import { AppContextProvider } from '@/context/AppContext';
import { useKeepAwake } from "expo-keep-awake";
import { Tabs } from 'expo-router';
import { ExternalLink, MapPin, RadioTower, Settings } from 'lucide-react-native';
import React from 'react';
import { View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Footer from '../components/Footer';
import Header from '../components/Header';

export default function Layout() {
  useKeepAwake();
  return (
    <SafeAreaProvider>
      <AppContextProvider>
          <View style={{flex:1}}>
            <SafeAreaView edges={['top']}>
              <Header />
            </SafeAreaView>
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
              <Tabs.Screen name="settings" options={{ title: '', tabBarIcon: ({ color, size }) => <Settings color={color} size={size} /> }} />
            </Tabs>
            <SafeAreaView edges={['bottom']}>
              <Footer />
            </SafeAreaView>
          </View>
      </AppContextProvider>
    </SafeAreaProvider>
  );
}