import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const PoliticaPrivacidade = ({ navegar }) => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => navegar('registro')} style={styles.voltarBtn} accessibilityLabel="Voltar ao cadastro" accessibilityRole="button">
        <Text style={styles.voltarTexto}>← Voltar</Text>
      </TouchableOpacity>

      <Text style={styles.titulo}>Política de Privacidade</Text>
      <Text style={styles.subtitulo}>CHECAR — Plataforma de Inspeção Veicular</Text>

      <Text style={styles.secaoTitulo}>1. Dados que coletamos</Text>
      <Text style={styles.texto}>
        Coletamos nome, e-mail, informações do veículo (placa, modelo, ano, marca, cor),
        fotos de inspeção, checklists preenchidos, tokens de notificação push e logs de auditoria
        de ações realizadas na plataforma.
      </Text>

      <Text style={styles.secaoTitulo}>2. Como usamos seus dados</Text>
      <Text style={styles.texto}>
        Seus dados são usados exclusivamente para: autenticação e segurança da conta,
        gerenciamento de inspeções veiculares, envio de notificações sobre falhas críticas,
        geração de relatórios de conformidade e exportação de dados pelo gestor responsável.
      </Text>

      <Text style={styles.secaoTitulo}>3. Seus direitos (LGPD — Art. 18)</Text>
      <Text style={styles.texto}>
        • Acesso aos seus dados pessoais{'\n'}
        • Retificação de dados incompletos ou incorretos{'\n'}
        • Anonimização ou exclusão de dados desnecessários{'\n'}
        • Portabilidade dos dados a outro fornecedor{'\n'}
        • Revogação do consentimento a qualquer momento{'\n'}
        • Informação sobre compartilhamento de dados
      </Text>

      <Text style={styles.secaoTitulo}>4. Retenção de dados</Text>
      <Text style={styles.texto}>
        Logs de auditoria são retidos por 365 dias. Dados pessoais são mantidos enquanto
        sua conta estiver ativa. Após solicitação de exclusão, dados pessoais são anonimizados
        dentro de 30 dias.
      </Text>

      <Text style={styles.secaoTitulo}>5. Contato — DPO</Text>
      <Text style={styles.texto}>
        Para exercer seus direitos ou obter informações:{'\n'}
        E-mail: privacidade@checar.app{'\n'}
        Versão desta política: 1.0 (Junho 2025)
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#00112b' },
  content: { padding: 20, paddingBottom: 40 },
  voltarBtn: { marginBottom: 16 },
  voltarTexto: { color: '#00b7eb', fontSize: 16 },
  titulo: { fontSize: 24, fontWeight: 'bold', color: '#ffffff', marginBottom: 4 },
  subtitulo: { fontSize: 14, color: '#aaaaaa', marginBottom: 24 },
  secaoTitulo: { fontSize: 16, fontWeight: 'bold', color: '#00b7eb', marginTop: 16, marginBottom: 8 },
  texto: { fontSize: 14, color: '#cccccc', lineHeight: 22 },
});

export default PoliticaPrivacidade;
