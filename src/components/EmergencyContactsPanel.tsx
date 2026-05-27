import { Linking, Text, TouchableOpacity, View } from "react-native";
import { styles } from "../styles/styles";
import { EMERGENCY_CONTACTS } from "../constants/utilities";

const EmergencyContactsPanel = () => {
  const call = (phone: string) => Linking.openURL(`tel:${phone.replace(/\s/g, '')}`);
  return (
    <View style={styles.contactsPanel}>
      <View style={styles.contactsHeader}>
        <Text style={styles.contactsHeaderIcon}>📞</Text>
        <Text style={styles.contactsHeaderTitle}>Emergency Contacts</Text>
      </View>
      {EMERGENCY_CONTACTS.map(c => (
        <View key={c.id} style={styles.contactRow}>
          <View style={styles.contactInfo}>
            <Text style={styles.contactName}>{c.name}</Text>
            <Text style={styles.contactRole}>{c.role}</Text>
            <Text style={styles.contactPhone}>{c.phone}</Text>
          </View>
          <TouchableOpacity style={styles.callBtn} onPress={() => call(c.phone)} activeOpacity={0.85}>
            <Text style={styles.callBtnText}>Call</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
};

export default EmergencyContactsPanel