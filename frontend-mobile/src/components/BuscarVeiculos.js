import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  ActivityIndicator, 
  Platform,
  RefreshControl,
} from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import VehicleCard from './VehicleCardDetail';

// URL apontando para a rota do seu backend local
const API_URL = 'http://192.168.1.7:3000/vehicles'; 

export default function BuscarVeiculos({ aoTrocarTela, onSelectVehicle, onCreateNew }) {
  const insets = useSafeAreaInsets();
  const [veiculos, setVeiculos] = useState([]);
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [erro, setErro] = useState(null);

  // Função para carregar os dados
  const carregarDados = async () => {
    try {
      setCarregando(true);
      const response = await axios.get(API_URL);
      
      // Mapeia a estrutura exatamente como o Frontend Web faz
      const dadosVeiculos = response.data?.data || response.data || [];
      
      const veiculosFormatados = dadosVeiculos.map(veiculo => ({
        _id: veiculo._id,
        nome: veiculo.model,
        placa: veiculo.plate,
        status: veiculo.operationalStatus === 'active' ? 'OK' : 'ALERTA',
        ano: veiculo.year,
        quilometragem: veiculo.mileage,
        fotoUrl: null,
        observacao: veiculo.observation
      }));
      
      setVeiculos(veiculosFormatados);
      setErro(null);
    } catch (error) {
      console.error("Erro ao carregar dados no Mobile:", error);
      setErro("Não foi possível carregar os veículos.");
      setVeiculos([]);
    } finally {
      setCarregando(false);
      setRefreshing(false);
    }
  };

  // Função para refresh (puxar para atualizar)
  const onRefresh = () => {
    setRefreshing(true);
    carregarDados();
  };

  useEffect(() => {
    carregarDados();
  }, []);

  // FILTRAGEM INTELIGENTE: Limpa hífens e espaços do banco e do que foi digitado
  const veiculosFiltrados = veiculos.filter(v => {
    // Se não houver nada digitado, exibe a lista completa
    if (!busca.trim()) return true;

    const termoBusca = busca.toLowerCase().replace(/[^a-z0-9]/g, '');
    const placaLimpa = (v.placa || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const nomeLimpo = (v.nome || '').toLowerCase();

    return placaLimpa.includes(termoBusca) || nomeLimpo.includes(termoBusca);
  });

  return (
    <View style={styles.container}>
      
      <View style={styles.header}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>B U S C A R</Text>
        </View>
        <Text style={styles.headerTitle}>
          Gestão de <Text style={styles.headerTitleBlue}>Veículos</Text>
        </Text>
      </View>

      {/* Caixa de Entrada de Busca */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder="Placa ou modelo..."
          placeholderTextColor="rgba(147, 197, 253, 0.5)"
          value={busca}
          onChangeText={setBusca}
          autoCapitalize="characters"
          autoCorrect={false}
        />
        <View style={styles.searchIconBadge}>
          <Ionicons name="search" size={18} color="white" />
        </View>
      </View>

      {/* Contador de Resultados em Tempo Real */}
      {!carregando && !erro && veiculosFiltrados.length > 0 && (
        <Text style={styles.resultsCounter}>
          {veiculosFiltrados.length} RESULTADO{veiculosFiltrados.length !== 1 ? 'S' : ''} ENCONTRADO{veiculosFiltrados.length !== 1 ? 'S' : ''}
        </Text>
      )}

      {/* Gerenciamento de Estados Visuais */}
      {carregando ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#00b7eb" style={{ marginBottom: 12 }} />
          <Text style={styles.infoText}>Sincronizando dados...</Text>
        </View>
      ) : erro ? (
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle" size={48} color="#ef4444" style={{ marginBottom: 12 }} />
          <Text style={[styles.infoText, { color: '#ef4444', textAlign: 'center', marginBottom: 16 }]}>{erro}</Text>
          <TouchableOpacity onPress={carregarDados} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={veiculosFiltrados}
          keyExtractor={(item) => item._id || String(Math.random())}
          contentContainerStyle={[
            styles.listGap,
            // Adiciona espaço extra no final baseado na altura do menu inferior
            { paddingBottom: Math.max(insets.bottom, 20) + 120 }
          ]}
          showsVerticalScrollIndicator={true}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#00b7eb"
              colors={["#00b7eb"]}
              progressBackgroundColor="#002b45"
            />
          }
          renderItem={({ item: veiculo }) => (
            <VehicleCard 
              veiculo={veiculo} 
              onPress={() => onSelectVehicle && onSelectVehicle(veiculo._id)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="car-outline" size={48} color="rgba(255,255,255,0.3)" style={{ marginBottom: 12 }} />
              <Text style={styles.emptyIcon}>🚜</Text>
              <Text style={styles.emptyText}>
                {busca.trim() ? 'Nenhum veículo encontrado com essa placa ou modelo.' : 'Nenhum veículo cadastrado ainda.'}
              </Text>
              {!busca.trim() && (
                <TouchableOpacity onPress={aoTrocarTela} style={styles.emptyButton}>
                  <Text style={styles.emptyButtonText}>+ Adicionar Primeiro Veículo</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}

      <TouchableOpacity 
        style={[styles.addButton, { bottom: Math.max(insets.bottom, 20) + 16 }]} 
        onPress={() => onCreateNew && onCreateNew()}
      >
        <Ionicons name="add" size={24} color="#00112b" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#00112b' 
  },
  header: { 
    alignItems: 'center', 
    marginBottom: 24, 
    marginTop: Platform.OS === 'android' ? 16 : 12,
    paddingTop: 12,
    paddingHorizontal: 16,
    position: 'relative'
  },
  badge: { 
    backgroundColor: '#002b45', 
    paddingHorizontal: 12, 
    paddingVertical: 4, 
    borderRadius: 20, 
    borderWidth: 1, 
    borderColor: '#003d5c', 
    marginBottom: 6 
  },
  badgeText: { 
    fontSize: 9, 
    fontWeight: 'bold', 
    letterSpacing: 2, 
    color: '#00b7eb' 
  },
  headerTitle: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: '#fff' 
  },
  headerTitleBlue: { 
    color: '#00b7eb' 
  },
  addButton: {
    position: 'absolute',
    right: 16,
    backgroundColor: '#00b7eb',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00b7eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 20,
  },
  searchContainer: { 
    flexDirection: 'row', 
    position: 'relative', 
    marginBottom: 12, 
    alignItems: 'center',
    paddingHorizontal: 16
  },
  input: { 
    flex: 1, 
    backgroundColor: 'rgba(0, 153, 204, 0.15)', 
    borderRadius: 16, 
    paddingVertical: 12, 
    paddingLeft: 16, 
    paddingRight: 60, 
    color: '#fff', 
    fontSize: 16, 
    borderWidth: 1, 
    borderColor: 'rgba(255, 255, 255, 0.1)' 
  },
  searchIconBadge: { 
    position: 'absolute', 
    right: 28, 
    backgroundColor: '#00b7eb', 
    padding: 10, 
    borderRadius: 12 
  },
  resultsCounter: { 
    fontSize: 10, 
    color: 'rgba(255, 255, 255, 0.4)', 
    marginBottom: 16, 
    marginHorizontal: 16,
    fontWeight: 'bold', 
    letterSpacing: 1 
  },
  centerContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingVertical: 60 
  },
  infoText: { 
    color: 'rgba(255, 255, 255, 0.6)', 
    fontSize: 14, 
    fontWeight: '500' 
  },
  retryButton: {
    backgroundColor: '#00b7eb',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 16
  },
  retryButtonText: {
    color: '#00112b',
    fontWeight: 'bold',
    fontSize: 14
  },
  listGap: { 
    gap: 14, 
    paddingHorizontal: 16,
  },
  emptyContainer: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: 60, 
    backgroundColor: 'rgba(255, 255, 255, 0.03)', 
    borderRadius: 24, 
    borderWidth: 1, 
    borderStyle: 'dashed', 
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 16,
    marginTop: 20
  },
  emptyIcon: { 
    fontSize: 32, 
    marginBottom: 8, 
    opacity: 0.5 
  },
  emptyText: { 
    color: '#fff', 
    fontSize: 14, 
    opacity: 0.5, 
    textAlign: 'center', 
    paddingHorizontal: 16,
    marginBottom: 16
  },
  emptyButton: {
    backgroundColor: '#00b7eb',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 8
  },
  emptyButtonText: {
    color: '#00112b',
    fontWeight: 'bold',
    fontSize: 14
  }
});