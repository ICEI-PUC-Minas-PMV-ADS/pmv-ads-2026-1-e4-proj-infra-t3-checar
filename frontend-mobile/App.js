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

// Importando telas
import BuscarVeiculos from './src/components/BuscarVeiculos';
import UploadFotos from './src/components/UploadFotos';
import UserRegistration from './pages/UserRegistration';

// Importando TabBar
import TabBar from './src/components/TabBar';

// Componente principal
function AppContent() {
  const insets = useSafeAreaInsets();

  // Tela inicial
  const [telaAtual, setTelaAtual] = useState('registro');

  return (
    <View style={styles.container}>
      
      <StatusBar
        barStyle="light-content"
        backgroundColor="#00112b"
      />

      {/* Conteúdo da tela */}
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

        {/* Tela de Registro */}
        {telaAtual === 'registro' ? (
          <UserRegistration />

        ) : telaAtual === 'busca' ? (

          /* Tela Buscar Veículos */
          <BuscarVeiculos
            aoTrocarTela={() =>
              setTelaAtual('cadastro')
            }
          />

        ) : (

          /* Tela Upload Fotos */
          <UploadFotos
            aoVoltar={() =>
              setTelaAtual('busca')
            }
          />
        )}

      </View>

      {/* Menu inferior */}
      <TabBar
        telaAtual={telaAtual}
        onTabPress={setTelaAtual}
      />

    </View>
  );
}

// Wrapper principal
export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#00112b',
  },

  content: {
    flex: 1,
  },
});