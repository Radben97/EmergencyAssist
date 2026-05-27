import { Contact } from "../types/contacts";

export const EMERGENCY_CONTACTS: Contact[] = [
  { id: '1', name: 'Arun mama', role: 'Primary', phone: '+91 93425 57214' },
  { id: '2', name: 'Balaji', role: 'Secondary', phone: '+91 73050 86446' },
  { id: '3', name: 'Emergency 911', role: 'Emergency', phone: '911' },
];

export const EMERGENCY_SERVICES = [
  { id: 'ambulance', label: 'Ambulance', icon: '🚑', color: '#D32F2F', number: '108' },
  { id: 'police', label: 'Police', icon: '🛡️', color: '#1565C0', number: '100' },
  { id: 'firefighter', label: 'Firefighter', icon: '🚒', color: '#E65100', number: '101' },
];

export const UTILITY_SERVICES = [
  {
    id: 'towing',
    label: 'Towing',
    icon: '🔧',
    color: '#7B1FA2',
    keyword: 'towing',
  },

  {
    id: 'puncture',
    label: 'Puncture',
    icon: '⊙',
    color: '#3949AB',
    keyword: 'tyre puncture shop',
  },
];