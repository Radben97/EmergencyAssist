import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },

  // Status bar
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  statusLeft: { flexDirection: 'row', alignItems: 'center' },
  statusIcon: { fontSize: 13 },
  statusText: { fontSize: 12, color: '#374151', marginLeft: 3, fontWeight: '500' },
  statusTime: { fontSize: 11, color: '#6B7280' },

  scroll: { flex: 1 },
  scrollContent: { padding: 12, gap: 12 },

  // ── Chatbot ──
  chatPanel: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    height: 320,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4F46E5',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  chatHeaderIcon: { fontSize: 16, marginRight: 6 },
  chatHeaderTitle: { fontSize: 14, fontWeight: '700', color: '#FFFFFF', flex: 1 },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4ADE80' },
  chatMessages: { flex: 1, paddingHorizontal: 10 },
  bubble: {
    maxWidth: '78%',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginVertical: 3,
  },
  bubbleUser: {
    alignSelf: 'flex-end',
    backgroundColor: '#4F46E5',
    borderBottomRightRadius: 4,
  },
  bubbleAI: {
    alignSelf: 'flex-start',
    backgroundColor: '#F3F4F6',
    borderBottomLeftRadius: 4,
  },
  bubbleText: { fontSize: 13, lineHeight: 18 },
  bubbleTextUser: { color: '#FFFFFF' },
  bubbleTextAI: { color: '#1F2937' },
  chatInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#FAFAFA',
  },
  chatInput: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 13,
    color: '#111827',
  },
  sendBtn: {
    marginLeft: 8,
    backgroundColor: '#4F46E5',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnText: { color: '#FFFFFF', fontSize: 14 },

  // ── Top row (Location + Contacts) ──
  topRow: {
    flexDirection: 'row',
    gap: 10,
  },

  // Location
  locationPanel: {
    flex: 1,
    backgroundColor: '#DBEAFE',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    paddingHorizontal: 10,
  },
  locationIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  locationIcon: { fontSize: 22, color: '#FFFFFF' },
  locationTitle: { fontSize: 12, fontWeight: '700', color: '#1E3A5F', textAlign: 'center' },
  locationSub: { fontSize: 10, color: '#3B82F6', marginTop: 2, textAlign: 'center' },

  // Contacts
  contactsPanel: {
    flex: 1.3,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  contactsHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  contactsHeaderIcon: { fontSize: 14, marginRight: 5 },
  contactsHeaderTitle: { fontSize: 12, fontWeight: '700', color: '#1F2937' },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  contactInfo: { flex: 1 },
  contactName: { fontSize: 11, fontWeight: '700', color: '#111827' },
  contactRole: { fontSize: 10, color: '#6B7280' },
  contactPhone: { fontSize: 10, color: '#374151' },
  callBtn: {
    backgroundColor: '#16A34A',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginLeft: 6,
  },
  callBtnText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },

  // ── SOS ──
  sosSection: { alignItems: 'center', paddingVertical: 8 },
  sosBtn: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  sosBtnIcon: { fontSize: 28 },
  sosBtnText: { color: '#FFFFFF', fontWeight: '900', fontSize: 18, letterSpacing: 2, marginTop: 2 },
  sosSubText: { marginTop: 8, fontSize: 12, color: '#6B7280', textAlign: 'center' },

  // ── Sections ──
  section: { 
    marginVertical: 4, 
  },
  sectionTitle: { 
    fontSize: 14, 
    fontWeight: '700', 
    color: '#111827',
    marginBottom: 8,
  },
  grid2: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between',
    rowGap: 10,
  },

  // Emergency service buttons
  serviceBtn: {
    width: '48%', // Guarantees exactly 2 items per row with space in-between
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  serviceBtnIcon: { fontSize: 26, marginBottom: 6 },
  serviceBtnLabel: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },

  // Utility buttons
  utilityBtn: {
    width: '48%', // Guarantees exactly 2 items per row with space in-between
    borderRadius: 12,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  utilityBtnIcon: { fontSize: 24, marginBottom: 6 },
  utilityBtnLabel: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },

  // ── Bottom Nav ──
  navBar: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  navTab: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTabActive: { opacity: 0.85 },
  navTabIcon: { fontSize: 18, marginBottom: 2 },
  navTabLabel: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
});