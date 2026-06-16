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

export default function Relatorios({ navegar }) {
  const [checklistId, setChecklistId] = useState('');
  const [placaInspecao, setPlacaInspecao] = useState('');
  const [loadingChecklist, setLoadingChecklist] = useState(false);
  const [loadingInspecao, setLoadingInspecao] = useState(false);

  const getToken = async () => {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuário não autenticado.');
    return await getIdToken(user);
  };

  const baixarPdf = async (url, nomeArquivo) => {
    const token = await getToken();
    const localUri = FileSystem.cacheDirectory + nomeArquivo;
    const result = await FileSystem.downloadAsync(url, localUri, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (result.status !== 200) {
      throw new Error(`Erro ao baixar PDF (status ${result.status}).`);
    }
    await Sharing.shareAsync(result.uri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Compartilhar Relatório',
    });
  };

  const gerarPdfChecklist = async () => {
    if (!checklistId.trim()) {
      Alert.alert('Atenção', 'Informe o ID do checklist.');
      return;
    }
    setLoadingChecklist(true);
    try {
      const url = `${BASE_URL}/relatorios/checklists/${checklistId.trim()}/pdf`;
      await baixarPdf(url, `checklist_${checklistId.trim()}.pdf`);
    } catch (error) {
      const msg = error?.message || 'Não foi possível gerar o relatório.';
      Alert.alert('Erro', msg);
    } finally {
      setLoadingChecklist(false);
    }
  };

  const gerarPdfInspecoes = async () => {
    if (!placaInspecao.trim()) {
      Alert.alert('Atenção', 'Informe a placa do veículo.');
      return;
    }
    setLoadingInspecao(true);
    try {
      const placa = placaInspecao.trim().toUpperCase();
      const url = `${BASE_URL}/relatorios/inspecoes/${placa}/pdf`;
      await baixarPdf(url, `inspecoes_${placa}.pdf`);
    } catch (error) {
      const msg = error?.message || 'Não foi possível gerar o relatório.';
      Alert.alert('Erro', msg);
    } finally {
      setLoadingInspecao(false);
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
          Relatórios em <Text style={styles.headerTitleBlue}>PDF</Text>
        </Text>
        <Text style={styles.headerSubtitle}>Baixe e compartilhe relatórios</Text>
      </View>

      {/* Card: PDF do Checklist */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="document-text" size={24} color="#00b7eb" />
          <Text style={styles.cardTitle}>Relatório de Checklist</Text>
        </View>
        <Text style={styles.cardDescription}>
          Gera o PDF de um checklist específico pelo seu ID.
        </Text>
        <TextInput
          style={styles.input}
          placeholder="ID do Checklist"
          placeholderTextColor="rgba(147, 197, 253, 0.5)"
          value={checklistId}
          onChangeText={setChecklistId}
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel="ID do checklist"
          accessibilityHint="Digite o ID para gerar o PDF"
        />
        <TouchableOpacity
          style={[styles.button, loadingChecklist && styles.buttonDisabled]}
          onPress={gerarPdfChecklist}
          disabled={loadingChecklist}
          activeOpacity={0.8}
          accessibilityLabel="Gerar PDF do checklist"
          accessibilityRole="button"
          accessibilityState={{ disabled: loadingChecklist }}
        >
          {loadingChecklist ? (
            <ActivityIndicator size="small" color="#00112b" />
          ) : (
            <>
              <Ionicons name="download" size={18} color="#00112b" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Gerar PDF do Checklist</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Card: PDF de Inspeções */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="car" size={24} color="#00b7eb" />
          <Text style={styles.cardTitle}>Relatório de Inspeções</Text>
        </View>
        <Text style={styles.cardDescription}>
          Gera o PDF com todas as inspeções de um veículo pela placa.
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Placa do Veículo (ex: ABC1D23)"
          placeholderTextColor="rgba(147, 197, 253, 0.5)"
          value={placaInspecao}
          onChangeText={setPlacaInspecao}
          autoCapitalize="characters"
          autoCorrect={false}
          accessibilityLabel="Placa do veículo"
          accessibilityHint="Digite a placa para gerar PDF das inspeções"
        />
        <TouchableOpacity
          style={[styles.button, loadingInspecao && styles.buttonDisabled]}
          onPress={gerarPdfInspecoes}
          disabled={loadingInspecao}
          activeOpacity={0.8}
          accessibilityLabel="Gerar PDF de inspeções por placa"
          accessibilityRole="button"
          accessibilityState={{ disabled: loadingInspecao }}
        >
          {loadingInspecao ? (
            <ActivityIndicator size="small" color="#00112b" />
          ) : (
            <>
              <Ionicons name="download" size={18} color="#00112b" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Gerar PDF de Inspeções</Text>
            </>
          )}
        </TouchableOpacity>
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
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  cardDescription: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 16,
    lineHeight: 18,
  },
  input: {
    backgroundColor: 'rgba(0, 153, 204, 0.15)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    color: '#fff',
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 14,
  },
  button: {
    backgroundColor: '#00b7eb',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
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
});
