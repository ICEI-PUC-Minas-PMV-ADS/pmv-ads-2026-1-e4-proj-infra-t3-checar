import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Platform,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
const LIMIT = 20;

const tipoConfig = (tipo) => {
  switch (tipo) {
    case 'conforme':
    case 'aprovado':
    case 'ok':
      return { icon: 'checkmark-circle', color: '#4ade80', bg: 'rgba(74,222,128,0.12)' };
    case 'nao_conforme':
    case 'reprovado':
    case 'alerta':
    case 'erro':
      return { icon: 'close-circle', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' };
    default:
      return { icon: 'information-circle', color: '#60a5fa', bg: 'rgba(96,165,250,0.12)' };
  }
};

const formatarTempo = (dataStr) => {
  if (!dataStr) return '';
  try {
    const diff = Date.now() - new Date(dataStr).getTime();
    const minutos = Math.floor(diff / 60000);
    if (minutos < 1) return 'Agora mesmo';
    if (minutos < 60) return `${minutos}min atrás`;
    const horas = Math.floor(minutos / 60);
    if (horas < 24) return `${horas}h atrás`;
    const dias = Math.floor(horas / 24);
    return `${dias}d atrás`;
  } catch {
    return dataStr;
  }
};

export default function Notificacoes({ navegar }) {
  const [notificacoes, setNotificacoes] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [carregando, setCarregando] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [erro, setErro] = useState(null);

  const naoLidas = notificacoes.filter((n) => !n.lida && !n.read).length;
  const temMais = notificacoes.length < total;

  const carregar = useCallback(async (novaPagina = 1, isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setCarregando(true);
    setErro(null);

    try {
      const response = await api.get('/notificacoes', {
        params: { page: novaPagina, limit: LIMIT },
      });
      const { data = [], total: t = 0 } = response.data || {};
      if (novaPagina === 1) {
        setNotificacoes(data);
      } else {
        setNotificacoes((prev) => [...prev, ...data]);
      }
      setTotal(t);
      setPage(novaPagina);
    } catch (error) {
      setErro('Não foi possível carregar as notificações.');
    } finally {
      setCarregando(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    carregar(1);
  }, [carregar]);

  const onRefresh = () => carregar(1, true);

  const marcarComoLida = async (id) => {
    try {
      await api.patch(`/notificacoes/${id}/lida`);
      setNotificacoes((prev) =>
        prev.map((n) => (n._id === id || n.id === id ? { ...n, lida: true, read: true } : n))
      );
    } catch {
      Alert.alert('Erro', 'Não foi possível marcar a notificação como lida.');
    }
  };

  const marcarTodasComoLidas = async () => {
    try {
      await api.patch('/notificacoes/lida/todas');
      setNotificacoes((prev) => prev.map((n) => ({ ...n, lida: true, read: true })));
    } catch {
      Alert.alert('Erro', 'Não foi possível marcar todas como lidas.');
    }
  };

  const carregarMais = () => {
    if (!carregando && temMais) {
      carregar(page + 1);
    }
  };

  const renderItem = ({ item }) => {
    const id = item._id || item.id;
    const lida = item.lida || item.read;
    const cfg = tipoConfig(item.tipo || item.type);

    return (
      <View style={[styles.card, lida && styles.cardLida]}>
        <View style={[styles.iconContainer, { backgroundColor: cfg.bg }]}>
          <Ionicons name={cfg.icon} size={26} color={cfg.color} />
        </View>
        <View style={styles.cardContent}>
          <Text style={[styles.cardMensagem, lida && styles.cardMensagemLida]} numberOfLines={3}>
            {item.mensagem || item.message || 'Sem mensagem'}
          </Text>
          <Text style={styles.cardTempo}>{formatarTempo(item.createdAt || item.data)}</Text>
        </View>
        {!lida && (
          <TouchableOpacity
            style={styles.markButton}
            onPress={() => marcarComoLida(id)}
            activeOpacity={0.7}
          >
            <Ionicons name="checkmark" size={18} color="#00b7eb" />
          </TouchableOpacity>
        )}
        {lida && (
          <View style={styles.lidaIndicator}>
            <Ionicons name="checkmark-done" size={16} color="rgba(255,255,255,0.25)" />
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>
            Notificações
            {naoLidas > 0 && (
              <Text style={styles.headerBadge}> ({naoLidas})</Text>
            )}
          </Text>
          {naoLidas > 0 && (
            <TouchableOpacity
              style={styles.marcarTodasButton}
              onPress={marcarTodasComoLidas}
              activeOpacity={0.8}
            >
              <Ionicons name="checkmark-done" size={16} color="#00112b" style={{ marginRight: 4 }} />
              <Text style={styles.marcarTodasText}>Marcar todas</Text>
            </TouchableOpacity>
          )}
        </View>
        {naoLidas > 0 && (
          <Text style={styles.headerSubtitle}>{naoLidas} não lida{naoLidas !== 1 ? 's' : ''}</Text>
        )}
      </View>

      {/* Conteúdo */}
      {carregando && !refreshing && notificacoes.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#00b7eb" />
          <Text style={styles.infoText}>Carregando notificações...</Text>
        </View>
      ) : erro ? (
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle" size={48} color="#ef4444" style={{ marginBottom: 12 }} />
          <Text style={[styles.infoText, { color: '#ef4444', textAlign: 'center' }]}>{erro}</Text>
          <TouchableOpacity onPress={() => carregar(1)} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={notificacoes}
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
          onEndReached={carregarMais}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            carregando && notificacoes.length > 0 ? (
              <ActivityIndicator size="small" color="#00b7eb" style={{ marginVertical: 16 }} />
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="notifications-off-outline" size={56} color="rgba(255,255,255,0.2)" />
              <Text style={styles.emptyText}>Nenhuma notificação ainda.</Text>
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
    paddingHorizontal: 16,
    marginBottom: 16,
    marginTop: Platform.OS === 'android' ? 8 : 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerBadge: {
    color: '#00b7eb',
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
  },
  marcarTodasButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00b7eb',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  marcarTodasText: {
    color: '#00112b',
    fontWeight: '700',
    fontSize: 12,
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
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(0,43,69,0.85)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  cardLida: {
    backgroundColor: 'rgba(0,43,69,0.4)',
    borderColor: 'rgba(255,255,255,0.04)',
  },
  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardMensagem: {
    fontSize: 14,
    color: '#fff',
    lineHeight: 20,
    fontWeight: '500',
  },
  cardMensagemLida: {
    color: 'rgba(255,255,255,0.45)',
    fontWeight: '400',
  },
  cardTempo: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.35)',
    marginTop: 6,
    fontWeight: '500',
  },
  markButton: {
    marginLeft: 8,
    backgroundColor: 'rgba(0,183,235,0.15)',
    padding: 8,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,183,235,0.3)',
  },
  lidaIndicator: {
    marginLeft: 8,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
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
  },
});
