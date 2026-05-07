import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getOperationalStatusLabel } from '../config/vehicleEnums';

export default function VehicleCard({ item, onDelete, onPress }) {
  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.cardPressable}
        activeOpacity={0.7}
        onPress={onPress}
      >
        <View style={styles.cardLeftIndicator} />
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: 'https://via.placeholder.com/100x60' }}
            style={styles.vehicleImage}
            resizeMode="contain"
          />
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.vehicleName}>{item.model}</Text>
          <Text style={styles.vehiclePlate}>{item.plate}</Text>
        </View>
        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Status:</Text>
          <Text style={styles.statusValue}>{getOperationalStatusLabel(item.operationalStatus)}</Text>
        </View>
      </TouchableOpacity>
      {onDelete && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={(e) => {
            e.stopPropagation?.();
            onDelete();
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="trash" size={20} color="#ff4444" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#004aad',
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: '#fff',
    height: 100,
    position: 'relative',
    overflow: 'hidden',
  },
  cardPressable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  cardLeftIndicator: { 
    position: 'absolute', 
    left: 0, 
    top: '30%', 
    bottom: '30%', 
    width: 6, 
    backgroundColor: '#00b4d8', 
    borderTopRightRadius: 4, 
    borderBottomRightRadius: 4 
  },
  imageContainer: { 
    backgroundColor: '#fff', 
    borderRadius: 15, 
    width: 90, 
    height: 60, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  vehicleImage: { width: '80%', height: '80%' },
  infoContainer: { flex: 1, paddingLeft: 15 },
  vehicleName: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  vehiclePlate: { color: '#fff', fontSize: 13 },
  statusContainer: { width: 70 },
  statusLabel: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  statusValue: { color: '#fff', fontSize: 12 },
  deleteButton: {
    position: 'absolute',
    right: 15,
    top: 15,
    padding: 8,
  },
});
