import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { FrameProvider } from '../providers/FrameProvider';

export default function Layout() {
  return (
    <FrameProvider>
      <View style={{flex:1}}>
        <Header />
        <Tabs screenOptions={{headerShown:false}}>
          <Tabs.Screen name="index" options={{ title: 'Frames' }} />
          <Tabs.Screen name="map" options={{ title: 'Map' }} />
          <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
        </Tabs>
        <Footer />
      </View>
    </FrameProvider>
  );
}

const styles = StyleSheet.create({
  footer:{ backgroundColor:'#033', padding:8, alignItems:'center' }
});
