import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Menu({ navigation, onClose }) {
  const menuItems = [
    {
      id: 'vehicles',
      label: 'Veículos',
      icon: 'car',
      onPress: () => {
        navigation.navigate('VehicleList');
        onClose();
      },
    },
    {
      id: 'search',
      label: 'Buscar',
      icon: 'search',
      onPress: () => {
        navigation.navigate('VehicleList');
        onClose();
      },
    },
    {
      id: 'settings',
      label: 'Configurações',
      icon: 'settings',
      onPress: () => {
        alert('Configurações em desenvolvimento');
        onClose();
      },
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.menuHeader}>
        <Text style={styles.menuTitle}>Menu</Text>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={28} color="white" />
        </TouchableOpacity>
      </View>

      {menuItems.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.menuItem}
          onPress={item.onPress}
        >
          <Ionicons name={item.icon} size={24} color="#00b4d8" />
          <Text style={styles.menuItemText}>{item.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#004aad',
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  menuTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 10,
  },
  menuItemText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 15,
    fontWeight: '500',
  },
});
