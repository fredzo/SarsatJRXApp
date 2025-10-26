import { AppContext } from "@/context/AppContext";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import React, { useContext, useEffect } from "react";
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");
const SCAN_SIZE = width * 0.7;

export default function QRScanner() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const { saveDeviceURL, setWaitForConnection } = useContext(AppContext);

  const lineY = useSharedValue(0);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  useEffect(() => {
    // Animation de la ligne de scan (va-et-vient)
    lineY.value = withRepeat(
      withTiming(SCAN_SIZE - 10, { duration: 2000 }),
      -1,
      true
    );
  }, []);

  const animatedLineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: lineY.value }],
  }));

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    setWaitForConnection(true);
    saveDeviceURL(data);
    router.back(); // Go back to settings screen
  };

  if (!permission?.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Camera permission required</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant access</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={handleBarcodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
      />

      {/* Overlay assombri autour du cadre */}
      <View style={styles.overlay}>
        <View style={styles.maskTop} />
        <View style={styles.maskRow}>
          <View style={styles.maskSide} />
          <View style={styles.scanArea}>
            {/* Ligne de scan animée */}
            <Animated.View style={[styles.scanLine, animatedLineStyle]} />
          </View>
          <View style={styles.maskSide} />
        </View>
        <View style={styles.maskBottom}>
          <Text style={styles.scanText}>Align QR code within the frame</Text>

          <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },

  // Masques pour obscurcir autour de la zone de scan
  maskTop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    width: "100%",
  },
  maskRow: {
    flexDirection: "row",
  },
  maskSide: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
  },

  maskBottom: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 30,
  },

  // Zone centrale du scan
  scanArea: {
    width: SCAN_SIZE,
    height: SCAN_SIZE,
    borderWidth: 3,
    borderColor: "#00FF66",
    borderRadius: 12,
    overflow: "hidden",
  },

  // Ligne verte animée
  scanLine: {
    position: "absolute",
    width: "100%",
    height: 3,
    backgroundColor: "#00FF66",
  },

  scanText: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 20,
  },
  cancelButton: {
    backgroundColor: "#222",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  cancelText: { color: "#fff", fontSize: 16 },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  text: { color: "#fff", fontSize: 18, marginBottom: 20 },
  button: {
    backgroundColor: "#333",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  buttonText: { color: "#fff", fontSize: 16 },
});