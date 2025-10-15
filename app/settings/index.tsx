import { AppContext } from "@/context/AppContext";
import { getAudioFeedback, getAudioNotif, getCountDownBeep, getVibrateFeedback, getVibrateNotif, setAudioFeedback, setAudioFrameNotif, setCountDownBeep, setVibrateFeendback, setVibrateFrameNotif } from "@/lib/notifications";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { QrCode } from "lucide-react-native";
import { default as React, useContext, useEffect, useRef, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SettingsScreen() {
  const [showList, setShowList] = useState(false);
  const { saveDeviceURL, savedURLs, deviceURL, connected } = useContext(AppContext);
  const prevConnected = useRef(connected);

  const [countdownNotification, setCountdownNotification] = useState(getCountDownBeep());
  const [frameNotification, setFrameNotification] = useState(getAudioNotif());
  const [frameVibration, setFrameVibration] = useState(getVibrateNotif());
  const [audioFeedback, setAudioFeedbackState] = useState(getAudioFeedback());
  const [vibrationFeedback, setVibrateFeendbackState] = useState(getVibrateFeedback());

  const [localURL, setLocalURL] = useState(deviceURL); // état local indépendant

  const router = useRouter();

  useEffect(() => {
    setLocalURL(deviceURL);
  }, [deviceURL]);

  useEffect(() => {
    console.log("Use effect connected :", connected);
    if (!prevConnected.current && connected) {
      // Detect connection and go back to main screen
      router.back();
    }
    prevConnected.current = connected;
  }, [connected]);

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

  const toggleAudioFeebdack = async (value: boolean) => {
    setAudioFeedbackState(value);
    setAudioFeedback(value);
  };

  const toggleVibrationFeedback = async (value: boolean) => {
    setVibrateFeendbackState(value);
    setVibrateFeendback(value);
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
          value={localURL ? localURL : ""}
          onChangeText={setLocalURL}
          placeholder="Enter or select URL"
          placeholderTextColor="#777"
          onFocus={() => setShowList(true)}
          onBlur={(e : any) => {
            if(localURL) saveDeviceURL(localURL);
            setShowList(false);
          }
          }
          onSubmitEditing={(e : any) => {
            if(localURL) saveDeviceURL(localURL);
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
            maxHeight: 300,
            minHeight: 100,
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
      
      {/* ---- Feedback Notification ---- */}
      <View style={styles.card}>
        <Text style={styles.label}>Audio feedback</Text>
        <Switch
          value={audioFeedback}
          onValueChange={toggleAudioFeebdack}
        />
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>Vibration feedback</Text>
        <Switch
          value={vibrationFeedback}
          onValueChange={toggleVibrationFeedback}
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
