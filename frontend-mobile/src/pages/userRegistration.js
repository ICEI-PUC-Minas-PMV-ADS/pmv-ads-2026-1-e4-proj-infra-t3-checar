import * as React from 'react';
import { View } from 'react-native';
import { TextInput, Menu, Button } from 'react-native-paper';

const UserRegistration = () => {
  const [nome, setNome] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [senha, setSenha] = React.useState('');
  const [tipoUsuario, setTipoUsuario] = React.useState('');

  const [visible, setVisible] = React.useState(false);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  return (
    <View style={{ padding: 20, gap: 15 }}>
      
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
          <Button mode="outlined" onPress={openMenu}>
            {tipoUsuario || 'Selecione o tipo de usuário'}
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
            setTipoUsuario('Funcionário');
            closeMenu();
          }}
          title="Funcionário"
        />
      </Menu>

    </View>
  );
};

export default UserRegistration;