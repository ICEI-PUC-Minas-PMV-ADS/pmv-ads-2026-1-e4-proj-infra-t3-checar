import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const vehicleTypes = [
  { value: 'car', label: 'Carro' },
  { value: 'motorcycle', label: 'Moto' },
  { value: 'truck', label: 'Caminhão' },
  { value: 'bus', label: 'Ônibus' },
  { value: 'van', label: 'Van' },
  { value: 'other', label: 'Outro' },
];

const operationalStatusOptions = [
  { value: 'active', label: 'Ativo' },
  { value: 'inactive', label: 'Inativo' },
  { value: 'maintenance', label: 'Manutenção' },
  { value: 'decommissioned', label: 'Descomissionado' },
];

const VehicleForm = ({
  values,
  onChange,
  onSubmit,
  onDelete,
  loading,
  isEditing,
  error,
  success,
}) => {
  const handleDeleteConfirm = () => {
    if (onDelete) {
      Alert.alert(
        'Excluir veículo?',
        'Tem certeza que deseja excluir este veículo? Esta ação não pode ser desfeita.',
        [
          { text: 'Cancelar', onPress: () => {}, style: 'cancel' },
          {
            text: 'Excluir',
            onPress: onDelete,
            style: 'destructive',
          },
        ]
      );
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerLabel}>DADOS DO VEÍCULO</Text>
          <Text style={styles.headerTitle}>
            {isEditing ? 'Editar veículo' : 'Novo veículo'}
          </Text>
        </View>

        {/* Mensagens */}
        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={18} color="#ef4444" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {success && (
          <View style={styles.successContainer}>
            <Ionicons name="checkmark-circle" size={18} color="#4ade80" />
            <Text style={styles.successText}>{success}</Text>
          </View>
        )}

        {/* Formulário */}
        <View style={styles.form}>
          {/* Placa */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Placa</Text>
            <TextInput
              style={styles.input}
              placeholder="ABC1234"
              placeholderTextColor="rgba(255, 255, 255, 0.3)"
              value={values.plate}
              onChangeText={(text) => onChange('plate', text.toUpperCase())}
              editable={!loading}
              autoCapitalize="characters"
            />
          </View>

          {/* Modelo */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Modelo</Text>
            <TextInput
              style={styles.input}
              placeholder="Fiat Strada"
              placeholderTextColor="rgba(255, 255, 255, 0.3)"
              value={values.model}
              onChangeText={(text) => onChange('model', text)}
              editable={!loading}
            />
          </View>

          {/* Ano */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Ano</Text>
            <TextInput
              style={styles.input}
              placeholder="2025"
              placeholderTextColor="rgba(255, 255, 255, 0.3)"
              value={values.year.toString()}
              onChangeText={(text) => onChange('year', text)}
              editable={!loading}
              keyboardType="number-pad"
            />
          </View>

          {/* Quilometragem */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Quilometragem (km)</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              placeholderTextColor="rgba(255, 255, 255, 0.3)"
              value={values.mileage.toString()}
              onChangeText={(text) => onChange('mileage', text)}
              editable={!loading}
              keyboardType="number-pad"
            />
          </View>

          {/* Tipo de Veículo */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Tipo de Veículo</Text>
            <View style={styles.selectGroup}>
              {vehicleTypes.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.selectOption,
                    values.vehicleType === type.value && styles.selectOptionActive,
                  ]}
                  onPress={() => onChange('vehicleType', type.value)}
                  disabled={loading}
                >
                  <Text
                    style={[
                      styles.selectOptionText,
                      values.vehicleType === type.value && styles.selectOptionTextActive,
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Status Operacional */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Status Operacional</Text>
            <View style={styles.selectGroup}>
              {operationalStatusOptions.map((status) => (
                <TouchableOpacity
                  key={status.value}
                  style={[
                    styles.selectOption,
                    values.operationalStatus === status.value && styles.selectOptionActive,
                  ]}
                  onPress={() => onChange('operationalStatus', status.value)}
                  disabled={loading}
                >
                  <Text
                    style={[
                      styles.selectOptionText,
                      values.operationalStatus === status.value && styles.selectOptionTextActive,
                    ]}
                  >
                    {status.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Observação */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Observação</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder="Ex: Verificar nível de óleo..."
              placeholderTextColor="rgba(255, 255, 255, 0.3)"
              value={values.observation}
              onChangeText={(text) => onChange('observation', text)}
              editable={!loading}
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Botões de Ação */}
          <View style={styles.buttonGroup}>
            {onDelete && (
              <TouchableOpacity
                style={[styles.button, styles.buttonDelete]}
                onPress={handleDeleteConfirm}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#ef4444" />
                ) : (
                  <>
                    <Ionicons name="trash" size={18} color="#ef4444" />
                    <Text style={styles.buttonDeleteText}>Excluir</Text>
                  </>
                )}
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.button, styles.buttonPrimary]}
              onPress={onSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#00112b" />
              ) : (
                <>
                  <Ionicons
                    name={isEditing ? 'save' : 'add'}
                    size={18}
                    color="#00112b"
                  />
                  <Text style={styles.buttonPrimaryText}>
                    {isEditing ? 'Salvar alterações' : 'Criar veículo'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Espaço final */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default VehicleForm;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  header: {
    marginBottom: 20,
  },
  headerLabel: {
    fontSize: 10,
    color: '#00b7eb',
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  errorText: {
    flex: 1,
    color: '#fecaca',
    fontSize: 13,
    fontWeight: '600',
  },
  successContainer: {
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.4)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  successText: {
    flex: 1,
    color: '#bbf7d0',
    fontSize: 13,
    fontWeight: '600',
  },
  form: {
    gap: 20,
  },
  fieldGroup: {
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.8)',
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#00112b',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 14,
  },
  textarea: {
    paddingVertical: 12,
    textAlignVertical: 'top',
  },
  selectGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectOption: {
    backgroundColor: 'rgba(0, 153, 204, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: '48%',
  },
  selectOptionActive: {
    backgroundColor: '#00b7eb',
    borderColor: '#00b7eb',
  },
  selectOptionText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  selectOptionTextActive: {
    color: '#00112b',
  },
  buttonGroup: {
    gap: 12,
    marginTop: 24,
    marginBottom: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  buttonPrimary: {
    backgroundColor: '#00b7eb',
    borderColor: '#00b7eb',
  },
  buttonPrimaryText: {
    color: '#00112b',
    fontWeight: '900',
    fontSize: 14,
  },
  buttonDelete: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  buttonDeleteText: {
    color: '#ef4444',
    fontWeight: '900',
    fontSize: 14,
  },
});
