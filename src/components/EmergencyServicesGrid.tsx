import { Linking, Text, TouchableOpacity, View } from "react-native";
import { styles } from "../styles/styles";
import { EMERGENCY_SERVICES } from "../constants/utilities";

const EmergencyServicesGrid = () => {
  const call = (number: string) => Linking.openURL(`tel:${number}`);
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Emergency Services</Text>
      <View style={styles.grid2}>
        {EMERGENCY_SERVICES.map(s => (
          <TouchableOpacity
            key={s.id}
            style={[styles.serviceBtn, { backgroundColor: s.color }]}
            onPress={() => call(s.number)}
            activeOpacity={0.85}
          >
            <Text style={styles.serviceBtnIcon}>{s.icon}</Text>
            <Text style={styles.serviceBtnLabel}>{s.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default EmergencyServicesGrid