import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabBar({ telaAtual, onTabPress }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[
      styles.tabBar,
      { 
        paddingBottom: Platform.OS === 'ios' ? insets.bottom : insets.bottom + 8,
        height: Platform.OS === 'ios' ? 75 + insets.bottom : 65 + insets.bottom
      }
    ]}>
      <TouchableOpacity 
        style={styles.tabItem} 
        onPress={() => onTabPress('busca')}
        activeOpacity={0.7}
      >
        <Ionicons 
          name="search" 
          size={24} 
          color={telaAtual === 'busca' ? '#00b7eb' : 'rgba(255,255,255,0.5)'} 
        />
        <Text style={[
          styles.tabText, 
          { color: telaAtual === 'busca' ? '#00b7eb' : 'rgba(255,255,255,0.5)' }
        ]}>
          Buscar
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.tabItem} 
        onPress={() => onTabPress('upload')}
        activeOpacity={0.7}
      >
        <Ionicons 
          name="camera" 
          size={24} 
          color={telaAtual === 'upload' ? '#00b7eb' : 'rgba(255,255,255,0.5)'} 
        />
        <Text style={[
          styles.tabText, 
          { color: telaAtual === 'upload' ? '#00b7eb' : 'rgba(255,255,255,0.5)' }
        ]}>
          Upload
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.tabItem} 
        onPress={() => onTabPress('modelos')}
        activeOpacity={0.7}
      >
        <Ionicons 
          name="clipboard" 
          size={24} 
          color={telaAtual === 'modelos' ? '#00b7eb' : 'rgba(255,255,255,0.5)'} 
        />
        <Text style={[
          styles.tabText, 
          { color: telaAtual === 'modelos' ? '#00b7eb' : 'rgba(255,255,255,0.5)' }
        ]}>
          Modelos
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#002b45',
    borderTopWidth: 1,
    borderTopColor: '#003d5c',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 8,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 4,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  }
});
