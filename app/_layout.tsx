import { AppContextProvider } from '@/context/AppContext';
import { useKeepAwake } from "expo-keep-awake";
import { Stack } from 'expo-router';
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
            <Stack screenOptions={{
                headerStyle: {
                  backgroundColor:'#001a1a',
                },
                headerTintColor: '#3fe6e6',
                headerTitleStyle: {
                  fontWeight: "bold",
                  color:'#3fe6e6', 
                  fontSize:22
                },
              }}>
              {/* Main route to tabs */}
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

              {/* Settings screen */}
              <Stack.Screen name="settings" options={{ /*presentation: "modal",*/ title: "Settings ⚙️", headerShown: true }} />
            </Stack>            
            <SafeAreaView edges={['bottom']}>
              <Footer />
            </SafeAreaView>
          </View>
      </AppContextProvider>
    </SafeAreaProvider>
  );
}