'use client';

import React, { useState, useEffect, createContext, useContext } from 'react';
import { User, Chat, Message, GroupType, UserRole, PatientProfile, CallLog, ClinicalNote, SoapSection, NoteTemplateType, UserPreferences, ConsultationType } from '../../types';
import { CURRENT_USER, MOCK_CHATS, USERS } from '../../services/mockData';
import { generateCallSummary, generateTemplatedNote } from '../../services/geminiService';
import { NOTE_TEMPLATES } from '../../templates/noteTemplates';

// --- CONTEXT ---
interface CallSession {
  user: User;
  type: 'voice' | 'video';
  startTime?: Date;
}

interface AppContextType {
  currentUser: User;
  chats: Chat[];
  activeChat: Chat | null;
  setActiveChat: (chat: Chat | null) => void;
  sendMessage: (chatId: string, content: string, type?: Message['type'], metadata?: any) => void;
  startChat: (phoneNumber: string, isSMS: boolean) => string;
  updateMessageMetadata: (chatId: string, messageId: string, metadata: any) => void;
  togglePinChat: (chatId: string) => void;

  // Scribe & Notes State
  isNotesPanelOpen: boolean;
  toggleNotesPanel: () => void;
  isScribeActive: boolean;
  toggleScribe: () => void;
  clinicalNotes: Record<string, ClinicalNote>;
  updateClinicalNote: (chatId: string, section: string, text: string) => void;
  acceptSuggestion: (chatId: string, suggestionId: string, editedText?: string) => void;
  dismissSuggestion: (chatId: string, suggestionId: string) => void;
  generateFullSOAP: (chatId: string) => Promise<void>;

  // UI & Call State
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  isChatInfoOpen: boolean;
  toggleChatInfo: () => void;
  previewMedia: Message | null;
  setPreviewMedia: (msg: Message | null) => void;

  incomingCall: CallSession | null;
  callPreview: { user: User; type: 'voice' | 'video' } | null;
  activeCallSession: CallSession | null;
  callTranscription: string;
  setCallTranscription: (text: string) => void;
  simulateIncomingCall: () => void;
  acceptCall: () => void;
  declineCall: () => void;
  startCall: (user: User, type: 'voice' | 'video') => void;
  acceptCallPreview: () => void;
  declineCallPreview: () => void;
  endCall: () => void;

  // Settings & Template Preferences
  userPreferences: UserPreferences;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
  isSettingsOpen: boolean;
  toggleSettings: () => void;
  isTemplatePickerOpen: boolean;
  openTemplatePicker: (noteId: string, currentTemplate: NoteTemplateType, onSelect: (template: NoteTemplateType) => void) => void;
  closeTemplatePicker: () => void;
  templatePickerContext: any;

  // Contact Picker
  isContactPickerOpen: boolean;
  toggleContactPicker: () => void;

  // Group Chat Management
  isCreateGroupOpen: boolean;
  toggleCreateGroup: () => void;
  isAddMembersOpen: boolean;
  addMembersChatId: string | null;
  openAddMembers: (chatId: string) => void;
  closeAddMembers: () => void;
  createGroupChat: (name: string, type: GroupType, participantIds: string[]) => string;
  addGroupMembers: (chatId: string, userIds: string[]) => void;
  removeGroupMember: (chatId: string, userId: string) => void;
  isGroupAdmin: (chat: Chat) => boolean;

  // Clinical Note Access Control
  canAccessNotes: (chat: Chat | null) => 'full' | 'readonly' | 'none';
  togglePatientNotesVisibility: (chatId: string) => void;

  // Typing Indicators & Presence
  typingUsers: Record<string, string[]>;
  simulateTyping: (chatId: string, userName: string, durationMs?: number) => void;
  onlineUsers: Set<string>;

  // Message Deletion
  deleteMessage: (chatId: string, messageId: string) => void;

  // Leave Group & Mute
  leaveGroup: (chatId: string) => void;
  mutedChats: Set<string>;
  toggleMuteChat: (chatId: string) => void;

  // Offline
  isOffline: boolean;

  // Profile Editing
  updateCurrentUser: (updates: Partial<User>) => void;

  // Patient & Consultation Management
  promptForPatient: (chatId?: string) => void;
  promptForConsultationType: (chatId?: string) => void;
  isPatientSelectorOpen: boolean;
  isPatientCreationOpen: boolean;
  isConsultationPickerOpen: boolean;
  handlePatientSelected: (patientId: string) => void;
  handleCreateNewPatient: (patientData: { name: string; dob: string; phone?: string }) => void;
  handleConsultationTypeSelected: (type: ConsultationType, reason?: string) => void;

  // Patient Management
  patients: PatientProfile[];
  selectedPatientId: string | null;
  setSelectedPatientId: (patientId: string | null) => void;
  addPatient: (patientData: { name: string; dob: string; address?: string; phone?: string }) => PatientProfile;
}

const AppContext = createContext<AppContextType | undefined>(undefined);
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(CURRENT_USER as User);
  const [chats, setChats] = useState<Chat[]>(MOCK_CHATS);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [patients, setPatients] = useState<PatientProfile[]>([
    {
      id: 'p1',
      userId: 'u4',
      mrn: 'MRN-001234',
      dob: '1985-03-15',
      address: '123 Main St, Springfield, IL',
      diagnosis: ['Hypertension', 'Type 2 Diabetes'],
      medications: [
        { id: 'm1', name: 'Lisinopril', dosage: '10mg', frequency: 'Daily' },
        { id: 'm2', name: 'Metformin', dosage: '1000mg', frequency: 'Twice Daily' }
      ],
      allergies: ['Penicillin'],
      vitalsHistory: []
    }
  ]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>('p1');

  // Patient management functions
  const generateMRN = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `MRN-${timestamp}${random}`;
  };

  const addPatient = (patientData: { name: string; dob: string; address?: string; phone?: string }) => {
    const newPatientId = `p${Date.now()}`;
    const newPatient: PatientProfile = {
      id: newPatientId,
      userId: newPatientId,
      mrn: generateMRN(),
      dob: patientData.dob,
      address: patientData.address || '',
      diagnosis: [],
      medications: [],
      allergies: [],
      vitalsHistory: []
    };
    setPatients(prev => [...prev, newPatient]);
    setSelectedPatientId(newPatientId);
    return newPatient;
  };

  const [isNotesPanelOpen, setIsNotesPanelOpen] = useState(false);
  const [isScribeActive, setIsScribeActive] = useState(false);
  const [clinicalNotes, setClinicalNotes] = useState<Record<string, ClinicalNote>>({});
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isChatInfoOpen, setIsChatInfoOpen] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<Message | null>(null);
  
  const [incomingCall, setIncomingCall] = useState<CallSession | null>(null);
  const [callPreview, setCallPreview] = useState<{ user: User; type: 'voice' | 'video' } | null>(null);
  const [activeCallSession, setActiveCallSession] = useState<CallSession | null>(null);
  const [callTranscription, setCallTranscription] = useState('');

  // Typing Indicators & Presence State
  const [typingUsers, setTypingUsers] = useState<Record<string, string[]>>({});
  const MOCK_ONLINE_USERS = new Set(['u2', 'u7', 'u8']); // Dr. Chen, David Kim, Rachel Green
  const [onlineUsers] = useState<Set<string>>(MOCK_ONLINE_USERS);

  // User preferences & settings
  const [userPreferences, setUserPreferences] = useState<UserPreferences>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('consentmd_preferences');
      return saved
        ? JSON.parse(saved)
        : { defaultTemplate: 'soap', favoriteTemplates: [], autoScribe: true };
    }
    return { defaultTemplate: 'soap', favoriteTemplates: [], autoScribe: true };
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const toggleSettings = () => setIsSettingsOpen(!isSettingsOpen);

  const [isTemplatePickerOpen, setIsTemplatePickerOpen] = useState(false);
  const [templatePickerContext, setTemplatePickerContext] = useState<{
    noteId: string;
    currentTemplate: NoteTemplateType;
    onSelect: (template: NoteTemplateType) => void;
  } | null>(null);

  const openTemplatePicker = (noteId: string, currentTemplate: NoteTemplateType, onSelect: (template: NoteTemplateType) => void) => {
    setTemplatePickerContext({ noteId, currentTemplate, onSelect });
    setIsTemplatePickerOpen(true);
  };

  const closeTemplatePicker = () => {
    setIsTemplatePickerOpen(false);
    setTemplatePickerContext(null);
  };

  // Contact Picker State
  const [isContactPickerOpen, setIsContactPickerOpen] = useState(false);
  const toggleContactPicker = () => setIsContactPickerOpen(prev => !prev);

  // Group Chat Management State
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const toggleCreateGroup = () => setIsCreateGroupOpen(prev => !prev);

  const [isAddMembersOpen, setIsAddMembersOpen] = useState(false);
  const [addMembersChatId, setAddMembersChatId] = useState<string | null>(null);
  const openAddMembers = (chatId: string) => {
    setAddMembersChatId(chatId);
    setIsAddMembersOpen(true);
  };
  const closeAddMembers = () => {
    setIsAddMembersOpen(false);
    setAddMembersChatId(null);
  };

  // Patient & Consultation State
  const [isPatientSelectorOpen, setIsPatientSelectorOpen] = useState(false);
  const [isPatientCreationOpen, setIsPatientCreationOpen] = useState(false);
  const [isConsultationPickerOpen, setIsConsultationPickerOpen] = useState(false);
  const [pendingNoteContext, setPendingNoteContext] = useState<{
    chatId?: string;
    patientId?: string;
    consultationType?: ConsultationType;
    visitReason?: string;
  } | null>(null);

  const promptForPatient = (chatId?: string) => {
    setPendingNoteContext({ chatId });
    setIsPatientSelectorOpen(true);
  };

  const handlePatientSelected = (patientId: string) => {
    setPendingNoteContext(prev => ({ ...prev, patientId }));
    setIsPatientSelectorOpen(false);

    if (pendingNoteContext?.chatId) {
      setClinicalNotes(prev => ({
        ...prev,
        [pendingNoteContext.chatId!]: {
          ...prev[pendingNoteContext.chatId!],
          patientId,
          updatedAt: new Date()
        }
      }));
    }
  };

  const handleCreateNewPatient = (patientData: { name: string; dob: string; phone?: string }) => {
    setIsPatientCreationOpen(false);
    handlePatientSelected(`p${Date.now()}`);
  };

  const promptForConsultationType = (chatId?: string) => {
    setPendingNoteContext(prev => ({ ...prev, chatId }));
    setIsConsultationPickerOpen(true);
  };

  const handleConsultationTypeSelected = (type: ConsultationType, reason?: string) => {
    setPendingNoteContext(prev => ({
      ...prev,
      consultationType: type,
      visitReason: reason
    }));
    setIsConsultationPickerOpen(false);

    if (pendingNoteContext?.chatId) {
      setClinicalNotes(prev => ({
        ...prev,
        [pendingNoteContext.chatId!]: {
          ...prev[pendingNoteContext.chatId!],
          consultationType: type,
          visitReason: reason,
          updatedAt: new Date()
        }
      }));
    }
  };

  const updatePreferences = (prefs: Partial<UserPreferences>) => {
    setUserPreferences((prev: UserPreferences) => {
      const updated = { ...prev, ...prefs };
      if (typeof window !== 'undefined') {
        localStorage.setItem('consentmd_preferences', JSON.stringify(updated));
      }
      return updated;
    });
  };

  const sendMessage = (chatId: string, content: string, type: Message['type'] = 'text', metadata?: any) => {
    setChats(prevChats => prevChats.map(chat => {
      if (chat.id === chatId) {
        const newMessage: Message = {
          id: `m_${Date.now()}`,
          senderId: currentUser.id,
          content,
          timestamp: new Date(),
          type,
          isRead: false,
          metadata
        };
        return {
          ...chat,
          messages: [...chat.messages, newMessage],
          lastMessage: type === 'text' ? content : `Sent a ${type}`,
          lastMessageTime: newMessage.timestamp
        };
      }
      return chat;
    }));
  };

  const startChat = (phoneNumber: string, isSMS: boolean) => {
    const newChatId = `c_${Date.now()}`;
    const newChat: Chat = {
      id: newChatId,
      name: phoneNumber,
      type: isSMS ? GroupType.SMS : GroupType.DIRECT,
      participants: [
        currentUser,
        { id: `u_${Date.now()}`, name: phoneNumber, phoneNumber, role: UserRole.PATIENT, avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(phoneNumber)}` }
      ],
      messages: [],
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(phoneNumber)}`
    };
    setChats(prev => [newChat, ...prev]);
    return newChatId;
  };

  const updateMessageMetadata = (chatId: string, messageId: string, metadata: any) => {
    setChats(chats => chats.map(c => {
      if (c.id === chatId) {
        return {
          ...c,
          messages: c.messages.map(m =>
            m.id === messageId ? { ...m, metadata: { ...m.metadata, ...metadata } } : m
          )
        };
      }
      return c;
    }));
  };

  const togglePinChat = (chatId: string) => {
    setChats(chats => chats.map(c =>
      c.id === chatId ? { ...c, pinned: !c.pinned } : c
    ));
  };

  const toggleNotesPanel = () => setIsNotesPanelOpen(prev => !prev);
  const toggleScribe = () => setIsScribeActive(prev => !prev);
  const toggleChatInfo = () => setIsChatInfoOpen(prev => !prev);

  const updateClinicalNote = (chatId: string, section: string, text: string) => {
    setClinicalNotes(prev => {
      const existingNote = prev[chatId];
      if (!existingNote) {
        // Create new note with flexible sections structure
        return {
          ...prev,
          [chatId]: {
            id: chatId,
            chatId,
            templateType: 'soap' as NoteTemplateType,
            sections: {
              [section]: text
            },
            suggestions: [],
            createdAt: new Date(),
            updatedAt: new Date()
          }
        };
      }

      // For backward compatibility, support both old and new formats
      return {
        ...prev,
        [chatId]: {
          ...existingNote,
          // Support new sections format
          sections: {
            ...(existingNote.sections || {}),
            [section]: text
          },
          // Also update old fields for backward compatibility
          [section]: text,
          updatedAt: new Date()
        }
      };
    });
  };

  const acceptSuggestion = (chatId: string, suggestionId: string, editedText?: string) => {
    setClinicalNotes(prev => {
      const note = prev[chatId];
      if (!note) return prev;
      const suggestion = note.suggestions.find(s => s.id === suggestionId);
      if (!suggestion) return prev;
      
      const textToAdd = editedText !== undefined ? editedText : suggestion.text;
      const currentSectionText = (note.sections as any)[suggestion.section] || '';
      const newSectionText = currentSectionText ? `${currentSectionText}\n${textToAdd}` : textToAdd;

      return {
        ...prev,
        [chatId]: {
          ...note,
          sections: {
            ...(note.sections || {}),
            [suggestion.section]: newSectionText
          },
          suggestions: note.suggestions.filter(s => s.id !== suggestionId),
          updatedAt: new Date()
        }
      };
    });
  };

  const dismissSuggestion = (chatId: string, suggestionId: string) => {
    setClinicalNotes(prev => {
      const note = prev[chatId];
      if (!note) return prev;
      return {
        ...prev,
        [chatId]: {
          ...note,
          suggestions: note.suggestions.filter(s => s.id !== suggestionId),
          updatedAt: new Date()
        }
      };
    });
  };

  // Group Chat Management Functions
  const isGroupAdmin = (chat: Chat): boolean =>
    chat.adminId === currentUser.id || currentUser.role === UserRole.ADMIN;

  const createGroupChat = (name: string, type: GroupType, participantIds: string[]): string => {
    const newChatId = `cg_${Date.now()}`;
    const newChat: Chat = {
      id: newChatId,
      name: name.trim(),
      type,
      participants: [currentUser, ...USERS.filter(u => participantIds.includes(u.id))],
      messages: [],
      adminId: currentUser.id,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
    };
    setChats(prev => [newChat, ...prev]);
    return newChatId;
  };

  const addGroupMembers = (chatId: string, userIds: string[]): void => {
    const newUsers = USERS.filter(u => userIds.includes(u.id));
    const updater = (chat: Chat) => {
      const existingIds = new Set(chat.participants.map(p => p.id));
      return {
        ...chat,
        participants: [...chat.participants, ...newUsers.filter(u => !existingIds.has(u.id))]
      };
    };
    setChats(prev => prev.map(c => c.id === chatId ? updater(c) : c));
    setActiveChat(prev => prev?.id === chatId ? updater(prev) : prev);
  };

  const removeGroupMember = (chatId: string, userId: string): void => {
    const updater = (chat: Chat) => {
      if (chat.adminId === userId) return chat; // cannot remove creator
      return { ...chat, participants: chat.participants.filter(p => p.id !== userId) };
    };
    setChats(prev => prev.map(c => c.id === chatId ? updater(c) : c));
    setActiveChat(prev => prev?.id === chatId ? updater(prev) : prev);
  };

  // Clinical Note Access Control
  const canAccessNotes = (chat: Chat | null): 'full' | 'readonly' | 'none' => {
    if (!chat) return 'none';
    if (currentUser.role === UserRole.DOCTOR || currentUser.role === UserRole.NURSE) return 'full';
    if (currentUser.role === UserRole.PATIENT && chat.patientNotesVisible) return 'readonly';
    return 'none';
  };

  const togglePatientNotesVisibility = (chatId: string) => {
    const updater = (chat: Chat) => ({ ...chat, patientNotesVisible: !chat.patientNotesVisible });
    setChats(prev => prev.map(c => c.id === chatId ? updater(c) : c));
    setActiveChat(prev => prev?.id === chatId ? updater(prev) : prev);
  };

  // Typing Indicators & Presence
  const simulateTyping = (chatId: string, userName: string, durationMs = 2000) => {
    setTypingUsers(prev => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []).filter(n => n !== userName), userName]
    }));
    setTimeout(() => {
      setTypingUsers(prev => ({
        ...prev,
        [chatId]: (prev[chatId] || []).filter(n => n !== userName)
      }));
    }, durationMs);
  };

  // Message Deletion (Soft Delete)
  const deleteMessage = (chatId: string, messageId: string) => {
    const marker = (msg: Message) =>
      msg.id === messageId ? { ...msg, content: '', deletedAt: new Date() } : msg;
    setChats(prev => prev.map(c => c.id === chatId
      ? { ...c, messages: c.messages.map(marker) }
      : c
    ));
    setActiveChat(prev => prev?.id === chatId
      ? { ...prev, messages: prev.messages.map(marker) }
      : prev
    );
  };

  // Leave Group
  const leaveGroup = (chatId: string) => {
    const chat = chats.find(c => c.id === chatId);
    if (!chat) return;
    const systemMsg: Message = {
      id: `sys_${Date.now()}`, senderId: 'system',
      content: `${currentUser.name} left the group`,
      timestamp: new Date(), type: 'text', isRead: true
    };
    setChats(prev => prev.map(c => c.id === chatId
      ? { ...c, participants: c.participants.filter(p => p.id !== currentUser.id), messages: [...c.messages, systemMsg] }
      : c
    ));
    setActiveChat(null);
  };

  // Mute Chat
  const [mutedChats, setMutedChats] = useState(new Set([] as string[]));
  const toggleMuteChat = (chatId: string) => {
    setMutedChats(prev => {
      const next = new Set(prev);
      if (next.has(chatId)) { next.delete(chatId); } else { next.add(chatId); }
      return next;
    });
  };

  // Offline Detection
  const [isOffline, setIsOffline] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOffline(!navigator.onLine);
      const goOnline = () => setIsOffline(false);
      const goOffline = () => setIsOffline(true);
      window.addEventListener('online', goOnline);
      window.addEventListener('offline', goOffline);
      return () => { window.removeEventListener('online', goOnline); window.removeEventListener('offline', goOffline); };
    }
  }, []);

  // Profile Editing
  const updateCurrentUser = (updates: any) => {
    setCurrentUser((prev: any) => ({ ...prev, ...updates }));
  };

  const generateFullSOAP = async (chatId: string) => {
    const chat = chats.find(c => c.id === chatId);
    if (!chat) return;

    try {
      // Get the user's default template
      const templateType = userPreferences.defaultTemplate;
      const template = NOTE_TEMPLATES[templateType];

      // Get existing note data to preserve patient and consultation info
      const existingNote = clinicalNotes[chatId];

      // Use the new templated note generation with consultation context
      const result = await generateTemplatedNote(
        chat.messages,
        template,
        existingNote?.consultationType,
        existingNote?.visitReason
      );

      if (result) {
        setClinicalNotes(prev => ({
          ...prev,
          [chatId]: {
            id: chatId,
            chatId,
            patientId: existingNote?.patientId,
            consultationType: existingNote?.consultationType,
            visitReason: existingNote?.visitReason,
            templateType,
            sections: {
              ...(prev[chatId]?.sections || {}),
              ...result  // Merge AI-generated sections
            },
            suggestions: prev[chatId]?.suggestions || [],
            createdAt: prev[chatId]?.createdAt || new Date(),
            updatedAt: new Date()
          }
        }));
      }
    } catch (e) {
      console.error('Generate Full Note Error:', e);
    }
  };

  const simulateIncomingCall = () => {
    setIncomingCall({ user: USERS[1], type: 'video' });
  };
  const acceptCall = () => {
    if (incomingCall) {
      setActiveCallSession({ ...incomingCall, startTime: new Date() });
      setIncomingCall(null);
    }
  };
  const declineCall = () => setIncomingCall(null);

  const startCall = (user: User, type: 'voice' | 'video') => {
    // Show call preview instead of immediately starting
    setCallPreview({ user, type });
  };

  const acceptCallPreview = () => {
    if (callPreview) {
      setActiveCallSession({ user: callPreview.user, type: callPreview.type, startTime: new Date() });
      setCallPreview(null);
    }
  };

  const declineCallPreview = () => {
    setCallPreview(null);
  };
  const endCall = async () => {
    if (activeCallSession && activeChat) {
      // Calculate call duration
      const startTime = activeCallSession.startTime || new Date();
      const endTime = new Date();
      const durationSeconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
      const minutes = Math.floor(durationSeconds / 60);
      const seconds = durationSeconds % 60;
      const durationStr = `${minutes}m ${seconds}s`;

      // Get the full transcription from the call
      const fullTranscription = callTranscription;

      // Generate call summary using AI
      let summary = "Call ended.";
      let fullSOAPNote: ClinicalNote | null = null;

      try {
        summary = await generateCallSummary(durationSeconds);

        // If there's transcription, generate full note in user's selected template format
        if (fullTranscription.trim()) {
          try {
            // Use user's default template
            const templateType = userPreferences.defaultTemplate;
            const template = NOTE_TEMPLATES[templateType];

            const noteResult = await generateTemplatedNote(
              [
                {
                  id: `call_msg_${Date.now()}`,
                  senderId: currentUser.id,
                  content: fullTranscription,
                  timestamp: new Date(),
                  type: 'text',
                  isRead: true
                } as Message
              ],
              template
            );

            if (noteResult) {
              fullSOAPNote = {
                id: activeChat.id,
                chatId: activeChat.id,
                templateType,
                sections: noteResult,
                suggestions: [],
                createdAt: new Date(),
                updatedAt: new Date(),
                callId: `call_${Date.now()}`
              };

              // Store the note in clinical notes
              setClinicalNotes(prev => ({
                ...prev,
                [activeChat.id]: fullSOAPNote!
              }));
            }
          } catch (soapError) {
            console.error("Error generating note:", soapError);
          }
        }
      } catch (e) {
        console.error("Error generating call summary:", e);
      }

      // Create call_log message with full transcription and SOAP note
      const callId = `call_${Date.now()}`;
      sendMessage(activeChat.id, '', 'call_log', {
        callId,
        callType: activeCallSession.type,
        duration: durationStr,
        transcriptionSummary: summary,
        transcription: fullTranscription, // Store full transcription
        soapNote: fullSOAPNote // Store generated SOAP note
      });

      // Also create a dedicated message with the SOAP note details
      if (fullSOAPNote) {
        sendMessage(activeChat.id, '', 'text', {
          isCallNote: true,
          callId: callId,
          soapNote: fullSOAPNote,
          noteType: 'call_scribe'
        });
      }
    }
    setActiveCallSession(null);
    setCallTranscription(''); // Clear transcription after call ends
  };

  const value = {
    currentUser,
    chats,
    activeChat,
    setActiveChat,
    sendMessage,
    startChat,
    updateMessageMetadata,
    togglePinChat,
    isNotesPanelOpen,
    toggleNotesPanel,
    isScribeActive,
    toggleScribe,
    clinicalNotes,
    updateClinicalNote,
    acceptSuggestion,
    dismissSuggestion,
    generateFullSOAP,
    searchTerm,
    setSearchTerm,
    isChatInfoOpen,
    toggleChatInfo,
    previewMedia,
    setPreviewMedia,
    incomingCall,
    callPreview,
    activeCallSession,
    callTranscription,
    setCallTranscription,
    simulateIncomingCall,
    acceptCall,
    declineCall,
    startCall,
    acceptCallPreview,
    declineCallPreview,
    endCall,
    userPreferences,
    updatePreferences,
    isSettingsOpen,
    toggleSettings,
    isTemplatePickerOpen,
    openTemplatePicker,
    closeTemplatePicker,
    templatePickerContext,
    isContactPickerOpen,
    toggleContactPicker,
    isCreateGroupOpen,
    toggleCreateGroup,
    isAddMembersOpen,
    addMembersChatId,
    openAddMembers,
    closeAddMembers,
    createGroupChat,
    addGroupMembers,
    removeGroupMember,
    isGroupAdmin,
    canAccessNotes,
    togglePatientNotesVisibility,
    typingUsers,
    simulateTyping,
    onlineUsers,
    deleteMessage,
    leaveGroup,
    mutedChats,
    toggleMuteChat,
    isOffline,
    updateCurrentUser,
    promptForPatient,
    promptForConsultationType,
    isPatientSelectorOpen,
    isPatientCreationOpen,
    isConsultationPickerOpen,
    handlePatientSelected,
    handleCreateNewPatient,
    handleConsultationTypeSelected,
    patients,
    selectedPatientId,
    setSelectedPatientId,
    addPatient
  } as AppContextType;

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
