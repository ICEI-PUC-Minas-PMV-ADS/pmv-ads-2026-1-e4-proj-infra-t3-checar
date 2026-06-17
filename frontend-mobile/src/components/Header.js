import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Header() {
  return (
    <View style={styles.header}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>L O G O B U S C A R</Text>
      </View>
      <Text style={styles.headerTitle}>
        Busca por <Text style={styles.headerTitleBlue}>Placa</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 40,
    paddingHorizontal: 60, // leave room for the floating hamburger button
  },
  badge: {
    backgroundColor: '#004e7c',
    paddingHorizontal: 15,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 10,
  },
  badgeText: { color: '#a1b821', fontSize: 10 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  headerTitleBlue: { color: '#00b4d8' },
});
