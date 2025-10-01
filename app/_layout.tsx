import { Tabs } from 'expo-router';
import { ExternalLink, MapPin, RadioTower, Settings } from 'lucide-react-native';
import React from 'react';
import { View } from 'react-native';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { FrameProvider } from '../providers/FrameProvider';

export default function Layout() {
  return (
    <FrameProvider>
      <View style={{flex:1}}>
        <Header />
        <Tabs screenOptions={{
          headerShown:false,
          tabBarShowLabel: false, // hide text
          tabBarStyle: { backgroundColor: "#000" }, // dark background
          tabBarActiveTintColor: "cyan",
          tabBarInactiveTintColor: "gray",
        }}>
          <Tabs.Screen name="index" options={{ title: '', tabBarIcon: ({ color, size }) => <RadioTower color={color} size={size} /> }} />
          <Tabs.Screen name="map" options={{ title: '', tabBarIcon: ({ color, size }) => <MapPin color={color} size={size} /> }} />
          <Tabs.Screen name="data" options={{ title: '', tabBarIcon: ({ color, size }) => <ExternalLink color={color} size={size} /> }} />
          <Tabs.Screen name="settings" options={{ title: '', tabBarIcon: ({ color, size }) => <Settings color={color} size={size} /> }} />
        </Tabs>
        <Footer />
      </View>
    </FrameProvider>
  );
}