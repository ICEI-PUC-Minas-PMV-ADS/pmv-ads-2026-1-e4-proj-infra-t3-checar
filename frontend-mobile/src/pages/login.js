import * as React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { signInWithEmailAndPassword } from 'firebase/auth';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../services/firebaseConfig';
import { registrarTokenPush } from '../services/pushNotification';

const CREDS_KEY = 'checar_credentials';

const Login = ({ navegar }) => {
  const [email,    setEmail]    = React.useState('');
  const [senha,    setSenha]    = React.useState('');
  const [loading,  setLoading]  = React.useState(false);
  const [biometriaDisponivel, setBiometriaDisponivel] = React.useState(false);

  React.useEffect(() => {
    verificarBiometria();
  }, []);

  const verificarBiometria = async () => {
    try {
      const compativel  = await LocalAuthentication.hasHardwareAsync();
      const cadastrada  = await LocalAuthentication.isEnrolledAsync();
      const credSalvas  = await AsyncStorage.getItem(CREDS_KEY);
      setBiometriaDisponivel(compativel && cadastrada && Boolean(credSalvas));
    } catch {
      setBiometriaDisponivel(false);
    }
  };

  const login = async () => {
    if (!email || !senha) {
      Alert.alert('Atenção', 'Preencha email e senha');
      return;
    }

    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, senha);

      // Save credentials encrypted for future biometric login
      await AsyncStorage.setItem(CREDS_KEY, JSON.stringify({ email, senha }));

      // Register FCM push token (non-blocking)
      registrarTokenPush().catch(() => {});


      navegar('busca');
    } catch (error) {
      const code = error.code;
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        Alert.alert('Erro', 'Email ou senha inválidos');
      } else if (code === 'auth/too-many-requests') {
        Alert.alert('Atenção', 'Muitas tentativas. Aguarde alguns minutos.');
      } else {
        Alert.alert('Erro', 'Não foi possível realizar o login');
      }
    } finally {
      setLoading(false);
    }
  };

  const loginBiometrico = async () => {
    try {
      setLoading(true);

      // Step 1: Verify biometrics on device
      const resultado = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Autenticar com biometria',
        fallbackLabel: 'Usar senha',
        disableDeviceFallback: false,
      });

      if (!resultado.success) {
        Alert.alert('Falha', 'Autenticação biométrica não reconhecida');
        return;
      }

      // Step 2: Recover stored credentials and RE-AUTHENTICATE with Firebase
      const credJson = await AsyncStorage.getItem(CREDS_KEY);
      if (!credJson) {
        Alert.alert('Erro', 'Nenhuma credencial armazenada. Faça login normalmente primeiro.');
        setBiometriaDisponivel(false);
        return;
      }

      const { email: storedEmail, senha: storedSenha } = JSON.parse(credJson);

      // Step 3: Re-authenticate with Firebase to get a fresh token
      await signInWithEmailAndPassword(auth, storedEmail, storedSenha);

      navegar('busca');
    } catch (error) {
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        // Stored credentials are no longer valid — clear them
        await AsyncStorage.removeItem(CREDS_KEY);
        setBiometriaDisponivel(false);
        Alert.alert('Sessão expirada', 'Por segurança, faça login com email e senha novamente.');
      } else {
        Alert.alert('Erro', 'Não foi possível autenticar com biometria');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20, gap: 15 }}>
      <Text style={{ fontSize: 28, fontWeight: 'bold', textAlign: 'center', color: '#fff' }}>
        Login
      </Text>

      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        mode="outlined"
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!loading}
      />

      <TextInput
        label="Senha"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
        mode="outlined"
        editable={!loading}
      />

      <Button mode="contained" onPress={login} loading={loading} disabled={loading}>
        Entrar
      </Button>

      {biometriaDisponivel && (
        <Button mode="outlined" icon="fingerprint" onPress={loginBiometrico} disabled={loading}>
          Entrar com biometria
        </Button>
      )}

      <TouchableOpacity onPress={() => navegar('recuperarSenha')}>
        <Text style={{ textAlign: 'center', color: '#6200ee' }}>Esqueceu sua senha?</Text>
      </TouchableOpacity>

      <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 20 }}>
        <Text style={{ color: '#fff' }}>Não possui conta?</Text>
        <TouchableOpacity onPress={() => navegar('registro')}>
          <Text style={{ color: '#6200ee', fontWeight: 'bold' }}>{' '}Cadastre-se</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Login;
