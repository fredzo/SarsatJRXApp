import { Tabs } from 'expo-router';
import { MapPin, RadioTower } from 'lucide-react-native';
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
        <Tabs screenOptions={{headerShown:false}}>
          <Tabs.Screen name="index" options={{ title: '', tabBarIcon: ({ color, size }) => <RadioTower color={color} size={size} /> }} />
          <Tabs.Screen name="map" options={{ title: '', tabBarIcon: ({ color, size }) => <MapPin color={color} size={size} /> }} />
          <Tabs.Screen name="data" options={{ title: 'Data' }} />
          <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
        </Tabs>
        <Footer />
      </View>
    </FrameProvider>
  );
}