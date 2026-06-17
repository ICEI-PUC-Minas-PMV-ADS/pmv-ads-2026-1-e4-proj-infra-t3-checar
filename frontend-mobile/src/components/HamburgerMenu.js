import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MENU_ITEMS = [
  { tela: 'busca',        icon: 'search',        label: 'Buscar Veículo' },
  { tela: 'upload',       icon: 'camera',        label: 'Nova Inspeção' },
  { tela: 'modelos',      icon: 'clipboard',     label: 'Modelos' },
  { tela: 'historico',    icon: 'time',          label: 'Histórico' },
  { tela: 'relatorios',   icon: 'document-text', label: 'Relatórios' },
  { tela: 'notificacoes', icon: 'notifications', label: 'Notificações' },
  { tela: 'exportacoes',  icon: 'download',      label: 'Exportações' },
];

export default function HamburgerMenu({ telaAtual, navegar, onLogout }) {
  const [aberto, setAberto] = useState(false);
  const insets = useSafeAreaInsets();

  const handleNavegar = (tela) => {
    setAberto(false);
    navegar(tela);
  };

  const handleLogout = () => {
    setAberto(false);
    onLogout?.();
  };

  return (
    <>
      {/* Floating trigger button — absolute, top-right, over all content */}
      <View
        style={[styles.triggerWrapper, { top: insets.top + 10 }]}
        pointerEvents="box-none"
      >
        <TouchableOpacity
          style={styles.trigger}
          onPress={() => setAberto(true)}
          accessibilityLabel="Abrir menu de navegação"
          accessibilityRole="button"
        >
          <Ionicons name="menu" size={26} color="white" />
        </TouchableOpacity>
      </View>

      {/* Side drawer modal */}
      <Modal
        visible={aberto}
        transparent
        animationType="fade"
        onRequestClose={() => setAberto(false)}
        statusBarTranslucent
      >
        <View style={styles.overlay}>
          {/* Tap outside to close */}
          <TouchableWithoutFeedback onPress={() => setAberto(false)}>
            <View style={StyleSheet.absoluteFillObject} />
          </TouchableWithoutFeedback>

          {/* Drawer panel */}
          <View
            style={[
              styles.drawer,
              { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 16 },
            ]}
          >
            {/* Drawer header */}
            <View style={styles.drawerHeader}>
              <View style={styles.logoBadge}>
                <Text style={styles.logoText}>C</Text>
              </View>
              <Text style={styles.drawerTitle}>CHECAR</Text>
              <TouchableOpacity
                onPress={() => setAberto(false)}
                style={styles.closeBtn}
                accessibilityLabel="Fechar menu"
                accessibilityRole="button"
              >
                <Ionicons name="close" size={22} color="rgba(255,255,255,0.6)" />
              </TouchableOpacity>
            </View>

            {/* Navigation items */}
            <ScrollView showsVerticalScrollIndicator={false} style={styles.navList}>
              {MENU_ITEMS.map(({ tela, icon, label }) => {
                const ativo = telaAtual === tela;
                return (
                  <TouchableOpacity
                    key={tela}
                    style={[styles.menuItem, ativo && styles.menuItemAtivo]}
                    onPress={() => handleNavegar(tela)}
                    accessibilityRole="button"
                    accessibilityLabel={label}
                    accessibilityState={{ selected: ativo }}
                  >
                    <Ionicons
                      name={icon}
                      size={20}
                      color={ativo ? '#00b7eb' : 'rgba(255,255,255,0.65)'}
                    />
                    <Text style={[styles.menuLabel, ativo && styles.menuLabelAtivo]}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Logout */}
            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={handleLogout}
              accessibilityRole="button"
              accessibilityLabel="Sair da conta"
            >
              <Ionicons name="log-out-outline" size={20} color="#ff6b6b" />
              <Text style={styles.logoutLabel}>Sair</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  triggerWrapper: {
    position: 'absolute',
    right: 16,
    zIndex: 100,
  },
  trigger: {
    backgroundColor: '#002b45',
    borderRadius: 10,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,183,235,0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  drawer: {
    width: 270,
    backgroundColor: '#001e38',
    paddingHorizontal: 12,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(0,183,235,0.2)',
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  logoBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#00b7eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  logoText: { color: '#00112b', fontWeight: 'bold', fontSize: 14 },
  drawerTitle: {
    flex: 1,
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 3,
  },
  closeBtn: { padding: 4 },
  navList: { flex: 1 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 2,
    gap: 12,
  },
  menuItemAtivo: { backgroundColor: 'rgba(0,183,235,0.12)' },
  menuLabel: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 15,
    fontWeight: '500',
  },
  menuLabelAtivo: { color: '#00b7eb', fontWeight: '700' },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginTop: 8,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  logoutLabel: { color: '#ff6b6b', fontSize: 15, fontWeight: '600' },
});
