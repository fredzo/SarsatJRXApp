import { useRouter } from 'expo-router';
import { Settings } from 'lucide-react-native';
import React, { useContext, useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FrameContext } from '../providers/FrameProvider';

export default function Header() {
  const router = useRouter();
  const { frame } = useContext(FrameContext);
  const [time, setTime] = useState<string>(new Date().toLocaleTimeString());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const battery = frame?.['BATT'] ?? '--';

  return (
    <View style={styles.header}>
      <Text style={styles.time}>{time}</Text>
      <Text style={styles.title}>SarsatJRXApp</Text>
      <Text style={styles.batt}>Battery: {battery}%</Text>
      <View style={styles.leds}>
        {[0,1,2,3].map(i => (
          <View key={i} style={[styles.led, {backgroundColor: i===0 ? 'lime' : 'gray'}]} />
        ))}
      </View>
      <TouchableOpacity onPress={() => router.push('/settings')}>
        <Settings color="white" size={24} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#022',
    padding: 8,
  },
  time: { color: 'white', fontSize: 14 },
  title: { color: '#3fe6e6', fontSize: 18, fontWeight: '700', width:'100%', textAlign:'center' },
  batt: { color: 'white', fontSize: 12, width:100 },
  leds: { flexDirection: 'row', width:100 },
  led: { width: 10, height: 10, borderRadius: 5, marginHorizontal: 2 },
});
