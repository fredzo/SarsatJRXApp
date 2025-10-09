import { AppContext } from "@/context/AppContext";
import { FrameState } from "@/lib/frames";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { default as React, useContext, useRef } from "react";
import { Animated, Easing, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const AnimatedButton = ({
  icon,
  label,
  color,
  onPress,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  color: string;
  onPress: () => void;
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const animatePress = (toValue: number) => {
    Animated.timing(scale, {
      toValue,
      duration: 120,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      onPressIn={() => animatePress(0.9)}
      onPressOut={() => animatePress(1)}
      onPress={onPress}
    >
      <Animated.View
        style={{
          transform: [{ scale }],
          backgroundColor: color,
          borderRadius: 12,
          paddingVertical: 8,
          paddingHorizontal: 16,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 3,
          elevation: 3,
        }}
      >
        <MaterialCommunityIcons name={icon} size={28} color="white" />
        <Text style={{ color: "white", fontWeight: "600" }}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
};

export default function HomeScreen() {
  const { currentFrame } = useContext(AppContext);

  const openMaps = () => {
    if (!currentFrame?.hasLocation) return;
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${currentFrame.lat},${currentFrame.lon}`);
  };
  const openWaze = () => {
    if (!currentFrame?.hasLocation) return;
    Linking.openURL(`https://waze.com/ul?ll=${currentFrame.lat},${currentFrame.lon}&navigate=yes`);
  };

// --- Convert decimal to sexagesimal ---
function formatDMS(value: number | null, isLat: boolean) {
  if(!value) return "";
  const abs = Math.abs(value);
  const deg = Math.floor(abs);
  const minFloat = (abs - deg) * 60;
  const min = Math.floor(minFloat);
  const sec = Math.round((minFloat - min) * 60);
  const dir = value >= 0 ? (isLat ? "N" : "E") : isLat ? "S" : "W";
  return `${deg}°${min.toString().padStart(2, "0")}'${sec
    .toString()
    .padStart(2, "0")}"${dir}`;
}

// --- Format bytes ---
function formatData(data: string) {
  return data.match(/.{1,2}/g)?.join(" ") || data;
}

// --- Calcul du Maidenhead Locator ---
function calculateMaidenhead(lat: number | null, lon: number | null): string {
  if(!lat || !lon) return "";
  // Adjust range
  lon += 180;
  lat += 90;

  // Field (2 chars)
  const A = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lonField = Math.floor(lon / 20);
  const latField = Math.floor(lat / 10);

  // Square (2 digits)
  const lonSquare = Math.floor((lon % 20) / 2);
  const latSquare = Math.floor(lat % 10);

  // Subsquare (2 chars)
  const lonSub = Math.floor(((lon % 2) * 12));
  const latSub = Math.floor(((lat % 1) * 24));

  // Extended square (2 digits)
  const lonExt = Math.floor(((lon * 60) % 5) / 0.5);
  const latExt = Math.floor(((lat * 60) % 2.5) / 0.25);

  // Extended subsquare (2 chars)
  const lonExtSub = Math.floor((((lon * 60) % 0.5) / (0.5 / 24)));
  const latExtSub = Math.floor((((lat * 60) % 0.25) / (0.25 / 24)));

  // Build locator (10 chars)
  const locator =
    A[lonField] +
    A[latField] +
    lonSquare.toString() +
    latSquare.toString() +
    A[lonSub] +
    A[latSub] +
    lonExt.toString() +
    latExt.toString() +
    A[lonExtSub] +
    A[latExtSub];

  return locator.toUpperCase();
}

  if (!currentFrame) {
    return (
      <View style={styles.waitContainer}>
        <Text style={styles.waitText}>Waiting for the wave...</Text>
      </View>
    );
  }

  const maiden = calculateMaidenhead(currentFrame.lat, currentFrame.lon);

  return (
    <View
      style={[
        styles.container,
        currentFrame.state != FrameState.OK ? styles.containerError : undefined,
      ]}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>{currentFrame.data.title}</Text>

        <View style={styles.section}>
          <Text style={styles.label}>Info:</Text>
          <Text style={styles.value}>{currentFrame.data.protocol}</Text>
          <Text style={styles.value}>{currentFrame.data.protocolDesc}</Text>
          <Text style={styles.value}>{currentFrame.data.protocolAddData}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Location:&nbsp;&nbsp;&nbsp;&nbsp;</Text>
          <Text style={styles.value}>{currentFrame.data.country}</Text>
          {currentFrame.hasLocation ? (
          <>
          <Text style={styles.value}>
            {formatDMS(currentFrame.lat, true)}, {formatDMS(currentFrame.lon, false)}
          </Text>
          <Text style={styles.value}>
            {currentFrame.lat.toFixed(6)}, {currentFrame.lon.toFixed(6)}
          </Text>
          <Text style={styles.locator}>{maiden}</Text>
          </>  ) : (
          <Text style={styles.value}>GPS not synchronized</Text>
          )
          }
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Control:</Text>
          <View style={styles.row}>
            {currentFrame.data.bch1 && (
            <Text style={[styles.value, { color: currentFrame.bch1Ok ? "#00FF00" : "#FF4444" }]}>
              BCH1-{currentFrame.data.bch1.toUpperCase()}
            </Text>)}
            {currentFrame.data.bch2 && (
            <Text style={[styles.value, { color: currentFrame.bch2Ok ? "#00FF00" : "#FF4444", marginLeft: 10 }]}>
              BCH2-{currentFrame.data.bch2.toUpperCase()}
            </Text>)}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Date:</Text>
          <Text style={styles.value}>
            {currentFrame.data.date} - {currentFrame.data.time}
          </Text>
        </View>
      
        {currentFrame.data.serial && (
        <View style={styles.section}>
          <Text style={styles.label}>Serial #:</Text>
          <Text style={styles.value}>{currentFrame.data.serial}</Text>
        </View>)}

        <View style={styles.section}>
          <Text style={styles.label}>Main loc. device:</Text>
          <Text style={styles.value}>{currentFrame.data.mainDevice}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Aux. loc. device:</Text>
          <Text style={styles.value}>{currentFrame.data.auxDevice}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Hex ID:</Text>
          <Text style={styles.value}>{currentFrame.data.hexId}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Data:</Text>
          {currentFrame.data.data ? (
              <>
                <Text style={styles.value}>
                  {formatData(currentFrame.data.data).slice(0, 24)} 
                </Text>
                <Text style={styles.value}>
                  {formatData(currentFrame.data.data).slice(24)} {/* le reste */}
                </Text>
              </>
            ) : (
              <Text style={styles.value}>—</Text>
            )}
        </View>
      </ScrollView>
      {currentFrame.hasLocation && (
      <View style={{ marginTop: 10, marginBottom: 20 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-evenly", marginTop: 8 }}>
          <AnimatedButton
            icon="google-maps"
            label="Maps"
            color="#4285F4"
            onPress={() => {
              const url = `https://www.google.com/maps?q=${currentFrame.lat},${currentFrame.lon}`;
              Linking.openURL(url);
            }}
          />

          <AnimatedButton
            icon="waze"
            label="Waze"
            color="#0DACE5"
            onPress={() => {
              const url = `https://waze.com/ul?ll=${currentFrame.lat},${currentFrame.lon}&navigate=yes`;
              Linking.openURL(url);
            }}
          />
        </View>
      </View>
      )}
    </View>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#001000",
    paddingTop: 10,
    paddingHorizontal: 12,
    borderWidth: 4,
    borderColor: "#003000",
  },
  containerError: {
    borderColor: "#FF0000",
  },
  waitContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#001000",
  },
  waitText: {
    //fontFamily: "Courier",
    color: "#00FFFF",
    fontSize: 18,
  },
  scroll: {
    paddingBottom: 40,
  },
  title: {
    //fontFamily: "Courier",
    color: "#00FFFF",
    fontSize: 24,
    textAlign: "center",
    marginBottom: 8,
  },
  section: {
    marginVertical: 4,
  },
  label: {
    //fontFamily: "Courier",
    color: "#00FFFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  value: {
    fontFamily: "Courier",
    color: "#FFFFFF",
    fontSize: 14,
  },
  locator: {
    fontFamily: "Courier",
    color: "#FFFFFF",
    fontSize: 14,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  rowBetween: {
    flexDirection: "row",
    //justifyContent: "space-between",
  },
  link:{ color:'cyan', marginVertical:4 },
});