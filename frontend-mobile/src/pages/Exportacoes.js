import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { getIdToken } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';
import { BASE_URL } from '../services/api';

export default function Exportacoes({ navegar }) {
  const [placaInspecao, setPlacaInspecao] = useState('');
  const [loadingVeiculos, setLoadingVeiculos] = useState(false);
  const [loadingInspecoes, setLoadingInspecoes] = useState(false);

  const getToken = async () => {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuário não autenticado.');
    return await getIdToken(user);
  };

  const baixarCsv = async (url, nomeArquivo) => {
    const token = await getToken();
    const localUri = FileSystem.cacheDirectory + nomeArquivo;
    const result = await FileSystem.downloadAsync(url, localUri, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (result.status !== 200) {
      throw new Error(`Erro ao baixar CSV (status ${result.status}).`);
    }
    await Sharing.shareAsync(result.uri, {
      mimeType: 'text/csv',
      dialogTitle: 'Compartilhar Exportação CSV',
    });
  };

  const exportarVeiculos = async () => {
    setLoadingVeiculos(true);
    try {
      const url = `${BASE_URL}/exportacoes/vehicles/csv`;
      await baixarCsv(url, 'veiculos.csv');
    } catch (error) {
      const msg = error?.message || 'Não foi possível exportar os veículos.';
      Alert.alert('Erro', msg);
    } finally {
      setLoadingVeiculos(false);
    }
  };

  const exportarInspecoes = async () => {
    setLoadingInspecoes(true);
    try {
      const placa = placaInspecao.trim().toUpperCase();
      const query = placa ? `?placa=${encodeURIComponent(placa)}` : '';
      const url = `${BASE_URL}/exportacoes/inspecoes/csv${query}`;
      const nomeArquivo = placa ? `inspecoes_${placa}.csv` : 'inspecoes.csv';
      await baixarCsv(url, nomeArquivo);
    } catch (error) {
      const msg = error?.message || 'Não foi possível exportar as inspeções.';
      Alert.alert('Erro', msg);
    } finally {
      setLoadingInspecoes(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Exportações <Text style={styles.headerTitleBlue}>CSV</Text>
        </Text>
        <Text style={styles.headerSubtitle}>Baixe os dados em formato planilha</Text>
      </View>

      {/* Card: Exportar Veículos */}
      <View style={styles.card}>
        <View style={styles.cardIconWrapper}>
          <Ionicons name="car-outline" size={32} color="#00b7eb" />
        </View>
        <Text style={styles.cardTitle}>Exportar Veículos</Text>
        <Text style={styles.cardDescription}>
          Baixa todos os veículos cadastrados em formato CSV para uso em planilhas.
        </Text>
        <TouchableOpacity
          style={[styles.button, loadingVeiculos && styles.buttonDisabled]}
          onPress={exportarVeiculos}
          disabled={loadingVeiculos}
          activeOpacity={0.8}
        >
          {loadingVeiculos ? (
            <ActivityIndicator size="small" color="#00112b" />
          ) : (
            <>
              <Ionicons name="download-outline" size={18} color="#00112b" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Baixar CSV</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Card: Exportar Inspeções */}
      <View style={styles.card}>
        <View style={styles.cardIconWrapper}>
          <Ionicons name="document-outline" size={32} color="#00b7eb" />
        </View>
        <Text style={styles.cardTitle}>Exportar Inspeções</Text>
        <Text style={styles.cardDescription}>
          Baixa o histórico de inspeções em CSV. Informe uma placa para filtrar (opcional).
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Placa do Veículo (opcional)"
          placeholderTextColor="rgba(147, 197, 253, 0.5)"
          value={placaInspecao}
          onChangeText={setPlacaInspecao}
          autoCapitalize="characters"
          autoCorrect={false}
        />
        <TouchableOpacity
          style={[styles.button, loadingInspecoes && styles.buttonDisabled]}
          onPress={exportarInspecoes}
          disabled={loadingInspecoes}
          activeOpacity={0.8}
        >
          {loadingInspecoes ? (
            <ActivityIndicator size="small" color="#00112b" />
          ) : (
            <>
              <Ionicons name="download-outline" size={18} color="#00112b" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Baixar CSV</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Dica */}
      <View style={styles.dicaContainer}>
        <Ionicons name="information-circle-outline" size={18} color="rgba(255,255,255,0.3)" />
        <Text style={styles.dicaText}>
          Os arquivos CSV podem ser abertos no Excel, Google Sheets ou Numbers.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#00112b',
  },
  scrollContent: {
    paddingBottom: 100,
    paddingHorizontal: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
    marginTop: Platform.OS === 'android' ? 8 : 0,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerTitleBlue: {
    color: '#00b7eb',
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 4,
  },
  card: {
    backgroundColor: 'rgba(0, 43, 69, 0.8)',
    borderRadius: 20,
    padding: 22,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
  },
  cardIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(0,183,235,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,183,235,0.2)',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 18,
    paddingHorizontal: 8,
  },
  input: {
    width: '100%',
    backgroundColor: 'rgba(0, 153, 204, 0.15)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    color: '#fff',
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 14,
    textAlign: 'center',
    letterSpacing: 2,
  },
  button: {
    backgroundColor: '#00b7eb',
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 32,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    minWidth: 160,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#00112b',
    fontWeight: '800',
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dicaContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  dicaText: {
    flex: 1,
    fontSize: 12,
    color: 'rgba(255,255,255,0.3)',
    lineHeight: 18,
  },
});
