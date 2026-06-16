import React, { useRef } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import SignatureCanvas from 'react-native-signature-canvas';
import { Button } from 'react-native-paper';

/**
 * Modal de assinatura digital do motorista (React Native).
 * onConfirm recebe a assinatura como data URL PNG (Base64).
 */
export default function SignaturePad({ onConfirm, onCancel }) {
  const sigRef = useRef(null);

  const handleOK     = (signature) => onConfirm(signature);
  const handleClear  = () => sigRef.current?.clearSignature();
  const handleSubmit = () => sigRef.current?.readSignature();

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <Text style={styles.title}>
          Assinatura do{' '}
          <Text style={styles.highlight}>motorista</Text>
        </Text>
        <Text style={styles.subtitle}>
          Assine no espaço abaixo para concluir o checklist.
        </Text>

        <View style={styles.canvasWrapper}>
          <SignatureCanvas
            ref={sigRef}
            onOK={handleOK}
            descriptionText=""
            clearText="Limpar"
            confirmText="Confirmar"
            webStyle={WEB_STYLE}
            autoClear={false}
            style={styles.canvas}
          />
        </View>

        <View style={styles.buttons}>
          <Button
            mode="contained-tonal"
            onPress={handleClear}
            buttonColor="rgba(255,255,255,0.1)"
            textColor="#fff"
            style={styles.button}
          >
            Limpar
          </Button>
          <Button
            mode="contained"
            onPress={handleSubmit}
            buttonColor="#00b7eb"
            textColor="#00112b"
            style={styles.button}
          >
            Confirmar
          </Button>
        </View>

        <Button
          mode="text"
          onPress={onCancel}
          textColor="rgba(255,255,255,0.5)"
          style={styles.cancelButton}
        >
          Cancelar
        </Button>
      </View>
    </View>
  );
}

const WEB_STYLE = `
  .m-signature-pad { margin: 0; border: none; box-shadow: none; }
  .m-signature-pad--body { border: none; }
  .m-signature-pad--footer { display: none; }
  body { background: white; margin: 0; padding: 0; }
`;

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    padding: 16,
    zIndex: 100,
  },
  container: {
    backgroundColor: '#001233',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    padding: 20,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  highlight: {
    color: '#00b7eb',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    marginBottom: 16,
  },
  canvasWrapper: {
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#00b7eb',
    overflow: 'hidden',
    height: 200,
    backgroundColor: 'white',
  },
  canvas: {
    flex: 1,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  button: {
    flex: 1,
    borderRadius: 12,
  },
  cancelButton: {
    marginTop: 6,
  },
});
