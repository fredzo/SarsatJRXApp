import React, { useEffect, useRef } from "react";
import { Animated, Easing, Platform, StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

type Props = {
  countdown: number | null;
  size?: number;
  arcLength?: number; // longueur de l’arc en degrés (ex: 90)
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
};

const CountdownSpinner: React.FC<Props> = ({
  countdown,
  size = 50,
  arcLength = 90,
  strokeWidth = 4,
  color = "cyan",
  backgroundColor = "#333",
}) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: Platform.OS !== "web", // évite le warning sur web
      })
    ).start();
  }, [rotateAnim]);

  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const arcRatio = arcLength / 360;
  const dashArray = `${arcRatio * circumference} ${circumference}`;

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* Cercle gris de fond */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
      </Svg>

      {/* Arc animé */}
      <Animated.View
        style={{
          position: "absolute",
          transform: [{ rotate: spin }],
        }}
      >
        <Svg width={size} height={size}>
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={dashArray}
          />
        </Svg>
      </Animated.View>

      {/* Texte countdown */}
      <Text style={styles.text}>{countdown ?  Math.abs(countdown) : ''}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    position: "absolute",
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default CountdownSpinner;
