import { MapView, Marker } from '@netizen-teknologi/react-native-maps-leaflet';
import { useContext } from 'react';
import { StyleSheet, Text, View } from 'react-native';
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

  const externalUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

  // console.log("Latitude = ", latitude, "Longitude =", longitude);

  return (
    <View style={styles.container}>
      <Text style={styles.h1}>Map</Text>
        <MapView
          center={[ latitude, longitude ]}>
          <Marker
            position={[ latitude, longitude ]} >
           </Marker>
        </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: '#001a1a' },
  h1: { color: '#3fe6e6', fontSize: 20, fontWeight: '700', marginBottom: 12 },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#022', padding: 12 },
});