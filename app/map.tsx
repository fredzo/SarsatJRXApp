import { MapView, Marker } from '@netizen-teknologi/react-native-maps-leaflet';
import { useContext } from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FrameContext } from '../providers/FrameProvider';


export default function MapScreen() {
  const { coords } = useContext(FrameContext);

  if (!coords) {
    return (
      <View style={styles.container}>
        <Text style={styles.h1}>Map</Text>
        <Text style={{ color: 'white' }}>No beacon position available</Text>
      </View>
    );
  }

  const { latitude, longitude } = coords;
  //const latitude=48.85854530343698;
  //const longitude=2.35265015343154;

  const externalUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

  console.log("Latitude = ", latitude, "Longitude =", longitude);

  return (
    <View style={styles.container}>
      <Text style={styles.h1}>Map</Text>
      {/*Platform.OS !== 'web'*/ true ? (
        <MapView
          center={[ latitude, longitude ]}
          /*style={{ flex: 1 }}
          initialRegion={{
            latitude,
            longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}*/
        >
          <Marker
            position={[ latitude, longitude ]}
            //title="Beacon"
            /*description="Last known position"*/
          >
           </Marker>
        </MapView>
      ) : (
        <View style={styles.placeholder}>
          <Text>Map preview is not available here.</Text>
          <TouchableOpacity onPress={() => Linking.openURL(externalUrl)}>
            <Text style={{ color: 'cyan', marginTop: 8 }}>Open in Google Maps</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: '#001a1a' },
  h1: { color: '#3fe6e6', fontSize: 20, fontWeight: '700', marginBottom: 12 },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#022', padding: 12 },
});