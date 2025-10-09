import { useKeepAwake } from "expo-keep-awake";
import { Tabs } from 'expo-router';
import { ExternalLink, MapPin, RadioTower } from 'lucide-react-native';
import React from 'react';

export default function Layout() {
  useKeepAwake();
  return (
    <Tabs screenOptions={{
      headerShown:false,
      tabBarShowLabel: false, // hide text
      tabBarStyle: { backgroundColor: "#000", maxHeight: 50 }, // dark background
      tabBarActiveTintColor: "cyan",
      tabBarInactiveTintColor: "gray",
    }}>
      <Tabs.Screen name="index" options={{ title: '', tabBarIcon: ({ color, size }) => <RadioTower color={color} size={size} /> }} />
      <Tabs.Screen name="map" options={{ title: '', tabBarIcon: ({ color, size }) => <MapPin color={color} size={size} /> }} />
      <Tabs.Screen name="data" options={{ title: '', tabBarIcon: ({ color, size }) => <ExternalLink color={color} size={size} /> }} />
    </Tabs>
  );
}