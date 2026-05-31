import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const API_BASE_URL = 'http://10.0.2.2:3000';

const formatTipo = (tipo) => (tipo === 'Diario' ? 'Diario' : tipo || '-');

export default function ModeloChecklistSelection({ navegar, params = {} }) {
  const insets = useSafeAreaInsets();
  const vehicleId = params.vehicleId;
  const vehicle = params.vehicle || null;
  const isChecklistFlow = Boolean(vehicleId);

  const [modelos, setModelos] = useState([]);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const carregarModelos = async () => {
    try {
      setError('');
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/modelochecklists`, {
        params: { ativo: 'true' },
      });
      setModelos(response.data || []);
    } catch (err) {
      setError(`Falha ao carregar modelos: ${err.response?.data?.erro || err.message}`);
      setModelos([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    carregarModelos();
  }, []);

  const modelosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return modelos;

    return modelos.filter((modelo) =>
      [modelo.nome, modelo.tipo, modelo.descricao]
        .filter(Boolean)
        .some((valor) => valor.toLowerCase().includes(termo))
    );
  }, [busca, modelos]);

  const selecionarModelo = (modelo) => {
    if (isChecklistFlow) {
      navegar('checklist', { vehicleId, vehicle, modeloChecklist: modelo });
      return;
    }

    navegar('modeloEdit', { modeloId: modelo._id });
  };

  const onRefresh = () => {
    setRefreshing(true);
    carregarModelos();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navegar('busca')} style={styles.backButton}>
          <Ionicons name="chevron-back" size={20} color="white" />
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>

        {!isChecklistFlow && (
          <TouchableOpacity
            onPress={() => navegar('modeloEdit', { modeloId: null })}
            style={styles.createButton}
            activeOpacity={0.85}
          >
            <Ionicons name="add" size={20} color="#00112b" />
            <Text style={styles.createButtonText}>Criar</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.titleContainer}>
        <Text style={styles.mainTitle}>
          {isChecklistFlow ? 'Escolha o ' : 'Modelos '}
          <Text style={styles.highlightText}>{isChecklistFlow ? 'Modelo' : 'Checklist'}</Text>
        </Text>
        <Text style={styles.subtitle}>
          {isChecklistFlow
            ? `Veiculo: ${vehicle?.model || vehicle?.nome || '-'} | Placa: ${vehicle?.plate || vehicle?.placa || '-'}`
            : 'Selecione um modelo para editar ou crie um novo.'}
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder="Buscar por nome, tipo ou descricao"
          placeholderTextColor="rgba(147, 197, 253, 0.5)"
          value={busca}
          onChangeText={setBusca}
          autoCorrect={false}
        />
        <View style={styles.searchIconBadge}>
          <Ionicons name="search" size={18} color="white" />
        </View>
      </View>

      {error ? (
        <View style={styles.alertError}>
          <Ionicons name="alert-circle" size={18} color="#ef4444" />
          <Text style={styles.alertErrorText}>{error}</Text>
        </View>
      ) : null}

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#00b7eb" style={styles.loader} />
          <Text style={styles.infoText}>Carregando modelos...</Text>
        </View>
      ) : (
        <FlatList
          data={modelosFiltrados}
          keyExtractor={(item) => item._id}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: Math.max(insets.bottom, 20) + 90 },
          ]}
          showsVerticalScrollIndicator
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#00b7eb"
              colors={['#00b7eb']}
              progressBackgroundColor="#002b45"
            />
          }
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => selecionarModelo(item)} activeOpacity={0.85}>
              <LinearGradient
                colors={['#0052cc', '#0041a3']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.card}
              >
                <View style={styles.iconBox}>
                  <Ionicons name="clipboard" size={28} color="#00112b" />
                </View>

                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle} numberOfLines={1}>{item.nome}</Text>
                  <Text style={styles.cardMeta}>
                    {formatTipo(item.tipo)} | {item.secoes?.length || 0} secoes
                  </Text>
                  {item.descricao ? (
                    <Text style={styles.cardDescription} numberOfLines={2}>{item.descricao}</Text>
                  ) : null}
                </View>

                <Ionicons name="chevron-forward" size={22} color="rgba(255,255,255,0.75)" />
              </LinearGradient>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="clipboard-outline" size={48} color="rgba(255,255,255,0.3)" />
              <Text style={styles.emptyText}>Nenhum modelo encontrado.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#00112b',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 8 : 0,
    marginBottom: 18,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#002b45',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  backButtonText: {
    color: 'white',
    marginLeft: 6,
    fontSize: 14,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#00b7eb',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  createButtonText: {
    color: '#00112b',
    fontWeight: '900',
    fontSize: 13,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  mainTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  highlightText: {
    color: '#00b7eb',
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 6,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(0, 153, 204, 0.15)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingLeft: 16,
    paddingRight: 58,
    color: '#fff',
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  searchIconBadge: {
    position: 'absolute',
    right: 28,
    backgroundColor: '#00b7eb',
    padding: 10,
    borderRadius: 12,
  },
  alertError: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ef4444',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    flexDirection: 'row',
    gap: 8,
  },
  alertErrorText: {
    color: '#fca5a5',
    flex: 1,
    fontSize: 12,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loader: {
    marginBottom: 12,
  },
  infoText: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 14,
  },
  listContent: {
    gap: 14,
    paddingHorizontal: 16,
  },
  card: {
    borderRadius: 20,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  iconBox: {
    width: 58,
    height: 58,
    borderRadius: 16,
    backgroundColor: '#00b7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
    paddingHorizontal: 12,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  cardMeta: {
    color: '#5bc4f1',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 2,
  },
  cardDescription: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    marginTop: 6,
    lineHeight: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 20,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginTop: 20,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
  },
});
