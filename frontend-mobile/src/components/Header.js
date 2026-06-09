import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Adicionamos 'navegar' como parâmetro nas props
export default function Header({ navegar }) {
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

      {/* Botão Checar adicionado aqui */}
      <TouchableOpacity 
        style={styles.checarButton} 
        onPress={() => navegar('login')}
      >
        <Ionicons name="fingerprint" size={24} color="#00b4d8" />
        <Text style={styles.checarText}>Checar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { 
    paddingHorizontal: 20, 
    flexDirection: 'row', 
    alignItems: 'center', // Alinhamento vertical centralizado
    marginBottom: 30,
    marginTop: 40 // Ajuste para não colidir com a status bar
  },
  headerTitleContainer: { 
    flex: 1, 
    alignItems: 'center', 
  },
  badge: { 
    backgroundColor: '#004e7c', 
    paddingHorizontal: 15, 
    paddingVertical: 4, 
    borderRadius: 20, 
    marginBottom: 10 
  },
  badgeText: { color: '#a1b821', fontSize: 10 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  headerTitleBlue: { color: '#00b4d8' },
  
  // Estilos do novo botão
  checarButton: { alignItems: 'center', marginLeft: 10 },
  checarText: { color: '#991e1e', fontSize: 10, fontWeight: 'bold', marginTop: 2 }
});