import { Platform, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

import { AppContext } from "@/context/AppContext";
import { useContext } from "react";
import { Text, View } from 'react-native';


export default function DataScreen() {
  const { currentFrame } = useContext(AppContext);

  if (!currentFrame) {
    return (
      <View style={styles.container}>
        <Text style={styles.h1}>Map</Text>
        <Text style={{ color: 'white' }}>No beacon available</Text>
      </View>
    );
  }

  const externalUrl = `http://decoder2.herokuapp.com/decoded/`;


  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom", "left", "right"]}>
      {Platform.OS === "web" ? (
        <iframe src={externalUrl + currentFrame.data['data']} style={styles.webIframe as any} />
      ) : (
        <WebView source={{ uri: externalUrl + currentFrame.data['data'] }} style={styles.webview} />
      )}
    </SafeAreaView>
  );

}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: '#001a1a' },
  h1: { color: '#3fe6e6', fontSize: 20, fontWeight: '700', marginBottom: 12 },
  webview: {
    flex: 1,
  },
  webIframe: {
    flex: 1,
    width: "100%",
    height: "100%",
  },  
});