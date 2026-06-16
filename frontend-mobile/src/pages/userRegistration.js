import * as React from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  Alert,
} from 'react-native';

import {
  TextInput,
  Menu,
  Button,
  Checkbox,
} from 'react-native-paper';

import {
  createUserWithEmailAndPassword,
  deleteUser,
} from 'firebase/auth';

import { auth } from "../services/firebaseConfig";
import api from '../services/api';

const UserRegistration = ({ navegar }) => {
  const [nome, setNome] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [senha, setSenha] = React.useState('');
  const [tipoUsuario, setTipoUsuario] =
    React.useState('');

  const [visible, setVisible] =
    React.useState(false);

  const [loading, setLoading] =
    React.useState(false);

  const [aceitouTermos, setAceitouTermos] = React.useState(false);

  const openMenu = () => setVisible(true);

  const closeMenu = () => setVisible(false);

  const cadastrar = async () => {

 if (!nome || !email || !senha) {
      Alert.alert(
        'Atenção',
        'Preencha todos os campos'
      );

      return;
    }

    if (!aceitouTermos) {
      Alert.alert('Atenção', 'Você deve aceitar os termos para continuar');
      return;
    }

    try {
      setLoading(true);

      // 1. Cria conta no Firebase
      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          email,
          senha
        );

      // 2. Registra no backend (MongoDB) — crítico para authMiddleware
      try {
        await api.post('/usuarios', {
          nome,
          email,
          senha,
          tipoUsuario: tipoUsuario || 'Motorista',
        });
      } catch (backendError) {
        // Rollback: remove conta Firebase para manter consistência
        await deleteUser(userCredential.user);
        throw backendError;
      }

      Alert.alert(
        'Sucesso',
        'Cadastro realizado com sucesso'
      );

      navegar('login');

    } catch (error) {
      const code = error.code;
      if (code === 'auth/email-already-in-use') {
        Alert.alert('Erro', 'Este email já está cadastrado');
      } else if (code === 'auth/weak-password') {
        Alert.alert('Erro', 'Senha deve ter pelo menos 6 caracteres');
      } else {
        Alert.alert('Erro', 'Não foi possível realizar o cadastro');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        padding: 20,
        justifyContent: 'center',
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
        Cadastro
      </Text>

      <TextInput
        label="Nome"
        value={nome}
        onChangeText={setNome}
        mode="outlined"
      />

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

      <Menu
        visible={visible}
        onDismiss={closeMenu}
        anchor={
          <Button
            mode="outlined"
            onPress={openMenu}
          >
            {tipoUsuario ||
              'Selecione o tipo de usuário'}
          </Button>
        }
      >

        <Menu.Item
          onPress={() => {
            setTipoUsuario('Gestor');
            closeMenu();
          }}
          title="Gestor"
        />

        <Menu.Item
          onPress={() => {
            setTipoUsuario('Motorista');
            closeMenu();
          }}
          title="Motorista"
        />

      </Menu>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Checkbox
          status={aceitouTermos ? 'checked' : 'unchecked'}
          onPress={() => setAceitouTermos(!aceitouTermos)}
          accessibilityLabel="Aceitar política de privacidade"
        />
        <TouchableOpacity onPress={() => navegar('politicaPrivacidade')} accessibilityRole="link">
          <Text style={{ color: '#00b7eb', fontSize: 13 }}>
            Li e aceito a Política de Privacidade
          </Text>
        </TouchableOpacity>
      </View>

      <Button
        mode="contained"
        onPress={cadastrar}
        loading={loading}
        disabled={loading}
      >
        Cadastrar
      </Button>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          marginTop: 20,
        }}
      >

        <Text>
          Já possui cadastro?
        </Text>

        <TouchableOpacity
          onPress={() => navegar('login')}
        >
          <Text
            style={{
              color: '#6200ee',
              fontWeight: 'bold',
            }}
          >
            {' '}Entre por aqui
          </Text>
        </TouchableOpacity>

      </View>

    </View>
  );
};

export default UserRegistration;