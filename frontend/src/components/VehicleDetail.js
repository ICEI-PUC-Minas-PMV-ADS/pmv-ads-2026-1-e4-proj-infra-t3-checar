import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, SafeAreaView, StatusBar, TouchableOpacity, StyleSheet, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import vehicleService from '../services/vehicleService';
import { showAlert } from '../config/alertUtils';
import {
  VEHICLE_TYPE_OPTIONS,
  OPERATIONAL_STATUS_OPTIONS,
  getOperationalStatusLabel,
} from '../config/vehicleEnums';

export default function VehicleDetail({ navigation, route }) {
  const { vehicle } = route.params || {};
  const isNewVehicle = !vehicle;

  const [formData, setFormData] = useState({
    plate: vehicle?.plate || '',
    model: vehicle?.model || '',
    year: vehicle?.year?.toString() || new Date().getFullYear().toString(),
    mileage: vehicle?.mileage?.toString() || '0',
    vehicleType: vehicle?.vehicleType || 'van',
    operationalStatus: vehicle?.operationalStatus || 'active',
    observation: vehicle?.observation || '',
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleSave = async () => {
    if (!formData.plate.trim()) {
      showAlert('Erro', 'Por favor, preencha a placa do veículo');
      return;
    }
    if (!formData.model.trim()) {
      showAlert('Erro', 'Por favor, preencha o modelo do veículo');
      return;
    }

    const year = parseInt(formData.year) || new Date().getFullYear();
    const mileage = parseInt(formData.mileage) || 0;

    const vehicleData = {
      plate: formData.plate.toUpperCase(),
      model: formData.model,
      year,
      mileage,
      vehicleType: formData.vehicleType,
      operationalStatus: formData.operationalStatus,
      observation: formData.observation.trim() || null,
    };

    try {
      setLoading(true);

      if (isNewVehicle) {
        await vehicleService.createVehicle(vehicleData);
        showAlert(
          'Sucesso',
          'Veículo criado com sucesso',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        await vehicleService.updateVehicle(vehicle._id, vehicleData);
        showAlert(
          'Sucesso',
          'Veículo atualizado com sucesso',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }
    } catch (err) {
      showAlert('Erro', `Falha ao salvar veículo: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="white" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>
            {isNewVehicle ? 'Novo Veículo' : 'Editar Veículo'}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.formContainer}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Placa do Veículo</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: ABC-1234"
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
            value={formData.plate}
            onChangeText={(value) => handleChange('plate', value.toUpperCase())}
            autoCapitalize="characters"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Modelo</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: VAN 12"
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
            value={formData.model}
            onChangeText={(value) => handleChange('model', value)}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Ano de Fabricação</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: 2020"
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
            value={formData.year}
            onChangeText={(value) => handleChange('year', value)}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Quilometragem</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: 50000"
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
            value={formData.mileage}
            onChangeText={(value) => handleChange('mileage', value)}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Tipo de Veículo</Text>
          <View style={styles.statusOptions}>
            {VEHICLE_TYPE_OPTIONS.map(({ label, value }) => (
              <TouchableOpacity
                key={value}
                style={[
                  styles.statusButton,
                  formData.vehicleType === value && styles.statusButtonActive,
                ]}
                onPress={() => handleChange('vehicleType', value)}
              >
                <Text
                  style={[
                    styles.statusButtonText,
                    formData.vehicleType === value && styles.statusButtonTextActive,
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Status Operacional</Text>
          <View style={styles.statusOptions}>
            {OPERATIONAL_STATUS_OPTIONS.map(({ label, value }) => (
              <TouchableOpacity
                key={value}
                style={[
                  styles.statusButton,
                  formData.operationalStatus === value && styles.statusButtonActive,
                ]}
                onPress={() => handleChange('operationalStatus', value)}
              >
                <Text
                  style={[
                    styles.statusButtonText,
                    formData.operationalStatus === value && styles.statusButtonTextActive,
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Informações Adicionais</Text>
          <TextInput
            style={[styles.input, styles.observationInput]}
            placeholder="Ex: Observações adicionais sobre o veículo"
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
            value={formData.observation}
            onChangeText={(value) => handleChange('observation', value)}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.previewSection}>
          <Text style={styles.previewLabel}>Preview:</Text>
          <View style={styles.previewCard}>
            <View style={styles.cardLeftIndicator} />
            <View style={styles.imageContainer}>
              <Ionicons name="car" size={40} color="#001233" />
            </View>
            <View style={styles.previewInfo}>
              <Text style={styles.previewName}>{formData.model || 'Modelo do Veículo'}</Text>
              <Text style={styles.previewPlate}>{formData.plate || 'ABC-1234'}</Text>
            </View>
            <View style={styles.previewStatus}>
              <Text style={styles.previewStatusLabel}>Status:</Text>
              <Text style={styles.previewStatusValue}>{getOperationalStatusLabel(formData.operationalStatus)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.cancelButton} 
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Ionicons name="close" size={24} color="white" />
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.saveButton, loading && styles.saveButtonDisabled]} 
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Ionicons name="checkmark" size={24} color="white" />
              <Text style={styles.saveButtonText}>Salvar</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#001233' },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitleContainer: { flex: 1, alignItems: 'center', marginRight: 28 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  formContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 120,
  },
  formGroup: { marginBottom: 30 },
  label: {
    color: '#00b4d8',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#004aad',
    borderWidth: 2,
    borderColor: '#00b4d8',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 16,
  },
  observationInput: {
    minHeight: 100,
    paddingTop: 12,
    paddingBottom: 12,
    textAlignVertical: 'top',
  },
  statusOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  statusButton: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#00b4d8',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#004aad',
  },
  statusButtonActive: {
    backgroundColor: '#00b4d8',
    borderColor: '#fff',
  },
  statusButtonText: {
    color: '#00b4d8',
    fontWeight: 'bold',
    fontSize: 12,
  },
  statusButtonTextActive: {
    color: '#001233',
  },
  previewSection: { marginTop: 30 },
  previewLabel: {
    color: '#00b4d8',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  previewCard: {
    backgroundColor: '#004aad',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1.5,
    borderColor: '#fff',
    height: 100,
    position: 'relative',
    overflow: 'hidden',
  },
  cardLeftIndicator: {
    position: 'absolute',
    left: 0,
    top: '30%',
    bottom: '30%',
    width: 6,
    backgroundColor: '#00b4d8',
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  imageContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    width: 70,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewInfo: { flex: 1, paddingLeft: 15 },
  previewName: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  previewPlate: { color: '#fff', fontSize: 13 },
  previewStatus: { width: 60 },
  previewStatusLabel: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  previewStatusValue: { color: '#fff', fontSize: 12 },
  buttonContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 15,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#001233',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#7a0800',
    borderRadius: 12,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#00b4d8',
    borderRadius: 12,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#001233',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
