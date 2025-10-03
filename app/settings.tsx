import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';

export default function SettingsScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.h1}>Settings</Text>
      <Text style={styles.item}>WiFi SSID: MyDecoderSSID</Text>
      <Text style={styles.item}>WiFi Passkey: ********</Text>
      <Text style={styles.item}>Decoder Settings: Default</Text>
      <Text style={styles.item}>Display Settings: Dark Mode</Text>
      <Text style={styles.item}>System Info: v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, backgroundColor:'#001a1a', padding:12 },
  h1:{ color:'#3fe6e6', fontSize:20, fontWeight:'700', marginBottom:12 },
  item:{ color:'white', marginBottom:8 }
});
