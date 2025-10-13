import { AppContext } from "@/context/AppContext";
import { getAudioNotif, getCountDownBeep, getVibrateNotif, setAudioFrameNotif, setCountDownBeep, setVibrateFrameNotif } from "@/lib/audio";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { QrCode } from "lucide-react-native";
import { default as React, useContext, useEffect, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';

const DEFAULT_URLS = ["http://sarsatjrx.local", "http://localhost", "http://192.168.0.83", "http://10.0.2.2", "http://10.157.161.213"];


export default function SettingsScreen() {
  const [savedURLs, setSavedURLs] = useState<string[]>(DEFAULT_URLS);
  const [showList, setShowList] = useState(false);
  const { setDeviceURL, deviceURL } = useContext(AppContext);

  const [countdownNotification, setCountdownNotification] = useState(getCountDownBeep());
  const [frameNotification, setFrameNotification] = useState(getAudioNotif());
  const [frameVibration, setFrameVibration] = useState(getVibrateNotif());

  const router = useRouter();

  // Save changes
  const toggleCountdown = async (value: boolean) => {
    setCountdownNotification(value);
    setCountDownBeep(value);
  };

  const toggleFrame = async (value: boolean) => {
    setFrameNotification(value);
    setAudioFrameNotif(value);
  };

  const toggleFrameVibration = async (value: boolean) => {
    setFrameVibration(value);
    setVibrateFrameNotif(value);
  };

  // 🔄 Load saved settings on startup
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

      {/* Editable combo */}
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
          defaultValue={deviceURL ? deviceURL : ""}
          placeholder="Enter or select URL"
          placeholderTextColor="#777"
          onFocus={() => setShowList(true)}
          onSubmitEditing={(e : any) => {
            saveDeviceURL(e.nativeEvent.text);
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

      {/* ---- QR Code Scan Button ---- */}
      <TouchableOpacity
        style={styles.qrButton}
        onPress={() => router.push("/settings/scan")}
      >
        <QrCode color="#fff" size={20} />
        <Text style={styles.qrButtonText}>Scan QR Code</Text>
      </TouchableOpacity>

      <Text style={styles.h1}>
        App settings
      </Text>
      <View style={styles.card}>
        <Text style={styles.label}>Countdown notification</Text>
        <Switch
          value={countdownNotification}
          onValueChange={toggleCountdown}
        />
      </View>

      {/* ---- Frame Notification ---- */}
      <View style={styles.card}>
        <Text style={styles.label}>Frame audio notification</Text>
        <Switch
          value={frameNotification}
          onValueChange={toggleFrame}
        />
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>Frame vibrate notification</Text>
        <Switch
          value={frameVibration}
          onValueChange={toggleFrameVibration}
        />
      </View>
      
      <ScrollView>
        <Text style={styles.h1}>Decoder Settings</Text>
        { /*
        <Text style={styles.item}>WiFi SSID: MyDecoderSSID</Text>
        <Text style={styles.item}>WiFi Passkey: ********</Text>
        <Text style={styles.item}>Decoder Settings: Default</Text>
        <Text style={styles.item}>Display Settings: Dark Mode</Text>
        <Text style={styles.item}>System Info: v1.0.0</Text> */ }
        { /*<TouchableOpacity onPress={playSoundOK}>
          <Speaker size={28} color="cyan" /><Text>OK</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={playSoundKO}>
          <Speaker size={28} color="cyan" /><Text>KO</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={playSoundError}>
          <Speaker size={28} color="cyan" /><Text>Error</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={playSoundFiltered}>
          <Speaker size={28} color="cyan" /><Text>Filtered</Text>
        </TouchableOpacity> */ }
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, backgroundColor:'#001a1a', padding:12 },
  h1:{ color:'#3fe6e6', fontSize:20, fontWeight:'700', marginBottom:12, marginTop:20 },
  item:{ color:'white', marginBottom:8 },
  card: {
    backgroundColor: "#1e1e1e",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  label: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  qrButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2563eb",
    borderRadius: 8,
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignSelf: "flex-start",
  },
  qrButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
});
