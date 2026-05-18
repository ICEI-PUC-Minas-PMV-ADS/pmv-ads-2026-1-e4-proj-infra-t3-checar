import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Header() {
  return (
    <View style={styles.header}>
      <TouchableOpacity>
        <Ionicons name="chevron-back" size={28} color="white" />
      </TouchableOpacity>
      <View style={styles.headerTitleContainer}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>L O G O B U S C A R</Text>
        </View>
        <Text style={styles.headerTitle}>
          Busca por <Text style={styles.headerTitleBlue}>Placa</Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { 
    paddingHorizontal: 20, 
    flexDirection: 'row', 
    marginBottom: 30 
  },
  headerTitleContainer: { 
    flex: 1, 
    alignItems: 'center', 
    marginRight: 28 
  },
  badge: { 
    backgroundColor: '#004e7c', 
    paddingHorizontal: 15, 
    paddingVertical: 4, 
    borderRadius: 20, 
    marginBottom: 10 
  },
  badgeText: { 
    color: '#fff', 
    fontSize: 12 
  },
  headerTitle: { 
    color: '#fff', 
    fontSize: 22, 
    fontWeight: 'bold' 
  },
  headerTitleBlue: { 
    color: '#00b4d8' 
  },
});