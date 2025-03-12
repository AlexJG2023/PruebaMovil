import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { SQLiteProvider } from 'expo-sqlite';
import { Home } from './src/screens/home/Home';
import { Usuarios } from './src/screens/usuarios/Usuarios';
import { Dispositivos } from './src/screens/dispositivos/Dispositivos';

const Tab = createBottomTabNavigator();

function RootTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Inicio') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Usuarios') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Dispositivos') {
            iconName = focused ? 'hardware-chip' : 'hardware-chip-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4C1D95',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: { backgroundColor: 'white' },
      })}
    >
      <Tab.Screen name="Inicio" component={Home} options={{ title: "Página Principal" }} />
      <Tab.Screen name="Usuarios" component={Usuarios} options={{ title: "Gestión de Usuarios" }} />
      <Tab.Screen name="Dispositivos" component={Dispositivos} options={{ title: "Gestión de Dispositivos" }} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <SQLiteProvider databaseName="myDatabase.db">
        <RootTabs />
      </SQLiteProvider>
    </NavigationContainer>
  );
}