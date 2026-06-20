import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Platform,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';

const LIMIT = 10;

const conformidadeConfig = (valor) => {
  if (valor === true || valor === 'conforme' || valor === 'Conforme') {
    return { label: 'Conforme', bg: 'rgba(74,222,128,0.15)', border: 'rgba(74,222,128,0.4)', text: '#4ade80' };
  }
  if (valor === false || valor === 'nao_conforme' || valor === 'Não Conforme') {
    return { label: 'Não Conforme', bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.4)', text: '#ef4444' };
  }
  return { label: 'Pendente', bg: 'rgba(251,191,36,0.15)', border: 'rgba(251,191,36,0.4)', text: '#fbbf24' };
};

const formatarData = (dataStr) => {
  if (!dataStr) return '—';
  try {
    const d = new Date(dataStr);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return dataStr;
  }
};

export default function Historico({ navegar }) {
  const [aba, setAba] = useState('inspecoes'); // 'inspecoes' | 'checklists'
  const [placa, setPlaca] = useState('');
  const [checklistId, setChecklistId] = useState('');
  const [filtroConformidade, setFiltroConformidade] = useState('');

  const [dados, setDados] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [carregando, setCarregando] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [erro, setErro] = useState(null);
  const [buscado, setBuscado] = useState(false);

  const buscar = useCallback(async (novaPagina = 1, isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setCarregando(true);
    setErro(null);

    try {
      let response;
      if (aba === 'inspecoes') {
        const placaParam = placa.trim().toUpperCase();
        if (!placaParam) {
          setErro('Informe a placa para buscar inspeções.');
          return;
        }
        response = await api.get(`/inspecoes/historico/${placaParam}`, {
          params: { page: novaPagina, limit: LIMIT },
        });
      } else {
        const params = { page: novaPagina, limit: LIMIT };
        if (checklistId.trim()) params.checklistId = checklistId.trim();
        if (filtroConformidade.trim()) params.conformidade = filtroConformidade.trim();
        response = await api.get('/checklists/historico', { params });
      }

      const { data = [], totalPages: tp = 1 } = response.data || {};
      setDados(data);
      setPage(novaPagina);
      setTotalPages(tp);
      setBuscado(true);
    } catch (error) {
      setErro('Não foi possível carregar os dados. Verifique sua conexão.');
      setDados([]);
    } finally {
      setCarregando(false);
      setRefreshing(false);
    }
  }, [aba, placa, checklistId, filtroConformidade]);

  const onRefresh = () => buscar(1, true);

  const trocarAba = (novaAba) => {
    setAba(novaAba);
    setDados([]);
    setPage(1);
    setTotalPages(1);
    setErro(null);
    setBuscado(false);
    setPlaca('');
    setChecklistId('');
    setFiltroConformidade('');
  };

  const renderItem = ({ item }) => {
    const conf = conformidadeConfig(item.conformidade ?? item.isCompliant);
    return (
      <View style={styles.card}>
        <View style={styles.cardRow}>
          <View style={styles.cardLeft}>
            <Text style={styles.cardData}>{formatarData(item.createdAt || item.data || item.date)}</Text>
            {item.plate || item.placa ? (
              <Text style={styles.cardPlaca}>{item.plate || item.placa}</Text>
            ) : null}
            {item.modelo || item.modelName ? (
              <Text style={styles.cardModelo} numberOfLines={1}>{item.modelo || item.modelName}</Text>
            ) : null}
          </View>
          <View style={[styles.badge, { backgroundColor: conf.bg, borderColor: conf.border }]}>
            <Text style={[styles.badgeText, { color: conf.text }]}>{conf.label}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Histórico de <Text style={styles.headerTitleBlue}>Atividades</Text>
        </Text>
      </View>

      {/* Alternador de aba */}
      <View style={styles.segmentedContainer}>
        <TouchableOpacity
          style={[styles.segmentButton, aba === 'inspecoes' && styles.segmentButtonActive]}
          onPress={() => trocarAba('inspecoes')}
          activeOpacity={0.8}
        >
          <Ionicons
            name="car"
            size={16}
            color={aba === 'inspecoes' ? '#00112b' : 'rgba(255,255,255,0.6)'}
            style={{ marginRight: 6 }}
          />
          <Text style={[styles.segmentText, aba === 'inspecoes' && styles.segmentTextActive]}>
            Inspeções
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.segmentButton, aba === 'checklists' && styles.segmentButtonActive]}
          onPress={() => trocarAba('checklists')}
          activeOpacity={0.8}
        >
          <Ionicons
            name="clipboard"
            size={16}
            color={aba === 'checklists' ? '#00112b' : 'rgba(255,255,255,0.6)'}
            style={{ marginRight: 6 }}
          />
          <Text style={[styles.segmentText, aba === 'checklists' && styles.segmentTextActive]}>
            Checklists
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filtros */}
      <View style={styles.filtrosContainer}>
        {aba === 'inspecoes' ? (
          <TextInput
            style={styles.input}
            placeholder="Placa do Veículo (ex: ABC1D23)"
            placeholderTextColor="rgba(147, 197, 253, 0.5)"
            value={placa}
            onChangeText={setPlaca}
            autoCapitalize="characters"
            autoCorrect={false}
          />
        ) : (
          <View style={styles.filtrosChecklist}>
            <TextInput
              style={styles.input}
              placeholder="ID do checklist (cole aqui)"
              placeholderTextColor="rgba(147, 197, 253, 0.5)"
              value={checklistId}
              onChangeText={setChecklistId}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TextInput
              style={styles.input}
              placeholder="Conformidade (opcional)"
              placeholderTextColor="rgba(147, 197, 253, 0.5)"
              value={filtroConformidade}
              onChangeText={setFiltroConformidade}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        )}
        <TouchableOpacity
          style={[styles.searchButton, carregando && styles.buttonDisabled]}
          onPress={() => buscar(1)}
          disabled={carregando}
          activeOpacity={0.8}
        >
          {carregando ? (
            <ActivityIndicator size="small" color="#00112b" />
          ) : (
            <Ionicons name="search" size={20} color="#00112b" />
          )}
        </TouchableOpacity>
      </View>

      {/* Lista */}
      {carregando && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#00b7eb" />
          <Text style={styles.infoText}>Carregando...</Text>
        </View>
      ) : erro ? (
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle" size={48} color="#ef4444" style={{ marginBottom: 12 }} />
          <Text style={[styles.infoText, { color: '#ef4444', textAlign: 'center' }]}>{erro}</Text>
          <TouchableOpacity onPress={() => buscar(1)} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={dados}
          keyExtractor={(item, index) => item._id || item.id || String(index)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#00b7eb"
              colors={['#00b7eb']}
              progressBackgroundColor="#002b45"
            />
          }
          renderItem={renderItem}
          ListEmptyComponent={
            buscado ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="time-outline" size={48} color="rgba(255,255,255,0.2)" />
                <Text style={styles.emptyText}>Nenhum registro encontrado.</Text>
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={48} color="rgba(255,255,255,0.2)" />
                <Text style={styles.emptyText}>
                  {aba === 'inspecoes'
                    ? 'Informe a placa e toque em buscar.'
                    : 'Toque em buscar para carregar o histórico.'}
                </Text>
              </View>
            )
          }
          ListFooterComponent={
            dados.length > 0 ? (
              <View style={styles.paginacao}>
                <TouchableOpacity
                  style={[styles.pageButton, page <= 1 && styles.pageButtonDisabled]}
                  onPress={() => buscar(page - 1)}
                  disabled={page <= 1 || carregando}
                  activeOpacity={0.8}
                >
                  <Ionicons name="chevron-back" size={18} color={page <= 1 ? 'rgba(255,255,255,0.3)' : '#00b7eb'} />
                  <Text style={[styles.pageButtonText, page <= 1 && styles.pageButtonTextDisabled]}>
                    Anterior
                  </Text>
                </TouchableOpacity>
                <Text style={styles.pageInfo}>{page} / {totalPages}</Text>
                <TouchableOpacity
                  style={[styles.pageButton, page >= totalPages && styles.pageButtonDisabled]}
                  onPress={() => buscar(page + 1)}
                  disabled={page >= totalPages || carregando}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.pageButtonText, page >= totalPages && styles.pageButtonTextDisabled]}>
                    Próxima
                  </Text>
                  <Ionicons name="chevron-forward" size={18} color={page >= totalPages ? 'rgba(255,255,255,0.3)' : '#00b7eb'} />
                </TouchableOpacity>
              </View>
            ) : null
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
    alignItems: 'center',
    marginBottom: 20,
    marginTop: Platform.OS === 'android' ? 8 : 0,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerTitleBlue: {
    color: '#00b7eb',
  },
  segmentedContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: 'rgba(0,43,69,0.6)',
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  segmentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 11,
  },
  segmentButtonActive: {
    backgroundColor: '#00b7eb',
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
  },
  segmentTextActive: {
    color: '#00112b',
    fontWeight: '800',
  },
  filtrosContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  filtrosChecklist: {
    flex: 1,
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(0, 153, 204, 0.15)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    color: '#fff',
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  searchButton: {
    backgroundColor: '#00b7eb',
    padding: 13,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  infoText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    marginTop: 12,
  },
  retryButton: {
    backgroundColor: '#00b7eb',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 16,
  },
  retryButtonText: {
    color: '#00112b',
    fontWeight: 'bold',
    fontSize: 14,
  },
  listContent: {
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: 'rgba(0,43,69,0.8)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardLeft: {
    flex: 1,
    paddingRight: 12,
  },
  cardData: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 4,
  },
  cardPlaca: {
    fontSize: 15,
    fontWeight: '800',
    color: '#00b7eb',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  cardModelo: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    marginHorizontal: 16,
    marginTop: 20,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 24,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.1)',
  },
  emptyText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  paginacao: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginTop: 8,
  },
  pageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,43,69,0.8)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,183,235,0.3)',
    gap: 4,
  },
  pageButtonDisabled: {
    borderColor: 'rgba(255,255,255,0.1)',
    opacity: 0.4,
  },
  pageButtonText: {
    color: '#00b7eb',
    fontWeight: '700',
    fontSize: 13,
  },
  pageButtonTextDisabled: {
    color: 'rgba(255,255,255,0.3)',
  },
  pageInfo: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    fontWeight: '600',
  },
});
