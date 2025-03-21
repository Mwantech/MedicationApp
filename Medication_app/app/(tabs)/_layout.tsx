import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { HapticTab } from '@/components/HapticTab';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { MaterialIcons } from '@expo/vector-icons';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#007bff',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: styles.tabBar,
        // Add this to ensure content is shifted up
        contentStyle: { paddingBottom: 60 },
        tabBarBackground: () => (
          <BlurView intensity={90} tint={colorScheme ?? 'light'} style={styles.blurBackground} />
        ),
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <MaterialIcons name="home" size={28} color={color} />, 
        }}
      />
      <Tabs.Screen
        name="Schedule"
        options={{
          title: 'Schedule',
          tabBarIcon: ({ color }) => <MaterialIcons name="calendar-today" size={28} color={color} />, 
        }}
      />
      <Tabs.Screen
        name="finder"
        options={{
          title: 'Pharmacy',
          tabBarIcon: ({ color }) => <MaterialIcons name="local-pharmacy" size={28} color={color} />, 
        }}
      />
      <Tabs.Screen
        name="settingsScreen"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <MaterialIcons name="settings" size={28} color={color} />, 
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 60,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    backgroundColor: 'white',
  },
  blurBackground: {
    ...StyleSheet.absoluteFillObject,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
});