import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import api, { BASE_URL } from '../services/api';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function UploadFotos({ aoVoltar }) {
  const insets = useSafeAreaInsets();
  const [novoVeiculo, setNovoVeiculo] = useState({
    placa: '',
    model: '',
    year: new Date().getFullYear().toString()
  });

  const [fotos, setFotos] = useState({
    frente: null,
    lateralEsquerda: null,
    lateralDireita: null,
    traseira: null,
    topo: null
  });

  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erroGeral, setErroGeral] = useState(null);

  const fotoTipos = [
    { id: 'frente', label: 'Frontal', icon: '🚗', required: true },
    { id: 'lateralEsquerda', label: 'Lateral Esquerda', icon: '⬅️', required: true },
    { id: 'lateralDireita', label: 'Lateral Direita', icon: '➡️', required: true },
    { id: 'traseira', label: 'Traseira', icon: '🔙', required: true },
    { id: 'topo', label: 'Topo / Céu', icon: '☁️', required: true }
  ];

  const handleInputChange = (name, value) => {
    setNovoVeiculo(prev => ({ 
      ...prev, 
      [name]: name === 'placa' ? value.toUpperCase() : value 
    }));
  };

  const tirarFoto = async (tipo) => {
    const permissao = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissao.granted) {
      alert('Precisamos de permissão para acessar a câmera!');
      return;
    }

    let resultado = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaType.images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!resultado.canceled && resultado.assets[0]) {
      const asset = resultado.assets[0];
      setFotos(prev => ({ ...prev, [tipo]: asset.uri }));
    }
  };

  const removeFoto = (tipo) => {
    setFotos(prev => ({ ...prev, [tipo]: null }));
  };

  const cadastrarVeiculo = async () => {
    const vehicleData = {
      plate: novoVeiculo.placa,
      model: novoVeiculo.model,
      year: parseInt(novoVeiculo.year),
      mileage: 0,
      vehicleType: 'car',
      operationalStatus: 'active',
      observation: null
    };

    const response = await api.post('/vehicles', vehicleData);
    return response.data;
  };

  const enviarFotos = async (placa) => {
    const formData = new FormData();
    formData.append('placa', placa);
    
    Object.entries(fotos).forEach(([tipo, uri]) => {
      if (uri) {
        const nomeArquivo = uri.split('/').pop();
        const match = /\.(\w+)$/.exec(nomeArquivo);
        const tipoMime = match ? `image/${match[1]}` : `image`;
        
        formData.append(tipo, {
          uri: uri,
          name: nomeArquivo,
          type: tipoMime
        });
      }
    });

    const response = await api.post('/inspecao/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  };

  const handleSalvarTudo = async () => {
    if (!novoVeiculo.placa || novoVeiculo.placa.trim() === '') {
      setErroGeral("Insira uma placa válida.");
      return;
    }
    if (!novoVeiculo.model || novoVeiculo.model.trim() === '') {
      setErroGeral("Insira o modelo do veículo.");
      return;
    }

    const faltando = fotoTipos.filter(t => t.required && !fotos[t.id]);
    if (faltando.length > 0) {
      setErroGeral(`Faltam fotos: ${faltando.map(f => f.label).join(', ')}`);
      return;
    }

    setLoading(true);
    setErroGeral(null);

    try {
      await cadastrarVeiculo();
      await enviarFotos(novoVeiculo.placa);
      
      setSucesso(true);
      setTimeout(() => aoVoltar(), 2000);
    } catch (error) {
      console.error(error);
      setErroGeral(error.response?.data?.erro || "Erro ao salvar o veículo e fotos.");
    } finally {
      setLoading(false);
    }
  };

  const totalSelecionadas = Object.values(fotos).filter(f => f !== null).length;
  const isCompleto = totalSelecionadas === 5;

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <ScrollView 
          contentContainerStyle={[
            styles.scrollContent,
            { 
              paddingBottom: Math.max(insets.bottom, 20) + 100,
              paddingTop: 8 
            }
          ]}
          showsVerticalScrollIndicator={true}
          keyboardShouldPersistTaps="handled"
        >
          
          <TouchableOpacity onPress={aoVoltar} style={styles.backButton}>
            <Ionicons name="chevron-back" size={20} color="white" />
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>

          {/* Título */}
          <View style={styles.titleContainer}>
            <Text style={styles.mainTitle}>
              Upload <Text style={styles.highlightText}>Fotos</Text>
            </Text>
            <Text style={styles.subtitle}>Preencha os dados e tire as 5 fotos obrigatórias</Text>
          </View>

          {/* Formulário de Dados */}
          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="car" size={18} color="#fff" /> Dados do Veículo
            </Text>
            <TextInput
              style={styles.input}
              placeholder="PLACA (ex: ABC1234)"
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={novoVeiculo.placa}
              onChangeText={(txt) => handleInputChange('placa', txt)}
              autoCapitalize="characters"
              editable={!loading}
            />
            <TextInput
              style={styles.input}
              placeholder="MODELO (ex: Fiat Strada)"
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={novoVeiculo.model}
              onChangeText={(txt) => handleInputChange('model', txt)}
              editable={!loading}
            />
            <TextInput
              style={styles.input}
              placeholder="ANO"
              placeholderTextColor="rgba(255,255,255,0.4)"
              keyboardType="numeric"
              value={novoVeiculo.year}
              onChangeText={(txt) => handleInputChange('year', txt)}
              editable={!loading}
            />
          </View>

          {/* Barra de Progresso */}
          <View style={styles.progressContainer}>
            <View style={styles.progressTextRow}>
              <Text style={styles.progressText}>Progresso das Fotos</Text>
              <Text style={styles.progressCount}>{totalSelecionadas}/5</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[
                styles.progressBarFill, 
                { width: `${(totalSelecionadas / 5) * 100}%`, backgroundColor: isCompleto ? '#4ade80' : '#00b7eb' }
              ]} />
            </View>
          </View>

          {/* Grid de Fotos */}
          <View style={styles.gridContainer}>
            {fotoTipos.map(({ id, label, icon }) => (
              <View key={id} style={[styles.photoCard, fotos[id] ? styles.photoCardSuccess : styles.photoCardBorder]}>
                <View style={styles.photoHeader}>
                  <Text style={styles.photoLabel}>{icon} {label} *</Text>
                  {fotos[id] && (
                    <TouchableOpacity 
                      onPress={() => removeFoto(id)} 
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons name="close-circle" size={20} color="#f87171" />
                    </TouchableOpacity>
                  )}
                </View>

                {fotos[id] ? (
                  <Image source={{ uri: fotos[id] }} style={styles.previewImage} />
                ) : (
                  <TouchableOpacity 
                    onPress={() => tirarFoto(id)} 
                    style={styles.cameraPlaceholder} 
                    disabled={loading}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="camera" size={36} color="rgba(51, 204, 255, 0.6)" />
                    <Text style={styles.cameraText}>Tirar Foto</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>

          {/* Alertas de Status */}
          {sucesso && (
            <View style={[styles.alert, styles.alertSuccess]}>
              <Ionicons name="checkmark-circle" size={20} color="#4ade80" />
              <Text style={styles.alertTextSuccess}>Veículo cadastrado e fotos enviadas! Redirecionando...</Text>
            </View>
          )}
          {erroGeral && (
            <View style={[styles.alert, styles.alertError]}>
              <Ionicons name="alert-circle" size={20} color="#ef4444" />
              <Text style={styles.alertTextError}>{erroGeral}</Text>
            </View>
          )}

          {/* Botão de Submissão */}
          <TouchableOpacity 
            onPress={handleSalvarTudo} 
            disabled={loading || !isCompleto}
            style={[
              styles.submitButtonWrapper,
              { opacity: loading || !isCompleto ? 0.5 : 1 }
            ]}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#00b7eb', '#0099cc']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.submitButton}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.submitButtonText}>
                  📸 CADASTRAR E ENVIAR FOTOS ({totalSelecionadas}/5)
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#00112b' 
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: { 
    paddingHorizontal: 16,
  },
  backButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    alignSelf: 'flex-start', 
    backgroundColor: '#002b45', 
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    borderRadius: 20, 
    marginBottom: 20,
    zIndex: 1
  },
  backButtonText: { 
    color: 'white', 
    marginLeft: 6, 
    fontSize: 14 
  },
  titleContainer: { 
    alignItems: 'center', 
    marginBottom: 24 
  },
  mainTitle: { 
    fontSize: 26, 
    fontWeight: 'bold', 
    color: '#fff' 
  },
  highlightText: { 
    color: '#00b7eb' 
  },
  subtitle: { 
    color: '#94a3b8', 
    fontSize: 13, 
    marginTop: 4, 
    textAlign: 'center' 
  },
  formContainer: { 
    backgroundColor: 'rgba(0, 43, 69, 0.5)', 
    borderRadius: 16, 
    padding: 16, 
    marginBottom: 20, 
    borderWidth: 1, 
    borderColor: 'rgba(51, 204, 255, 0.3)' 
  },
  sectionTitle: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: 'bold', 
    marginBottom: 12 
  },
  input: { 
    backgroundColor: '#00112b', 
    borderRadius: 12, 
    padding: 12, 
    color: '#fff', 
    borderWidth: 1, 
    borderColor: 'rgba(51, 204, 255, 0.3)', 
    marginBottom: 12 
  },
  progressContainer: { 
    marginBottom: 20 
  },
  progressTextRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 6 
  },
  progressText: { 
    color: '#fff', 
    fontSize: 13 
  },
  progressCount: { 
    color: '#fff', 
    fontWeight: 'bold' 
  },
  progressBarBg: { 
    width: '100%', 
    height: 8, 
    backgroundColor: '#00112b', 
    borderRadius: 99,
    overflow: 'hidden'
  },
  progressBarFill: { 
    height: 8, 
    borderRadius: 99 
  },
  gridContainer: { 
    gap: 16, 
    marginBottom: 20 
  },
  photoCard: { 
    backgroundColor: 'rgba(0, 82, 204, 0.2)', 
    borderRadius: 16, 
    padding: 12, 
    borderWidth: 2 
  },
  photoCardBorder: { 
    borderColor: 'rgba(51, 204, 255, 0.3)' 
  },
  photoCardSuccess: { 
    borderColor: '#4ade80' 
  },
  photoHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 8 
  },
  photoLabel: { 
    color: '#fff', 
    fontSize: 12, 
    fontWeight: 'bold', 
    textTransform: 'uppercase' 
  },
  cameraPlaceholder: { 
    width: '100%', 
    height: 160, 
    backgroundColor: '#00112b', 
    borderRadius: 12, 
    borderStyle: 'dashed', 
    borderWidth: 2, 
    borderColor: 'rgba(51, 204, 255, 0.5)', 
    justifyContent: 'center', 
    alignItems: 'center', 
    gap: 6 
  },
  cameraText: { 
    color: '#fff', 
    fontSize: 13, 
    opacity: 0.7 
  },
  previewImage: { 
    width: '100%', 
    height: 160, 
    borderRadius: 12, 
    resizeMode: 'cover' 
  },
  alert: { 
    padding: 12, 
    borderRadius: 12, 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 10, 
    marginBottom: 16, 
    borderWidth: 1 
  },
  alertSuccess: { 
    backgroundColor: 'rgba(74, 222, 128, 0.15)', 
    borderColor: '#4ade80' 
  },
  alertError: { 
    backgroundColor: 'rgba(239, 68, 68, 0.15)', 
    borderColor: '#ef4444' 
  },
  alertTextSuccess: { 
    color: '#4ade80', 
    fontSize: 12, 
    flex: 1 
  },
  alertTextError: { 
    color: '#ef4444', 
    fontSize: 12, 
    flex: 1 
  },
  submitButtonWrapper: {
    borderRadius: 16,
    marginTop: 8,
    marginBottom: 20,
  },
  submitButton: { 
    borderRadius: 16, 
    padding: 16, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  submitButtonText: { 
    color: '#00112b', 
    fontSize: 16, 
    fontWeight: 'bold' 
  }
});