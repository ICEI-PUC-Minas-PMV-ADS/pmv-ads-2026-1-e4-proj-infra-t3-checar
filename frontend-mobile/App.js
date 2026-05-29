import React, { useState } from 'react';
import { StyleSheet, StatusBar, Platform, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Telas e Componentes
import BuscarVeiculos from './src/components/BuscarVeiculos';
import UploadFotos from './src/components/UploadFotos';
import UserRegistration from './src/pages/userRegistration';
import Login from './src/pages/login';
import ForgotPassword from './src/pages/forgotPassword';
import Header from './src/components/Header';
import TabBar from './src/components/TabBar';

function AppContent() {
  const [telaAtual, setTelaAtual] = useState('login');

  // Configurações de exibição
  const telasLogadas = ['busca', 'upload'];
  const telasComHeader = ['busca', 'upload'];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#00112b" />

      {/* 1. Header Fixo no topo (apenas telas logadas) */}
      {telasComHeader.includes(telaAtual) && (
        <Header navegar={setTelaAtual} />
      )}

      {/* 2. Área de Conteúdo Dinâmico */}
      <View style={[styles.content, { marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }]}>
        {telaAtual === 'registro' && <UserRegistration navegar={setTelaAtual} />}
        {telaAtual === 'login' && <Login navegar={setTelaAtual} />}
        {telaAtual === 'recuperarSenha' && <ForgotPassword navegar={setTelaAtual} />}
        
        {telaAtual === 'busca' && (
          <BuscarVeiculos aoTrocarTela={() => setTelaAtual('upload')} />
        )}
        
        {telaAtual === 'upload' && (
          <UploadFotos aoVoltar={() => setTelaAtual('busca')} />
        )}
      </View>

      {/* 3. TabBar na base (apenas telas logadas) */}
      {telasLogadas.includes(telaAtual) && (
        <TabBar telaAtual={telaAtual} onTabPress={setTelaAtual} />
      )}
    </View>
  );
}

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
  },
});