import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity, Modal, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Importando componentes/telas
import VehicleList from './components/VehicleList';
import VehicleDetail from './components/VehicleDetail';
import Menu from './components/Menu';

const Stack = createNativeStackNavigator();

export default function App() {
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={({ navigation }) => ({
          headerShown: false,
          cardStyle: { backgroundColor: '#001233' },
        })}
      >
        <Stack.Screen
          name="VehicleList"
          component={VehicleList}
          options={({ navigation }) => ({
            headerShown: false,
          })}
        />
        <Stack.Screen
          name="VehicleDetail"
          component={VehicleDetail}
          options={{
            headerShown: false,
            animationEnabled: true,
            cardStyle: { backgroundColor: '#001233' },
          }}
        />
      </Stack.Navigator>

      <Modal
        visible={menuVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setMenuVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Menu
              navigation={null}
              onClose={() => setMenuVisible(false)}
            />
          </View>
        </View>
      </Modal>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
  },
  modalContent: {
    backgroundColor: '#004aad',
    width: '100%',
    marginTop: 0,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingBottom: 20,
  },
});