<<<<<<< HEAD
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

export default function VehicleCard({ item }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardLeftIndicator} />
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: 'https://via.placeholder.com/100x60' }} 
          style={styles.vehicleImage}
          resizeMode="contain"
        />
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.vehicleName}>{item.nome}</Text>
        <Text style={styles.vehiclePlate}>{item.placa}</Text>
      </View>
      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>Status:</Text>
        <Text style={styles.statusValue}>{item.status}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#004aad', borderRadius: 20, flexDirection: 'row',
    alignItems: 'center', padding: 15, marginBottom: 20, borderWidth: 1.5,
    borderColor: '#fff', height: 100, position: 'relative', overflow: 'hidden',
  },
  cardLeftIndicator: { position: 'absolute', left: 0, top: '30%', bottom: '30%', width: 6, backgroundColor: '#00b4d8', borderTopRightRadius: 4, borderBottomRightRadius: 4 },
  imageContainer: { backgroundColor: '#fff', borderRadius: 15, width: 90, height: 60, justifyContent: 'center', alignItems: 'center' },
  vehicleImage: { width: '80%', height: '80%' },
  infoContainer: { flex: 1, paddingLeft: 15 },
  vehicleName: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  vehiclePlate: { color: '#fff', fontSize: 13 },
  statusContainer: { width: 70 },
  statusLabel: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  statusValue: { color: '#fff', fontSize: 12 },
=======
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

export default function VehicleCard({ item }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardLeftIndicator} />
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: 'https://via.placeholder.com/100x60' }} 
          style={styles.vehicleImage}
          resizeMode="contain"
        />
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.vehicleName}>{item.nome}</Text>
        <Text style={styles.vehiclePlate}>{item.placa}</Text>
      </View>
      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>Status:</Text>
        <Text style={styles.statusValue}>{item.status}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#004aad', borderRadius: 20, flexDirection: 'row',
    alignItems: 'center', padding: 15, marginBottom: 20, borderWidth: 1.5,
    borderColor: '#fff', height: 100, position: 'relative', overflow: 'hidden',
  },
  cardLeftIndicator: { position: 'absolute', left: 0, top: '30%', bottom: '30%', width: 6, backgroundColor: '#00b4d8', borderTopRightRadius: 4, borderBottomRightRadius: 4 },
  imageContainer: { backgroundColor: '#fff', borderRadius: 15, width: 90, height: 60, justifyContent: 'center', alignItems: 'center' },
  vehicleImage: { width: '80%', height: '80%' },
  infoContainer: { flex: 1, paddingLeft: 15 },
  vehicleName: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  vehiclePlate: { color: '#fff', fontSize: 13 },
  statusContainer: { width: 70 },
  statusLabel: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  statusValue: { color: '#fff', fontSize: 12 },
>>>>>>> 44fb58b (confirmando atualização)
});