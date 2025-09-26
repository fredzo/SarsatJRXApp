import React, { useContext } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { FrameContext } from '../providers/FrameProvider';

export default function Footer() {
  const { frame } = useContext(FrameContext);
  const countdown = frame?.['COUNTDOWN'] ?? '--';
  return (
    <View style={styles.footer}>
      <Text style={{color:'white'}}>Next frame in: {countdown}s</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  footer:{ backgroundColor:'#033', padding:8, alignItems:'center' }
});
