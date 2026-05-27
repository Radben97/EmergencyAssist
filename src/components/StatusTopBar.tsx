import { Text, View } from "react-native";
import { styles } from "../styles/styles";

const StatusTopBar = () => (
  <View style={styles.statusBar}>
    <View style={styles.statusLeft}>
      <Text style={styles.statusIcon}>📶</Text>
      <Text style={styles.statusText}>Strong</Text>
      <Text style={styles.statusIcon}>  🧭</Text>
      <Text style={styles.statusText}>High Accuracy</Text>
    </View>
        <Text style={styles.statusTime}>{}</Text>
  </View>
);

export default StatusTopBar