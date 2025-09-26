import React from 'react';
import { Tabs } from 'expo-router';
import { FrameProvider, FrameContext } from '../providers/FrameProvider';
import Header from '../components/Header';
import { Text, View, StyleSheet } from 'react-native';
import { useContext } from 'react';

function Footer() {
  const { frame } = useContext(FrameContext);
  const countdown = frame?.['COUNTDOWN'] ?? '--';
  return (
    <View style={styles.footer}>
      <Text style={{color:'white'}}>Next frame in: {countdown}s</Text>
    </View>
  );
}

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
