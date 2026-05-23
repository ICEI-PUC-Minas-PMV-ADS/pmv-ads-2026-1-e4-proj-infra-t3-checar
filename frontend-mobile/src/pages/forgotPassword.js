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
  sendPasswordResetEmail,
} from 'firebase/auth';

import { auth } from '../firebaseConfig';

const ForgotPassword = ({ navegar }) => {

  const [email, setEmail] =
    React.useState('');

  const [loading, setLoading] =
    React.useState(false);

  const recuperarSenha = async () => {

    if (!email) {

      Alert.alert(
        'Atenção',
        'Digite seu email'
      );

      return;
    }

    try {

      setLoading(true);

      await sendPasswordResetEmail(
        auth,
        email
      );

      Alert.alert(
        'Sucesso',
        'Email de recuperação enviado'
      );

      navegar('login');

    } catch (error) {

      console.log(error);

      Alert.alert(
        'Erro',
        'Não foi possível enviar o email'
      );

    } finally {

      setLoading(false);
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
        Recuperar Senha
      </Text>

      <Text
        style={{
          textAlign: 'center',
          color: '#666',
          marginBottom: 10,
        }}
      >
        Digite seu email para receber
        o link de recuperação
      </Text>

      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        mode="outlined"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Button
        mode="contained"
        onPress={recuperarSenha}
        loading={loading}
        disabled={loading}
      >
        Enviar email
      </Button>

      <TouchableOpacity
        onPress={() =>
          navegar('login')
        }
      >
        <Text
          style={{
            textAlign: 'center',
            color: '#6200ee',
            marginTop: 15,
          }}
        >
          Voltar para login
        </Text>
      </TouchableOpacity>

    </View>
  );
};

export default ForgotPassword;