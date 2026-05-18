import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SearchBar({ value, onChangeText }) {
  return (
    <View style={styles.searchSection}>
      <TextInput
        style={styles.input}
        placeholder="Digite a placa (ex: ABC-1234)"
        placeholderTextColor="rgba(0, 18, 51, 0.5)"
        value={value}
        onChangeText={onChangeText}
        autoCapitalize="characters"
        underlineColorAndroid="transparent"
      />
      <TouchableOpacity style={styles.searchButton}>
        <Ionicons name="search" size={20} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  searchSection: {
    flexDirection: 'row', 
    backgroundColor: '#00b4d8', 
    marginHorizontal: 20,
    borderRadius: 25, 
    alignItems: 'center', 
    paddingLeft: 20, 
    height: 50, 
    marginBottom: 30,
  },
  input: { 
    flex: 1, 
    color: '#001233', 
    fontSize: 16, 
    fontWeight: 'bold',
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      },
    }),
  },
  searchButton: { 
    backgroundColor: '#001d3d', 
    height: 40, 
    width: 60, 
    borderRadius: 20, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 5 
  },
});