import * as React from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  Alert,
} from 'react-native';

import {
  TextInput,
  Button,
} from 'react-native-paper';

import {
  signInWithEmailAndPassword,
} from 'firebase/auth';

import * as LocalAuthentication from 'expo-local-authentication';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { auth } from '../firebaseConfig';

const Login = ({ navegar }) => {

  const [email, setEmail] =
    React.useState('');

  const [senha, setSenha] =
    React.useState('');

  const [loading, setLoading] =
    React.useState(false);

  const [biometriaDisponivel, setBiometriaDisponivel] =
    React.useState(false);

  // Verificar biometria ao abrir tela
  React.useEffect(() => {

    verificarBiometria();

  }, []);

  const verificarBiometria = async () => {

    const compativel =
      await LocalAuthentication.hasHardwareAsync();

    const cadastrada =
      await LocalAuthentication.isEnrolledAsync();

    const usuarioSalvo =
      await AsyncStorage.getItem('usuarioLogado');

    if (
      compativel &&
      cadastrada &&
      usuarioSalvo
    ) {
      setBiometriaDisponivel(true);
    }
  };

  // Login normal
  const login = async () => {

    if (!email || !senha) {

      Alert.alert(
        'Atenção',
        'Preencha email e senha'
      );

      return;
    }

    try {

      setLoading(true);

      const userCredential =
        await signInWithEmailAndPassword(
          auth,
          email,
          senha
        );

      console.log(
        'Usuário logado:',
        userCredential.user
      );

      // Salvar login para biometria futura
      await AsyncStorage.setItem(
        'usuarioLogado',
        email
      );

      Alert.alert(
        'Sucesso',
        'Login realizado com sucesso'
      );

      navegar('busca');

    } catch (error) {

      console.log(error);

      Alert.alert(
        'Erro ao entrar',
        'Email ou senha inválidos'
      );

    } finally {

      setLoading(false);
    }
  };

  // Login biométrico
  const loginBiometrico = async () => {

    try {

      const resultado =
        await LocalAuthentication.authenticateAsync({
          promptMessage: 'Entrar com biometria',
          fallbackLabel: 'Usar senha',
        });

      if (resultado.success) {

        Alert.alert(
          'Sucesso',
          'Biometria reconhecida'
        );

        navegar('busca');

      } else {

        Alert.alert(
          'Falha',
          'Biometria não reconhecida'
        );
      }

    } catch (error) {

      console.log(error);

      Alert.alert(
        'Erro',
        'Não foi possível autenticar'
      );
    }
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        gap: 15,
      }}
    >

      <Text
        style={{
          fontSize: 28,
          fontWeight: 'bold',
          textAlign: 'center',
        }}
      >
        Login
      </Text>

      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        mode="outlined"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        label="Senha"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
        mode="outlined"
      />

      <Button
        mode="contained"
        onPress={login}
        loading={loading}
        disabled={loading}
      >
        Entrar
      </Button>

      {/* Botão biometria */}
      {biometriaDisponivel && (
        <Button
          mode="outlined"
          icon="fingerprint"
          onPress={loginBiometrico}
        >
          Entrar com biometria
        </Button>
      )}

      <TouchableOpacity
        onPress={() =>
          navegar('recuperarSenha')
        }
      >
        <Text
          style={{
            textAlign: 'center',
            color: '#6200ee',
          }}
        >
          Esqueceu sua senha?
        </Text>
      </TouchableOpacity>

      <Text
        style={{
          textAlign: 'center',
          marginTop: 10,
        }}
      >
        ───── OU ─────
      </Text>

      <Button
        mode="outlined"
        icon="google"
      >
        Entrar com Google
      </Button>

      <Button
        mode="outlined"
        icon="linkedin"
      >
        Entrar com LinkedIn
      </Button>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          marginTop: 20,
        }}
      >

        <Text>
          Não possui conta?
        </Text>

        <TouchableOpacity
          onPress={() =>
            navegar('registro')
          }
        >
          <Text
            style={{
              color: '#6200ee',
              fontWeight: 'bold',
            }}
          >
            {' '}Cadastre-se
          </Text>
        </TouchableOpacity>

      </View>

    </View>
  );
};

export default Login;