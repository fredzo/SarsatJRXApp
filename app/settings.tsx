import { AppContext } from "@/context/AppContext";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { default as React, useContext, useEffect, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const DEFAULT_URLS = ["http://sarsatjrx.local", "http://localhost", "http://192.168.0.83", "http://10.0.2.2", "http://10.157.161.213"];


export default function SettingsScreen() {
  const [savedURLs, setSavedURLs] = useState<string[]>(DEFAULT_URLS);
  const [showList, setShowList] = useState(false);
  const { setDeviceURL, deviceURL } = useContext(AppContext);


  // 🔄 Load saved URLs and last used one on startup
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem("deviceURLs");
        if (stored) {
          const parsed = JSON.parse(stored);
          setSavedURLs([...new Set([...DEFAULT_URLS, ...parsed])]);
        }
      } catch (err) {
        console.warn("Error loading stored URLs", err);
      }
    })();
  }, []);

  // 💾 Save selected or entered URL
  const saveDeviceURL = async (url: string) => {
    if (!url || url.trim().length < 5) return;
    url = url.trim().replace(/\/$/, "");
    if(!url.startsWith("http://")) url = "http://" + url;
    const newList = [...new Set([url, ...savedURLs])];
    setSavedURLs(newList);
    setDeviceURL(url);
    await AsyncStorage.setItem("deviceURLs", JSON.stringify(newList));
  };

  // 🧭 Handle selection from combo
  const handleSelect = (url: string) => {
    saveDeviceURL(url);
    setShowList(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.h1}>
        Decoder address
      </Text>

      {/* Combo editable */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "#222",
          borderRadius: 10,
          paddingHorizontal: 12,
          paddingVertical: 8,
        }}
      >
        <TextInput
          style={{ flex: 1, color: "white", fontSize: 16 }}
          value={deviceURL ? deviceURL : ""}
          placeholder="Enter or select URL"
          placeholderTextColor="#777"
          onFocus={() => setShowList(true)}
          onSubmitEditing={() => {
            if (deviceURL) saveDeviceURL(deviceURL);
            setShowList(false);
          }}
        />
        <TouchableOpacity onPress={() => setShowList((v) => !v)}>
          <Ionicons
            name={showList ? "chevron-up" : "chevron-down"}
            color="#ccc"
            size={20}
            style={{ marginLeft: 8 }}
          />
        </TouchableOpacity>
      </View>

      {/* Dropdown list */}
      {showList && (
        <FlatList
          data={savedURLs}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleSelect(item)}
              style={{
                backgroundColor: "#1a1a1a",
                paddingVertical: 10,
                paddingHorizontal: 12,
                borderBottomColor: "#333",
                borderBottomWidth: 1,
              }}
            >
              <Text style={{ color: "white" }}>{item}</Text>
            </TouchableOpacity>
          )}
          style={{
            maxHeight: 180,
            marginTop: 6,
            borderRadius: 8,
            borderColor: "#333",
            borderWidth: 1,
          }}
        />
      )}
      <ScrollView style={{ marginTop: 30 }}>
        <Text style={styles.h1}>Settings</Text>
        <Text style={styles.item}>WiFi SSID: MyDecoderSSID</Text>
        <Text style={styles.item}>WiFi Passkey: ********</Text>
        <Text style={styles.item}>Decoder Settings: Default</Text>
        <Text style={styles.item}>Display Settings: Dark Mode</Text>
        <Text style={styles.item}>System Info: v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, backgroundColor:'#001a1a', padding:12 },
  h1:{ color:'#3fe6e6', fontSize:20, fontWeight:'700', marginBottom:12 },
  item:{ color:'white', marginBottom:8 }
});
