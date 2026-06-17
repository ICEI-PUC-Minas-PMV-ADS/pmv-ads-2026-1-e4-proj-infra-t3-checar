import React, { useState, useEffect } from 'react';
import {
  StyleSheet, StatusBar, Platform, View, ActivityIndicator,
} from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './src/services/firebaseConfig';

// Telas
import BuscarVeiculos from './src/pages/BuscarVeiculos';
import UploadFotos from './src/pages/UploadFotos';
import UserRegistration from './src/pages/userRegistration';
import Login from './src/pages/login';
import ForgotPassword from './src/pages/forgotPassword';
import ModeloChecklistSelection from './src/pages/ModeloChecklistSelection';
import ModeloChecklistEdit from './src/pages/ModeloChecklistEdit';
import ChecklistExecution from './src/pages/ChecklistExecution';
import Relatorios from './src/pages/Relatorios';
import Historico from './src/pages/Historico';
import Notificacoes from './src/pages/Notificacoes';
import Exportacoes from './src/pages/Exportacoes';
import PoliticaPrivacidade from './src/pages/PoliticaPrivacidade';

// Componentes
import Header from './src/components/Header';
import HamburgerMenu from './src/components/HamburgerMenu';

// Telas que não exigem autenticação
const TELAS_PUBLICAS = ['login', 'registro', 'recuperarSenha', 'politicaPrivacidade'];
// Telas que exibem o Header fixo no topo
const TELAS_COM_HEADER = ['busca', 'upload'];

function AppContent() {
  const [telaAtual, setTelaAtual] = useState('login');
  const [telaParams, setTelaParams] = useState({});
  const [usuarioAutenticado, setUsuarioAutenticado] = useState(false);
  const [carregandoAuth, setCarregandoAuth] = useState(true);

  // Observa estado de autenticação Firebase (persiste via AsyncStorage no mobile)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const autenticado = Boolean(user);
      setUsuarioAutenticado(autenticado);
      setCarregandoAuth(false);

      if (autenticado) {
        // Se estiver em tela pública ao iniciar (ex: sessão persistida), vai para busca
        setTelaAtual((prev) => (TELAS_PUBLICAS.includes(prev) ? 'busca' : prev));
      } else {
        // Se perder a sessão em tela protegida, redireciona para login
        setTelaAtual((prev) => (!TELAS_PUBLICAS.includes(prev) ? 'login' : prev));
      }
    });
    return unsubscribe;
  }, []);

  // Auth guard: bloqueia navegação para telas protegidas sem autenticação
  const navegar = (tela, params = {}) => {
    if (!TELAS_PUBLICAS.includes(tela) && !usuarioAutenticado) {
      setTelaAtual('login');
      setTelaParams({});
      return;
    }
    setTelaParams(params || {});
    setTelaAtual(tela);
  };

  const logout = async () => {
    try {
      await signOut(auth);
      // onAuthStateChanged dispara com null e redireciona para login automaticamente
    } catch {
      setTelaAtual('login');
    }
  };

  const eAutenticado = !TELAS_PUBLICAS.includes(telaAtual);

  // Mostra spinner enquanto verifica sessão persistida
  if (carregandoAuth) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#00112b" />
        <ActivityIndicator size="large" color="#00b7eb" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#00112b" />

      {/* Header fixo (apenas telas busca e upload) */}
      {TELAS_COM_HEADER.includes(telaAtual) && (
        <Header navegar={navegar} />
      )}

      {/* Área de conteúdo dinâmico */}
      <View
        style={[
          styles.content,
          { marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
        ]}
      >
        {telaAtual === 'registro' && <UserRegistration navegar={navegar} />}
        {telaAtual === 'login' && <Login navegar={navegar} />}
        {telaAtual === 'recuperarSenha' && <ForgotPassword navegar={navegar} />}
        {telaAtual === 'politicaPrivacidade' && <PoliticaPrivacidade navegar={navegar} />}

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

        {telaAtual === 'relatorios' && <Relatorios navegar={navegar} />}
        {telaAtual === 'historico' && <Historico navegar={navegar} />}
        {telaAtual === 'notificacoes' && <Notificacoes navegar={navegar} />}
        {telaAtual === 'exportacoes' && <Exportacoes navegar={navegar} />}
      </View>

      {/* Hamburger menu flutuante (substitui TabBar em telas autenticadas) */}
      {eAutenticado && (
        <HamburgerMenu
          telaAtual={telaAtual}
          navegar={navegar}
          onLogout={logout}
        />
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
  loadingContainer: {
    flex: 1,
    backgroundColor: '#00112b',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
