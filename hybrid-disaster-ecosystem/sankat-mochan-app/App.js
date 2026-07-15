import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar, Text, View } from 'react-native';
import { AppProvider } from './src/context/AppContext';
import NearbyPeersScreen   from './src/screens/NearbyPeersScreen';
import ChatScreen          from './src/screens/ChatScreen';
import BroadcastScreen     from './src/screens/BroadcastScreen';
import ReportScreen        from './src/screens/ReportScreen';
import SettingsScreen      from './src/screens/SettingsScreen';

const Tab   = createBottomTabNavigator();
const Stack = createStackNavigator();

const THEME = {
  bg:       '#0A0E1A',
  surface:  '#111827',
  border:   '#1E3A5F',
  accent:   '#3B82F6',
  danger:   '#EF4444',
  success:  '#10B981',
  warning:  '#F59E0B',
  text:     '#F1F5F9',
  muted:    '#64748B',
};

function TabIcon({ name, focused, color }) {
  const icons = {
    Peers: '📡', Chat: '💬', Broadcast: '📢', Report: '⚠️', Settings: '⚙️',
  };
  return (
    <Text style={{ fontSize: 18, opacity: focused ? 1 : 0.5 }}>
      {icons[name] || '●'}
    </Text>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color }) => (
          <TabIcon name={route.name} focused={focused} color={color} />
        ),
        tabBarActiveTintColor:   THEME.accent,
        tabBarInactiveTintColor: THEME.muted,
        tabBarStyle: {
          backgroundColor: THEME.surface,
          borderTopColor: THEME.border,
          borderTopWidth: 1,
          paddingBottom: 4,
          paddingTop: 4,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          fontFamily: 'monospace',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Peers"     component={NearbyPeersScreen} />
      <Tab.Screen name="Chat"      component={ChatScreen} />
      <Tab.Screen name="Broadcast" component={BroadcastScreen} />
      <Tab.Screen name="Report"    component={ReportScreen} />
      <Tab.Screen name="Settings"  component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <AppProvider>
      <StatusBar barStyle="light-content" backgroundColor={THEME.bg} />
      <NavigationContainer
        theme={{
          dark: true,
          colors: {
            primary: THEME.accent,
            background: THEME.bg,
            card: THEME.surface,
            text: THEME.text,
            border: THEME.border,
            notification: THEME.danger,
          },
        }}
      >
        <MainTabs />
      </NavigationContainer>
    </AppProvider>
  );
}
