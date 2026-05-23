import React, { useState } from 'react';

import {
  StyleSheet,
  StatusBar,
  Platform,
  View
} from 'react-native';

import {
  SafeAreaProvider,
  useSafeAreaInsets
} from 'react-native-safe-area-context';

// Telas
import BuscarVeiculos from './src/components/BuscarVeiculos';
import UploadFotos from './src/components/UploadFotos';
import UserRegistration from './pages/UserRegistration';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';

// Menu
import TabBar from './src/components/TabBar';

function AppContent() {
  const insets = useSafeAreaInsets();

  // Tela inicial
  const [telaAtual, setTelaAtual] =
    useState('registro');

  return (
    <View style={styles.container}>

      <StatusBar
        barStyle="light-content"
        backgroundColor="#00112b"
      />

      <View
        style={[
          styles.content,
          {
            marginTop:
              Platform.OS === 'android'
                ? StatusBar.currentHeight
                : 0,
          },
        ]}
      >

        {/* Cadastro */}
        {telaAtual === 'registro' && (
          <UserRegistration
            navegar={setTelaAtual}
          />
        )}

        {/* Login */}
        {telaAtual === 'login' && (
          <Login
            navegar={setTelaAtual}
          />
        )}

        {/* Buscar veículos */}
        {telaAtual === 'busca' && (
          <BuscarVeiculos
            aoTrocarTela={() =>
              setTelaAtual('upload')
            }
          />
        )}

        {/* Upload */}
        {telaAtual === 'upload' && (
          <UploadFotos
            aoVoltar={() =>
              setTelaAtual('busca')
            }
          />
        )}
        
        {/* Recuperar Senha */}
        {telaAtual === 'recuperarSenha' && (
  <ForgotPassword navegar={setTelaAtual} />
)}

      </View>

      <TabBar
        telaAtual={telaAtual}
        onTabPress={setTelaAtual}
      />

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