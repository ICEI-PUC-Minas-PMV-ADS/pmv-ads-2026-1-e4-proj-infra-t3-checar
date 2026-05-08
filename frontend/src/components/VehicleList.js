import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, SafeAreaView, StatusBar, TouchableOpacity, StyleSheet, Modal, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

// Importando componentes
import Header from './Header';
import SearchBar from './SearchBar';
import VehicleCard from './VehicleCard';
import Menu from './Menu';
import { showAlert, showConfirm } from '../config/alertUtils';
import vehicleService from '../services/vehicleService';

export default function VehicleList({ navigation }) {
  const [vehicles, setVehicles] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Carregar veículos da API
  const loadVehicles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await vehicleService.listVehicles();
      setVehicles(data);
    } catch (err) {
      setError(err.message);
      showAlert('Erro', `Falha ao carregar veículos: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar veículos ao montar o componente
  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

  // Atualizar lista ao retornar da tela de detalhes
  useFocusEffect(
    useCallback(() => {
      loadVehicles();
    }, [loadVehicles])
  );

  const veiculosFiltrados = vehicles.filter(v => 
    v.plate?.toLowerCase().replace('-', '').includes(searchText.toLowerCase().replace('-', ''))
  );

  const confirmDelete = async (plate) => {
    const message = `Tem certeza que deseja deletar o veículo ${plate}?`;
    return await showConfirm(message);
  };

  const handleDeleteVehicle = async (id, plate) => {
    const confirmed = await confirmDelete(plate);
    if (!confirmed) return;
    try {
      await vehicleService.deleteVehicle(id);
      setVehicles((prev) => prev.filter((v) => v._id !== id));
      showAlert('Sucesso', 'Veículo deletado com sucesso');
    } catch (err) {
      showAlert('Erro', `Falha ao deletar veículo: ${err.message}`);
    }
  };

  const handleEditVehicle = (vehicle) => {
    navigation.navigate('VehicleDetail', { vehicle });
  };

  const handleAddVehicle = () => {
    navigation.navigate('VehicleDetail', { vehicle: null });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00b4d8" />
          <Text style={styles.loadingText}>Carregando veículos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <Header 
          onMenuPress={() => setMenuVisible(true)}
          showMenuButton={true}
        />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#ff4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={loadVehicles}
          >
            <Text style={styles.retryButtonText}>Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <Header 
        onMenuPress={() => setMenuVisible(true)}
        showMenuButton={true}
      />
      <SearchBar value={searchText} onChangeText={setSearchText} />

      <ScrollView contentContainerStyle={styles.listContainer}>
        {veiculosFiltrados.length > 0 ? (
          veiculosFiltrados.map((item) => (
            <VehicleCard
              key={item._id}
              item={item}
              onPress={() => handleEditVehicle(item)}
              onDelete={() => handleDeleteVehicle(item._id, item.plate)}
            />
          ))
        ) : (
          searchText !== '' && (
            <Text style={styles.emptyText}>Nenhum veículo encontrado.</Text>
          )
        )}
      </ScrollView>

      <TouchableOpacity 
        style={styles.addButton}
        onPress={handleAddVehicle}
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>

      <Modal
        visible={menuVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setMenuVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Menu
              navigation={navigation}
              onClose={() => setMenuVisible(false)}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#001233', paddingTop: 20 },
  listContainer: { paddingHorizontal: 20, paddingBottom: 100 },
  emptyText: { color: '#fff', textAlign: 'center', marginTop: 20 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 15,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    color: '#fff',
    marginTop: 15,
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#00b4d8',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#001233',
    fontWeight: 'bold',
    fontSize: 16,
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#00b4d8',
    borderRadius: 50,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
  },
  modalContent: {
    backgroundColor: '#004aad',
    width: '100%',
    marginTop: 0,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingBottom: 20,
  },
});
