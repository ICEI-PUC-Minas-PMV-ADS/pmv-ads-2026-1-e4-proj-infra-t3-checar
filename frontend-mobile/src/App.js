<<<<<<< HEAD
import React, { useState } from 'react';
import { StyleSheet, ScrollView, SafeAreaView, StatusBar, Text } from 'react-native';

// Importando componentes
import Header from './src/components/Header';
import SearchBar from './src/components/SearchBar';
import VehicleCard from './src/components/VehicleCard';

const VEICULOS_DATABASE = [
  { id: '1', nome: 'VAN 12', placa: 'ABC-1234', status: 'OK' },
  { id: '2', nome: 'CAMINHÃO 05', placa: 'DEF-5678', status: 'ALERTA' },
  { id: '3', nome: 'UTILITÁRIO 02', placa: 'GHI-9087', status: 'Ok' },
];

export default function App() {
  const [searchText, setSearchText] = useState('');

  const veiculosFiltrados = VEICULOS_DATABASE.filter(v => 
    v.placa.toLowerCase().replace('-', '').includes(searchText.toLowerCase().replace('-', ''))
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <Header />
      <SearchBar value={searchText} onChangeText={setSearchText} />

      <ScrollView contentContainerStyle={styles.listContainer}>
        {veiculosFiltrados.length > 0 ? (
          veiculosFiltrados.map((item) => (
            <VehicleCard key={item.id} item={item} />
          ))
        ) : (
          searchText !== '' && (
            <Text style={styles.emptyText}>Nenhum veículo encontrado.</Text>
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#001233', paddingTop: 20 },
  listContainer: { paddingHorizontal: 20 },
  emptyText: { color: '#fff', textAlign: 'center', marginTop: 20 }
=======
import React, { useState } from 'react';
import { StyleSheet, ScrollView, SafeAreaView, StatusBar, Text } from 'react-native';

// Importando componentes
import Header from './src/components/Header';
import SearchBar from './src/components/SearchBar';
import VehicleCard from './src/components/VehicleCard';

const VEICULOS_DATABASE = [
  { id: '1', nome: 'VAN 12', placa: 'ABC-1234', status: 'OK' },
  { id: '2', nome: 'CAMINHÃO 05', placa: 'DEF-5678', status: 'ALERTA' },
  { id: '3', nome: 'UTILITÁRIO 02', placa: 'GHI-9087', status: 'Ok' },
];

export default function App() {
  const [searchText, setSearchText] = useState('');

  const veiculosFiltrados = VEICULOS_DATABASE.filter(v => 
    v.placa.toLowerCase().replace('-', '').includes(searchText.toLowerCase().replace('-', ''))
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <Header />
      <SearchBar value={searchText} onChangeText={setSearchText} />

      <ScrollView contentContainerStyle={styles.listContainer}>
        {veiculosFiltrados.length > 0 ? (
          veiculosFiltrados.map((item) => (
            <VehicleCard key={item.id} item={item} />
          ))
        ) : (
          searchText !== '' && (
            <Text style={styles.emptyText}>Nenhum veículo encontrado.</Text>
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#001233', paddingTop: 20 },
  listContainer: { paddingHorizontal: 20 },
  emptyText: { color: '#fff', textAlign: 'center', marginTop: 20 }
>>>>>>> 44fb58b (confirmando atualização)
});