import { useContext } from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FrameContext } from '../providers/FrameProvider';

export default function HomeScreen() {
  const { frames, currentIndex } = useContext(FrameContext);

  const openMaps = () => {
    if (!frames[currentIndex] || !frames[currentIndex].lat || !frames[currentIndex].lon) return;
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${frames[currentIndex].lat},${frames[currentIndex].lon}`);
  };
  const openWaze = () => {
    if (!frames[currentIndex] || !frames[currentIndex].lat || !frames[currentIndex].lon) return;
    Linking.openURL(`https://waze.com/ul?ll=${frames[currentIndex].lat},${frames[currentIndex].lon}&navigate=yes`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.h1}>{frames[currentIndex] ? frames[currentIndex].data['title'] : "No frame yet"}</Text>
      <ScrollView>
        {frames[currentIndex]
          ? Object.entries(frames[currentIndex].data).map(([k,v]) => (
              <Text key={k} style={styles.line}>{k}: {v}</Text>
            ))
          : <Text style={styles.line}>Waiting for frame...</Text>}
      </ScrollView>
      {frames[currentIndex] && !frames[currentIndex].lat && !frames[currentIndex].lon && (
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

const styles = StyleSheet.create({
  container:{ flex:1, padding:12, backgroundColor:'#001a1a' },
  h1:{ color:'#3fe6e6', fontSize:20, fontWeight:'700', marginBottom:12, textAlign:'center' },
  line:{ color:'white', marginBottom:4 },
  link:{ color:'cyan', marginVertical:4 }
});
