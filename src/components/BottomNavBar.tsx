import { Text, TouchableOpacity, View } from "react-native";
import { styles } from "../styles/styles";

const BottomNavBar = ({ active, onSelect }: { active: string; onSelect: (tab: string) => void }) => {
  const tabs = [
    { id: 'chat', label: 'AI Chat', icon: '💬', color: '#16A34A' },
    { id: 'voice', label: 'Voice', icon: '🎙️', color: '#9333EA' },
    { id: 'profile', label: 'Profile', icon: '👤', color: '#4F46E5' },
  ];
  return (
    <View style={styles.navBar}>
      {tabs.map(t => (
        <TouchableOpacity
          key={t.id}
          style={[styles.navTab, { backgroundColor: t.color }, active === t.id && styles.navTabActive]}
          onPress={() => onSelect(t.id)}
          activeOpacity={0.85}
        >
          <Text style={styles.navTabIcon}>{t.icon}</Text>
          <Text style={styles.navTabLabel}>{t.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default BottomNavBar