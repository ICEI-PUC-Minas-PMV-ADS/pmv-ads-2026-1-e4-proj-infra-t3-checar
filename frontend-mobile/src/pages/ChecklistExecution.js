import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import axios from 'axios';
import {
  Button,
  Card,
  IconButton,
  SegmentedButtons,
  TextInput as PaperTextInput,
} from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const API_BASE_URL = 'http://10.0.2.2:3000';
const STATUS_OPTIONS = ['Conforme', 'Nao Conforme'];
const paperInputTheme = {
  colors: {
    background: '#00112b',
    onSurfaceVariant: 'rgba(255,255,255,0.55)',
  },
};

const sortByOrder = (a, b) => (a.ordem || 0) - (b.ordem || 0);
const isActive = (item) => item.ativo !== false;

const mapModeloToSections = (modeloChecklist) => {
  const secoes = modeloChecklist?.secoes || [];

  return secoes
    .filter(isActive)
    .sort(sortByOrder)
    .map((secao) => ({
      id: secao._id || secao.titulo,
      title: secao.titulo,
      description: secao.descricao || '',
      items: (secao.campos || [])
        .filter(isActive)
        .sort(sortByOrder)
        .map((campo) => ({
          id: campo._id || `${secao.titulo}-${campo.nome}`,
          label: campo.nome,
          status: 'Conforme',
        })),
    }));
};

export default function ChecklistExecution({ navegar, params = {} }) {
  const insets = useSafeAreaInsets();
  const {
    vehicleId = null,
    vehicle = null,
    modeloChecklist = null,
    usuarioId = null,
  } = params;

  const [statusByItem, setStatusByItem] = useState({});
  const [notes, setNotes] = useState({});
  const [visibleNotes, setVisibleNotes] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const sections = useMemo(() =>
    mapModeloToSections(modeloChecklist).map((section) => ({
      ...section,
      items: section.items.map((item) => ({
        ...item,
        status: statusByItem[item.id] || item.status,
      })),
    })),
  [modeloChecklist, statusByItem]);

  const allItems = useMemo(() => sections.flatMap((section) => section.items), [sections]);
  const nonConformingCount = allItems.filter((item) => item.status === 'Nao Conforme').length;

  const handleStatusChange = (itemId, status) => {
    setStatusByItem((current) => ({ ...current, [itemId]: status }));
  };

  const handleNoteChange = (itemId, value) => {
    setNotes((current) => ({ ...current, [itemId]: value }));
  };

  const showNote = (itemId) => {
    setVisibleNotes((current) => ({ ...current, [itemId]: true }));
  };

  const createChecklist = async () => {
    const isConforme = allItems.every((item) => item.status === 'Conforme');
    const checklistData = {
      data: new Date().toISOString(),
      conformidade: isConforme,
      observacao: Object.values(notes).filter(Boolean).join('\n'),
      status: isConforme ? ['disponivel'] : ['com problema'],
      modeloId: modeloChecklist?._id,
    };

    if (vehicleId) checklistData.veiculoId = vehicleId;
    if (usuarioId) checklistData.usuarioId = usuarioId;

    const response = await axios.post(`${API_BASE_URL}/checklists`, checklistData);
    return response.data._id;
  };

  const handleSave = async () => {
    if (!modeloChecklist || allItems.length === 0) {
      setMessage({ type: 'error', text: 'Selecione um modelo com itens antes de salvar.' });
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: '', text: '' });

      const checklistId = await createChecklist();
      const itemsToSave = allItems.map((item) => {
        const payload = {
          checklistId,
          descricao: item.label,
          status: item.status,
        };

        if (notes[item.id]?.trim()) {
          payload.observacao = notes[item.id].trim();
        }

        return payload;
      });

      await Promise.all(
        itemsToSave.map((itemChecklist) => axios.post(`${API_BASE_URL}/itemchecklists`, itemChecklist))
      );

      setMessage({ type: 'success', text: 'Inspecao registrada com sucesso.' });
    } catch (err) {
      setMessage({ type: 'error', text: `Falha ao registrar checklist: ${err.response?.data?.erro || err.message}` });
    } finally {
      setLoading(false);
    }
  };

  if (!modeloChecklist) {
    return (
      <View style={styles.emptyPage}>
        <IconButton icon="clipboard-outline" size={52} iconColor="rgba(255,255,255,0.35)" />
        <Text style={styles.emptyTitle}>Nenhum modelo selecionado</Text>
        <Text style={styles.emptyText}>Escolha um modelo antes de iniciar o checklist.</Text>
        <Button
          mode="contained"
          onPress={() => navegar('modelos')}
          buttonColor="#00b7eb"
          textColor="#00112b"
          style={styles.primaryButton}
          labelStyle={styles.primaryButtonText}
        >
          Selecionar modelo
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, 20) + 110 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator
        >
          <Button
            mode="contained-tonal"
            icon="chevron-left"
            onPress={() => navegar(vehicleId ? 'modelos' : 'busca')}
            buttonColor="#002b45"
            textColor="#fff"
            style={styles.backButton}
            contentStyle={styles.backButtonContent}
          >
            Voltar
          </Button>

          <View style={styles.titleContainer}>
            <Text style={styles.mainTitle}>
              Checklist <Text style={styles.highlightText}>em andamento</Text>
            </Text>
            <Text style={styles.subtitle}>
              {vehicle?.model || vehicle?.nome || 'Veiculo'} | {vehicle?.plate || vehicle?.placa || 'sem placa'}
            </Text>
            <Text style={styles.modelName}>{modeloChecklist.nome}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Card style={styles.summaryBox}>
              <Card.Content style={styles.summaryContent}>
              <Text style={styles.summaryValue}>{allItems.length}</Text>
              <Text style={styles.summaryLabel}>Itens</Text>
              </Card.Content>
            </Card>
            <Card style={styles.summaryBox}>
              <Card.Content style={styles.summaryContent}>
              <Text style={[styles.summaryValue, nonConformingCount > 0 && styles.summaryWarning]}>
                {nonConformingCount}
              </Text>
              <Text style={styles.summaryLabel}>Nao conformes</Text>
              </Card.Content>
            </Card>
          </View>

          {message.text ? (
            <Card style={[styles.alert, message.type === 'success' ? styles.alertSuccess : styles.alertError]}>
              <Card.Content style={styles.alertContent}>
              <IconButton
                icon={message.type === 'success' ? 'check-circle' : 'alert-circle'}
                size={20}
                iconColor={message.type === 'success' ? '#4ade80' : '#ef4444'}
                style={styles.alertIcon}
              />
              <Text style={message.type === 'success' ? styles.alertSuccessText : styles.alertErrorText}>
                {message.text}
              </Text>
              </Card.Content>
            </Card>
          ) : null}

          {sections.map((section) => (
            <Card key={section.id} style={styles.sectionCard}>
              <Card.Content>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              {section.description ? (
                <Text style={styles.sectionDescription}>{section.description}</Text>
              ) : null}

              {section.items.map((item) => (
                <View key={item.id} style={styles.itemRow}>
                  <Text style={styles.itemLabel}>{item.label}</Text>

                  <SegmentedButtons
                    value={item.status}
                    onValueChange={(status) => handleStatusChange(item.id, status)}
                    buttons={STATUS_OPTIONS.map((status) => ({
                      value: status,
                      label: status === 'Conforme' ? 'Conforme' : 'Nao conforme',
                      disabled: loading,
                      checkedColor: '#00112b',
                      uncheckedColor: '#fff',
                    }))}
                    style={styles.segmentedButtons}
                    theme={{ colors: { secondaryContainer: '#00b7eb', onSecondaryContainer: '#00112b', outline: '#00b7eb' } }}
                  />

                  {visibleNotes[item.id] ? (
                    <PaperTextInput
                      mode="outlined"
                      label="Observacao"
                      placeholder="Adicione observacoes"
                      value={notes[item.id] || ''}
                      onChangeText={(value) => handleNoteChange(item.id, value)}
                      editable={!loading}
                      multiline
                      textColor="#fff"
                      outlineColor="rgba(51, 204, 255, 0.35)"
                      activeOutlineColor="#00b7eb"
                      theme={paperInputTheme}
                      style={styles.noteInput}
                    />
                  ) : (
                    <Button
                      mode="text"
                      icon="pencil-outline"
                      onPress={() => showNote(item.id)}
                      disabled={loading}
                      style={styles.noteButton}
                      textColor="#5bc4f1"
                      labelStyle={styles.noteButtonText}
                    >
                      Adicionar observacao
                    </Button>
                  )}
                </View>
              ))}
              </Card.Content>
            </Card>
          ))}
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <Button
          mode="contained"
          icon="close"
          onPress={() => navegar(vehicleId ? 'modelos' : 'busca')}
          disabled={loading}
          buttonColor="#7a0800"
          textColor="#fff"
          style={styles.footerButton}
          contentStyle={styles.footerButtonContent}
          labelStyle={styles.cancelButtonText}
        >
          Cancelar
        </Button>
        <Button
          mode="contained"
          icon={loading ? undefined : 'content-save-outline'}
          onPress={handleSave}
          disabled={loading}
          buttonColor="#00b7eb"
          textColor="#00112b"
          style={styles.footerButton}
          contentStyle={styles.footerButtonContent}
          labelStyle={styles.saveButtonText}
        >
          {loading ? 'Salvando...' : 'Salvar'}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#00112b',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 8 : 0,
  },
  emptyPage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#00112b',
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
    marginTop: 14,
    textAlign: 'center',
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  primaryButton: {
    borderRadius: 14,
    marginTop: 22,
  },
  primaryButtonText: {
    color: '#00112b',
    fontWeight: '900',
  },
  backButton: {
    alignSelf: 'flex-start',
    borderRadius: 20,
    marginBottom: 20,
  },
  backButtonContent: {
    minHeight: 38,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 18,
  },
  mainTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
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
  modelName: {
    color: '#00b7eb',
    fontSize: 13,
    fontWeight: '900',
    marginTop: 6,
    textTransform: 'uppercase',
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  summaryBox: {
    flex: 1,
    backgroundColor: 'rgba(0, 43, 69, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(51, 204, 255, 0.3)',
    borderRadius: 14,
  },
  summaryContent: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  summaryValue: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
  },
  summaryWarning: {
    color: '#ef4444',
  },
  summaryLabel: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 3,
  },
  alert: {
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
  },
  alertContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  alertIcon: {
    margin: 0,
    marginRight: 8,
  },
  alertSuccess: {
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    borderColor: '#4ade80',
  },
  alertError: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: '#ef4444',
  },
  alertSuccessText: {
    color: '#4ade80',
    fontSize: 12,
    flex: 1,
  },
  alertErrorText: {
    color: '#ef4444',
    fontSize: 12,
    flex: 1,
  },
  sectionCard: {
    backgroundColor: '#0041a3',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  sectionTitle: {
    color: '#00b7eb',
    fontSize: 20,
    fontWeight: '900',
  },
  sectionDescription: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    marginTop: 6,
  },
  itemRow: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.12)',
    paddingTop: 14,
    marginTop: 14,
  },
  itemLabel: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10,
  },
  segmentedButtons: {
    marginTop: 2,
  },
  segmentButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00357d',
    paddingHorizontal: 8,
  },
  segmentButtonActive: {
    backgroundColor: '#00b7eb',
  },
  segmentButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
  segmentButtonTextActive: {
    color: '#00112b',
  },
  noteButton: {
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  noteButtonText: {
    color: '#5bc4f1',
    fontSize: 13,
    fontWeight: '800',
  },
  noteInput: {
    backgroundColor: '#00112b',
    marginTop: 10,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: '#00112b',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  footerButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: 16,
    overflow: 'hidden',
  },
  footerButtonContent: {
    minHeight: 50,
  },
  cancelButton: {
    backgroundColor: '#7a0800',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: '900',
  },
  saveButton: {
    flex: 1,
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveButtonText: {
    color: '#00112b',
    fontWeight: '900',
    fontSize: 15,
  },
});
