
export enum UserRole {
  ADMIN = 'Admin',
  DOCTOR = 'Doctor',
  NURSE = 'Nurse',
  PATIENT = 'Patient',
  FAMILY = 'Family'
}

export enum GroupType {
  DIRECT = 'Direct',
  CARE_TEAM = 'Care Team',
  FAMILY_UPDATE = 'Family Update',
  INTERNAL_STAFF = 'Internal Staff',
  BROADCAST = 'Broadcast',
  SMS = 'SMS'
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  role: UserRole;
  title?: string;
  phoneNumber?: string;
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'voice' | 'file' | 'system' | 'call_log';
  isRead: boolean;
  metadata?: {
    fileUrl?: string;
    fileName?: string;
    fileSize?: string;
    mimeType?: string;
    duration?: string;
    isTranscribing?: boolean;
    transcription?: string;
    callId?: string;
    transcriptionSummary?: string;
    callType?: 'voice' | 'video';
    soapNote?: any; // ClinicalNote type
    isCallNote?: boolean;
    noteType?: 'call_scribe';
  };
}

export interface Chat {
  id: string;
  name: string;
  type: GroupType;
  participants: User[];
  messages: Message[];
  lastMessage?: string;
  lastMessageTime?: Date;
  avatar?: string;
  pinned?: boolean;
  phoneNumber?: string;
  patientId?: string;
}

export interface CallLog {
  id: string;
  userId: string;
  direction: 'incoming' | 'outgoing' | 'missed';
  status: 'answered' | 'missed' | 'declined';
  type: 'voice' | 'video';
  timestamp: Date;
  duration?: string;
  dataUsage?: string;
  transcription?: string;
  summary?: string;
  metadata?: {
    soapNote?: any; // ClinicalNote type
    transcription?: string;
    transcriptionSummary?: string;
  };
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
}

export interface Vitals {
  date: string;
  systolic: number;
  diastolic: number;
  heartRate: number;
}

export interface PatientProfile {
  id: string;
  userId: string;
  mrn: string;  // Medical Record Number - unique identifier
  dob: string;
  address: string;
  diagnosis: string[];
  medications: Medication[];
  allergies: string[];
  vitalsHistory: Vitals[];
}

// TEMPLATE TYPES
// Consultation/Visit Types
export type ConsultationType =
  | 'initial_consultation'
  | 'follow_up'
  | 'emergency'
  | 'routine_checkup'
  | 'annual_physical'
  | 'urgent_care'
  | 'telemedicine'
  | 'post_op_followup'
  | 'pre_op_evaluation'
  | 'medication_review'
  | 'lab_results_review';

export interface ConsultationTypeInfo {
  id: ConsultationType;
  name: string;
  description: string;
  icon?: string;
  aiContextModifier?: string;
}

export type NoteTemplateType =
  | 'soap'
  | 'apso'
  | 'comprehensive'
  | 'psychiatry'
  | 'cardiology'
  | 'emergency'
  | 'oncology'
  | 'wellchild'
  | 'diet'
  | 'psychology'
  | 'lactation';

export interface TemplateSection {
  id: string;
  label: string;
  fullName: string;
  placeholder?: string;
  required?: boolean;
}

export interface NoteTemplate {
  id: NoteTemplateType;
  name: string;
  description: string;
  sections: TemplateSection[];
  specialty?: string;
  icon?: string;
  aiPromptModifier?: string;
}

export interface UserPreferences {
  defaultTemplate: NoteTemplateType;
  favoriteTemplates: NoteTemplateType[];
  autoScribe: boolean;
}

// CLINICAL NOTE TYPES
export type SoapSection = 'subjective' | 'objective' | 'assessment' | 'plan';

export interface ClinicalNote {
  id: string;
  chatId: string;
  patientId?: string;
  consultationType?: ConsultationType;
  visitReason?: string;
  templateType: NoteTemplateType;
  sections: Record<string, string>;
  suggestions: {
    id: string;
    section: string;
    text: string;
    type: 'medication' | 'symptom' | 'action' | 'finding';
  }[];
  createdAt: Date;
  updatedAt: Date;
  callId?: string;
}
