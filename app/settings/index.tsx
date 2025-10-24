import { AppContext } from "@/context/AppContext";
import { sendConfigUpdate } from "@/lib/config";
import { getAudioFeedback, getAudioNotif, getCountDownBeep, getVibrateFeedback, getVibrateNotif, setAudioFeedback, setAudioFrameNotif, setCountDownBeep, setVibrateFeendback, setVibrateFrameNotif } from "@/lib/notifications";
import { Ionicons } from "@expo/vector-icons";
import { cardSd } from '@lucide/lab';
import { useRouter } from "expo-router";
import { CheckSquare, Icon, Info, Minus, Monitor, Plus, QrCode, RadioTower, Speaker, Square, Wifi } from "lucide-react-native";
import { default as React, useContext, useEffect, useRef, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, UIManager, View } from 'react-native';
import Animated, { LinearTransition, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

// ✅ Enable LayoutAnimation on Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) 
{
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

/* ----------------------- LABELS -------------------------- */
const LABELS: Record<string, string> = {
  frameSound: "Frame sound",
  countdownSound: "Countdown sound",
  countdownLeds: "Countdown Leds",
  reloadCountdown: "Countdown auto-reload",
  countdownDuration: "Countdown duration",
  fliterOrbito: "Filter orbito",
  filterInvalid: "Filter invalid",
  buzzerLevel: "Buzzer level",
  touchSound: "Touch sound",
  displayReverse: "Reverse screen",
  showBatPercentage: "Show battery %",
  showBatWarnMessage: "Battery warning",
  screenOffOnCharge: "Screen off on charge",
  allowFrameSimu: "Frame simulation",
  wifiSsid: "WiFi SSID 1",
  wifiPassPhrase: "WiFi Passphrase 1",
  wifiSsid1: "WiFi SSID 2",
  wifiPassPhrase1: "WiFi Passphrase 2",
  wifiSsid2: "WiFi SSID 3",
  wifiPassPhrase2: "WiFi Passphrase 3",
  timeZone: "Timezone",
  sdCardMounted: "SD card mounted",
  sdCardTotalBytes: "Total space",
  sdCardUsedBytes: "Used space",
  chipFrequency: "Chip frequency",
  flashFreq: "Flash frequency",
  wifiMode: "Mode",
  wifiStatus: "Status",
  wifiCurrentSsid: "WiFi SSID",
  wifiRssi: "RSSI",
  wifiIP: "IP",
  wifiGatewayIP: "Gateway",
  wifiDNS1: "DNS1",
  wifiDNS2: "DNS2",
  wifiMacAddress: "MAC Address",
  wifiSubnetMask: "Seubnet Mask",
  rtcDate: "Date",
  rtcNtpSync: "NTP Synced",
  firmwareVersion: "Firmware Version",
  sketchInfo: "Sketch Info",
  chipModel: "Chip Model",
  chipCores: "Chip Cores",
  ramSize: "Ram Size",
  ramFree: "Free Ram",
  psRamSize: "PS Ram Size",
  psRamFree: "Free PS Ram",
  flashSize: "Flash Size",
  powerVcc: "VCC",
  powerState: "Power State",
  powerBatteryPercentage: "Battery percentage",
  upTime: "Up time",
};

/* ----------------------- FORMATTERS -------------------------- */
function formatValue(key: string, value: string): string {
  if (!value) return "-";

  switch (key) {
    case "ramSize":
    case "ramFree":
    case "psRamSize":
    case "psRamFree":
    case "flashSize":
    {
      const bytes = parseInt(value);
      if (isNaN(bytes)) return value;
      const kb = (bytes / 1024).toFixed(1);
      return `${kb} KB (${bytes.toLocaleString()} bytes)`;
    }
    case "sdCardTotalBytes":
    case "sdCardUsedBytes": {
      const bytes = parseInt(value);
      if (isNaN(bytes)) return value;
      const kb = (bytes / 1024).toFixed(1);
      return `${kb} kB`;
    }
    case "chipFrequency": {
      return `${value} MHz`;
    }
    case "powerVcc": {
      return `${value}V`;
    }
    case "powerBatteryPercentage": {
      return `${value}%`;
    }
    case "flashFreq": {
      const hz = parseInt(value);
      if (isNaN(hz)) return value;
      const mhz = (hz / 1_000_000).toFixed(2);
      return `${mhz} MHz`;
    }
    default:
      return value;
  }
}

export default function SettingsScreen() {
  const [showList, setShowList] = useState(false);
  const { saveDeviceURL, savedURLs, deviceURL, connected, config } = useContext(AppContext);
  const prevConnected = useRef(connected);

  const [countdownNotification, setCountdownNotification] = useState(getCountDownBeep());
  const [frameNotification, setFrameNotification] = useState(getAudioNotif());
  const [frameVibration, setFrameVibration] = useState(getVibrateNotif());
  const [audioFeedback, setAudioFeedbackState] = useState(getAudioFeedback());
  const [vibrationFeedback, setVibrateFeendbackState] = useState(getVibrateFeedback());

  const [localURL, setLocalURL] = useState(deviceURL);

  const [localConfig, setLocalConfig] = useState(config?.data || {});

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

  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withTiming(showList ? 180 : 0, { duration: 200 });
  }, [showList]);

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const updateConfig = (key: string, value: string) => {
    setLocalConfig({ ...localConfig, [key]: value });
    sendConfigUpdate(deviceURL, key, value);
  };

  const renderToggle = (key: string) => (
    <Switch
      value={localConfig[key] === "true"}
      onValueChange={(v) => updateConfig(key, v ? "true" : "false")}
    />
  );

  const renderCheckbox = (key: string) => {
    const val = localConfig[key] === "1" || localConfig[key]?.toLowerCase() === "true";
    return (
      <View style={styles.checkboxContainer}>
        {val ? (
          <CheckSquare size={18} color="#3fe6e6" />
        ) : (
          <Square size={18} color="#555" />
        )}
      </View>
    );
  };

  const renderText = (key: string, editable = false) =>
    editable ? (
      <TextInput
        style={styles.input}
        value={localConfig[key] || ""}
        onChangeText={(t) => setLocalConfig({ ...localConfig, [key]: t })}
        onSubmitEditing={(e) => updateConfig(key, e.nativeEvent.text)}
      />
    ) : [
      "rtcNtpSync",
      "sdCardMounted",
    ].includes(key) ? (
      renderCheckbox(key)
    ) : 
    (
      <Text style={styles.value}>{formatValue(key, localConfig[key])}</Text>
    );

  const renderNumber = (key: string, min: number, max: number) => (
    <View style={styles.numberContainer}>
      <TouchableOpacity
        style={styles.numButton}
        onPress={() => {
          const v = Math.max(min, (parseInt(localConfig[key] || "0") || 0) - 1);
          updateConfig(key, v.toString());
        }}
      >
        <Minus size={18} color="#fff" />
      </TouchableOpacity>
      <TextInput
        style={[styles.numberInput, { width: 60, textAlign: "center" }]}
        value={localConfig[key] || "0"}
        keyboardType="numeric"
        onChangeText={(t) => setLocalConfig({ ...localConfig, [key]: t })}
        onSubmitEditing={(e) => updateConfig(key, e.nativeEvent.text)}
      />
      <TouchableOpacity
        style={styles.numButton}
        onPress={() => {
          const v = Math.min(max, (parseInt(localConfig[key] || "0") || 0) + 1);
          updateConfig(key, v.toString());
        }}
      >
        <Plus size={18} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  const Section = ({ title, icon, children }: any) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        {icon}
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );

  const Row = ({ label, control }: any) => (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      {control}
    </View>
  );


  return (
    <ScrollView style={styles.container}>
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
          <Animated.View style={chevronStyle}>
            <Ionicons
              name="chevron-down"
              color="#ccc"
              size={20}
              style={{ margin: 4 }}
            />
          </Animated.View>
        </TouchableOpacity>
      </View>

      {/* Dropdown list */}
      {showList && (
        <Animated.View
          layout={LinearTransition.springify()}
          style={{
            marginTop: 6,
            borderRadius: 8,
            borderColor: "#333",
            borderWidth: 1,
            overflow: "hidden",
          }}
        >
          {savedURLs.map((item) => (
            <TouchableOpacity
              key={item}
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
          ))}
        </Animated.View>
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
      
      { config && (
      <View>
        <Text style={styles.h1}>Decoder Settings</Text>
        {/* === RADIO SECTION === */}
        <Section
          title="Radio"
          icon={<RadioTower size={18} color="#3fe6e6" style={{ marginRight: 6 }} />}
        >
          <Row label="Frame sound" control={renderToggle("frameSound")} />
          <Row label="Countdown sound" control={renderToggle("countdownSound")} />
          <Row label="Countdown leds" control={renderToggle("countdownLeds")} />
          <Row label="Auto reload" control={renderToggle("reloadCountdown")} />
          <Row
            label="Countdown duration"
            control={renderNumber("countdownDuration", 0, 999)}
          />
          <Row label="Filter orbito" control={renderToggle("fliterOrbito")} />
          <Row label="Filter invalid" control={renderToggle("filterInvalid")} />
        </Section>

        {/* === AUDIO SECTION === */}
        <Section
          title="Audio"
          icon={<Speaker size={18} color="#3fe6e6" style={{ marginRight: 6 }} />}
        >
          <Row label="Touch sound" control={renderToggle("touchSound")} />
          <Row
            label="Buzzer level"
            control={renderNumber("buzzerLevel", 0, 100)}
          />
        </Section>

        {/* === DISPLAY SECTION === */}
        <Section
          title="Display"
          icon={<Monitor size={18} color="#3fe6e6" style={{ marginRight: 6 }} />}
        >
          <Row label="Reverse" control={renderToggle("displayReverse")} />
          <Row label="Show battery %" control={renderToggle("showBatPercentage")} />
          <Row
            label="Warn battery"
            control={renderToggle("showBatWarnMessage")}
          />
          <Row
            label="Off on charge"
            control={renderToggle("screenOffOnCharge")}
          />
          <Row label="Frame simulation" control={renderToggle("allowFrameSimu")} />
        </Section>

        {/* === WIFI SECTION === */}
        <Section
          title="WiFi"
          icon={<Wifi size={18} color="#3fe6e6" style={{ marginRight: 6 }} />}
        >
          {[
            "wifiSsid",
            "wifiPassPhrase",
            "wifiSsid1",
            "wifiPassPhrase1",
            "wifiSsid2",
            "wifiPassPhrase2",
            "timeZone",
          ].map((k) => (
            <Row key={k} label={LABELS[k]} control={renderText(k, true)} />
          ))}

          {[
            "wifiMode",
            "wifiStatus",
            "wifiRssi",
            "wifiIP",
            "wifiGatewayIP",
            "wifiDNS1",
            "wifiDNS2",
            "wifiMacAddress",
            "wifiSubnetMask",
            "rtcDate",
            "rtcNtpSync",
          ].map((k) => (
            <Row key={k} label={LABELS[k]} control={renderText(k)} />
          ))}
        </Section>

        {/* === SD SECTION === */}
        <Section
          title="SD Card"
          icon={<Icon iconNode={cardSd} size={18} color="#3fe6e6" style={{ marginRight: 6 }}/>}
        >
          {["sdCardMounted", "sdCardTotalBytes", "sdCardUsedBytes"].map((k) => (
            <Row key={k} label={LABELS[k]} control={renderText(k)} />
          ))}
        </Section>

        {/* === SYSTEM SECTION === */}
        <Section
          title="System"
          icon={<Info size={18} color="#3fe6e6" style={{ marginRight: 6 }} />}
        >
          {[
            "firmwareVersion",
            "sketchInfo",
            "chipModel",
            "chipCores",
            "chipFrequency",
            "ramSize",
            "ramFree",
            "psRamSize",
            "psRamFree",
            "flashSize",
            "flashFreq",
            "powerVcc",
            "powerState",
            "powerBatteryPercentage",
            "upTime",
          ].map((k) => (
            <Row key={k} label={LABELS[k]} control={renderText(k)} />
          ))}
        </Section>
      </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, backgroundColor:'#001a1a', padding:0 },
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
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
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
  section: {
    backgroundColor: "#0a2a2a",
    borderRadius: 12,
    marginBottom: 20,
    padding: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  sectionTitle: {
    color: "#3fe6e6",
    fontSize: 18,
    fontWeight: "700",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#112",
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginVertical: 3,
    borderRadius: 8,
  },
  value: {
    color: "#fff",
    fontSize: 14,
    textAlign: "right",
    flex: 1,
  },
  input: {
    color: "#fff",
    backgroundColor: "#223",
    paddingHorizontal: 8,
    borderRadius: 6,
    minWidth: 260,
    textAlign: "right",
  },
  numberInput: {
    color: "#fff",
    backgroundColor: "#223",
    paddingHorizontal: 8,
    borderRadius: 6,
    minWidth: 60,
    textAlign: "right",
  },
  numButton: {
    backgroundColor: "#2563eb",
    padding: 6,
    borderRadius: 6,
    marginHorizontal: 4,
  },
  checkboxContainer: { justifyContent: "center", alignItems: "center" },
  numberContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  info: { color: "#aaa", textAlign: "center", padding: 20 },
});
