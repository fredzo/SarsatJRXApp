import React, { useContext } from "react";
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FrameContext } from '../providers/FrameProvider';


export default function HomeScreen() {
  const { frames, currentIndex } = useContext(FrameContext);

  const openMaps = () => {
    if (!frames[currentIndex] || !frames[currentIndex].data.lat || !frames[currentIndex].data.lon) return;
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${frames[currentIndex].data.lat},${frames[currentIndex].data.lon}`);
  };
  const openWaze = () => {
    if (!frames[currentIndex] || !frames[currentIndex].data.lat || !frames[currentIndex].data.lon) return;
    Linking.openURL(`https://waze.com/ul?ll=${frames[currentIndex].data.lat},${frames[currentIndex].data.lon}&navigate=yes`);
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

  if (!frames[currentIndex]) {
    return (
      <View style={styles.waitContainer}>
        <Text style={styles.waitText}>Waiting for the wave...</Text>
      </View>
    );
  }

  const isBCH1ok = frames[currentIndex].data.bch1 && frames[currentIndex].data.bch1.toUpperCase() === "OK";
  const isBCH2ok = frames[currentIndex].data.bch2 && frames[currentIndex].data.bch2.toUpperCase() === "OK";
  const hasError = (!isBCH1ok) || (frames[currentIndex].data.bch2 && !isBCH2ok);
  const hasLocation = (frames[currentIndex].lat !== null && frames[currentIndex].lat !== null);
  const lat = frames[currentIndex].lat ? frames[currentIndex].lat : 0;
  const lon = frames[currentIndex].lon ? frames[currentIndex].lon : 0;

  const maiden = calculateMaidenhead(frames[currentIndex].lat, frames[currentIndex].lon);

  return (
    <View
      style={[
        styles.container,
        hasError ? styles.containerError : undefined,
      ]}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>{frames[currentIndex].data.title}</Text>

        <View style={styles.section}>
          <Text style={styles.label}>Info:</Text>
          <Text style={styles.value}>{frames[currentIndex].data.protocol}</Text>
          <Text style={styles.value}>{frames[currentIndex].data.protocolDesc}</Text>
          <Text style={styles.value}>{frames[currentIndex].data.protocolAddData}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Location:&nbsp;&nbsp;&nbsp;&nbsp;</Text>
          <Text style={styles.value}>{frames[currentIndex].data.country}</Text>
          {hasLocation ? (
          <>
          <Text style={styles.value}>
            {formatDMS(frames[currentIndex].lat, true)}, {formatDMS(frames[currentIndex].lon, false)}
          </Text>
          <Text style={styles.value}>
            {lat.toFixed(6)}, {lon.toFixed(6)}
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
            {frames[currentIndex].data.bch1 && (
            <Text style={[styles.value, { color: isBCH1ok ? "#00FF00" : "#FF4444" }]}>
              BCH1-{frames[currentIndex].data.bch1.toUpperCase()}
            </Text>)}
            {frames[currentIndex].data.bch2 && (
            <Text style={[styles.value, { color: isBCH2ok ? "#00FF00" : "#FF4444", marginLeft: 10 }]}>
              BCH2-{frames[currentIndex].data.bch2.toUpperCase()}
            </Text>)}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Date:</Text>
          <Text style={styles.value}>
            {frames[currentIndex].data.date} - {frames[currentIndex].data.time}
          </Text>
        </View>
      
        {frames[currentIndex].data.serial && (
        <View style={styles.section}>
          <Text style={styles.label}>Serial #:</Text>
          <Text style={styles.value}>{frames[currentIndex].data.serial}</Text>
        </View>)}

        <View style={styles.section}>
          <Text style={styles.label}>Main loc. device:</Text>
          <Text style={styles.value}>{frames[currentIndex].data.mainDevice}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Aux. loc. device:</Text>
          <Text style={styles.value}>{frames[currentIndex].data.auxDevice}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Hex ID:</Text>
          <Text style={styles.value}>{frames[currentIndex].data.hexId}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Data:</Text>
          {frames[currentIndex].data.data ? (
              <>
                <Text style={styles.value}>
                  {formatData(frames[currentIndex].data.data).slice(0, 24)} 
                </Text>
                <Text style={styles.value}>
                  {formatData(frames[currentIndex].data.data).slice(24)} {/* le reste */}
                </Text>
              </>
            ) : (
              <Text style={styles.value}>—</Text>
            )}
        </View>
      </ScrollView>
      {frames[currentIndex].data.lat && frames[currentIndex].data.lon && (
        <View style={{marginTop:12}}>
          <TouchableOpacity onPress={openMaps}>
            <Text style={styles.link}>Open in Google Maps</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={openWaze}>
            <Text style={styles.link}>Open in Waze</Text>
          </TouchableOpacity>
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
    paddingTop: 40,
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