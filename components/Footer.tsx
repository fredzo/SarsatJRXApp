import { ArrowBigLeft, ArrowBigRight } from 'lucide-react-native';
import React, { useContext } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CountdownSpinner from '../components/CountdownSpinner';
import { FrameContext } from '../providers/FrameProvider';


export default function Footer() {
  const { frames, currentIndex, countdown, nextFrame, prevFrame } = useContext(FrameContext);
  return (
    <View style={styles.footer}>
      <TouchableOpacity onPress={prevFrame}>
        <ArrowBigLeft size={28} color="cyan" />
      </TouchableOpacity>
      <CountdownSpinner countdown={countdown} size={40} arcLength={60} strokeWidth={4} color="cyan" backgroundColor="#555" />
      <Text style={styles.info}>
        Frame {frames.length > 0 ? currentIndex + 1 : 0} / {frames.length}
      </Text>
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
