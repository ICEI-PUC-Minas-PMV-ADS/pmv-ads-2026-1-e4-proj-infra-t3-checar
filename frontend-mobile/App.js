import React, { useState } from 'react';
import { StyleSheet, StatusBar, Platform, View } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Telas e Componentes
import BuscarVeiculos from './src/pages/BuscarVeiculos';
import UploadFotos from './src/pages/UploadFotos';
import UserRegistration from './src/pages/userRegistration';
import Login from './src/pages/login';
import ForgotPassword from './src/pages/forgotPassword';
import ModeloChecklistSelection from './src/pages/ModeloChecklistSelection';
import ModeloChecklistEdit from './src/pages/ModeloChecklistEdit';
import ChecklistExecution from './src/pages/ChecklistExecution';
import Header from './src/components/Header';
import TabBar from './src/components/TabBar';

function AppContent() {
  const [telaAtual, setTelaAtual] = useState('login');
  const [telaParams, setTelaParams] = useState({});

  const navegar = (tela, params = {}) => {
    setTelaParams(params || {});
    setTelaAtual(tela);
  };

  // Configurações de exibição
  const telasLogadas = ['busca', 'upload', 'modelos'];
  const telasComHeader = ['busca', 'upload'];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#00112b" />

      {/* 1. Header Fixo no topo (apenas telas logadas) */}
      {telasComHeader.includes(telaAtual) && (
        <Header navegar={navegar} />
      )}

      {/* 2. Área de Conteúdo Dinâmico */}
      <View style={[styles.content, { marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }]}>
        {telaAtual === 'registro' && <UserRegistration navegar={navegar} />}
        {telaAtual === 'login' && <Login navegar={navegar} />}
        {telaAtual === 'recuperarSenha' && <ForgotPassword navegar={navegar} />}
        
        {telaAtual === 'busca' && (
          <BuscarVeiculos aoTrocarTela={() => navegar('upload')} navegar={navegar} />
        )}
        
        {telaAtual === 'upload' && (
          <UploadFotos aoVoltar={() => navegar('busca')} />
        )}

        {telaAtual === 'modelos' && (
          <ModeloChecklistSelection navegar={navegar} params={telaParams} />
        )}

        {telaAtual === 'modeloEdit' && (
          <ModeloChecklistEdit navegar={navegar} params={telaParams} />
        )}

        {telaAtual === 'checklist' && (
          <ChecklistExecution navegar={navegar} params={telaParams} />
        )}
      </View>

      {/* 3. TabBar na base (apenas telas logadas) */}
      {telasLogadas.includes(telaAtual) && (
        <TabBar telaAtual={telaAtual} onTabPress={(tela) => navegar(tela)} />
      )}
    </View>
  );
}

export default function App() {
  return (
    <PaperProvider>
      <SafeAreaProvider>
        <AppContent />
      </SafeAreaProvider>
    </PaperProvider>
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
