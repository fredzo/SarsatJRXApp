import { AppContext } from '@/context/AppContext';
import { usePathname, useRouter } from 'expo-router';
import { ArrowBigLeft, ArrowBigRight, Settings } from 'lucide-react-native';
import React, { useContext } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CountdownSpinner from '../components/CountdownSpinner';

export default function Footer() {
  const { frames, currentIndex, countdown, nextFrame, prevFrame } = useContext(AppContext);
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View style={styles.footer}>
      <TouchableOpacity onPress={prevFrame}>
        <ArrowBigLeft size={28} color="cyan" />
      </TouchableOpacity>
      <CountdownSpinner countdown={countdown} size={40} arcLength={60} strokeWidth={4} color="cyan" backgroundColor="#555" />
      <Text style={styles.info}>
        Frame {frames.length > 0 ? currentIndex + 1 : 0} / {frames.length}
      </Text>
      <TouchableOpacity onPress={() => {
          if (pathname === '/settings') router.back();
          else router.push('/settings');
        }}>
        <Settings color="white" size={28} />
      </TouchableOpacity>
      <TouchableOpacity onPress={nextFrame}>
        <ArrowBigRight size={28} color="cyan" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    backgroundColor: '#033',
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  btn: { color: 'cyan', fontWeight: '600', marginHorizontal: 8 },
  info: { color: 'white' },
  countdown: { color: 'white', marginLeft: 12 },
});
