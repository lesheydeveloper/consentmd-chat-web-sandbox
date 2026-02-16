# ConsentMD - Backend Documentation

## Project Overview

ConsentMD is a HIPAA-compliant telemedicine and clinical communication platform designed for healthcare professionals to securely communicate with patients, manage clinical notes using AI-powered scribe functionality, and conduct secure video/voice calls.

**Technology Stack:**
- **Backend Framework:** Node.js with Express/Fastify (recommended)
- **Database:** PostgreSQL with proper HIPAA encryption
- **Authentication:** JWT + OAuth 2.0
- **AI Integration:** Google Gemini API
- **Communication:** 100ms (calls/video), Twilio (messaging)
- **Storage:** Secure cloud storage with encryption (AWS S3 or similar)
- **Cache:** Redis for session management

---

## 1. Database Schema

### 1.1 Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone_number VARCHAR(20),
  password_hash VARCHAR(255) NOT NULL,
  role ENUM ('Admin', 'Doctor', 'Nurse', 'Patient', 'Family') NOT NULL,
  title VARCHAR(100),
  avatar_url VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP,
  mfa_enabled BOOLEAN DEFAULT false,
  mfa_secret VARCHAR(255),
  CONSTRAINT users_email_unique UNIQUE(email)
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_phone ON users(phone_number);
```

### 1.2 Patients Table
```sql
CREATE TABLE patients (
  id UUID PRIMARY KEY,
  mrn VARCHAR(50) UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date_of_birth DATE NOT NULL,
  address TEXT,
  phone_number VARCHAR(20),
  emergency_contact VARCHAR(255),
  emergency_contact_phone VARCHAR(20),
  blood_type VARCHAR(5),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES users(id),
  CONSTRAINT unique_patient_mrn UNIQUE(mrn)
);

CREATE INDEX idx_patients_mrn ON patients(mrn);
CREATE INDEX idx_patients_user_id ON patients(user_id);
```

### 1.3 Patient Diagnoses Table
```sql
CREATE TABLE patient_diagnoses (
  id UUID PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  diagnosis VARCHAR(255) NOT NULL,
  diagnosed_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_diagnoses_patient_id ON patient_diagnoses(patient_id);
```

### 1.4 Patient Medications Table
```sql
CREATE TABLE patient_medications (
  id UUID PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  dosage VARCHAR(100),
  frequency VARCHAR(100),
  start_date DATE,
  end_date DATE,
  prescribing_doctor_id UUID REFERENCES users(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_medications_patient_id ON patient_medications(patient_id);
```

### 1.5 Patient Allergies Table
```sql
CREATE TABLE patient_allergies (
  id UUID PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  allergy VARCHAR(255) NOT NULL,
  severity ENUM ('mild', 'moderate', 'severe') DEFAULT 'mild',
  reaction_description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_allergies_patient_id ON patient_allergies(patient_id);
```

### 1.6 Patient Vitals Table
```sql
CREATE TABLE patient_vitals (
  id UUID PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  recorded_by UUID REFERENCES users(id),
  recorded_date TIMESTAMP NOT NULL,
  systolic_bp INTEGER,
  diastolic_bp INTEGER,
  heart_rate INTEGER,
  temperature DECIMAL(5, 2),
  respiration_rate INTEGER,
  oxygen_saturation DECIMAL(5, 2),
  weight DECIMAL(8, 2),
  height DECIMAL(8, 2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vitals_patient_id ON patient_vitals(patient_id);
CREATE INDEX idx_vitals_recorded_date ON patient_vitals(recorded_date);
```

### 1.7 Chats Table
```sql
CREATE TABLE chats (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type ENUM ('Direct', 'Care Team', 'Family Update', 'Internal Staff', 'Broadcast', 'SMS') NOT NULL,
  patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
  avatar_url VARCHAR(500),
  is_pinned BOOLEAN DEFAULT false,
  phone_number VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES users(id),
  last_message_id UUID,
  last_message_time TIMESTAMP
);

CREATE INDEX idx_chats_patient_id ON chats(patient_id);
CREATE INDEX idx_chats_created_by ON chats(created_by);
CREATE INDEX idx_chats_type ON chats(type);
```

### 1.8 Chat Participants Table
```sql
CREATE TABLE chat_participants (
  id UUID PRIMARY KEY,
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_admin BOOLEAN DEFAULT false,
  muted BOOLEAN DEFAULT false,
  archived BOOLEAN DEFAULT false,
  CONSTRAINT unique_chat_participant UNIQUE(chat_id, user_id)
);

CREATE INDEX idx_participants_chat_id ON chat_participants(chat_id);
CREATE INDEX idx_participants_user_id ON chat_participants(user_id);
```

### 1.9 Messages Table
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY,
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT,
  message_type ENUM ('text', 'image', 'voice', 'file', 'system', 'call_log') DEFAULT 'text',
  file_url VARCHAR(500),
  file_name VARCHAR(255),
  file_size BIGINT,
  mime_type VARCHAR(100),
  is_read BOOLEAN DEFAULT false,
  voice_duration VARCHAR(20),
  is_transcribing BOOLEAN DEFAULT false,
  transcription TEXT,
  transcription_summary TEXT,
  call_id UUID,
  call_type ENUM ('voice', 'video'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE INDEX idx_messages_chat_id ON messages(chat_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_messages_call_id ON messages(call_id);
```

### 1.10 Clinical Notes Table
```sql
CREATE TABLE clinical_notes (
  id UUID PRIMARY KEY,
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  created_by UUID REFERENCES users(id),
  consultation_type VARCHAR(50),
  visit_reason TEXT,
  template_type VARCHAR(50) NOT NULL,
  note_content JSONB NOT NULL,
  call_id UUID,
  is_draft BOOLEAN DEFAULT false,
  is_signed BOOLEAN DEFAULT false,
  signed_by UUID REFERENCES users(id),
  signed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notes_chat_id ON clinical_notes(chat_id);
CREATE INDEX idx_notes_patient_id ON clinical_notes(patient_id);
CREATE INDEX idx_notes_created_by ON clinical_notes(created_by);
CREATE INDEX idx_notes_created_at ON clinical_notes(created_at);
```

### 1.11 Clinical Note Suggestions Table
```sql
CREATE TABLE clinical_note_suggestions (
  id UUID PRIMARY KEY,
  note_id UUID REFERENCES clinical_notes(id) ON DELETE CASCADE,
  section VARCHAR(100),
  suggested_text TEXT,
  suggestion_type ENUM ('medication', 'symptom', 'action', 'finding'),
  is_accepted BOOLEAN DEFAULT false,
  accepted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_suggestions_note_id ON clinical_note_suggestions(note_id);
```

### 1.12 Call Logs Table
```sql
CREATE TABLE call_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  direction ENUM ('incoming', 'outgoing', 'missed') NOT NULL,
  status ENUM ('answered', 'missed', 'declined') NOT NULL,
  call_type ENUM ('voice', 'video') NOT NULL,
  duration INTEGER,
  data_usage VARCHAR(20),
  transcription TEXT,
  transcription_summary TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ended_at TIMESTAMP,
  room_id VARCHAR(255),
  recording_url VARCHAR(500),
  CONSTRAINT valid_duration CHECK (duration >= 0)
);

CREATE INDEX idx_calls_user_id ON call_logs(user_id);
CREATE INDEX idx_calls_created_at ON call_logs(created_at);
```

### 1.13 User Preferences Table
```sql
CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  default_template VARCHAR(50),
  favorite_templates TEXT[],
  auto_scribe BOOLEAN DEFAULT true,
  notifications_enabled BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT false,
  dark_mode BOOLEAN DEFAULT false,
  language VARCHAR(10) DEFAULT 'en',
  timezone VARCHAR(50),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 1.14 Audit Logs Table
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(100),
  entity_id UUID,
  changes JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
```

---

## 2. API Endpoints

### 2.1 Authentication Endpoints

#### POST `/api/v1/auth/register`
Register a new user account
```json
Request:
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "Doctor",
  "phoneNumber": "+1234567890",
  "title": "MD"
}

Response (201):
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "Doctor"
  },
  "token": "jwt_token"
}
```

#### POST `/api/v1/auth/login`
Login user
```json
Request:
{
  "email": "john@example.com",
  "password": "securePassword123",
  "mfaCode": "123456" // Optional if MFA enabled
}

Response (200):
{
  "success": true,
  "token": "jwt_token",
  "refreshToken": "refresh_token",
  "user": {
    "id": "uuid",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "Doctor"
  }
}
```

#### POST `/api/v1/auth/logout`
Logout user (invalidate token)

#### POST `/api/v1/auth/refresh`
Refresh JWT token
```json
Request:
{
  "refreshToken": "refresh_token"
}

Response (200):
{
  "token": "new_jwt_token"
}
```

#### POST `/api/v1/auth/enable-mfa`
Enable MFA for user
```json
Response (200):
{
  "secret": "qr_code_secret",
  "qrCode": "data:image/png;base64,..."
}
```

#### POST `/api/v1/auth/verify-mfa`
Verify MFA setup
```json
Request:
{
  "code": "123456"
}

Response (200):
{
  "success": true,
  "backupCodes": ["code1", "code2", ...]
}
```

---

### 2.2 User Endpoints

#### GET `/api/v1/users/me`
Get current user profile
```json
Response (200):
{
  "id": "uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "Doctor",
  "title": "MD",
  "phoneNumber": "+1234567890",
  "avatar": "url",
  "mfaEnabled": false
}
```

#### PUT `/api/v1/users/me`
Update current user profile
```json
Request:
{
  "name": "John Doe Updated",
  "phoneNumber": "+9876543210",
  "title": "MD, PhD"
}
```

#### GET `/api/v1/users/:userId`
Get user profile by ID

#### GET `/api/v1/users`
List all users (Admin only)
```json
Query Parameters:
- role: "Doctor" | "Nurse" | "Patient"
- page: integer
- limit: integer
- search: string

Response (200):
{
  "data": [
    {
      "id": "uuid",
      "name": "John Doe",
      "role": "Doctor",
      "avatar": "url"
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10
  }
}
```

#### DELETE `/api/v1/users/:userId`
Delete user (Admin only)

---

### 2.3 Patient Endpoints

#### POST `/api/v1/patients`
Create new patient
```json
Request:
{
  "mrn": "MRN-001234",
  "dateOfBirth": "1985-03-15",
  "address": "123 Main St, Springfield, IL",
  "phoneNumber": "+1234567890",
  "emergencyContact": "Jane Doe",
  "emergencyContactPhone": "+0987654321",
  "bloodType": "O+"
}

Response (201):
{
  "id": "uuid",
  "mrn": "MRN-001234",
  "dateOfBirth": "1985-03-15",
  "address": "123 Main St, Springfield, IL"
}
```

#### GET `/api/v1/patients/:patientId`
Get patient details
```json
Response (200):
{
  "id": "uuid",
  "mrn": "MRN-001234",
  "userId": "uuid",
  "dateOfBirth": "1985-03-15",
  "address": "123 Main St, Springfield, IL",
  "diagnoses": ["Hypertension", "Type 2 Diabetes"],
  "medications": [
    {
      "id": "uuid",
      "name": "Lisinopril",
      "dosage": "10mg",
      "frequency": "Daily"
    }
  ],
  "allergies": ["Penicillin"],
  "vitals": [
    {
      "date": "2024-01-15",
      "systolic": 120,
      "diastolic": 80,
      "heartRate": 72
    }
  ]
}
```

#### GET `/api/v1/patients`
List patients (with filtering)
```json
Query Parameters:
- search: "John" (searches by name or MRN)
- page: integer
- limit: integer

Response (200):
{
  "data": [
    {
      "id": "uuid",
      "mrn": "MRN-001234",
      "name": "John Doe",
      "dateOfBirth": "1985-03-15"
    }
  ],
  "pagination": {
    "total": 500,
    "page": 1,
    "limit": 10
  }
}
```

#### PUT `/api/v1/patients/:patientId`
Update patient information

#### POST `/api/v1/patients/:patientId/diagnoses`
Add diagnosis to patient
```json
Request:
{
  "diagnosis": "Type 2 Diabetes",
  "diagnosedDate": "2023-06-01"
}

Response (201):
{
  "id": "uuid",
  "diagnosis": "Type 2 Diabetes",
  "diagnosedDate": "2023-06-01"
}
```

#### POST `/api/v1/patients/:patientId/medications`
Add medication to patient
```json
Request:
{
  "name": "Metformin",
  "dosage": "1000mg",
  "frequency": "Twice Daily",
  "startDate": "2023-06-01",
  "prescribingDoctorId": "uuid"
}

Response (201):
{
  "id": "uuid",
  "name": "Metformin",
  "dosage": "1000mg",
  "frequency": "Twice Daily"
}
```

#### POST `/api/v1/patients/:patientId/allergies`
Add allergy to patient
```json
Request:
{
  "allergy": "Penicillin",
  "severity": "moderate",
  "reactionDescription": "Causes rash"
}

Response (201):
{
  "id": "uuid",
  "allergy": "Penicillin",
  "severity": "moderate"
}
```

#### POST `/api/v1/patients/:patientId/vitals`
Record patient vitals
```json
Request:
{
  "systolicBp": 120,
  "diastolicBp": 80,
  "heartRate": 72,
  "temperature": 37.5,
  "respirationRate": 16,
  "oxygenSaturation": 98.5,
  "weight": 75.5,
  "height": 180,
  "notes": "Patient appears healthy"
}

Response (201):
{
  "id": "uuid",
  "systolicBp": 120,
  "diastolicBp": 80,
  "recordedDate": "2024-01-15T10:30:00Z"
}
```

#### GET `/api/v1/patients/:patientId/vitals`
Get patient vitals history
```json
Query Parameters:
- startDate: ISO date
- endDate: ISO date

Response (200):
{
  "data": [
    {
      "date": "2024-01-15",
      "systolic": 120,
      "diastolic": 80,
      "heartRate": 72
    }
  ]
}
```

---

### 2.4 Chat Endpoints

#### POST `/api/v1/chats`
Create new chat/group
```json
Request:
{
  "name": "Care Team - John Doe",
  "type": "Care Team",
  "patientId": "uuid",
  "participantIds": ["uuid1", "uuid2", "uuid3"],
  "phoneNumber": "+1234567890" // For SMS type
}

Response (201):
{
  "id": "uuid",
  "name": "Care Team - John Doe",
  "type": "Care Team",
  "patientId": "uuid",
  "createdAt": "2024-01-15T10:00:00Z"
}
```

#### GET `/api/v1/chats/:chatId`
Get chat details with messages
```json
Query Parameters:
- limit: integer (default 50)
- offset: integer (default 0)

Response (200):
{
  "id": "uuid",
  "name": "Care Team - John Doe",
  "type": "Care Team",
  "participants": [
    {
      "id": "uuid",
      "name": "John Doe",
      "role": "Patient"
    }
  ],
  "messages": [
    {
      "id": "uuid",
      "sender": { "id": "uuid", "name": "Dr. Smith" },
      "content": "How are you feeling today?",
      "type": "text",
      "createdAt": "2024-01-15T10:00:00Z",
      "isRead": true
    }
  ]
}
```

#### GET `/api/v1/chats`
List user's chats
```json
Query Parameters:
- type: "Direct" | "Care Team" | etc.
- page: integer
- limit: integer
- pinned: boolean

Response (200):
{
  "data": [
    {
      "id": "uuid",
      "name": "John Doe",
      "type": "Direct",
      "lastMessage": "Thanks for the update",
      "lastMessageTime": "2024-01-15T10:00:00Z",
      "avatar": "url",
      "isPinned": true,
      "unreadCount": 3
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10
  }
}
```

#### PUT `/api/v1/chats/:chatId`
Update chat information
```json
Request:
{
  "name": "Updated Chat Name",
  "isPinned": true
}
```

#### POST `/api/v1/chats/:chatId/pin`
Pin/unpin chat

#### POST `/api/v1/chats/:chatId/participants`
Add participant to chat
```json
Request:
{
  "userId": "uuid"
}
```

#### DELETE `/api/v1/chats/:chatId/participants/:userId`
Remove participant from chat

#### DELETE `/api/v1/chats/:chatId`
Delete chat (soft delete for HIPAA compliance)

---

### 2.5 Message Endpoints

#### POST `/api/v1/chats/:chatId/messages`
Send message
```json
Request:
{
  "content": "How are you feeling today?",
  "type": "text"
}

OR for file upload:
{
  "type": "file",
  "file": <binary>,
  "fileName": "document.pdf"
}

OR for voice message:
{
  "type": "voice",
  "audio": <binary>,
  "duration": "30s"
}

Response (201):
{
  "id": "uuid",
  "chatId": "uuid",
  "sender": { "id": "uuid", "name": "Dr. Smith" },
  "content": "How are you feeling today?",
  "type": "text",
  "createdAt": "2024-01-15T10:00:00Z",
  "isRead": false
}
```

#### GET `/api/v1/messages/:messageId`
Get message details

#### PUT `/api/v1/messages/:messageId`
Edit message
```json
Request:
{
  "content": "Updated message content"
}
```

#### DELETE `/api/v1/messages/:messageId`
Delete message (soft delete)

#### POST `/api/v1/messages/:messageId/read`
Mark message as read

#### POST `/api/v1/chats/:chatId/messages/read-all`
Mark all chat messages as read

#### POST `/api/v1/messages/:messageId/transcribe`
Transcribe voice message (Twilio)
```json
Response (200):
{
  "messageId": "uuid",
  "transcription": "How are you feeling today?",
  "duration": "5.2s"
}
```

---

### 2.6 Clinical Notes Endpoints

#### POST `/api/v1/clinical-notes`
Create clinical note
```json
Request:
{
  "chatId": "uuid",
  "patientId": "uuid",
  "consultationType": "initial_consultation",
  "visitReason": "Annual checkup",
  "templateType": "soap",
  "sections": {
    "subjective": "Patient reports feeling well...",
    "objective": "BP 120/80, HR 72...",
    "assessment": "Patient in good health...",
    "plan": "Continue current medications..."
  }
}

Response (201):
{
  "id": "uuid",
  "chatId": "uuid",
  "patientId": "uuid",
  "templateType": "soap",
  "createdAt": "2024-01-15T10:00:00Z",
  "isDraft": false
}
```

#### GET `/api/v1/clinical-notes/:noteId`
Get clinical note details
```json
Response (200):
{
  "id": "uuid",
  "chatId": "uuid",
  "patientId": "uuid",
  "createdBy": { "id": "uuid", "name": "Dr. Smith" },
  "consultationType": "initial_consultation",
  "visitReason": "Annual checkup",
  "templateType": "soap",
  "sections": {
    "subjective": "...",
    "objective": "...",
    "assessment": "...",
    "plan": "..."
  },
  "suggestions": [
    {
      "id": "uuid",
      "section": "plan",
      "suggestedText": "Add follow-up in 3 months",
      "type": "action",
      "isAccepted": false
    }
  ],
  "isDraft": false,
  "isSigned": false,
  "createdAt": "2024-01-15T10:00:00Z"
}
```

#### GET `/api/v1/patients/:patientId/clinical-notes`
List patient's clinical notes
```json
Query Parameters:
- page: integer
- limit: integer
- templateType: "soap" | "apso" | etc.

Response (200):
{
  "data": [
    {
      "id": "uuid",
      "templateType": "soap",
      "consultationType": "follow_up",
      "createdBy": "Dr. Smith",
      "createdAt": "2024-01-15"
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10
  }
}
```

#### PUT `/api/v1/clinical-notes/:noteId`
Update clinical note
```json
Request:
{
  "sections": {
    "subjective": "Updated content...",
    "objective": "Updated content..."
  },
  "isDraft": false
}
```

#### POST `/api/v1/clinical-notes/:noteId/sign`
Sign clinical note
```json
Request:
{
  "password": "user_password_for_verification"
}

Response (200):
{
  "success": true,
  "signedAt": "2024-01-15T10:00:00Z",
  "signedBy": "Dr. Smith"
}
```

#### POST `/api/v1/clinical-notes/:noteId/accept-suggestion/:suggestionId`
Accept AI suggestion
```json
Response (200):
{
  "success": true,
  "updatedSection": "plan",
  "updatedContent": "..."
}
```

#### DELETE `/api/v1/clinical-notes/:noteId`
Delete clinical note (soft delete with audit trail)

#### POST `/api/v1/clinical-notes/:noteId/export`
Export clinical note (PDF, DOCX)
```json
Query Parameters:
- format: "pdf" | "docx" | "txt"

Response (200):
File download
```

---

### 2.7 AI/Scribe Endpoints

#### POST `/api/v1/scribe/generate-note`
Generate clinical note from chat messages using Gemini AI
```json
Request:
{
  "chatId": "uuid",
  "templateType": "soap",
  "consultationType": "initial_consultation",
  "visitReason": "Annual checkup"
}

Response (200):
{
  "id": "uuid",
  "sections": {
    "subjective": "AI-generated content...",
    "objective": "AI-generated content...",
    "assessment": "AI-generated content...",
    "plan": "AI-generated content..."
  },
  "suggestions": [
    {
      "id": "uuid",
      "section": "plan",
      "suggestedText": "Consider follow-up visit",
      "type": "action"
    }
  ]
}
```

#### POST `/api/v1/scribe/generate-suggestions`
Get AI suggestions for a note section
```json
Request:
{
  "noteId": "uuid",
  "section": "plan",
  "context": "Recent patient history and symptoms"
}

Response (200):
{
  "suggestions": [
    {
      "id": "uuid",
      "text": "Prescribe Lisinopril 10mg daily",
      "type": "medication",
      "confidence": 0.92
    },
    {
      "id": "uuid",
      "text": "Schedule follow-up in 2 weeks",
      "type": "action",
      "confidence": 0.85
    }
  ]
}
```

#### POST `/api/v1/scribe/summarize-call`
Summarize call transcription using Gemini
```json
Request:
{
  "callId": "uuid",
  "transcription": "Full call transcription text..."
}

Response (200):
{
  "summary": "Patient discussed symptoms of...",
  "keyPoints": [
    "Patient experiencing headaches",
    "BP elevated at 140/90",
    "Prescribed new medication"
  ]
}
```

---

### 2.8 Call/Video Endpoints

#### POST `/api/v1/calls/initiate`
Initiate voice or video call (100ms integration)
```json
Request:
{
  "recipientId": "uuid",
  "callType": "video",
  "roomName": "call-uuid-timestamp"
}

Response (201):
{
  "callId": "uuid",
  "roomId": "room-uuid",
  "authToken": "100ms_auth_token",
  "roomUrl": "https://call.example.com/room/room-uuid",
  "participants": [
    {
      "id": "uuid",
      "name": "Dr. Smith"
    }
  ]
}
```

#### GET `/api/v1/calls/:callId`
Get call details

#### POST `/api/v1/calls/:callId/end`
End call
```json
Request:
{
  "duration": "15m 30s"
}

Response (200):
{
  "success": true,
  "callLog": {
    "id": "uuid",
    "duration": "15m 30s",
    "recordingUrl": "https://..."
  }
}
```

#### POST `/api/v1/calls/:callId/record`
Start/stop recording
```json
Request:
{
  "action": "start" | "stop"
}

Response (200):
{
  "recordingId": "uuid",
  "recordingUrl": "https://..."
}
```

#### GET `/api/v1/call-logs`
Get user's call history
```json
Query Parameters:
- page: integer
- limit: integer
- type: "voice" | "video"
- direction: "incoming" | "outgoing"

Response (200):
{
  "data": [
    {
      "id": "uuid",
      "direction": "incoming",
      "type": "video",
      "status": "answered",
      "duration": "15m 30s",
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 10
  }
}
```

#### POST `/api/v1/calls/:callId/transcribe`
Transcribe call recording
```json
Response (200):
{
  "callId": "uuid",
  "transcription": "Full transcription text...",
  "duration": "15m 30s"
}
```

---

### 2.9 Twilio Integration Endpoints

#### POST `/api/v1/messaging/send-sms`
Send SMS message
```json
Request:
{
  "recipientPhone": "+1234567890",
  "message": "Your appointment is tomorrow at 2 PM"
}

Response (201):
{
  "messageId": "uuid",
  "status": "sent",
  "sentAt": "2024-01-15T10:00:00Z"
}
```

#### POST `/api/v1/messaging/webhook/sms`
Webhook to receive incoming SMS (Twilio callback)
```json
Request:
{
  "MessageSid": "SM...",
  "From": "+1234567890",
  "To": "+0987654321",
  "Body": "Hello, this is a test message"
}
```

#### GET `/api/v1/messaging/sms-logs`
Get SMS message logs
```json
Query Parameters:
- page: integer
- limit: integer
- phone: "+1234567890"

Response (200):
{
  "data": [
    {
      "id": "uuid",
      "from": "+1234567890",
      "to": "+0987654321",
      "message": "...",
      "status": "delivered",
      "sentAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

---

### 2.10 Template Endpoints

#### GET `/api/v1/templates`
Get all available note templates
```json
Response (200):
{
  "data": [
    {
      "id": "soap",
      "name": "SOAP Note",
      "description": "Subjective, Objective, Assessment, Plan",
      "specialty": "General Medicine",
      "sections": [
        {
          "id": "subjective",
          "label": "S",
          "fullName": "Subjective",
          "required": true
        }
      ]
    },
    {
      "id": "cardiology",
      "name": "Cardiology Note",
      "description": "Specialty template for cardiology",
      "specialty": "Cardiology",
      "sections": [...]
    }
  ]
}
```

#### GET `/api/v1/consultation-types`
Get all consultation types
```json
Response (200):
{
  "data": [
    {
      "id": "initial_consultation",
      "name": "Initial Consultation",
      "description": "First visit with patient, comprehensive history",
      "aiContextModifier": "This is an initial consultation..."
    },
    {
      "id": "follow_up",
      "name": "Follow-up",
      "description": "Follow-up appointment for established patient",
      "aiContextModifier": "This is a follow-up visit..."
    }
  ]
}
```

---

### 2.11 User Preferences Endpoints

#### GET `/api/v1/users/me/preferences`
Get user preferences
```json
Response (200):
{
  "defaultTemplate": "soap",
  "favoriteTemplates": ["soap", "cardiology"],
  "autoScribe": true,
  "notificationsEnabled": true,
  "emailNotifications": true,
  "smsNotifications": false,
  "darkMode": false,
  "language": "en",
  "timezone": "America/Chicago"
}
```

#### PUT `/api/v1/users/me/preferences`
Update user preferences
```json
Request:
{
  "defaultTemplate": "apso",
  "autoScribe": false,
  "darkMode": true,
  "timezone": "America/New_York"
}

Response (200):
{
  "success": true,
  "preferences": {...}
}
```

---

## 3. WebSocket Events (Real-time Communication)

### Connection
```
CONNECT: ws://api.example.com/ws?token=jwt_token
```

### Message Events
```javascript
// Send message
{
  "event": "message:send",
  "data": {
    "chatId": "uuid",
    "content": "Hello there!",
    "type": "text"
  }
}

// Receive message
{
  "event": "message:received",
  "data": {
    "id": "uuid",
    "chatId": "uuid",
    "sender": { "id": "uuid", "name": "Dr. Smith" },
    "content": "Hello there!",
    "type": "text",
    "createdAt": "2024-01-15T10:00:00Z"
  }
}

// Typing indicator
{
  "event": "user:typing",
  "data": {
    "chatId": "uuid",
    "userId": "uuid",
    "isTyping": true
  }
}

// Message read
{
  "event": "message:read",
  "data": {
    "messageId": "uuid",
    "readBy": "uuid",
    "readAt": "2024-01-15T10:00:00Z"
  }
}
```

### Call Events
```javascript
// Call initiated
{
  "event": "call:initiated",
  "data": {
    "callId": "uuid",
    "from": { "id": "uuid", "name": "Dr. Smith" },
    "to": { "id": "uuid", "name": "John Doe" },
    "callType": "video"
  }
}

// Call answered
{
  "event": "call:answered",
  "data": {
    "callId": "uuid",
    "answeredAt": "2024-01-15T10:00:00Z",
    "roomId": "100ms-room-id"
  }
}

// Call ended
{
  "event": "call:ended",
  "data": {
    "callId": "uuid",
    "duration": "15m 30s",
    "recordingUrl": "https://..."
  }
}
```

### Notification Events
```javascript
{
  "event": "notification:new",
  "data": {
    "id": "uuid",
    "type": "message" | "call" | "note",
    "title": "New message from Dr. Smith",
    "body": "How are you feeling today?",
    "timestamp": "2024-01-15T10:00:00Z"
  }
}
```

---

## 4. Third-Party Integrations

### 4.1 Google Gemini AI Integration

**Endpoint:** `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent`

**API Key:** Store in environment variable `GEMINI_API_KEY`

**Usage:**
- Generate clinical notes from chat context
- Provide clinical suggestions for note sections
- Summarize call transcriptions
- Generate context-aware prompts based on consultation type

**Implementation:**
```typescript
// Example prompt for initial consultation
const prompt = `You are a medical AI assistant. A doctor is documenting an initial consultation with a patient.

Patient Context:
- Name: John Doe
- Age: 38
- Medical History: Hypertension, Type 2 Diabetes
- Allergies: Penicillin

Chat History:
[Previous messages...]

Generate a SOAP note with the following sections:
1. Subjective: Patient's symptoms and history
2. Objective: Physical examination findings
3. Assessment: Medical diagnosis and interpretation
4. Plan: Treatment plan and recommendations

Format the response as JSON with keys: subjective, objective, assessment, plan`;

const response = await axios.post(
  'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=' + GEMINI_API_KEY,
  {
    contents: [{
      parts: [{ text: prompt }]
    }]
  }
);
```

### 4.2 100ms Integration (Video/Voice Calls)

**Endpoint:** `https://api.100ms.live`

**API Key:** Store in environment variable `HUNDRED_MS_API_KEY`

**Create Room:**
```typescript
const room = await hundredmsClient.createRoom({
  name: `call-${callId}`,
  template: 'standard_template',
  description: `Medical call - ${patientName}`
});

const authToken = await hundredmsClient.getAuthToken({
  roomId: room.id,
  userId: currentUserId,
  role: 'host' // or 'guest'
});
```

**Webhook Events:**
```json
{
  "event": "room.participant.joined",
  "data": {
    "roomId": "room-id",
    "participantId": "participant-id",
    "userId": "user-id"
  }
}

{
  "event": "room.recording.started",
  "data": {
    "roomId": "room-id",
    "recordingId": "recording-id"
  }
}

{
  "event": "room.recording.stopped",
  "data": {
    "roomId": "room-id",
    "recordingId": "recording-id",
    "downloadUrl": "https://..."
  }
}
```

### 4.3 Twilio Integration (SMS/Chat)

**Endpoint:** `https://api.twilio.com`

**API Credentials:** Store `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` in environment

**Send SMS:**
```typescript
const message = await twilioClient.messages.create({
  body: 'Your appointment is tomorrow at 2 PM',
  from: TWILIO_PHONE_NUMBER,
  to: '+1234567890'
});
```

**Webhook Callback (Incoming SMS):**
```
POST /api/v1/messaging/webhook/sms

Parameters:
- MessageSid
- From
- To
- Body
```

---

## 5. Error Handling

### Standard Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "INVALID_REQUEST",
    "message": "User provided email already exists",
    "details": {
      "field": "email",
      "value": "john@example.com"
    }
  },
  "timestamp": "2024-01-15T10:00:00Z"
}
```

### HTTP Status Codes
- `200` - OK
- `201` - Created
- `204` - No Content
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict (e.g., duplicate MRN)
- `429` - Too Many Requests (Rate Limited)
- `500` - Internal Server Error
- `503` - Service Unavailable

### Common Error Codes
- `INVALID_REQUEST` - Malformed request
- `UNAUTHORIZED` - Missing or invalid authentication
- `FORBIDDEN` - User lacks permission
- `NOT_FOUND` - Resource not found
- `DUPLICATE_ENTRY` - Unique constraint violation
- `VALIDATION_ERROR` - Field validation failed
- `RATE_LIMITED` - Too many requests
- `EXTERNAL_SERVICE_ERROR` - Third-party service failure
- `INTERNAL_SERVER_ERROR` - Unexpected server error

---

## 6. Authentication & Security

### 6.1 JWT Token Structure
```json
{
  "sub": "user_id",
  "email": "user@example.com",
  "role": "Doctor",
  "iat": 1673779200,
  "exp": 1673865600,
  "aud": "consentmd",
  "iss": "consentmd"
}
```

### 6.2 Refresh Token
- Stored in secure HTTP-only cookies
- 7-day expiration
- One-time use (invalidated after refresh)

### 6.3 Rate Limiting
- General: 100 requests/minute per IP
- Auth endpoints: 10 requests/minute per IP
- File upload: 10 files/minute per user

### 6.4 HIPAA Compliance
- All messages/notes encrypted at rest (AES-256)
- TLS 1.2+ for all communications
- Audit logging for all data access
- 90-day retention for audit logs
- Automatic session timeout after 30 minutes
- MFA support for sensitive accounts

### 6.5 CORS Headers
```
Access-Control-Allow-Origin: https://app.consentmd.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Max-Age: 3600
```

---

## 7. Data Privacy & Compliance

### 7.1 PII Handling
- Patient names, DOB, phone numbers encrypted
- MRN treated as sensitive identifier
- Logs scrubbed of sensitive data

### 7.2 Access Control
- Role-based access control (RBAC)
- Patients can only access own records
- Doctors can access patient records only with authorization
- Admins have full access with audit trails

### 7.3 Data Retention
- Clinical notes: 7 years (HIPAA requirement)
- Call recordings: 2 years
- Chat messages: 5 years
- Audit logs: 3 years
- Soft deletes only - no permanent destruction

---

## 8. Performance & Scalability

### 8.1 Database Optimization
- Connection pooling (recommended min 10 connections)
- Read replicas for analytics queries
- Partitioning for large tables (messages, audit logs)
- Regular index maintenance

### 8.2 Caching Strategy
- Redis for session storage
- Cache chat lists (5-minute TTL)
- Cache patient records (10-minute TTL)
- Cache template definitions (24-hour TTL)

### 8.3 File Storage
- AWS S3 with server-side encryption
- CDN for file delivery (CloudFront)
- Max file size: 50MB per file
- Allowed types: PDF, DOCX, JPG, PNG, MP3, M4A

---

## 9. Deployment & Infrastructure

### 9.1 Recommended Stack
- **Backend:** Node.js with Express/Fastify
- **Database:** PostgreSQL 13+
- **Cache:** Redis 6.0+
- **Storage:** AWS S3
- **Container:** Docker
- **Orchestration:** Kubernetes (optional)
- **CI/CD:** GitHub Actions or GitLab CI
- **Monitoring:** Prometheus + Grafana
- **Logging:** ELK Stack or CloudWatch

### 9.2 Environment Variables
```
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/consentmd
REDIS_URL=redis://host:6379
JWT_SECRET=secure_random_key
JWT_REFRESH_SECRET=another_secure_key
GEMINI_API_KEY=your_gemini_api_key
HUNDRED_MS_API_KEY=your_100ms_api_key
HUNDRED_MS_API_SECRET=your_100ms_api_secret
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_number
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_S3_BUCKET=your_bucket_name
AWS_REGION=us-east-1
```

---

## 10. Testing Requirements

### 10.1 Unit Tests
- Minimum 80% code coverage
- Test all API endpoints
- Test error handling
- Test edge cases

### 10.2 Integration Tests
- Test database operations
- Test third-party integrations (Gemini, 100ms, Twilio)
- Test authentication flow
- Test file uploads

### 10.3 E2E Tests
- Test complete user workflows
- Test multi-user scenarios
- Test concurrent operations

---

## 11. Documentation & Monitoring

### 11.1 API Documentation
- Use OpenAPI/Swagger for API docs
- Auto-generate from code annotations
- Include request/response examples
- Include error code documentation

### 11.2 Monitoring
- Monitor API response times (target <200ms)
- Monitor database query performance
- Monitor third-party service health
- Alert on error rates >1%
- Monitor disk space and memory usage

---

## 12. Migration Guide

When implementing backend, follow this order:
1. Database setup and schema creation
2. User authentication system
3. Patient management
4. Chat/messaging system
5. Clinical notes system
6. Gemini AI integration
7. 100ms call integration
8. Twilio SMS integration
9. File upload system
10. Real-time WebSocket support
11. Comprehensive testing
12. Deployment and monitoring

---

**Document Version:** 1.0
**Last Updated:** January 2024
**Frontend Repository:** ConsentMD Frontend
**Backend Specification:** Ready for Development
