import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Text,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import VehicleForm from './VehicleForm';

const API_URL = 'http://192.168.1.7:3000/vehicles';

const emptyVehicle = {
  plate: '',
  model: '',
  year: new Date().getFullYear(),
  mileage: 0,
  vehicleType: 'car',
  operationalStatus: 'active',
  observation: '',
};

const VehicleDetails = ({ vehicleId, isNew = false, onClose, onSave }) => {
  const [formData, setFormData] = useState(emptyVehicle);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!isNew);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isNew) {
      setFormData(emptyVehicle);
      setFetching(false);
      return;
    }

    const loadVehicle = async () => {
      try {
        setFetching(true);
        const response = await axios.get(`${API_URL}/${vehicleId}`);
        const vehicle = response.data?.data;
        if (!vehicle) {
          setError('Veículo não encontrado.');
          return;
        }
        setFormData({
          plate: vehicle.plate || '',
          model: vehicle.model || '',
          year: vehicle.year || new Date().getFullYear(),
          mileage: vehicle.mileage ?? 0,
          vehicleType: vehicle.vehicleType || 'car',
          operationalStatus: vehicle.operationalStatus || 'active',
          observation: vehicle.observation || '',
        });
      } catch (err) {
        console.error('Erro ao carregar veículo:', err);
        setError(err.response?.data?.message || 'Falha ao carregar o veículo.');
      } finally {
        setFetching(false);
      }
    };

    loadVehicle();
  }, [isNew, vehicleId]);

  const handleChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'plate' ? value.toUpperCase() : value,
    }));
  };

  const handleSubmit = async () => {
    try {
      setError('');
      setSuccess('');
      setLoading(true);

      const payload = {
        plate: formData.plate.trim().toUpperCase(),
        model: formData.model.trim(),
        year: Number(formData.year),
        mileage: Number(formData.mileage),
        vehicleType: formData.vehicleType,
        operationalStatus: formData.operationalStatus,
        observation: formData.observation.trim() || null,
      };

      if (!payload.plate || !payload.model || !payload.year) {
        setError('Placa, modelo e ano são obrigatórios.');
        return;
      }

      if (isNew) {
        await axios.post(API_URL, payload);
        setSuccess('Veículo criado com sucesso!');
        setTimeout(() => {
          if (onSave) onSave();
          if (onClose) onClose();
        }, 1000);
        return;
      }

      await axios.put(`${API_URL}/${vehicleId}`, payload);
      setSuccess('Dados atualizados com sucesso!');
      setTimeout(() => {
        if (onSave) onSave();
        if (onClose) onClose();
      }, 1000);
    } catch (err) {
      console.error('Erro ao salvar:', err);
      const message =
        err.response?.data?.message ||
        err.response?.data?.errors?.join(', ') ||
        err.message;
      setError(message || 'Erro ao salvar o veículo.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`${API_URL}/${vehicleId}`);
      setSuccess('Veículo excluído com sucesso!');
      setTimeout(() => {
        if (onSave) onSave();
        if (onClose) onClose();
      }, 1000);
    } catch (err) {
      console.error('Erro ao deletar:', err);
      setError(err.response?.data?.message || 'Erro ao excluir o veículo.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} disabled={loading}>
            <Ionicons name="chevron-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Carregando...</Text>
          <View style={{ width: 28 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00b7eb" />
          <Text style={styles.loadingText}>Carregando veículo...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} disabled={loading}>
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isNew ? 'Novo Veículo' : 'Detalhes'}
        </Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Resumo Rápido (sidebar visual) */}
      {!isNew && (
        <View style={styles.quickSummary}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Placa</Text>
              <Text style={styles.summaryValue} numberOfLines={2}>
                {formData.plate || '---'}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Modelo</Text>
              <Text style={styles.summaryValue} numberOfLines={2}>
                {formData.model || '---'}
              </Text>
            </View>
          </View>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Status</Text>
              <Text style={styles.summaryValue} numberOfLines={2}>
                {formData.operationalStatus}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Km</Text>
              <Text style={styles.summaryValue} numberOfLines={2}>
                {Number(formData.mileage).toLocaleString()}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Formulário */}
      <VehicleForm
        values={formData}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onDelete={!isNew ? handleDelete : undefined}
        loading={loading}
        isEditing={!isNew}
        error={error}
        success={success}
      />
    </View>
  );
};

export default VehicleDetails;

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
    paddingTop: 24,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  quickSummary: {
    backgroundColor: 'rgba(0, 153, 204, 0.05)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  summaryItem: {
    flex: 1,
    minWidth: 0,
    marginRight: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'rgba(0, 183, 235, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 183, 235, 0.2)',
    alignItems: 'flex-start',
  },
  summaryLabel: {
    fontSize: 9,
    color: '#00b7eb',
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '900',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    marginTop: 12,
    fontWeight: '500',
  },
});
