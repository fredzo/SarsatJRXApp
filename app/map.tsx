import { MapView, Marker } from '@netizen-teknologi/react-native-maps-leaflet';
import { useContext } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { FrameContext } from '../providers/FrameProvider';

export default function MapScreen() {
  const { frames, currentIndex } = useContext(FrameContext);

  if (!frames[currentIndex] || !frames[currentIndex].lat || !frames[currentIndex].lon) {
    return (
      <View style={styles.container}>
        <Text style={styles.h1}>Map</Text>
        <Text style={{ color: 'white' }}>No beacon position available</Text>
      </View>
    );
  }

  const isBCH1ok = frames[currentIndex].data.bch1 && frames[currentIndex].data.bch1.toUpperCase() === "OK";
  const isBCH2ok = frames[currentIndex].data.bch2 && frames[currentIndex].data.bch2.toUpperCase() === "OK";
  const hasError = (!isBCH1ok) || (frames[currentIndex].data.bch2 && !isBCH2ok);

  const latitude = frames[currentIndex].lat;
  const longitude =frames[currentIndex].lon;

  // console.log("Latitude = ", latitude, "Longitude =", longitude);


  if (Platform.OS === 'web') {
    return (
    <View 
      style={[
        styles.container,
        hasError ? styles.containerError : undefined,
      ]}>
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

  // Mobile : WebView avec Leaflet
  const leafletHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css"/>
      <style>
        html, body, #map { height: 100%; margin: 0; padding: 0; width: 100vw; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
      <script>
        var map = L.map('map').setView([${latitude}, ${longitude}], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19
        }).addTo(map);
        L.marker([${latitude}, ${longitude}])
          .addTo(map)
          .bindPopup('Vous êtes ici')
          .openPopup();
      </script>
    </body>
    </html>
  `;

  return (
    <View 
      style={[
        styles.container,
        hasError ? styles.containerError : undefined,
      ]}>
      <WebView
        originWhitelist={['*']}
        source={{ html: leafletHtml }}
        style={styles.webview}
      />
    </View>
  );
}

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
  h1: { color: '#3fe6e6', fontSize: 20, fontWeight: '700', marginBottom: 12 },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#022', padding: 12 },
  webview: { flex: 1 },
});