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
} from 'react-native-paper';

import {
  createUserWithEmailAndPassword,
} from 'firebase/auth';

import { auth } from "../services/firebaseConfig";

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

    try {
      setLoading(true);

      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          email,
          senha
        );

      console.log(
        'Usuário criado:',
        userCredential.user
      );

      Alert.alert(
        'Sucesso',
        'Cadastro realizado com sucesso'
      );

      // Ir para login
      navegar('login');

    } catch (error) {

      console.log(error);

      Alert.alert(
        'Erro',
        'Não foi possível realizar o cadastro'
      );

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