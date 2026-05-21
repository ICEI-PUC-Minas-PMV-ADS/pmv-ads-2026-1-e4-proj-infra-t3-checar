import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const VehicleCard = ({ veiculo, onPress }) => {
  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
      <LinearGradient
        colors={['#0052cc', '#0041a3']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.card}
      >
        {/* Thumbnail do Veículo */}
        <View style={styles.imageContainer}>
          <Ionicons name="car" size={40} color="rgba(0, 17, 43, 0.2)" />
          <View
            style={[
              styles.statusIndicatorBar,
              { backgroundColor: veiculo.status === 'OK' ? '#4ade80' : '#ef4444' },
            ]}
          />
        </View>

        {/* Informações textuais */}
        <View style={styles.infoContainer}>
          <Text style={styles.vehicleName} numberOfLines={1}>
            {veiculo.nome}
          </Text>
          <Text style={styles.vehiclePlate}>{veiculo.placa}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>{veiculo.ano}</Text>
            <Text style={styles.metaText}>•</Text>
            <Text style={styles.metaText}>{veiculo.quilometragem?.toLocaleString()} km</Text>
          </View>
        </View>

        {/* Status e Alertas laterais */}
        <View style={styles.statusBadgeContainer}>
          <View
            style={[
              styles.statusBadge,
              veiculo.status === 'ALERTA' ? styles.badgeAlert : styles.badgeOk,
            ]}
          >
            <Text style={veiculo.status === 'ALERTA' ? styles.textAlert : styles.textOk}>
              {veiculo.status}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default VehicleCard;

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  imageContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#fff',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  statusIndicatorBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 4,
    height: '100%',
  },
  infoContainer: {
    flex: 1,
    paddingLeft: 12,
  },
  vehicleName: {
    fontSize: 15,
    fontWeight: '900',
    color: '#fff',
    textTransform: 'uppercase',
  },
  vehiclePlate: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#00b7eb',
    marginVertical: 2,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  metaRow: {
    flexDirection: 'row',
    gap: 6,
    opacity: 0.6,
  },
  metaText: {
    color: '#fff',
    fontSize: 11,
  },
  statusBadgeContainer: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  badgeOk: {
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    borderColor: 'rgba(74, 222, 128, 0.4)',
  },
  badgeAlert: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  textOk: {
    color: '#4ade80',
    fontSize: 10,
    fontWeight: '900',
  },
  textAlert: {
    color: '#ef4444',
    fontSize: 10,
    fontWeight: '900',
  },
});
