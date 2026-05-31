import React, { useEffect, useMemo, useState } from 'react';
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
  ActivityIndicator,
  Button,
  Card,
  IconButton,
  SegmentedButtons,
  TextInput as PaperTextInput,
} from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const API_BASE_URL = 'http://10.0.2.2:3000';
const TIPO_OPTIONS = ['Diario', 'Preventivo'];
const paperInputTheme = {
  colors: {
    background: '#00112b',
    onSurfaceVariant: 'rgba(255,255,255,0.55)',
  },
};

const INITIAL_SECTIONS = [
  {
    id: 'motor',
    titulo: 'MOTOR',
    campos: [
      { id: 'nivel-oleo', nome: 'Nivel de oleo' },
      { id: 'vazamentos-aparentes', nome: 'Vazamentos aparentes' },
    ],
  },
  {
    id: 'pneus',
    titulo: 'PNEUS',
    campos: [
      { id: 'calibragem', nome: 'Calibragem' },
      { id: 'desgastes', nome: 'Desgastes' },
      { id: 'estepe', nome: 'Estepe' },
    ],
  },
  {
    id: 'seguranca',
    titulo: 'SEGURANCA',
    campos: [
      { id: 'freios', nome: 'Freios' },
      { id: 'luzes', nome: 'Luzes' },
      { id: 'cinto', nome: 'Cinto' },
    ],
  },
];

const cloneInitialSections = () => INITIAL_SECTIONS.map((section) => ({
  ...section,
  campos: section.campos.map((field) => ({ ...field })),
}));

const createLocalId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const sortByOrder = (a, b) => (a.ordem || 0) - (b.ordem || 0);
const orderByOrder = (items = []) => [...items].sort(sortByOrder);

const mapModeloToFormSections = (modelo) => {
  const secoes = modelo?.secoes || [];
  if (secoes.length === 0) return cloneInitialSections();

  return orderByOrder(secoes).map((section) => ({
    id: section._id || createLocalId('secao'),
    titulo: section.titulo || '',
    campos: orderByOrder(section.campos).map((field) => ({
      id: field._id || createLocalId('campo'),
      nome: field.nome || '',
    })),
  }));
};

export default function ModeloChecklistEdit({ navegar, params = {} }) {
  const insets = useSafeAreaInsets();
  const modeloId = params.modeloId;
  const isEditing = Boolean(modeloId);

  const [formData, setFormData] = useState({
    nome: '',
    tipo: TIPO_OPTIONS[0],
    descricao: '',
  });
  const [sections, setSections] = useState(cloneInitialSections);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(isEditing);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const carregarModelo = async () => {
      if (!isEditing) {
        setPageLoading(false);
        return;
      }

      try {
        setPageLoading(true);
        setMessage({ type: '', text: '' });
        const response = await axios.get(`${API_BASE_URL}/modelochecklists/${modeloId}`);
        const modelo = response.data;

        setFormData({
          nome: modelo.nome || '',
          tipo: modelo.tipo || TIPO_OPTIONS[0],
          descricao: modelo.descricao || '',
        });
        setSections(mapModeloToFormSections(modelo));
      } catch (err) {
        setMessage({ type: 'error', text: `Falha ao carregar modelo: ${err.response?.data?.erro || err.message}` });
      } finally {
        setPageLoading(false);
      }
    };

    carregarModelo();
  }, [isEditing, modeloId]);

  const secoesPayload = useMemo(() =>
    sections
      .map((section, sectionIndex) => ({
        titulo: section.titulo.trim(),
        ordem: sectionIndex,
        campos: section.campos
          .map((field, fieldIndex) => ({
            nome: field.nome.trim(),
            ordem: fieldIndex,
          }))
          .filter((field) => field.nome),
      }))
      .filter((section) => section.titulo && section.campos.length > 0),
  [sections]);

  const handleChange = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handleSectionChange = (sectionId, value) => {
    setSections((current) =>
      current.map((section) => section.id === sectionId ? { ...section, titulo: value } : section)
    );
  };

  const handleFieldChange = (sectionId, fieldId, value) => {
    setSections((current) =>
      current.map((section) => {
        if (section.id !== sectionId) return section;
        return {
          ...section,
          campos: section.campos.map((field) =>
            field.id === fieldId ? { ...field, nome: value } : field
          ),
        };
      })
    );
  };

  const addSection = () => {
    setSections((current) => [
      ...current,
      { id: createLocalId('secao'), titulo: '', campos: [{ id: createLocalId('campo'), nome: '' }] },
    ]);
  };

  const removeSection = (sectionId) => {
    setSections((current) => current.filter((section) => section.id !== sectionId));
  };

  const addField = (sectionId) => {
    setSections((current) =>
      current.map((section) =>
        section.id === sectionId
          ? { ...section, campos: [...section.campos, { id: createLocalId('campo'), nome: '' }] }
          : section
      )
    );
  };

  const removeField = (sectionId, fieldId) => {
    setSections((current) =>
      current.map((section) =>
        section.id === sectionId
          ? { ...section, campos: section.campos.filter((field) => field.id !== fieldId) }
          : section
      )
    );
  };

  const resetDraft = () => {
    setFormData({ nome: '', tipo: TIPO_OPTIONS[0], descricao: '' });
    setSections(cloneInitialSections());
    setMessage({ type: '', text: '' });
  };

  const validate = () => {
    if (!formData.nome.trim()) return 'Preencha o nome do modelo.';
    if (!formData.tipo) return 'Selecione o tipo do modelo.';
    if (!formData.descricao.trim()) return 'Preencha a descricao do modelo.';
    if (secoesPayload.length === 0) return 'Adicione pelo menos uma secao com itens.';

    const hasBlankField = sections.some(
      (section) => !section.titulo.trim() || section.campos.some((field) => !field.nome.trim())
    );

    if (hasBlankField) return 'Preencha todas as secoes e itens antes de salvar.';
    return '';
  };

  const handleSave = async () => {
    const validationMessage = validate();
    if (validationMessage) {
      setMessage({ type: 'error', text: validationMessage });
      return;
    }

    const payload = {
      nome: formData.nome.trim(),
      tipo: formData.tipo,
      descricao: formData.descricao.trim(),
      secoes: secoesPayload,
      ativo: true,
    };

    try {
      setLoading(true);
      setMessage({ type: '', text: '' });

      if (isEditing) {
        await axios.put(`${API_BASE_URL}/modelochecklists/${modeloId}`, payload);
      } else {
        await axios.post(`${API_BASE_URL}/modelochecklists`, payload);
      }

      setMessage({ type: 'success', text: 'Modelo salvo com sucesso.' });
      setTimeout(() => navegar('modelos'), 500);
    } catch (err) {
      setMessage({ type: 'error', text: `Falha ao salvar modelo: ${err.response?.data?.erro || err.message}` });
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#00b7eb" style={styles.loader} />
        <Text style={styles.infoText}>Carregando modelo...</Text>
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
            onPress={() => navegar('modelos')}
            buttonColor="#002b45"
            textColor="#fff"
            style={styles.backButton}
            contentStyle={styles.backButtonContent}
          >
            Voltar
          </Button>

          <View style={styles.titleContainer}>
            <Text style={styles.mainTitle}>
              {isEditing ? 'Editar Modelo' : 'Novo Modelo'} <Text style={styles.highlightText}>Checklist</Text>
            </Text>
            <Text style={styles.subtitle}>Estruture inspecoes padronizadas para diferentes cenarios.</Text>
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

          <Card style={styles.formContainer}>
            <Card.Content>
            <PaperTextInput
              mode="outlined"
              label="Nome"
              placeholder="Checklist da frota"
              value={formData.nome}
              onChangeText={(value) => handleChange('nome', value)}
              editable={!loading}
              textColor="#fff"
              outlineColor="rgba(51, 204, 255, 0.35)"
              activeOutlineColor="#00b7eb"
              theme={paperInputTheme}
              style={styles.paperInput}
            />

            <SegmentedButtons
              value={formData.tipo}
              onValueChange={(value) => handleChange('tipo', value)}
              buttons={TIPO_OPTIONS.map((tipo) => ({
                value: tipo,
                label: tipo,
                disabled: loading,
                checkedColor: '#00112b',
                uncheckedColor: '#fff',
              }))}
              style={styles.segmentedButtons}
              theme={{ colors: { secondaryContainer: '#00b7eb', onSecondaryContainer: '#00112b', outline: '#00b7eb' } }}
            />

            <PaperTextInput
              mode="outlined"
              label="Descricao"
              placeholder="Descreva quando e como este modelo sera usado"
              value={formData.descricao}
              onChangeText={(value) => handleChange('descricao', value)}
              editable={!loading}
              multiline
              textColor="#fff"
              outlineColor="rgba(51, 204, 255, 0.35)"
              activeOutlineColor="#00b7eb"
              theme={paperInputTheme}
              style={[styles.paperInput, styles.textArea]}
            />
            </Card.Content>
          </Card>

          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderText}>
              <Text style={styles.sectionTitle}>Secoes <Text style={styles.highlightText}>do Checklist</Text></Text>
              <Text style={styles.subtitleLeft}>Organize os itens por categorias.</Text>
            </View>
            <IconButton
              icon="plus"
              mode="contained"
              containerColor="#00b7eb"
              iconColor="#00112b"
              size={24}
              onPress={addSection}
              disabled={loading}
              style={styles.roundAddButton}
            />
          </View>

          {sections.map((section, sectionIndex) => (
            <Card key={section.id} style={styles.sectionCard}>
              <Card.Content>
              <View style={styles.sectionInputRow}>
                <PaperTextInput
                  mode="outlined"
                  style={[styles.paperInput, styles.sectionInput]}
                  placeholder={`Secao ${sectionIndex + 1}`}
                  value={section.titulo}
                  onChangeText={(value) => handleSectionChange(section.id, value)}
                  editable={!loading}
                  textColor="#fff"
                  outlineColor="rgba(51, 204, 255, 0.35)"
                  activeOutlineColor="#00b7eb"
                  theme={paperInputTheme}
                />
                <IconButton
                  icon="trash-can"
                  mode="contained"
                  onPress={() => removeSection(section.id)}
                  disabled={loading || sections.length === 1}
                  containerColor="#7a0800"
                  iconColor="#fff"
                  size={18}
                  style={styles.deleteIconButton}
                />
              </View>

              {section.campos.map((field, fieldIndex) => (
                <View key={field.id} style={styles.fieldInputRow}>
                  <PaperTextInput
                    mode="outlined"
                    style={[styles.paperInput, styles.fieldInput]}
                    placeholder={`Item ${fieldIndex + 1}`}
                    value={field.nome}
                    onChangeText={(value) => handleFieldChange(section.id, field.id, value)}
                    editable={!loading}
                    textColor="#fff"
                    outlineColor="rgba(51, 204, 255, 0.35)"
                    activeOutlineColor="#00b7eb"
                    theme={paperInputTheme}
                  />
                  <IconButton
                    icon="close"
                    mode="contained-tonal"
                    onPress={() => removeField(section.id, field.id)}
                    disabled={loading || section.campos.length === 1}
                    containerColor="#0057c2"
                    iconColor="#fff"
                    size={18}
                    style={styles.itemIconButton}
                  />
                </View>
              ))}

              <Button
                mode="text"
                icon="plus-circle"
                onPress={() => addField(section.id)}
                disabled={loading}
                textColor="#5bc4f1"
                style={styles.addFieldButton}
                labelStyle={styles.addFieldText}
              >
                Adicionar item
              </Button>
              </Card.Content>
            </Card>
          ))}

          <Card style={styles.previewCard}>
            <Card.Content>
            <Text style={styles.previewTitle}>Modelo <Text style={styles.highlightText}>do Checklist</Text></Text>
            <Text style={styles.previewDescription}>
              {formData.descricao || 'A descricao do modelo aparece aqui para revisao antes de salvar.'}
            </Text>
            <Text style={styles.previewMeta}>NOME</Text>
            <Text style={styles.previewValue}>{formData.nome || 'Checklist da frota'}</Text>
            <Text style={styles.previewMeta}>TIPO</Text>
            <Text style={styles.previewValue}>{formData.tipo}</Text>

            {secoesPayload.map((section) => (
              <View key={section.titulo} style={styles.previewSection}>
                <Text style={styles.previewSectionTitle}>{section.titulo}</Text>
                {section.campos.map((field) => (
                  <Text key={field.nome} style={styles.previewItem}>- {field.nome}</Text>
                ))}
              </View>
            ))}
            </Card.Content>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <Button
          mode="contained"
          icon="refresh"
          onPress={resetDraft}
          disabled={loading}
          buttonColor="#7a0800"
          textColor="#fff"
          style={styles.footerButton}
          contentStyle={styles.footerButtonContent}
          labelStyle={styles.footerButtonLabel}
        >
          Limpar
        </Button>
        <Button
          mode="contained"
          icon={loading ? undefined : 'check'}
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
  centerContainer: {
    flex: 1,
    backgroundColor: '#00112b',
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#002b45',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
  },
  backButtonText: {
    color: 'white',
    marginLeft: 6,
    fontSize: 14,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 22,
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
  subtitleLeft: {
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 4,
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
  formContainer: {
    backgroundColor: 'rgba(0, 43, 69, 0.5)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: 'rgba(51, 204, 255, 0.3)',
  },
  label: {
    color: '#00b7eb',
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 8,
    marginTop: 4,
  },
  input: {
    backgroundColor: '#00112b',
    borderRadius: 12,
    padding: 12,
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(51, 204, 255, 0.35)',
    marginBottom: 12,
    fontSize: 14,
  },
  paperInput: {
    backgroundColor: '#00112b',
    marginBottom: 12,
  },
  textArea: {
    minHeight: 110,
  },
  segmentedControl: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(51, 204, 255, 0.45)',
    overflow: 'hidden',
    marginBottom: 12,
  },
  segmentButton: {
    flex: 1,
    minHeight: 46,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00112b',
  },
  segmentButtonActive: {
    backgroundColor: '#00b7eb',
  },
  segmentButtonText: {
    color: '#fff',
    fontWeight: '800',
  },
  segmentButtonTextActive: {
    color: '#00112b',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionHeaderText: {
    flex: 1,
    paddingRight: 12,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  roundAddButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#00b7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteIconButton: {
    margin: 0,
    marginBottom: 12,
  },
  itemIconButton: {
    margin: 0,
    marginBottom: 12,
  },
  sectionCard: {
    backgroundColor: '#0041a3',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  sectionInputRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  sectionInput: {
    flex: 1,
    fontWeight: '900',
    backgroundColor: '#00357d',
  },
  fieldInputRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  fieldInput: {
    flex: 1,
    backgroundColor: '#00357d',
  },
  iconButtonDanger: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#7a0800',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0057c2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  disabledButton: {
    opacity: 0.4,
  },
  addFieldButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  addFieldText: {
    color: '#5bc4f1',
    fontWeight: '800',
    fontSize: 13,
  },
  previewCard: {
    backgroundColor: 'rgba(0, 43, 69, 0.65)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    marginTop: 6,
  },
  previewTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  previewDescription: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 8,
    marginBottom: 16,
  },
  previewMeta: {
    color: '#00b7eb',
    fontWeight: '900',
    fontSize: 12,
    marginTop: 10,
  },
  previewValue: {
    color: '#fff',
    marginTop: 3,
  },
  previewSection: {
    marginTop: 16,
  },
  previewSectionTitle: {
    color: '#00b7eb',
    fontWeight: '900',
  },
  previewItem: {
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
    fontSize: 13,
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
  footerButtonLabel: {
    fontWeight: '900',
  },
  clearButton: {
    backgroundColor: '#7a0800',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  clearButtonText: {
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
