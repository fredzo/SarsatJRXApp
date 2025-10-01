import React, { useContext } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FrameContext } from '../providers/FrameProvider';

export default function Footer() {
  const { frames, currentIndex, nextFrame, prevFrame } = useContext(FrameContext);
  const countdown = frames[currentIndex]?.['COUNTDOWN'] ?? '--';
  return (
    <View style={styles.footer}>
      <TouchableOpacity onPress={prevFrame}>
        <Text style={styles.btn}>Prev</Text>
      </TouchableOpacity>
      <Text style={styles.info}>
        Frame {frames.length > 0 ? currentIndex + 1 : 0} / {frames.length}
      </Text>
      <TouchableOpacity onPress={nextFrame}>
        <Text style={styles.btn}>Next</Text>
      </TouchableOpacity>
      <Text style={styles.countdown}>Next frame in: {countdown}s</Text>
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
