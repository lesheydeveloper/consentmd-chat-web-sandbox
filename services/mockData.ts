
import { User, UserRole, Chat, GroupType, PatientProfile, CallLog } from '../types';

export const CURRENT_USER: User = {
  id: 'u1',
  name: 'Sarah Jenkins',
  avatar: 'https://picsum.photos/seed/sarah/200/200',
  role: UserRole.NURSE,
  title: 'Lead RN',
  phoneNumber: '+1 (555) 123-4567'
};

export const USERS: User[] = [
  CURRENT_USER,
  { id: 'u2', name: 'Dr. Emily Chen', avatar: 'https://picsum.photos/seed/emily/200/200', role: UserRole.DOCTOR, title: 'Primary Physician', phoneNumber: '+1 (555) 987-6543' },
  { id: 'u3', name: 'Mark Johnson', avatar: 'https://picsum.photos/seed/mark/200/200', role: UserRole.FAMILY, title: 'Son of Patient', phoneNumber: '+1 (555) 012-3456' },
  { id: 'u4', name: 'Admin Support', avatar: 'https://picsum.photos/seed/admin/200/200', role: UserRole.ADMIN, title: 'Hospital Admin', phoneNumber: '+1 (800) 555-0000' },
  { id: 'u5', name: 'Alice Williams', avatar: 'https://picsum.photos/seed/alice/200/200', role: UserRole.PATIENT, phoneNumber: '+1 (555) 246-8101' },
  { id: 'u6', name: 'Unknown (555-0192)', avatar: 'https://ui-avatars.com/api/?name=%23&background=random', role: UserRole.PATIENT, phoneNumber: '+1 (555) 019-2837' },
  { id: 'u7', name: 'David Kim', avatar: 'https://picsum.photos/seed/david/200/200', role: UserRole.DOCTOR, title: 'Pharmacist', phoneNumber: '+1 (555) 369-1478' },
  { id: 'u8', name: 'Rachel Green', avatar: 'https://picsum.photos/seed/rachel/200/200', role: UserRole.NURSE, title: 'Physical Therapist', phoneNumber: '+1 (555) 741-8529' }
];

export const MOCK_CHATS: Chat[] = [
  {
    id: 'c1',
    name: 'Alice Williams - Care Team',
    type: GroupType.CARE_TEAM,
    participants: [USERS[0], USERS[1], USERS[3], USERS[4]],
    messages: [
      { id: 'm1', senderId: 'u2', content: 'Please monitor Alice\'s BP closely today.', timestamp: new Date(Date.now() - 3600000 * 2), type: 'text', isRead: true },
      { id: 'm2', senderId: 'u1', content: 'Noted Dr. Chen. Checking shortly.', timestamp: new Date(Date.now() - 3600000 * 1.5), type: 'text', isRead: true },
      {
        id: 'm_call1', senderId: 'u1', content: 'Call ended', timestamp: new Date(Date.now() - 3600000), type: 'call_log', isRead: true,
        metadata: { callId: 'cl1', duration: '12:04', callType: 'video', transcriptionSummary: "Discussed Mrs. Williams' medication adjustment. Increased Lisinopril to 20mg. Advised monitoring BP every 4 hours." }
      },
      {
        id: 'm_img1', senderId: 'u1', content: 'Current wound status looks stable.', timestamp: new Date(Date.now() - 2500000), type: 'image', isRead: true,
        metadata: { fileUrl: 'https://picsum.photos/seed/wound/800/600', fileName: 'wound_status.jpg' }
      },
      {
        id: 'm_audio1', senderId: 'u2', content: '', timestamp: new Date(Date.now() - 2000000), type: 'voice', isRead: true,
        metadata: { duration: '0:24', transcription: '' }
      }
    ],
    avatar: 'https://picsum.photos/seed/careteam/200/200',
    lastMessage: '🎤 Voice Message (0:24)',
    lastMessageTime: new Date(Date.now() - 2000000),
    pinned: true,
    adminId: 'u1'
  },
  {
    id: 'c2', name: 'Johnson Family Updates', type: GroupType.FAMILY_UPDATE, participants: [USERS[0], USERS[2]],
    messages: [
      { id: 'm3', senderId: 'u2', content: 'Your mother had a good night sleep.', timestamp: new Date(Date.now() - 86400000), type: 'text', isRead: true },
      { id: 'm_img2', senderId: 'u3', content: 'She looks happy today!', timestamp: new Date(Date.now() - 85000000), type: 'image', isRead: true, metadata: { fileUrl: 'https://picsum.photos/seed/happy/800/800' } }
    ],
    avatar: 'https://picsum.photos/seed/family/200/200', lastMessage: '📷 Image', lastMessageTime: new Date(Date.now() - 85000000), adminId: 'u1'
  },
  {
    id: 'c3', name: 'Staff Broadcast', type: GroupType.BROADCAST, participants: [USERS[0], USERS[3]],
    messages: [
      { id: 'm4', senderId: 'u4', content: '📢 New policy regarding PPE is now in effect. Please review the attached PDF.', timestamp: new Date(Date.now() - 120000), type: 'text', isRead: false },
      { id: 'm_pdf1', senderId: 'u4', content: 'PPE_Guidelines_V2.pdf', timestamp: new Date(Date.now() - 110000), type: 'file', isRead: false, metadata: { fileName: 'PPE_Guidelines_V2.pdf', fileSize: '2.4 MB', mimeType: 'application/pdf', fileUrl: '#' } }
    ],
    avatar: 'https://picsum.photos/seed/broadcast/200/200', lastMessage: '📄 PPE_Guidelines_V2.pdf', lastMessageTime: new Date(Date.now() - 110000), adminId: 'u4'
  },
  {
    id: 'c4', name: 'Dr. Emily Chen', type: GroupType.DIRECT, participants: [USERS[0], USERS[1]],
    messages: [
      { id: 'm_d1', senderId: 'u2', content: 'Hi Sarah, can you double check the lab results for Mr. Smith?', timestamp: new Date(Date.now() - 400000000), type: 'text', isRead: true },
      { id: 'm_d2', senderId: 'u1', content: 'Sure, pulling them up now. Give me a sec.', timestamp: new Date(Date.now() - 390000000), type: 'text', isRead: true },
      { id: 'm_d3', senderId: 'u1', content: 'Potassium levels look stable at 4.2.', timestamp: new Date(Date.now() - 380000000), type: 'text', isRead: true },
      { id: 'm_d4', senderId: 'u2', content: 'Perfect, thank you.', timestamp: new Date(Date.now() - 370000000), type: 'text', isRead: true }
    ],
    avatar: USERS[1].avatar, lastMessage: 'Perfect, thank you.', lastMessageTime: new Date(Date.now() - 370000000)
  },
  {
    id: 'c7', name: 'Mark Johnson', type: GroupType.DIRECT, participants: [USERS[0], USERS[2]],
    messages: [
       { id: 'm_fam1', senderId: 'u3', content: 'Hi Sarah, did my mom eat her lunch today?', timestamp: new Date(Date.now() - 18000000), type: 'text', isRead: true },
       { id: 'm_fam2', senderId: 'u1', content: 'Yes, she had the soup and half a sandwich. Appetite is improving.', timestamp: new Date(Date.now() - 17500000), type: 'text', isRead: true },
       { id: 'm_fam3', senderId: 'u3', content: 'That is such a relief to hear. Thank you for taking care of her.', timestamp: new Date(Date.now() - 17000000), type: 'text', isRead: true }
    ],
    avatar: USERS[2].avatar, lastMessage: 'That is such a relief to hear. Thank you...', lastMessageTime: new Date(Date.now() - 17000000)
  }
];

export const MOCK_CALLS: CallLog[] = [
    { 
        id: 'cl1', userId: 'u2', direction: 'outgoing', status: 'answered', type: 'voice', 
        timestamp: new Date('2026-02-10T10:00:00'), duration: '0:03', dataUsage: '1.2 MB',
        summary: '"Error: API Key missing. Cannot generate trans..."',
        transcription: 'Error: API Key missing. Cannot generate transcript.'
    },
    { 
        id: 'cl2', userId: 'u3', direction: 'outgoing', status: 'answered', type: 'voice', 
        timestamp: new Date('2026-02-09T14:30:00'), duration: '0:15', dataUsage: '12.8 MB',
        summary: '"Error: API Key missing. Cannot generate trans..."',
        transcription: 'Error: API Key missing. Cannot generate transcript.'
    },
    { 
        id: 'cl3', userId: 'u3', direction: 'outgoing', status: 'answered', type: 'video', 
        timestamp: new Date('2026-02-09T12:00:00'), duration: '0:01', dataUsage: '0.8 MB',
        summary: '"Error: API Key missing. Cannot generate trans..."',
        transcription: 'Error: API Key missing. Cannot generate transcript.'
    },
    { 
        id: 'cl4', userId: 'u2', direction: 'incoming', status: 'answered', type: 'video', 
        timestamp: new Date('2026-02-09T08:00:00'), duration: '12:04', dataUsage: '45.2 MB',
        summary: '"Discussed Mrs. Williams\' medication adjustm..."',
        transcription: 'Discussed Mrs. Williams\' medication adjustment. Increased Lisinopril to 20mg. Advised monitoring BP every 4 hours. Patient seems receptive to changes.'
    },
    { 
        id: 'cl5', userId: 'u3', direction: 'outgoing', status: 'answered', type: 'voice', 
        timestamp: new Date('2026-02-08T16:00:00'), duration: '5:30', dataUsage: '4.1 MB',
        summary: '"Update to family regarding successful night sl..."',
        transcription: 'Update to family regarding successful night sleep. Son expressed concerns about dietary restrictions. Clarified that low sodium diet is mandatory.'
    }
];

export const MOCK_PATIENT: PatientProfile = {
  id: 'p1', userId: 'u5', mrn: 'MRN-001234', dob: '1954-03-12', address: '123 Maple Street, Springfield',
  diagnosis: ['Hypertension', 'Type 2 Diabetes'],
  medications: [
    { id: 'med1', name: 'Lisinopril', dosage: '10mg', frequency: 'Daily' },
    { id: 'med2', name: 'Metformin', dosage: '500mg', frequency: 'Twice Daily' }
  ],
  allergies: ['Penicillin', 'Peanuts'],
  vitalsHistory: []
};
