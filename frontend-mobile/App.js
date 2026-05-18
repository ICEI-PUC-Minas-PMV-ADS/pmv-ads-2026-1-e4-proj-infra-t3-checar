import React, { useState } from 'react';
import { StyleSheet, SafeAreaView, StatusBar, Platform, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

// Importando as duas telas principais
import BuscarVeiculos from './src/components/BuscarVeiculos';
import UploadFotos from './src/components/UploadFotos';
import TabBar from './src/components/TabBar';

// Componente principal com as telas
function AppContent() {
  const insets = useSafeAreaInsets();
  const [telaAtual, setTelaAtual] = useState('busca'); 

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#00112b" />
      
      {/* Área do Conteúdo da Tela Ativa */}
      <View style={[styles.content, { marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }]}>
        {telaAtual === 'busca' ? (
          <BuscarVeiculos aoTrocarTela={() => setTelaAtual('cadastro')} />
        ) : (
          <UploadFotos aoVoltar={() => setTelaAtual('busca')} />
        )}
      </View>

      {/* Menu de Abas Inferior */}
      <TabBar telaAtual={telaAtual} onTabPress={setTelaAtual} />
    </View>
  );
}

// Componente wrapper com SafeAreaProvider
export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#00112b',
  },
  content: {
    flex: 1,
  }
});