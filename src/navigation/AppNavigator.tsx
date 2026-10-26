import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSize } from '../theme/colors';

// Screens
import GallineroScreen from '../screens/GallineroScreen';
import AddBirdScreen from '../screens/AddBirdScreen';
import BirdDetailScreen from '../screens/BirdDetailScreen';
import PedigreeCardScreen from '../screens/PedigreeCardScreen';
import IncubadoraScreen from '../screens/IncubadoraScreen';
import AddIncubationScreen from '../screens/AddIncubationScreen';
import IncubationDetailScreen from '../screens/IncubationDetailScreen';
import TareasScreen from '../screens/TareasScreen';
import AddTaskScreen from '../screens/AddTaskScreen';
import PremiumScreen from '../screens/PremiumScreen';

const Tab = createBottomTabNavigator();
const GallineroStack = createNativeStackNavigator();
const IncubadoraStack = createNativeStackNavigator();
const TareasStack = createNativeStackNavigator();

const screenOptions = { headerShown: false };

function GallineroNavigator() {
  return (
    <GallineroStack.Navigator screenOptions={screenOptions}>
      <GallineroStack.Screen name="GallineroMain" component={GallineroScreen} />
      <GallineroStack.Screen name="AddBird" component={AddBirdScreen} />
      <GallineroStack.Screen name="BirdDetail" component={BirdDetailScreen} />
      <GallineroStack.Screen name="PedigreeCard" component={PedigreeCardScreen} />
      <GallineroStack.Screen name="Premium" component={PremiumScreen} />
    </GallineroStack.Navigator>
  );
}

function IncubadoraNavigator() {
  return (
    <IncubadoraStack.Navigator screenOptions={screenOptions}>
      <IncubadoraStack.Screen name="IncubadoraMain" component={IncubadoraScreen} />
      <IncubadoraStack.Screen name="AddIncubation" component={AddIncubationScreen} />
      <IncubadoraStack.Screen name="IncubationDetail" component={IncubationDetailScreen} />
      <IncubadoraStack.Screen name="Premium" component={PremiumScreen} />
    </IncubadoraStack.Navigator>
  );
}

function TareasNavigator() {
  return (
    <TareasStack.Navigator screenOptions={screenOptions}>
      <TareasStack.Screen name="TareasMain" component={TareasScreen} />
      <TareasStack.Screen name="AddTask" component={AddTaskScreen} />
    </TareasStack.Navigator>
  );
}

interface TabIconProps {
  emoji: string;
  label: string;
  focused: boolean;
}

function TabIcon({ emoji, label, focused }: TabIconProps) {
  return (
    <View style={[styles.tabIcon, focused && styles.tabIconFocused]}>
      <Text style={styles.tabEmoji}>{emoji}</Text>
      <Text style={[styles.tabLabel, { color: focused ? Colors.tabActive : Colors.tabInactive }]}>
        {label}
      </Text>
    </View>
  );
}

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Gallinero"
        component={GallineroNavigator}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🐓" label="Mi Gallinero" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Incubadora"
        component={IncubadoraNavigator}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🥚" label="Incubadora" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Tareas"
        component={TareasNavigator}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="✅" label="Tareas" focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#13182A',
    borderTopColor: Colors.border,
    borderTopWidth: 1,
    height: 72,
    paddingBottom: 8,
    paddingTop: 4,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  tabIcon: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 64,
  },
  tabIconFocused: {
    backgroundColor: Colors.primary + '18',
  },
  tabEmoji: {
    fontSize: 22,
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
});
