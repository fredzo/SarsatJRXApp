import { AppContext } from '@/context/AppContext';
import { cardSd } from '@lucide/lab';
import { useRouter } from 'expo-router';
import { Activity, Icon, Settings } from 'lucide-react-native';
import React, { useContext } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type BatteryProps = {
  level: number;
};

export const BatteryIndicator: React.FC<BatteryProps> = ({ level }) => {
  const clampedLevel = Math.min(Math.max(level, 0), 100);

  const batteryColor =
    clampedLevel <= 15 ? "#884040" : clampedLevel <= 30 ? "#998500" : "#00885F";

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
  const router = useRouter();
  const { time, sdMounted, discriOn, batteryPercentage } = useContext(AppContext);

  return (
    <View style={styles.header}>
      <Text style={styles.time}>{time}</Text>
      <Icon iconNode={cardSd} style={{ marginLeft: 4, opacity: sdMounted ? 1 : 0.1 }} size={20} color="#FFFFFF"/>
      <Activity style={{ marginLeft: 4, opacity: discriOn ? 1 : 0.1 }} color="#FFFFFF"/>
      <Text style={styles.title}>SarsatJRXApp</Text>
      <View style={styles.headerRight}>
        { (batteryPercentage != undefined) && (<BatteryIndicator level={batteryPercentage} />) }
      </View>
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
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  headerIcon: {
    marginLeft: 4,
  },
  time: { fontFamily: "Courier", color: 'white', fontSize: 14 },
  title: { color: '#3fe6e6', fontSize: 18, fontWeight: '700', width:'100%', textAlign:'center' },
  batt: { color: 'white', fontSize: 12, width:100 },
  leds: { flexDirection: 'row', width:100 },
  led: { width: 10, height: 10, borderRadius: 5, marginHorizontal: 2 },
  batteryWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },

  batteryBody: {
    width: 50,
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
