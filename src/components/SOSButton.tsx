import { Animated, Linking, Text, TouchableOpacity, View } from "react-native";
import { styles } from "../styles/styles";
import { useRef } from "react";

const SOSButton = () => {
  const scale = useRef(new Animated.Value(1)).current;

  const onPress = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.92, duration: 100, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
    Linking.openURL('tel:112');
  };

  return (
    <View style={styles.sosSection}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <TouchableOpacity style={styles.sosBtn} onPress={onPress} activeOpacity={0.85}>
          <Text style={styles.sosBtnIcon}>📞</Text>
          <Text style={styles.sosBtnText}>SOS</Text>
        </TouchableOpacity>
      </Animated.View>
      <Text style={styles.sosSubText}>Press for immediate emergency assistance</Text>
    </View>
  );
};

export default SOSButton