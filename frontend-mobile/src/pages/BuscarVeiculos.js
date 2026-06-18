import React, { useEffect, useState } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  FlatList, ActivityIndicator, Platform, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../services/api';
import { extractList, getApiErrorMessage } from '../utils/apiPayload';

export default function BuscarVeiculos({ aoTrocarTela, navegar }) {
  const insets = useSafeAreaInsets();
  const [veiculos,    setVeiculos]    = useState([]);
  const [busca,       setBusca]       = useState('');
  const [carregando,  setCarregando]  = useState(true);
  const [refreshing,  setRefreshing]  = useState(false);
  const [erro,        setErro]        = useState(null);

  const carregarDados = async () => {
    try {
      setCarregando(true);
      const response = await api.get('/vehicles');
      const dadosVeiculos = extractList(response.data);

      setVeiculos(dadosVeiculos.map((v) => ({
        _id:            v._id,
        nome:           v.model,
        placa:          v.plate,
        status:         v.operationalStatus === 'active' ? 'OK' : 'ALERTA',
        ano:            v.year,
        quilometragem:  v.mileage,
        observacao:     v.observation,
      })));
      setErro(null);
    } catch (error) {
      console.error('[Checar] GET /api/vehicles falhou', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      setErro(getApiErrorMessage(error, 'Não foi possível carregar os veículos.'));
      setVeiculos([]);
    } finally {
      setCarregando(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => { setRefreshing(true); carregarDados(); };

  useEffect(() => { carregarDados(); }, []);

  const veiculosFiltrados = veiculos.filter((v) => {
    if (!busca.trim()) return true;
    const termo = busca.toLowerCase().replace(/[^a-z0-9]/g, '');
    const placa = (v.placa || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const nome  = (v.nome  || '').toLowerCase();
    return placa.includes(termo) || nome.includes(termo);
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Buscar <Text style={styles.headerTitleBlue}>veículos</Text>
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder="Placa ou modelo…"
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

      {!carregando && !erro && veiculosFiltrados.length > 0 && (
        <Text style={styles.resultsCounter}>
          {veiculosFiltrados.length} RESULTADO{veiculosFiltrados.length !== 1 ? 'S' : ''} ENCONTRADO{veiculosFiltrados.length !== 1 ? 'S' : ''}
        </Text>
      )}

      {carregando ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#00b7eb" style={{ marginBottom: 12 }} />
          <Text style={styles.infoText}>Sincronizando dados…</Text>
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
          contentContainerStyle={[styles.listGap, { paddingBottom: Math.max(insets.bottom, 20) + 80 }]}
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
          renderItem={({ item: veiculo }) => (
            <LinearGradient
              colors={['#0052cc', '#0041a3']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.card}
            >
              <View style={styles.imageContainer}>
                <Ionicons name="car" size={40} color="rgba(0, 17, 43, 0.2)" />
                <View style={[styles.statusIndicatorBar, { backgroundColor: veiculo.status === 'OK' ? '#4ade80' : '#ef4444' }]} />
              </View>

              <View style={styles.infoContainer}>
                <Text style={styles.vehicleName} numberOfLines={1}>{veiculo.nome}</Text>
                <Text style={styles.vehiclePlate}>{veiculo.placa}</Text>
                <View style={styles.metaRow}>
                  <Text style={styles.metaText}>{veiculo.ano}</Text>
                  <Text style={styles.metaText}>•</Text>
                  <Text style={styles.metaText}>{veiculo.quilometragem?.toLocaleString()} km</Text>
                </View>
                <TouchableOpacity
                  onPress={() => navegar?.('modelos', { vehicleId: veiculo._id, vehicle: veiculo })}
                  style={styles.checklistButton}
                  activeOpacity={0.85}
                >
                  <Text style={styles.checklistButtonText}>Iniciar Checklist</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.statusBadgeContainer}>
                <View style={[styles.statusBadge, veiculo.status === 'ALERTA' ? styles.badgeAlert : styles.badgeOk]}>
                  <Text style={veiculo.status === 'ALERTA' ? styles.textAlert : styles.textOk}>
                    {veiculo.status}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🚜</Text>
              <Text style={styles.emptyText}>
                {busca.trim() ? 'Nenhum veículo encontrado.' : 'Nenhum veículo cadastrado ainda.'}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container:          { flex: 1, backgroundColor: '#00112b' },
  header:             { alignItems: 'center', marginBottom: 24, marginTop: Platform.OS === 'android' ? 8 : 0, paddingHorizontal: 16 },
  headerTitle:        { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  headerTitleBlue:    { color: '#00b7eb' },
  searchContainer:    { flexDirection: 'row', position: 'relative', marginBottom: 12, alignItems: 'center', paddingHorizontal: 16 },
  input:              { flex: 1, backgroundColor: 'rgba(0, 153, 204, 0.15)', borderRadius: 16, paddingVertical: 12, paddingLeft: 16, paddingRight: 60, color: '#fff', fontSize: 16, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' },
  searchIconBadge:    { position: 'absolute', right: 28, backgroundColor: '#00b7eb', padding: 10, borderRadius: 12 },
  resultsCounter:     { fontSize: 10, color: 'rgba(255, 255, 255, 0.4)', marginBottom: 16, marginHorizontal: 16, fontWeight: 'bold', letterSpacing: 1 },
  centerContainer:    { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
  infoText:           { color: 'rgba(255, 255, 255, 0.6)', fontSize: 14, fontWeight: '500' },
  retryButton:        { backgroundColor: '#00b7eb', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, marginTop: 16 },
  retryButtonText:    { color: '#00112b', fontWeight: 'bold', fontSize: 14 },
  listGap:            { gap: 14, paddingHorizontal: 16 },
  card:               { borderRadius: 24, padding: 14, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' },
  imageContainer:     { width: 80, height: 80, backgroundColor: '#fff', borderRadius: 16, justifyContent: 'center', alignItems: 'center', position: 'relative', overflow: 'hidden' },
  statusIndicatorBar: { position: 'absolute', top: 0, left: 0, width: 4, height: '100%' },
  infoContainer:      { flex: 1, paddingLeft: 12 },
  vehicleName:        { fontSize: 15, fontWeight: '900', color: '#fff', textTransform: 'uppercase' },
  vehiclePlate:       { fontSize: 13, fontWeight: 'bold', color: '#00b7eb', marginVertical: 2, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  metaRow:            { flexDirection: 'row', gap: 6, opacity: 0.6 },
  metaText:           { color: '#fff', fontSize: 11 },
  checklistButton:    { alignSelf: 'flex-start', backgroundColor: '#00b7eb', borderRadius: 8, paddingHorizontal: 9, paddingVertical: 5, marginTop: 7 },
  checklistButtonText: { color: '#00112b', fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
  statusBadgeContainer: { alignItems: 'flex-end', marginLeft: 8 },
  statusBadge:        { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  badgeOk:            { backgroundColor: 'rgba(74, 222, 128, 0.15)', borderColor: 'rgba(74, 222, 128, 0.4)' },
  badgeAlert:         { backgroundColor: 'rgba(239, 68, 68, 0.15)', borderColor: 'rgba(239, 68, 68, 0.4)' },
  textOk:             { color: '#4ade80', fontSize: 10, fontWeight: '900' },
  textAlert:          { color: '#ef4444', fontSize: 10, fontWeight: '900' },
  emptyContainer:     { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: 24, borderWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(255, 255, 255, 0.1)', marginHorizontal: 16, marginTop: 20 },
  emptyIcon:          { fontSize: 32, marginBottom: 8, opacity: 0.5 },
  emptyText:          { color: '#fff', fontSize: 14, opacity: 0.5, textAlign: 'center', paddingHorizontal: 16, marginBottom: 16 },
  emptyButton:        { backgroundColor: '#00b7eb', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, marginTop: 8 },
  emptyButtonText:    { color: '#00112b', fontWeight: 'bold', fontSize: 14 },
});
