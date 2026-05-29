import * as React from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { TextInput, Button } from "react-native-paper";
import { signInWithEmailAndPassword } from "firebase/auth";
import * as LocalAuthentication from "expo-local-authentication";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth } from "../firebaseConfig";

const Login = ({ navegar }) => {
  const [email, setEmail] = React.useState("");
  const [senha, setSenha] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [biometriaDisponivel, setBiometriaDisponivel] = React.useState(false);

  // Verificar biometria ao abrir tela
  React.useEffect(() => {
    verificarBiometria();
  }, []);

  const verificarBiometria = async () => {
    try {
      const compativel = await LocalAuthentication.hasHardwareAsync();
      const cadastrada = await LocalAuthentication.isEnrolledAsync();
      const credencialsSalvas = await AsyncStorage.getItem("credenciais_salvas");

      console.log("Debug Biometria:", { compativel, cadastrada, credencialsSalvas });

      // Biometria só fica disponível se TODOS os requisitos forem atendidos
      if (compativel && cadastrada && credencialsSalvas) {
        setBiometriaDisponivel(true);
      } else {
        setBiometriaDisponivel(false);
      }
    } catch (error) {
      console.error("Erro ao verificar biometria:", error);
      setBiometriaDisponivel(false);
    }
  };

  // Login normal
  const login = async () => {
    if (!email || !senha) {
      Alert.alert("Atenção", "Preencha email e senha");
      return;
    }

    try {
      setLoading(true);

      const userCredential = await signInWithEmailAndPassword(auth, email, senha);
      console.log("Usuário logado:", userCredential.user);

      // Salvar credenciais de forma segura para biometria futura
      try {
        await AsyncStorage.setItem("credenciais_salvas", JSON.stringify({
          email: email,
          uid: userCredential.user.uid
        }));
      } catch (storageError) {
        console.warn("Aviso: Não foi possível salvar credenciais para biometria", storageError);
      }

      Alert.alert("Sucesso", "Login realizado com sucesso");
      navegar("busca");
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      Alert.alert("Erro ao entrar", "Email ou senha inválidos");
    } finally {
      setLoading(false);
    }
  };

  // Login biométrico
  const loginBiometrico = async () => {
    try {
      setLoading(true);

      // Passo 1: Autenticar com biometria do dispositivo
      const resultado = await LocalAuthentication.authenticateAsync({
        promptMessage: "Autenticar com biometria",
        fallbackLabel: "Usar senha",
        disableDeviceFallback: false,
      });

      if (!resultado.success) {
        Alert.alert("Falha", "Autenticação biométrica não reconhecida");
        setLoading(false);
        return;
      }

      // Passo 2: Recuperar credenciais armazenadas
      const credenciaisJson = await AsyncStorage.getItem("credenciais_salvas");
      if (!credenciaisJson) {
        Alert.alert("Erro", "Nenhuma credencial armazenada. Faça login normalmente primeiro.");
        setLoading(false);
        return;
      }

      const credenciais = JSON.parse(credenciaisJson);
      console.log("Biometria bem-sucedida para:", credenciais.email);

      // Biometria bem-sucedida, usuário pode acessar
      Alert.alert("Sucesso", "Autenticado via biometria");
      navegar("busca");
    } catch (error) {
      console.error("Erro na autenticação biométrica:", error);
      if (error.name === "NotAvailable") {
        Alert.alert("Indisponível", "Biometria não disponível neste dispositivo");
      } else {
        Alert.alert("Erro", "Não foi possível autenticar com biometria");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        padding: 20,
        gap: 15,
      }}
    >
      <Text
        style={{
          fontSize: 28,
          fontWeight: "bold",
          textAlign: "center",
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

      <Button
        mode="contained"
        onPress={login}
        loading={loading}
        disabled={loading}
      >
        Entrar
      </Button>

      {/* Botão biometria - apenas se disponível e tiver credenciais salvas */}
      {biometriaDisponivel && (
        <Button 
          mode="outlined" 
          icon="fingerprint" 
          onPress={loginBiometrico}
          disabled={loading}
        >
          Entrar com biometria
        </Button>
      )}

      <TouchableOpacity onPress={() => navegar("recuperarSenha")}>
        <Text
          style={{
            textAlign: "center",
            color: "#6200ee",
          }}
        >
          Esqueceu sua senha?
        </Text>
      </TouchableOpacity>

      <Text
        style={{
          textAlign: "center",
          marginTop: 10,
        }}
      >
        ───── OU ─────
      </Text>

      <Button mode="outlined" icon="google">
        Entrar com Google
      </Button>

      <Button mode="outlined" icon="linkedin">
        Entrar com LinkedIn
      </Button>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          marginTop: 20,
        }}
      >
        <Text>Não possui conta?</Text>

        <TouchableOpacity onPress={() => navegar("registro")}>
          <Text
            style={{
              color: "#6200ee",
              fontWeight: "bold",
            }}
          >
            {" "}
            Cadastre-se
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Login;
