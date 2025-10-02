import { Audio } from 'expo-av';
import { useContext, useEffect, useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import EventSource from 'react-native-sse';
import { FrameContext } from '../providers/FrameProvider';

//const DEVICE_URL = 'http://sarsatjrx.local';
const DEVICE_URL = 'http://localhost';
//const DEVICE_URL = 'http://10.0.2.2';

export default function HomeScreen() {
  const { frames, currentIndex, addFrame } = useContext(FrameContext);
  const [countdown, setCountdown] = useState<number>(0);

  const soundOK = new Audio.Sound();
  const soundKO = new Audio.Sound();
  const soundError = new Audio.Sound();

  async function loadSounds() 
  {
    try {
      if(!soundOK._loaded) await soundOK.loadAsync(require('../assets/beep.wav'));
      if(!soundKO._loaded) await soundKO.loadAsync(require('../assets/beep.wav'));
      if(!soundError._loaded) await soundError.loadAsync(require('../assets/beep.wav'));
    } catch (error){
      console.log("Error while loading sounds :",error);
    }
  }

  async function unloadSounds() 
  {
    try {
      if(soundOK._loaded) await soundOK.unloadAsync();
      if(soundKO._loaded) await soundKO.unloadAsync();
      if(soundError._loaded) await soundError.unloadAsync();
    } catch (error){
      console.log("Error while unloading sounds :",error);
    }
  }

  async function playSoundOK() {
    try {
      await soundOK.playAsync();
    } catch (error){
      console.log("Error when playing OK sound :",error);
    }
  }

  async function playSoundKO() {
    try {
      await soundKO.playAsync();
    } catch (error){
      console.log("Error when playing KO sound :",error);
    }
  }

  async function playSoundError() {
    try {
      await soundError.playAsync();
    } catch (error){
      console.log("Error when playing Error sound :",error);
    }
  }

  async function fetchFrames() {
    try {
      const resp = await fetch(DEVICE_URL+'/frames');
      const text = await resp.text();
      text.split("#\n").forEach(line => 
      {
        parseFrame(line);
      });
    } catch {}
  }

  async function fetchFrame() {
    try {
      const resp = await fetch(DEVICE_URL+'/frame');
      const text = await resp.text();
      parseFrame(text);
    } catch {}
  }

  function parseFrame(frameData: string) {
    try {
      const parsed: Record<string, string> = {};
      frameData.split(/\r?\n/).forEach(line => {
        const [key, value] = line.split('=');
        //console.log("Frame data:",key,value);
        if (key && value) parsed[key.trim()] = value.trim();
      });
      if(Object.entries(parsed).length > 0)
      {
        addFrame(parsed);
      }
    } catch {}
  }

  useEffect(() => {
    loadSounds();
    fetchFrames();
    const evtSource = new EventSource(DEVICE_URL+'/sse');
    evtSource.addEventListener("message", e => {
      if (!e.data) return;
      if (e.data.startsWith('tick;')) 
      {
        const parts = e.data.split(';');
        if(parts.length==3)
        {
          const val = parseInt(parts[1]);
          setCountdown(val);
        }
      } 
      else if (e.data.startsWith('frame'))
      {
        playSoundOK();
        //console.log("Event data: ",e.data);
        parseFrame(e.data.split("\n").slice(1).join("\n"));
      }
    });
    evtSource.addEventListener("error", (event) => {
      //console.error("SSE Error", event);
    });    
    return () => 
    {
        evtSource.close();
        unloadSounds();
    };
  }, []);

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
      <Text style={styles.countdown}>Next frame in: {countdown}s</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, padding:12, backgroundColor:'#001a1a' },
  h1:{ color:'#3fe6e6', fontSize:20, fontWeight:'700', marginBottom:12, textAlign:'center' },
  line:{ color:'white', marginBottom:4 },
  countdown:{ marginTop:12, color:'cyan', fontWeight:'600' },
  link:{ color:'cyan', marginVertical:4 }
});
