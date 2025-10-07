import { AppContext } from '@/context/AppContext';
import { cardSd } from '@lucide/lab';
import { Activity, Icon, MonitorUp, MonitorX } from 'lucide-react-native';
import React, { useContext, useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

type BatteryProps = {
  level: number;
};

export const BatteryIndicator: React.FC<BatteryProps> = ({ level }) => {
  const clampedLevel = Math.min(Math.max(level, 0), 100);

  const batteryColor =
    clampedLevel <= 15 ? "#b62d2dff" : clampedLevel <= 30 ? "#998500" : "#00885F";

  return (
    <View style={styles.batteryWrapper}>
      {/* Corps principal */}
      <View style={styles.batteryBody}>
        <View
          style={[
            styles.batteryFill,
            {
              width: `${clampedLevel}%`,
              backgroundColor: batteryColor,
            },
          ]}
        />
        <Text style={styles.batteryLabel}>{clampedLevel}%</Text>
      </View>

      {/* Plot de batterie */}
      <View style={styles.batteryCap} />
    </View>
  );
};

export default function Header() {
  const { time, sdMounted, discriOn, batteryPercentage, connected } = useContext(AppContext);
  const blinkAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!connected) {
      // Start blinking animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(blinkAnim, {
            toValue: 0.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(blinkAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      // Stop blinking
      blinkAnim.setValue(1);
    }
  }, [connected]);  

  return (
    <View style={styles.header}>
      <Text style={styles.time}>{time}</Text>
      <Icon iconNode={cardSd} style={{ marginLeft: 4, paddingLeft: 10, opacity: sdMounted ? 1 : 0.1 }} size={20} color="#FFFFFF"/>
      <Activity style={{ marginLeft: 4, paddingLeft: 10, opacity: discriOn ? 1 : 0.1 }} size={20} color="#FFFFFF"/>
      {connected ? (
      <MonitorUp color="#FFFFFF" size={20} />
      ) : (
      <Animated.View style={{ opacity: blinkAnim, paddingLeft: 10 }}>
          <MonitorX color="#ff8484ff" size={20} />
      </Animated.View>
      )}
      <Text style={styles.title}>SarsatJRXApp</Text>
      <View style={styles.headerBattery}>
        { (batteryPercentage != undefined) && (<BatteryIndicator level={batteryPercentage} />) }
      </View>
      <View style={styles.leds}>
          <View key={0} style={[styles.led, {backgroundColor: 'lime'}]} />
          <View key={1} style={[styles.led, {backgroundColor: 'grey'}]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#022',
    width: '100%',
    padding: 8,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
  },

  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    borderColor:'#FFFFFF',
    borderWidth:1,
    gap: 4,
  },

  headerBattery: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  headerIcon: {
    marginLeft: 4,
  },
  time: { fontFamily: "Courier", color: 'white', fontSize: 14 },
  title: { flex: 1, color: '#3fe6e6', fontSize: 18, fontWeight: '700', textAlign:'center' },
  batt: { color: 'white', fontSize: 12, width:100 },
  leds: { paddingLeft: 10, flexDirection: 'row' },
  led: { width: 10, height: 10, borderRadius: 5, marginHorizontal: 2 },
  batteryWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },

  batteryBody: {
    width: 40,
    height: 20,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    borderRadius: 3,
    position: "relative",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },

  batteryFill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
  },

  batteryLabel: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
    zIndex: 1,
    fontFamily: "monospace",
  },

  batteryCap: {
    width: 4,
    height: 10,
    backgroundColor: "#FFFFFF",
    marginLeft: 2,
    borderRadius: 1,
  },
});
