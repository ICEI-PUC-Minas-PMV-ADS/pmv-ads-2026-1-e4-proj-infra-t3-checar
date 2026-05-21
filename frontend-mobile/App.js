import React, { useState } from 'react';
import { PaperProvider } from 'react-native-paper';
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
import BuscarVeiculos from './src/components/BuscarVeiculos.js';
import VehicleDetails from './src/components/VehicleDetails.js';
import UploadFotos from './src/components/UploadFotos.js';
import UserRegistration from './src/pages/userRegistration.js';

// Importando TabBar
import TabBar from './src/components/TabBar.js';

// Componente principal
function AppContent() {
  const insets = useSafeAreaInsets();

  // Tela inicial
  const [telaAtual, setTelaAtual] = useState('registro');
  const [vehicleIdSelecionado, setVehicleIdSelecionado] = useState(null);

  const handleSelectVehicle = (vehicleId) => {
    setVehicleIdSelecionado(vehicleId);
    setTelaAtual('detalhes');
  };

  const handleCreateNewVehicle = () => {
    setVehicleIdSelecionado(null);
    setTelaAtual('detalhes');
  };

  const handleCloseDetails = () => {
    setVehicleIdSelecionado(null);
    setTelaAtual('busca');
  };

  const handleSaveVehicle = () => {
    setVehicleIdSelecionado(null);
    setTelaAtual('busca');
  };

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
            onSelectVehicle={handleSelectVehicle}
            onCreateNew={handleCreateNewVehicle}
          />

        ) : telaAtual === 'detalhes' ? (

          /* Tela de Detalhes do Veículo */
          <VehicleDetails
            vehicleId={vehicleIdSelecionado}
            isNew={!vehicleIdSelecionado}
            onClose={handleCloseDetails}
            onSave={handleSaveVehicle}
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

      {/* Menu inferior (só mostra se não estiver em detalhes) */}
      {telaAtual !== 'detalhes' && (
        <TabBar
          telaAtual={telaAtual}
          onTabPress={setTelaAtual}
        />
      )}

    </View>
  );
}

// Wrapper principal
export default function App() {
  return (
    <PaperProvider>
      <SafeAreaProvider>
        <AppContent />
      </SafeAreaProvider>
    </PaperProvider>
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