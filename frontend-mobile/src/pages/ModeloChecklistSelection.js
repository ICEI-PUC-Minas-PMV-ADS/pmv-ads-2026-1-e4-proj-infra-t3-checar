import React, { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import api from '../services/api';
import { ActivityIndicator, Button, Card, IconButton, Searchbar } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';



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
      const response = await api.get('/modelochecklists', {
        params: { ativo: 'true' },
      });
      setModelos(response.data?.data || response.data || []);
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
        <Button
          mode="contained-tonal"
          icon="chevron-left"
          onPress={() => navegar('busca')}
          buttonColor="#002b45"
          textColor="#fff"
          style={styles.headerButton}
          contentStyle={styles.headerButtonContent}
        >
          Voltar
        </Button>

        {!isChecklistFlow && (
          <Button
            mode="contained"
            icon="plus"
            onPress={() => navegar('modeloEdit', { modeloId: null })}
            buttonColor="#00b7eb"
            textColor="#00112b"
            style={styles.headerButton}
            contentStyle={styles.headerButtonContent}
            labelStyle={styles.createButtonLabel}
          >
            Criar
          </Button>
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

      <Searchbar
        placeholder="Buscar por nome, tipo ou descricao"
        value={busca}
        onChangeText={setBusca}
        autoCorrect={false}
        iconColor="#fff"
        placeholderTextColor="rgba(147, 197, 253, 0.55)"
        inputStyle={styles.searchInput}
        style={styles.searchbar}
      />

      {error ? (
        <Card style={[styles.messageCard, styles.errorCard]}>
          <Card.Content style={styles.messageContent}>
            <IconButton icon="alert-circle" size={18} iconColor="#ef4444" style={styles.messageIcon} />
          <Text style={styles.alertErrorText}>{error}</Text>
          </Card.Content>
        </Card>
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
            <Card
              mode="outlined"
              onPress={() => selecionarModelo(item)}
              style={styles.card}
              contentStyle={styles.cardContent}
            >
              <Card.Content style={styles.cardInner}>
                <View style={styles.iconBox}>
                  <IconButton icon="clipboard-text" size={28} iconColor="#00112b" style={styles.iconButton} />
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

                <IconButton icon="chevron-right" size={22} iconColor="rgba(255,255,255,0.75)" style={styles.chevron} />
              </Card.Content>
            </Card>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <IconButton icon="clipboard-outline" size={48} iconColor="rgba(255,255,255,0.3)" />
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
  headerButton: {
    borderRadius: 20,
  },
  headerButtonContent: {
    minHeight: 38,
  },
  createButtonLabel: {
    fontWeight: '900',
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
  searchbar: {
    backgroundColor: 'rgba(0, 153, 204, 0.15)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  searchInput: {
    color: '#fff',
    fontSize: 15,
  },
  messageCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
  },
  errorCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: '#ef4444',
  },
  messageContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  messageIcon: {
    margin: 0,
    marginRight: 8,
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
    backgroundColor: '#0041a3',
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  cardContent: {
    backgroundColor: '#0041a3',
    borderRadius: 20,
  },
  cardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  iconBox: {
    width: 58,
    height: 58,
    borderRadius: 16,
    backgroundColor: '#00b7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButton: {
    margin: 0,
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
  chevron: {
    margin: 0,
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
