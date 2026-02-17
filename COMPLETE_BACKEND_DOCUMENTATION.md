# ConsentMD - Complete Backend Documentation with NestJS Implementation

## Project Overview

ConsentMD is a HIPAA-compliant telemedicine and clinical communication platform designed for healthcare professionals to securely communicate with patients, manage clinical notes using AI-powered scribe functionality, and conduct secure video/voice calls.

**Technology Stack:**
- **Backend Framework:** NestJS 10.x (Progressive Node.js framework)
- **Language:** TypeScript
- **Database:** MongoDB (NoSQL) with Mongoose - optimized for chat, messages, and real-time data
- **Authentication:** JWT tokens from Laravel backend (Identity Provider)
- **API Documentation:** Swagger/OpenAPI
- **Real-time Communication:** WebSockets (Socket.IO)
- **Cache:** Redis for session management
- **Task Queue:** Bull for async jobs
- **AI Integration:** Google Gemini API
- **Communication:** 100ms SDK (calls/video), Twilio SDK (SMS)
- **Cloud Storage:** Google Cloud Storage (S3-compatible API)
- **Notifications:** Firebase Cloud Messaging (FCM), Email service, In-app real-time notifications
- **Deployment:** Google Cloud Run (serverless), Cloud Build (CI/CD)
- **Testing:** Jest with E2E support
- **Validation:** class-validator, class-transformer
- **Containerization:** Docker & Docker Compose, Artifact Registry
- **External Identity:** Laravel backend (user authentication & MFA)

---

## 📋 Table of Contents

1. [Project Setup & Installation](#1-project-setup--installation)
2. [Database Schema](#2-database-schema)
3. [Core Configuration Files](#3-core-configuration-files)
4. [TypeORM Entities](#4-typeorm-entities)
5. [NestJS Services](#5-nestjs-services)
6. [NestJS Controllers](#6-nestjs-controllers)
7. [WebSocket Gateway (Real-time Chat)](#7-websocket-gateway-real-time-chat)
8. [DTOs (Data Transfer Objects)](#8-dtos-data-transfer-objects)
9. [Guards & Decorators](#9-guards--decorators)
10. [Environment Variables](#10-environment-variables-env-example)
11. [Docker Setup](#11-docker-setup)
12. [API Endpoints Summary](#12-api-endpoints-summary)
13. [Third-Party Integration Details](#13-third-party-integration-details)
14. [Laravel Backend Integration (Identity Provider)](#14-laravel-backend-integration-identity-provider)
15. [Development Scripts](#15-development-scripts-packagejson)
16. [Testing Examples](#16-testing-examples)
17. [Deployment Checklist](#17-deployment-checklist)
18. [MongoDB Setup & Configuration](#18-mongodb-setup--configuration)
19. [Google Cloud Storage Setup](#19-google-cloud-storage-gcs-setup)
20. [Real-Time Notification Services](#20-real-time-notification-services)
21. [Google Cloud Deployment](#21-google-cloud-deployment)
22. [Monitoring, Logging & Security](#22-monitoring-logging--security)
23. [Development Workflow Commands](#23-development-workflow-commands)

---

## 1. Project Setup & Installation

### 1.1 Prerequisites
- Node.js 18.x or higher
- npm or yarn
- Neon Database Account (https://neon.tech) for PostgreSQL serverless
- Google Cloud Account with:
  - Cloud Run enabled
  - Cloud Storage (GCS) enabled
  - Artifact Registry enabled
  - Cloud Build enabled
  - Firebase project setup (for Cloud Messaging)
- Redis 6.0 or higher (for caching, can be Cloud Memorystore)
- Docker & Docker Compose (for local development)
- Google Cloud SDK (`gcloud` CLI)

### 1.2 Installation & Dependencies

```bash
# Install NestJS CLI globally
npm install -g @nestjs/cli

# Create new NestJS project
nest new consentmd-backend
cd consentmd-backend

# Install required dependencies
npm install @nestjs/mongoose mongoose
npm install @nestjs/jwt @nestjs/passport passport passport-jwt passport-local
npm install @nestjs/websockets @nestjs/platform-socket.io socket.io
npm install @nestjs/redis redis
npm install @nestjs/bull bull
npm install @nestjs/swagger swagger-ui-express
npm install @nestjs/config joi
npm install class-validator class-transformer
npm install axios dotenv
npm install @google/generative-ai
npm install @google-cloud/storage
npm install firebase-admin
npm install twilio
npm install 100ms-web
npm install nodemailer
npm install bcryptjs speakeasy qrcode
npm install helmet cors

# Dev dependencies
npm install -D @types/express @types/node @types/jest
npm install -D jest @types/jest ts-jest
npm install -D @nestjs/testing
npm install -D prettier eslint
npm install -D @types/bcryptjs @types/speakeasy
```

### 1.3 NestJS Project Structure

```
consentmd-backend/
├── src/
│   ├── auth/                          # Authentication module
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   ├── strategies/
│   │   │   ├── jwt.strategy.ts
│   │   │   └── local.strategy.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   ├── local-auth.guard.ts
│   │   │   └── roles.guard.ts
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts
│   │   │   ├── roles.decorator.ts
│   │   │   └── public.decorator.ts
│   │   └── dto/
│   │       ├── login.dto.ts
│   │       ├── register.dto.ts
│   │       └── refresh-token.dto.ts
│   │
│   ├── users/                         # Users module
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── users.module.ts
│   │   ├── entities/
│   │   │   └── user.entity.ts
│   │   ├── enums/
│   │   │   └── user-role.enum.ts
│   │   └── dto/
│   │       ├── create-user.dto.ts
│   │       ├── update-user.dto.ts
│   │       └── user-response.dto.ts
│   │
│   ├── patients/                      # Patients module
│   │   ├── patients.controller.ts
│   │   ├── patients.service.ts
│   │   ├── patients.module.ts
│   │   ├── entities/
│   │   │   ├── patient.entity.ts
│   │   │   ├── diagnosis.entity.ts
│   │   │   ├── medication.entity.ts
│   │   │   ├── allergy.entity.ts
│   │   │   └── vital.entity.ts
│   │   └── dto/
│   │       ├── create-patient.dto.ts
│   │       ├── update-patient.dto.ts
│   │       ├── add-diagnosis.dto.ts
│   │       ├── add-medication.dto.ts
│   │       ├── add-allergy.dto.ts
│   │       └── record-vital.dto.ts
│   │
│   ├── chats/                         # Chats module
│   │   ├── chats.controller.ts
│   │   ├── chats.service.ts
│   │   ├── chats.module.ts
│   │   ├── entities/
│   │   │   ├── chat.entity.ts
│   │   │   ├── chat-participant.entity.ts
│   │   │   └── message.entity.ts
│   │   ├── gateways/
│   │   │   └── chat.gateway.ts
│   │   └── dto/
│   │       ├── create-chat.dto.ts
│   │       ├── send-message.dto.ts
│   │       └── update-chat.dto.ts
│   │
│   ├── clinical-notes/                # Clinical notes module
│   │   ├── clinical-notes.controller.ts
│   │   ├── clinical-notes.service.ts
│   │   ├── clinical-notes.module.ts
│   │   ├── entities/
│   │   │   ├── clinical-note.entity.ts
│   │   │   └── note-suggestion.entity.ts
│   │   └── dto/
│   │       ├── create-note.dto.ts
│   │       ├── update-note.dto.ts
│   │       └── accept-suggestion.dto.ts
│   │
│   ├── scribe/                        # AI Scribe module
│   │   ├── scribe.controller.ts
│   │   ├── scribe.service.ts
│   │   └── scribe.module.ts
│   │
│   ├── calls/                         # Calls module (100ms)
│   │   ├── calls.controller.ts
│   │   ├── calls.service.ts
│   │   ├── calls.module.ts
│   │   ├── entities/
│   │   │   └── call-log.entity.ts
│   │   └── dto/
│   │       └── initiate-call.dto.ts
│   │
│   ├── messaging/                     # Messaging module (Twilio)
│   │   ├── messaging.controller.ts
│   │   ├── messaging.service.ts
│   │   ├── messaging.module.ts
│   │   └── dto/
│   │       └── send-sms.dto.ts
│   │
│   ├── templates/                     # Templates module
│   │   ├── templates.controller.ts
│   │   ├── templates.service.ts
│   │   └── templates.module.ts
│   │
│   ├── common/
│   │   ├── decorators/
│   │   ├── filters/
│   │   │   ├── http-exception.filter.ts
│   │   │   └── all-exceptions.filter.ts
│   │   ├── interceptors/
│   │   │   ├── logging.interceptor.ts
│   │   │   ├── transform.interceptor.ts
│   │   │   └── error.interceptor.ts
│   │   ├── middleware/
│   │   │   └── logger.middleware.ts
│   │   ├── pipes/
│   │   │   └── validation.pipe.ts
│   │   ├── guards/
│   │   │   ├── rate-limit.guard.ts
│   │   │   └── throttle.guard.ts
│   │   ├── constants/
│   │   │   └── constants.ts
│   │   ├── entities/
│   │   │   └── audit-log.entity.ts
│   │   └── utils/
│   │       ├── mrn.util.ts
│   │       └── password.util.ts
│   │
│   ├── config/
│   │   ├── database.config.ts
│   │   ├── typeorm.config.ts
│   │   ├── jwt.config.ts
│   │   ├── redis.config.ts
│   │   ├── bull.config.ts
│   │   └── env.validation.ts
│   │
│   ├── shared/
│   │   ├── services/
│   │   │   ├── gemini.service.ts
│   │   │   ├── hundred-ms.service.ts
│   │   │   ├── twilio.service.ts
│   │   │   └── s3.service.ts
│   │   └── dto/
│   │       ├── pagination.dto.ts
│   │       └── response.dto.ts
│   │
│   ├── migrations/                    # Database migrations
│   │   └── [timestamp]-InitialSchema.ts
│   │
│   ├── app.module.ts
│   ├── app.controller.ts
│   ├── app.service.ts
│   └── main.ts
│
├── test/
│   ├── auth.e2e-spec.ts
│   ├── users.e2e-spec.ts
│   ├── patients.e2e-spec.ts
│   ├── chats.e2e-spec.ts
│   └── jest-e2e.json
│
├── .env.example
├── .env.development
├── .env.production
├── docker-compose.yml
├── Dockerfile
├── nest-cli.json
├── tsconfig.json
├── package.json
└── README.md
```

---

## 2. Database Schema

### 2.0 MongoDB Collections Overview

**Note:** ConsentMD uses MongoDB for optimal performance with chat, messaging, and real-time data.

**Primary Collections:**
1. **users** - User profiles synced from Laravel
2. **messages** - Chat messages with flexible metadata
3. **conversations** - Chat conversations and groups
4. **participants** - Conversation participants tracking
5. **clinical_notes** - Clinical scribe notes
6. **notifications** - User notifications
7. **fcm_tokens** - Firebase Cloud Messaging tokens
8. **notification_preferences** - User notification settings

**MongoDB Advantages for ConsentMD:**
- ✅ Flexible schema for diverse message types
- ✅ High write throughput for real-time chat
- ✅ Horizontal scaling with sharding
- ✅ TTL indexes for auto-cleanup
- ✅ Native support for arrays and nested objects

### 2.1 Users Collection
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

### 2.2 Patients Table
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

### 2.3 Patient Diagnoses Table
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

### 2.4 Patient Medications Table
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

### 2.5 Patient Allergies Table
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

### 2.6 Patient Vitals Table
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

### 2.7 Chats Table
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

### 2.8 Chat Participants Table
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

### 2.9 Messages Table
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

### 2.10 Clinical Notes Table
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

### 2.11 Clinical Note Suggestions Table
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

### 2.12 Call Logs Table
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

### 2.13 User Preferences Table
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

### 2.14 Audit Logs Table
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

## 3. Core Configuration Files

### 3.1 main.ts - Application Bootstrap

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security middleware
  app.use(helmet());

  // Enable CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global error filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global logging interceptor
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('ConsentMD API')
    .setDescription('HIPAA-compliant telemedicine platform API')
    .setVersion('1.0.0')
    .addServer('http://localhost:3001', 'Development')
    .addServer('https://api.consentmd.com', 'Production')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'access-token',
    )
    .addTag('Auth', 'Authentication endpoints')
    .addTag('Users', 'User management')
    .addTag('Patients', 'Patient management')
    .addTag('Chats', 'Chat and messaging')
    .addTag('Clinical Notes', 'Clinical note management')
    .addTag('Scribe', 'AI scribe functionality')
    .addTag('Calls', 'Call management')
    .addTag('Messaging', 'SMS messaging')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
}

bootstrap();
```

### 3.2 app.module.ts - Root Module

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from '@nestjs/redis';
import { BullModule } from '@nestjs/bull';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PatientsModule } from './patients/patients.module';
import { ChatsModule } from './chats/chats.module';
import { ClinicalNotesModule } from './clinical-notes/clinical-notes.module';
import { ScribeModule } from './scribe/scribe.module';
import { CallsModule } from './calls/calls.module';
import { MessagingModule } from './messaging/messaging.module';
import { TemplatesModule } from './templates/templates.module';
import { typeormConfig } from './config/typeorm.config';
import { envValidation } from './config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'production'
        ? '.env.production'
        : '.env.development',
      validationSchema: envValidation,
    }),
    TypeOrmModule.forRoot(typeormConfig),
    RedisModule.forRoot({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    }),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    PatientsModule,
    ChatsModule,
    ClinicalNotesModule,
    ScribeModule,
    CallsModule,
    MessagingModule,
    TemplatesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

### 3.3 config/typeorm.config.ts

```typescript
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { UserEntity } from '../users/entities/user.entity';
import { PatientEntity } from '../patients/entities/patient.entity';
import { DiagnosisEntity } from '../patients/entities/diagnosis.entity';
import { MedicationEntity } from '../patients/entities/medication.entity';
import { AllergyEntity } from '../patients/entities/allergy.entity';
import { VitalEntity } from '../patients/entities/vital.entity';
import { ChatEntity } from '../chats/entities/chat.entity';
import { ChatParticipantEntity } from '../chats/entities/chat-participant.entity';
import { MessageEntity } from '../chats/entities/message.entity';
import { ClinicalNoteEntity } from '../clinical-notes/entities/clinical-note.entity';
import { NoteSuggestionEntity } from '../clinical-notes/entities/note-suggestion.entity';
import { CallLogEntity } from '../calls/entities/call-log.entity';
import { AuditLogEntity } from '../common/entities/audit-log.entity';

export const typeormConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'consentmd',
  entities: [
    UserEntity,
    PatientEntity,
    DiagnosisEntity,
    MedicationEntity,
    AllergyEntity,
    VitalEntity,
    ChatEntity,
    ChatParticipantEntity,
    MessageEntity,
    ClinicalNoteEntity,
    NoteSuggestionEntity,
    CallLogEntity,
    AuditLogEntity,
  ],
  migrations: ['src/migrations/*.ts'],
  migrationsRun: true,
  synchronize: process.env.NODE_ENV !== 'production',
  logging: ['error', 'warn'],
  dropSchema: false,
};
```

### 3.4 config/env.validation.ts

```typescript
import * as joi from 'joi';

export const envValidation = joi.object({
  // Application
  NODE_ENV: joi
    .string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: joi.number().default(3001),

  // Database
  DB_HOST: joi.string().required(),
  DB_PORT: joi.number().default(5432),
  DB_USERNAME: joi.string().required(),
  DB_PASSWORD: joi.string().required(),
  DB_NAME: joi.string().required(),

  // JWT
  JWT_SECRET: joi.string().required(),
  JWT_EXPIRATION: joi.string().default('1h'),
  JWT_REFRESH_SECRET: joi.string().required(),
  JWT_REFRESH_EXPIRATION: joi.string().default('7d'),

  // Redis
  REDIS_HOST: joi.string().default('localhost'),
  REDIS_PORT: joi.number().default(6379),

  // Frontend
  FRONTEND_URL: joi.string().uri().required(),

  // Gemini
  GEMINI_API_KEY: joi.string().required(),

  // 100ms
  HUNDRED_MS_API_KEY: joi.string().required(),
  HUNDRED_MS_API_SECRET: joi.string().required(),

  // Twilio
  TWILIO_ACCOUNT_SID: joi.string().required(),
  TWILIO_AUTH_TOKEN: joi.string().required(),
  TWILIO_PHONE_NUMBER: joi.string().required(),

  // AWS
  AWS_ACCESS_KEY_ID: joi.string().required(),
  AWS_SECRET_ACCESS_KEY: joi.string().required(),
  AWS_S3_BUCKET: joi.string().required(),
  AWS_REGION: joi.string().default('us-east-1'),
}).unknown();
```

---

## 4. TypeORM Entities

### 4.1 User Entity

```typescript
// src/users/entities/user.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { UserRole } from '../enums/user-role.enum';
import { ChatEntity } from '../../chats/entities/chat.entity';
import { MessageEntity } from '../../chats/entities/message.entity';
import { ClinicalNoteEntity } from '../../clinical-notes/entities/clinical-note.entity';
import { CallLogEntity } from '../../calls/entities/call-log.entity';

@Entity('users')
@Index(['email'])
@Index(['phoneNumber'])
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  phoneNumber?: string;

  @Column({ type: 'varchar' })
  @Exclude()
  passwordHash: string;

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  @Column({ type: 'varchar', length: 100, nullable: true })
  title?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  avatarUrl?: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastLogin?: Date;

  @Column({ type: 'boolean', default: false })
  mfaEnabled: boolean;

  @Column({ type: 'varchar', nullable: true })
  @Exclude()
  mfaSecret?: string;

  // Relations
  @OneToMany(() => ChatEntity, (chat) => chat.createdBy)
  createdChats: ChatEntity[];

  @OneToMany(() => MessageEntity, (message) => message.sender)
  messages: MessageEntity[];

  @OneToMany(() => ClinicalNoteEntity, (note) => note.createdBy)
  clinicalNotes: ClinicalNoteEntity[];

  @OneToMany(() => CallLogEntity, (call) => call.user)
  callLogs: CallLogEntity[];
}
```

### 4.2 Patient Entity

```typescript
// src/patients/entities/patient.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { DiagnosisEntity } from './diagnosis.entity';
import { MedicationEntity } from './medication.entity';
import { AllergyEntity } from './allergy.entity';
import { VitalEntity } from './vital.entity';

@Entity('patients')
@Index(['mrn'])
export class PatientEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  mrn: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ type: 'date' })
  dateOfBirth: Date;

  @Column({ type: 'text', nullable: true })
  address?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phoneNumber?: string;

  @Column({ type: 'varchar', nullable: true })
  emergencyContact?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  emergencyContactPhone?: string;

  @Column({ type: 'varchar', length: 5, nullable: true })
  bloodType?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'created_by' })
  createdBy: UserEntity;

  // Relations
  @OneToMany(() => DiagnosisEntity, (diagnosis) => diagnosis.patient)
  diagnoses: DiagnosisEntity[];

  @OneToMany(() => MedicationEntity, (medication) => medication.patient)
  medications: MedicationEntity[];

  @OneToMany(() => AllergyEntity, (allergy) => allergy.patient)
  allergies: AllergyEntity[];

  @OneToMany(() => VitalEntity, (vital) => vital.patient)
  vitals: VitalEntity[];
}
```

### 4.3 Message Entity

```typescript
// src/chats/entities/message.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ChatEntity } from './chat.entity';
import { UserEntity } from '../../users/entities/user.entity';

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  VOICE = 'voice',
  FILE = 'file',
  SYSTEM = 'system',
  CALL_LOG = 'call_log',
}

@Entity('messages')
@Index(['chatId', 'createdAt'])
export class MessageEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ChatEntity, (chat) => chat.messages)
  @JoinColumn({ name: 'chat_id' })
  chat: ChatEntity;

  @Column('uuid')
  chatId: string;

  @ManyToOne(() => UserEntity, (user) => user.messages)
  @JoinColumn({ name: 'sender_id' })
  sender: UserEntity;

  @Column('uuid')
  senderId: string;

  @Column({ type: 'text', nullable: true })
  content?: string;

  @Column({
    type: 'enum',
    enum: MessageType,
    default: MessageType.TEXT,
  })
  messageType: MessageType;

  @Column({ type: 'varchar', length: 500, nullable: true })
  fileUrl?: string;

  @Column({ type: 'varchar', nullable: true })
  fileName?: string;

  @Column({ type: 'bigint', nullable: true })
  fileSize?: number;

  @Column({ type: 'varchar', nullable: true })
  mimeType?: string;

  @Column({ type: 'boolean', default: false })
  isRead: boolean;

  @Column({ type: 'varchar', nullable: true })
  voiceDuration?: string;

  @Column({ type: 'boolean', default: false })
  isTranscribing: boolean;

  @Column({ type: 'text', nullable: true })
  transcription?: string;

  @Column({ type: 'text', nullable: true })
  transcriptionSummary?: string;

  @Column('uuid', { nullable: true })
  callId?: string;

  @Column({ type: 'varchar', nullable: true })
  callType?: 'voice' | 'video';

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt?: Date;
}
```

---

## 5. NestJS Services

### 5.1 Auth Service

```typescript
// src/auth/auth.service.ts
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UserEntity } from '../users/entities/user.entity';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<UserEntity> {
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async register(registerDto: RegisterDto): Promise<any> {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = await this.usersService.create({
      ...registerDto,
      passwordHash: hashedPassword,
    });

    return this.generateTokens(user);
  }

  async login(user: UserEntity): Promise<any> {
    return this.generateTokens(user);
  }

  async generateTokens(user: UserEntity): Promise<any> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION'),
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async refreshToken(refreshToken: string): Promise<any> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      const user = await this.usersService.findById(payload.sub);
      const newAccessToken = this.jwtService.sign({
        sub: payload.sub,
        email: payload.email,
        role: payload.role,
      });

      return { accessToken: newAccessToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async enableMFA(user: UserEntity): Promise<any> {
    const secret = speakeasy.generateSecret({
      name: `ConsentMD (${user.email})`,
      issuer: 'ConsentMD',
    });

    const qrCode = await QRCode.toDataURL(secret.otpauth_url);

    return {
      secret: secret.base32,
      qrCode,
    };
  }

  async verifyMFA(user: UserEntity, token: string): Promise<boolean> {
    return speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token,
    });
  }
}
```

### 5.2 Patients Service

```typescript
// src/patients/patients.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PatientEntity } from './entities/patient.entity';
import { DiagnosisEntity } from './entities/diagnosis.entity';
import { MedicationEntity } from './entities/medication.entity';
import { AllergyEntity } from './entities/allergy.entity';
import { VitalEntity } from './entities/vital.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { AddDiagnosisDto } from './dto/add-diagnosis.dto';
import { AddMedicationDto } from './dto/add-medication.dto';
import { AddAllergyDto } from './dto/add-allergy.dto';
import { RecordVitalDto } from './dto/record-vital.dto';
import { generateMRN } from '../common/utils/mrn.util';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(PatientEntity)
    private patientsRepository: Repository<PatientEntity>,
    @InjectRepository(DiagnosisEntity)
    private diagnosisRepository: Repository<DiagnosisEntity>,
    @InjectRepository(MedicationEntity)
    private medicationRepository: Repository<MedicationEntity>,
    @InjectRepository(AllergyEntity)
    private allergyRepository: Repository<AllergyEntity>,
    @InjectRepository(VitalEntity)
    private vitalRepository: Repository<VitalEntity>,
  ) {}

  async create(
    createPatientDto: CreatePatientDto,
    createdById: string,
  ): Promise<PatientEntity> {
    const mrn = generateMRN();

    const patient = this.patientsRepository.create({
      mrn,
      dateOfBirth: new Date(createPatientDto.dateOfBirth),
      address: createPatientDto.address,
      phoneNumber: createPatientDto.phoneNumber,
      emergencyContact: createPatientDto.emergencyContact,
      emergencyContactPhone: createPatientDto.emergencyContactPhone,
      bloodType: createPatientDto.bloodType,
      createdBy: { id: createdById },
    });

    return await this.patientsRepository.save(patient);
  }

  async findAll(page: number = 1, limit: number = 10, search?: string) {
    const query = this.patientsRepository.createQueryBuilder('patient')
      .leftJoinAndSelect('patient.user', 'user')
      .leftJoinAndSelect('patient.diagnoses', 'diagnoses')
      .leftJoinAndSelect('patient.medications', 'medications')
      .leftJoinAndSelect('patient.allergies', 'allergies')
      .leftJoinAndSelect('patient.vitals', 'vitals');

    if (search) {
      query.where(
        'patient.mrn ILIKE :search OR user.name ILIKE :search',
        { search: `%${search}%` },
      );
    }

    const [data, total] = await query
      .orderBy('patient.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string): Promise<PatientEntity> {
    const patient = await this.patientsRepository.findOne({
      where: { id },
      relations: ['user', 'diagnoses', 'medications', 'allergies', 'vitals'],
    });

    if (!patient) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }

    return patient;
  }

  async findByMRN(mrn: string): Promise<PatientEntity> {
    const patient = await this.patientsRepository.findOne({
      where: { mrn },
      relations: ['user', 'diagnoses', 'medications', 'allergies', 'vitals'],
    });

    if (!patient) {
      throw new NotFoundException(`Patient with MRN ${mrn} not found`);
    }

    return patient;
  }

  async update(
    id: string,
    updatePatientDto: UpdatePatientDto,
  ): Promise<PatientEntity> {
    const patient = await this.findById(id);

    if (updatePatientDto.dateOfBirth) {
      patient.dateOfBirth = new Date(updatePatientDto.dateOfBirth);
    }

    Object.assign(patient, updatePatientDto);

    return await this.patientsRepository.save(patient);
  }

  async addDiagnosis(
    patientId: string,
    addDiagnosisDto: AddDiagnosisDto,
  ): Promise<DiagnosisEntity> {
    const patient = await this.findById(patientId);

    const diagnosis = this.diagnosisRepository.create({
      patient,
      diagnosis: addDiagnosisDto.diagnosis,
      diagnosedDate: addDiagnosisDto.diagnosedDate
        ? new Date(addDiagnosisDto.diagnosedDate)
        : null,
    });

    return await this.diagnosisRepository.save(diagnosis);
  }

  async addMedication(
    patientId: string,
    addMedicationDto: AddMedicationDto,
  ): Promise<MedicationEntity> {
    const patient = await this.findById(patientId);

    const medication = this.medicationRepository.create({
      patient,
      ...addMedicationDto,
    });

    return await this.medicationRepository.save(medication);
  }

  async addAllergy(
    patientId: string,
    addAllergyDto: AddAllergyDto,
  ): Promise<AllergyEntity> {
    const patient = await this.findById(patientId);

    const allergy = this.allergyRepository.create({
      patient,
      ...addAllergyDto,
    });

    return await this.allergyRepository.save(allergy);
  }

  async recordVital(
    patientId: string,
    recordVitalDto: RecordVitalDto,
    recordedById: string,
  ): Promise<VitalEntity> {
    const patient = await this.findById(patientId);

    const vital = this.vitalRepository.create({
      patient,
      recordedBy: { id: recordedById },
      recordedDate: new Date(),
      ...recordVitalDto,
    });

    return await this.vitalRepository.save(vital);
  }

  async getVitalsHistory(
    patientId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<VitalEntity[]> {
    const query = this.vitalRepository
      .createQueryBuilder('vital')
      .where('vital.patientId = :patientId', { patientId });

    if (startDate) {
      query.andWhere('vital.recordedDate >= :startDate', { startDate });
    }

    if (endDate) {
      query.andWhere('vital.recordedDate <= :endDate', { endDate });
    }

    return await query.orderBy('vital.recordedDate', 'DESC').getMany();
  }
}
```

### 5.3 Scribe Service (Gemini AI Integration)

```typescript
// src/scribe/scribe.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ChatsService } from '../chats/chats.service';
import { ClinicalNotesService } from '../clinical-notes/clinical-notes.service';
import { GenerateNoteDto } from './dto/generate-note.dto';
import { SummarizeCallDto } from './dto/summarize-call.dto';

@Injectable()
export class ScribeService {
  private genAI: GoogleGenerativeAI;
  private model;

  constructor(
    private configService: ConfigService,
    private chatsService: ChatsService,
    private notesService: ClinicalNotesService,
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  async generateNoteFromChat(generateNoteDto: GenerateNoteDto): Promise<any> {
    const { chatId, templateType, consultationType, visitReason } =
      generateNoteDto;

    try {
      // Get chat messages
      const chat = await this.chatsService.findById(chatId);
      const messages = chat.messages
        .filter((m) => m.content)
        .map((m) => ({
          sender: m.sender.name,
          role: m.sender.role,
          content: m.content,
          timestamp: m.createdAt,
        }));

      if (messages.length === 0) {
        throw new BadRequestException('Chat has no messages to generate note from');
      }

      // Build prompt
      const prompt = this.buildPrompt(
        messages,
        templateType,
        consultationType,
        visitReason,
      );

      // Generate with Gemini
      const result = await this.model.generateContent(prompt);
      const responseText = result.response.text();

      // Parse response
      const noteContent = JSON.parse(responseText);

      // Generate suggestions
      const suggestions = this.generateSuggestions(noteContent);

      return {
        sections: noteContent,
        suggestions,
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to generate note: ${error.message}`,
      );
    }
  }

  private buildPrompt(
    messages: any[],
    templateType: string,
    consultationType?: string,
    visitReason?: string,
  ): string {
    let prompt = `You are a medical AI assistant specializing in clinical documentation.
Generate a professional clinical note in the "${templateType}" format.

Consultation Type: ${consultationType || 'General Consultation'}
Visit Reason: ${visitReason || 'Not specified'}

CHAT HISTORY:
${messages.map((m) => `[${m.timestamp.toLocaleTimeString()}] ${m.sender} (${m.role}): ${m.content}`).join('\n')}

INSTRUCTIONS:
Generate a structured clinical note as valid JSON with these exact keys based on the template type:
`;

    const templates = {
      soap: ['subjective', 'objective', 'assessment', 'plan'],
      apso: ['assessment', 'plan', 'subjective', 'objective'],
      comprehensive: [
        'chief_complaint',
        'hpi',
        'ros',
        'past_medical',
        'medications',
        'allergies',
        'physical_exam',
        'assessment',
        'plan',
      ],
      psychiatry: [
        'presenting_problem',
        'psychiatric_history',
        'mental_status_exam',
        'assessment',
        'plan',
      ],
      cardiology: [
        'chief_complaint',
        'symptoms',
        'vital_signs',
        'cardiac_exam',
        'assessment',
        'plan',
      ],
    };

    const sections = templates[templateType] || templates.soap;
    prompt += JSON.stringify(sections);

    prompt += `

REQUIREMENTS:
- Each section must contain substantive clinical content based on the chat
- Use medical terminology appropriately
- Be concise but comprehensive
- Focus on clinically relevant information only
- Respond ONLY with valid JSON, no additional text
- Each section should be a string between 100-500 characters

RESPONSE FORMAT:
${JSON.stringify(Object.fromEntries(sections.map((s) => [s, 'clinical content here'])))}`;

    return prompt;
  }

  private generateSuggestions(noteContent: any): any[] {
    const suggestions = [];
    const suggestionPatterns = {
      medication: /(?:prescribe|give|administer|start|increase|decrease)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/gi,
      action: /(?:should|recommend|consider|schedule)\s+([^.!?]+)/gi,
      finding: /(?:shows?|indicates?|reveals?|suggests?)\s+([^.!?]+)/gi,
    };

    Object.entries(suggestionPatterns).forEach(([type, pattern]) => {
      for (const section in noteContent) {
        const content = noteContent[section];
        let match;
        while ((match = (pattern as RegExp).exec(content)) !== null) {
          suggestions.push({
            section,
            type,
            text: match[0],
            confidence: 0.85,
          });
        }
      }
    });

    return suggestions.slice(0, 5); // Return top 5 suggestions
  }

  async summarizeCall(summarizeCallDto: SummarizeCallDto): Promise<any> {
    if (!summarizeCallDto.transcription) {
      throw new BadRequestException('Transcription is required');
    }

    try {
      const prompt = `Summarize the following medical call transcription. Provide:
1. A concise summary (2-3 sentences)
2. Key points discussed (3-5 bullet points)
3. Any action items or follow-ups needed

TRANSCRIPTION:
${summarizeCallDto.transcription}

Respond in JSON format with keys: summary, keyPoints, actionItems`;

      const result = await this.model.generateContent(prompt);
      const responseText = result.response.text();

      return JSON.parse(responseText);
    } catch (error) {
      throw new BadRequestException(
        `Failed to summarize call: ${error.message}`,
      );
    }
  }

  async generateSuggestions(noteId: string, section: string, context: string): Promise<any[]> {
    try {
      const prompt = `As a medical AI, provide 3-5 clinical suggestions for the following note section.

Section: ${section}
Current Content: ${context}

Provide suggestions as JSON array with objects containing: text (string), type (string: medication|action|finding), confidence (0-1).

Respond ONLY with valid JSON array.`;

      const result = await this.model.generateContent(prompt);
      const responseText = result.response.text();

      return JSON.parse(responseText);
    } catch (error) {
      throw new BadRequestException(
        `Failed to generate suggestions: ${error.message}`,
      );
    }
  }
}
```

---

## 6. NestJS Controllers

### 6.1 Auth Controller

```typescript
// src/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('Auth')
@Controller('api/v1/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    return this.authService.login(user);
  }

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh JWT token' })
  async refreshToken(@Request() req: any) {
    return this.authService.refreshToken(req.body.refreshToken);
  }

  @Post('mfa/enable')
  @ApiOperation({ summary: 'Enable MFA' })
  async enableMFA(@Request() req: any) {
    return this.authService.enableMFA(req.user);
  }

  @Post('mfa/verify')
  @ApiOperation({ summary: 'Verify MFA setup' })
  async verifyMFA(@Body() body: { code: string }, @Request() req: any) {
    const isValid = await this.authService.verifyMFA(req.user, body.code);
    if (!isValid) {
      throw new UnauthorizedException('Invalid MFA code');
    }
    return { success: true };
  }
}
```

### 6.2 Patients Controller

```typescript
// src/patients/patients.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { UserRole } from '../users/enums/user-role.enum';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { AddDiagnosisDto } from './dto/add-diagnosis.dto';
import { AddMedicationDto } from './dto/add-medication.dto';
import { AddAllergyDto } from './dto/add-allergy.dto';
import { RecordVitalDto } from './dto/record-vital.dto';

@ApiTags('Patients')
@ApiBearerAuth('access-token')
@Controller('api/v1/patients')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PatientsController {
  constructor(private patientsService: PatientsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.DOCTOR, UserRole.NURSE, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create new patient' })
  async create(
    @Body() createPatientDto: CreatePatientDto,
    @CurrentUser() user: any,
  ) {
    return this.patientsService.create(createPatientDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'List all patients' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'search', required: false })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
  ) {
    return this.patientsService.findAll(page, limit, search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get patient by ID' })
  async findById(@Param('id') id: string) {
    return this.patientsService.findById(id);
  }

  @Get('mrn/:mrn')
  @ApiOperation({ summary: 'Get patient by MRN' })
  async findByMRN(@Param('mrn') mrn: string) {
    return this.patientsService.findByMRN(mrn);
  }

  @Put(':id')
  @Roles(UserRole.DOCTOR, UserRole.NURSE, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update patient' })
  async update(
    @Param('id') id: string,
    @Body() updatePatientDto: UpdatePatientDto,
  ) {
    return this.patientsService.update(id, updatePatientDto);
  }

  @Post(':id/diagnoses')
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.DOCTOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Add diagnosis to patient' })
  async addDiagnosis(
    @Param('id') patientId: string,
    @Body() addDiagnosisDto: AddDiagnosisDto,
  ) {
    return this.patientsService.addDiagnosis(patientId, addDiagnosisDto);
  }

  @Post(':id/medications')
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.DOCTOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Add medication to patient' })
  async addMedication(
    @Param('id') patientId: string,
    @Body() addMedicationDto: AddMedicationDto,
  ) {
    return this.patientsService.addMedication(patientId, addMedicationDto);
  }

  @Post(':id/allergies')
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.DOCTOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Add allergy to patient' })
  async addAllergy(
    @Param('id') patientId: string,
    @Body() addAllergyDto: AddAllergyDto,
  ) {
    return this.patientsService.addAllergy(patientId, addAllergyDto);
  }

  @Post(':id/vitals')
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.DOCTOR, UserRole.NURSE, UserRole.ADMIN)
  @ApiOperation({ summary: 'Record patient vitals' })
  async recordVital(
    @Param('id') patientId: string,
    @Body() recordVitalDto: RecordVitalDto,
    @CurrentUser() user: any,
  ) {
    return this.patientsService.recordVital(patientId, recordVitalDto, user.id);
  }

  @Get(':id/vitals')
  @ApiOperation({ summary: 'Get patient vitals history' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async getVitalsHistory(
    @Param('id') patientId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.patientsService.getVitalsHistory(
      patientId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete patient' })
  async delete(@Param('id') id: string) {
    return this.patientsService.delete(id);
  }
}
```

---

## 7. WebSocket Gateway (Real-time Chat)

```typescript
// src/chats/gateways/chat.gateway.ts
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { ChatsService } from '../chats.service';

interface ConnectedUser {
  socketId: string;
  userId: string;
  chatId: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private server: Server;
  private logger = new Logger('ChatGateway');
  private connectedUsers: ConnectedUser[] = [];

  constructor(private chatsService: ChatsService) {}

  afterInit(server: Server) {
    this.server = server;
    this.logger.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.connectedUsers = this.connectedUsers.filter(
      (u) => u.socketId !== client.id,
    );
  }

  @SubscribeMessage('join-chat')
  async handleJoinChat(
    @MessageBody() data: { chatId: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { chatId, userId } = data;
    client.join(`chat-${chatId}`);

    this.connectedUsers.push({
      socketId: client.id,
      userId,
      chatId,
    });

    this.server.to(`chat-${chatId}`).emit('user-joined', {
      userId,
      connectedUsers: this.connectedUsers.filter((u) => u.chatId === chatId),
    });

    this.logger.log(`User ${userId} joined chat ${chatId}`);
  }

  @SubscribeMessage('send-message')
  async handleMessage(
    @MessageBody()
    data: {
      chatId: string;
      content: string;
      type: string;
      senderId: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const { chatId, content, type, senderId } = data;

    try {
      const message = await this.chatsService.sendMessage(chatId, {
        content,
        senderId,
        messageType: type,
      });

      this.server.to(`chat-${chatId}`).emit('message-received', message);
      this.logger.log(`Message sent in chat ${chatId}`);
    } catch (error) {
      client.emit('error', { message: 'Failed to send message' });
    }
  }

  @SubscribeMessage('typing')
  handleTyping(
    @MessageBody()
    data: {
      chatId: string;
      userId: string;
      isTyping: boolean;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const { chatId, userId, isTyping } = data;
    this.server.to(`chat-${chatId}`).emit('user-typing', {
      userId,
      isTyping,
    });
  }

  @SubscribeMessage('message-read')
  handleMessageRead(
    @MessageBody()
    data: {
      chatId: string;
      messageId: string;
      userId: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const { chatId, messageId, userId } = data;
    this.server.to(`chat-${chatId}`).emit('message-read', {
      messageId,
      readBy: userId,
      readAt: new Date(),
    });
  }

  @SubscribeMessage('call-initiated')
  handleCallInitiated(
    @MessageBody()
    data: {
      chatId: string;
      callId: string;
      callType: 'voice' | 'video';
      initiatedBy: string;
      roomId: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const { chatId, callId, callType, initiatedBy, roomId } = data;
    this.server.to(`chat-${chatId}`).emit('call-initiated', {
      callId,
      callType,
      initiatedBy,
      roomId,
    });
  }
}
```

---

## 8. DTOs (Data Transfer Objects)

### 8.1 Create Patient DTO

```typescript
// src/patients/dto/create-patient.dto.ts
import {
  IsString,
  IsDateString,
  IsOptional,
  IsPhoneNumber,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePatientDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '1985-03-15' })
  @IsDateString()
  dateOfBirth: string;

  @ApiProperty({ required: false, example: '123 Main St, Springfield, IL' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ required: false, example: '+1234567890' })
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  emergencyContact?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  emergencyContactPhone?: string;

  @ApiProperty({ required: false, example: 'O+' })
  @IsOptional()
  @IsString()
  bloodType?: string;
}
```

### 8.2 Login DTO

```typescript
// src/auth/dto/login.dto.ts
import { IsEmail, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'doctor@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
```

---

## 9. Guards & Decorators

### 9.1 JWT Auth Guard

```typescript
// src/auth/guards/jwt-auth.guard.ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: any) {
    const isPublic = this.reflector.getAllAndOverride('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }
}
```

### 9.2 Roles Guard

```typescript
// src/auth/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    return requiredRoles.includes(user.role);
  }
}
```

### 9.3 Current User Decorator

```typescript
// src/auth/decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
```

---

## 10. Environment Variables (.env.example)

```bash
# Application
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=consentmd

# JWT
JWT_SECRET=your_super_secure_jwt_secret_key_here_min_32_chars
JWT_EXPIRATION=1h
JWT_REFRESH_SECRET=your_super_secure_refresh_secret_key_min_32_chars
JWT_REFRESH_EXPIRATION=7d

# Neon Database (PostgreSQL Serverless)
DATABASE_URL=postgresql://user:password@ep-xxxx-us-east-2.neon.tech/neon?sslmode=require
DATABASE_POOL_SIZE=10
DATABASE_MAX_QUERY_TIME=5000

# Redis (for caching and session management)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=optional_redis_password
REDIS_DB=0

# Google Cloud Storage (S3-compatible)
GOOGLE_CLOUD_PROJECT_ID=your-gcp-project-id
GOOGLE_CLOUD_KEY_FILE=path/to/service-account-key.json
GCS_BUCKET_NAME=consentmd-bucket
GCS_BUCKET_URL=https://storage.googleapis.com/consentmd-bucket
GCS_CLINICAL_NOTES_FOLDER=clinical-notes
GCS_CALL_RECORDINGS_FOLDER=call-recordings
GCS_USER_UPLOADS_FOLDER=user-uploads

# Firebase Cloud Messaging (FCM)
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY=your-firebase-private-key
FIREBASE_CLIENT_EMAIL=your-firebase-client-email@firebase.gserviceaccount.com
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here

# 100ms (Video/Voice Calls)
HUNDRED_MS_API_KEY=your_100ms_api_key
HUNDRED_MS_API_SECRET=your_100ms_api_secret

# Twilio (SMS)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Email Service (Notifications)
EMAIL_SERVICE=gmail
EMAIL_USER=noreply@consentmd.com
EMAIL_PASSWORD=your_email_app_password
EMAIL_FROM=ConsentMD <noreply@consentmd.com>
EMAIL_SMTP_HOST=smtp.gmail.com
EMAIL_SMTP_PORT=587

# Notification Settings
NOTIFICATION_RETENTION_DAYS=30
MAX_RETRY_ATTEMPTS=3
NOTIFICATION_BATCH_SIZE=100

# Google Cloud Deployment
GOOGLE_CLOUD_REGION=us-central1
GOOGLE_CLOUD_ARTIFACT_REGISTRY=us-central1-docker.pkg.dev
CLOUD_RUN_MEMORY=512Mi
CLOUD_RUN_CPU=1
CLOUD_RUN_TIMEOUT=60s

# CORS
CORS_ORIGIN=http://localhost:3000,https://consentmd.example.com
CORS_CREDENTIALS=true

# API Documentation
SWAGGER_ENABLED=true
SWAGGER_PATH=/api/docs
```

---

## 11. Docker Setup

### 11.1 Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Build application
RUN npm run build

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start
CMD ["npm", "run", "start:prod"]
```

### 11.2 docker-compose.yml (for Local Development with Neon)

**Note:** In production, use Neon for PostgreSQL. For local development, you can either:
1. Use Neon with connection string in `.env`
2. Use local PostgreSQL (optional)

```yaml
version: '3.8'

services:
  # Redis for caching (required)
  redis:
    image: redis:7-alpine
    container_name: consentmd-redis
    ports:
      - "6379:6379"
    environment:
      REDIS_REQUIREPASS: redis_password
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5

  # Optional: PostgreSQL for local development (use Neon in production)
  postgres:
    image: postgres:15-alpine
    container_name: consentmd-postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: consentmd
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Backend Application
  app:
    build: .
    container_name: consentmd-backend
    environment:
      NODE_ENV: development
      # Option 1: Use Neon (recommended for production)
      DATABASE_URL: postgresql://user:password@ep-xxxx.neon.tech/neon?sslmode=require

      # Option 2: Use local PostgreSQL (for development)
      # DATABASE_URL: postgresql://postgres:postgres@postgres:5432/consentmd

      REDIS_HOST: redis
      REDIS_PORT: 6379
      REDIS_PASSWORD: redis_password
      JWT_SECRET: dev_secret_key_min_32_chars_long
      JWT_REFRESH_SECRET: dev_refresh_secret_min_32_chars
      FRONTEND_URL: http://localhost:3000

      # Google Cloud (local testing with mock or actual)
      GOOGLE_CLOUD_PROJECT_ID: local-dev
      GCS_BUCKET_NAME: consentmd-dev
    ports:
      - "3001:3001"
    depends_on:
      redis:
        condition: service_healthy
      postgres:
        condition: service_healthy
    volumes:
      - .:/app
      - /app/node_modules

volumes:
  postgres_data:
  redis_data:
```

---

## 12. API Endpoints Summary

### Authentication Endpoints
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/refresh` - Refresh JWT token
- `POST /api/v1/auth/mfa/enable` - Enable MFA
- `POST /api/v1/auth/mfa/verify` - Verify MFA

### User Endpoints
- `GET /api/v1/users/me` - Get current user
- `PUT /api/v1/users/me` - Update user profile
- `GET /api/v1/users/:id` - Get user by ID
- `GET /api/v1/users` - List all users (admin only)
- `DELETE /api/v1/users/:id` - Delete user (admin only)

### Patient Endpoints
- `POST /api/v1/patients` - Create patient
- `GET /api/v1/patients` - List patients
- `GET /api/v1/patients/:id` - Get patient by ID
- `GET /api/v1/patients/mrn/:mrn` - Get patient by MRN
- `PUT /api/v1/patients/:id` - Update patient
- `POST /api/v1/patients/:id/diagnoses` - Add diagnosis
- `POST /api/v1/patients/:id/medications` - Add medication
- `POST /api/v1/patients/:id/allergies` - Add allergy
- `POST /api/v1/patients/:id/vitals` - Record vitals
- `GET /api/v1/patients/:id/vitals` - Get vitals history
- `DELETE /api/v1/patients/:id` - Delete patient

### Chat Endpoints
- `POST /api/v1/chats` - Create chat
- `GET /api/v1/chats` - List chats
- `GET /api/v1/chats/:id` - Get chat details
- `PUT /api/v1/chats/:id` - Update chat
- `POST /api/v1/chats/:id/pin` - Pin chat
- `POST /api/v1/chats/:id/participants` - Add participant
- `DELETE /api/v1/chats/:id/participants/:userId` - Remove participant
- `DELETE /api/v1/chats/:id` - Delete chat

### Message Endpoints
- `POST /api/v1/chats/:chatId/messages` - Send message
- `GET /api/v1/messages/:id` - Get message
- `PUT /api/v1/messages/:id` - Edit message
- `DELETE /api/v1/messages/:id` - Delete message
- `POST /api/v1/messages/:id/read` - Mark as read
- `POST /api/v1/chats/:chatId/messages/read-all` - Mark all as read

### Clinical Notes Endpoints
- `POST /api/v1/clinical-notes` - Create note
- `GET /api/v1/clinical-notes/:id` - Get note
- `GET /api/v1/patients/:patientId/clinical-notes` - List patient notes
- `PUT /api/v1/clinical-notes/:id` - Update note
- `POST /api/v1/clinical-notes/:id/sign` - Sign note
- `POST /api/v1/clinical-notes/:id/suggestions/:suggestionId` - Accept suggestion
- `POST /api/v1/clinical-notes/:id/export` - Export note
- `DELETE /api/v1/clinical-notes/:id` - Delete note

### Scribe Endpoints
- `POST /api/v1/scribe/generate-note` - Generate note from chat
- `POST /api/v1/scribe/suggestions` - Get AI suggestions
- `POST /api/v1/scribe/summarize-call` - Summarize call

### Call Endpoints
- `POST /api/v1/calls/initiate` - Initiate call
- `GET /api/v1/calls/:id` - Get call details
- `POST /api/v1/calls/:id/end` - End call
- `POST /api/v1/calls/:id/record` - Control recording
- `GET /api/v1/call-logs` - Get call history
- `POST /api/v1/calls/:id/transcribe` - Transcribe call

### Messaging Endpoints
- `POST /api/v1/messaging/send-sms` - Send SMS
- `POST /api/v1/messaging/webhook/sms` - SMS webhook (Twilio callback)
- `GET /api/v1/messaging/sms-logs` - Get SMS logs

### Template Endpoints
- `GET /api/v1/templates` - Get all templates
- `GET /api/v1/consultation-types` - Get consultation types

### User Preferences Endpoints
- `GET /api/v1/users/me/preferences` - Get preferences
- `PUT /api/v1/users/me/preferences` - Update preferences

---

## 13. Third-Party Integration Details

### 13.1 Gemini AI Integration
```typescript
// API: https://generativelanguage.googleapis.com
// Model: gemini-pro

// Usage: Clinical note generation, suggestions, call summarization
// Configuration in scribe.service.ts
```

### 13.2 100ms Integration
```typescript
// API: https://api.100ms.live
// Features: Video/voice calls with recording

// Implementation steps:
// 1. Create room
// 2. Generate auth tokens
// 3. Send room details to client
// 4. Handle webhook events (join, leave, recording)
```

### 13.3 Twilio Integration
```typescript
// API: https://api.twilio.com
// Features: SMS messaging

// Implementation steps:
// 1. Initialize Twilio client with credentials
// 2. Send SMS via REST API
// 3. Handle incoming SMS via webhook
// 4. Log message status
```

---

## 14. Laravel Backend Integration (Identity Provider)

### 14.1 Overview

The NestJS backend uses an existing Laravel backend as the identity provider. All authentication is handled by Laravel, including:
- User login and registration
- Password management
- Multi-Factor Authentication (MFA)
- Token generation and validation
- User session management

The NestJS backend validates JWT tokens from Laravel and provides access to authenticated endpoints.

### 14.2 Architecture

```
User (Frontend)
    ↓
┌─────────────────────────────────┐
│     Laravel Backend             │
│  (Identity Provider)            │
│  ✓ Login/Register               │
│  ✓ MFA                          │
│  ✓ JWT Token Generation         │
│  ✓ Token Validation             │
└─────────────────────────────────┘
    ↓ (JWT Token)
┌─────────────────────────────────┐
│     NestJS Backend              │
│  (Resource Server)              │
│  ✓ Validate Token               │
│  ✓ Access User Data             │
│  ✓ Serve Resources              │
│  ✓ Real-time Features           │
└─────────────────────────────────┘
```

### 14.3 JWT Token Validation

#### Updated JWT Strategy

```typescript
// auth/strategies/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
      issuer: configService.get('LARAVEL_URL'), // Laravel URL as issuer
    });
  }

  async validate(payload: any) {
    // payload contains user data from Laravel JWT token
    // Example payload: { sub: userId, email: 'user@example.com', roles: ['doctor'] }

    // Optional: Verify token with Laravel backend
    const isValid = await this.verifyWithLaravel(payload);
    if (!isValid) {
      throw new Error('Invalid token from Laravel');
    }

    return {
      id: payload.sub,
      email: payload.email,
      roles: payload.roles || [],
      iat: payload.iat,
      exp: payload.exp,
    };
  }

  private async verifyWithLaravel(payload: any): Promise<boolean> {
    try {
      const response = await axios.post(
        `${this.configService.get('LARAVEL_URL')}/api/verify-token`,
        { token: payload },
        {
          headers: {
            Authorization: `Bearer ${this.configService.get('LARAVEL_API_KEY')}`,
          },
        }
      );
      return response.data.valid === true;
    } catch (error) {
      console.error('Laravel token verification failed:', error);
      return false;
    }
  }
}
```

### 14.4 Removed Authentication Endpoints

The following endpoints are **NOT** implemented in NestJS because they're handled by Laravel:

❌ POST `/auth/login` - Use Laravel backend
❌ POST `/auth/register` - Use Laravel backend
❌ POST `/auth/refresh` - Use Laravel backend
❌ POST `/auth/logout` - Use Laravel backend
❌ POST `/auth/forgot-password` - Use Laravel backend
❌ POST `/auth/reset-password` - Use Laravel backend
❌ POST `/auth/mfa/setup` - Use Laravel backend
❌ POST `/auth/mfa/verify` - Use Laravel backend

### 14.5 User Syncing

When a user authenticates with Laravel, their data may need to be synced to NestJS database for fast access.

```typescript
// users/users.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import axios from 'axios';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private configService: ConfigService,
  ) {}

  /**
   * Get or sync user from Laravel
   * Called when user authenticates
   */
  async getUserFromLaravel(userId: string, token: string): Promise<User> {
    try {
      // Fetch user data from Laravel
      const laravelUser = await axios.get(
        `${this.configService.get('LARAVEL_URL')}/api/users/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Sync to local database
      let user = await this.usersRepository.findOne({
        where: { larravelId: userId },
      });

      if (!user) {
        // Create new user locally
        user = this.usersRepository.create({
          laravelId: userId,
          email: laravelUser.data.email,
          name: laravelUser.data.name,
          avatar: laravelUser.data.avatar,
          role: laravelUser.data.role,
          phoneNumber: laravelUser.data.phone_number,
        });
      } else {
        // Update existing user
        user.email = laravelUser.data.email;
        user.name = laravelUser.data.name;
        user.avatar = laravelUser.data.avatar;
        user.role = laravelUser.data.role;
        user.phoneNumber = laravelUser.data.phone_number;
      }

      await this.usersRepository.save(user);
      return user;
    } catch (error) {
      console.error('Failed to sync user from Laravel:', error);
      throw error;
    }
  }

  /**
   * Get user by Laravel ID
   */
  async findByLaravelId(laravelId: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { laravelId },
    });
  }
}
```

### 14.6 Updated User Entity

```typescript
// users/entities/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { unique: true })
  laravelId: string; // User ID from Laravel backend

  @Column('varchar')
  email: string;

  @Column('varchar')
  name: string;

  @Column('varchar', { nullable: true })
  avatar?: string;

  @Column('varchar', { nullable: true })
  phoneNumber?: string;

  @Column('varchar')
  role: string; // 'doctor', 'nurse', 'patient', 'admin'

  @Column('varchar', { nullable: true })
  title?: string;

  @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  // NOTE: No password field - handled by Laravel
}
```

### 14.7 Authentication Flow

```
1. User enters credentials in frontend
    ↓
2. Frontend sends credentials to Laravel backend
    ↓
3. Laravel validates and returns JWT token
    ↓
4. Frontend stores JWT token
    ↓
5. Frontend includes token in Authorization header
    ↓
6. NestJS receives request with JWT token
    ↓
7. JwtStrategy validates token signature
    ↓
8. JwtStrategy extracts payload (user data)
    ↓
9. @CurrentUser() decorator provides user data
    ↓
10. User data synced to local NestJS database (optional)
    ↓
11. Request authorized, user can access resources
```

### 14.8 Environment Variables

Add these to `.env`:

```env
# Laravel Backend (Identity Provider)
LARAVEL_URL=https://laravel-app.example.com
LARAVEL_API_KEY=your_laravel_api_key
LARAVEL_VERIFY_TOKEN_ENDPOINT=/api/verify-token
LARAVEL_GET_USER_ENDPOINT=/api/users

# JWT Configuration
JWT_SECRET=your_jwt_secret_from_laravel
JWT_EXPIRATION=1h
```

### 14.9 Protected Endpoints Pattern

All NestJS endpoints should use `@UseGuards(JwtAuthGuard)` to require authentication:

```typescript
// Example: Clinical notes controller
@Controller('notes')
@UseGuards(JwtAuthGuard)
export class NotesController {
  constructor(private notesService: NotesService) {}

  @Get()
  async getNotes(@CurrentUser() user: User) {
    // user is populated from JWT token
    return this.notesService.getNotesByUser(user.id);
  }

  @Post()
  async createNote(
    @CurrentUser() user: User,
    @Body() dto: CreateNoteDto,
  ) {
    return this.notesService.create(user.id, dto);
  }
}
```

### 14.10 Logout Handling

Since Laravel manages sessions:

```typescript
// Frontend
// 1. Clear stored JWT token from localStorage/sessionStorage
localStorage.removeItem('auth_token');

// 2. Call Laravel logout endpoint
await fetch(`${LARAVEL_URL}/api/logout`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` },
});

// 3. Redirect to Laravel login page
window.location.href = `${LARAVEL_URL}/login`;
```

### 14.11 Error Handling

```typescript
// Common authentication errors

// 1. Invalid token
// Response: 401 Unauthorized
// Solution: User needs to login again with Laravel

// 2. Expired token
// Response: 401 Token expired
// Solution: Refresh token endpoint in Laravel

// 3. Token not provided
// Response: 401 No auth token
// Solution: Include Authorization header

// 4. Invalid signature
// Response: 401 Invalid token
// Solution: Verify token from same Laravel instance
```

---

## 15. Development Scripts (package.json)

```json
{
  "scripts": {
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "start:prod": "node dist/main",
    "build": "nest build",
    "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand",
    "test:e2e": "jest --config ./test/jest-e2e.json",
    "typeorm": "typeorm-ts-node-esm",
    "migration:create": "typeorm migration:create",
    "migration:run": "npm run typeorm migration:run",
    "migration:revert": "npm run typeorm migration:revert",
    "docker:up": "docker-compose up -d",
    "docker:down": "docker-compose down",
    "docker:logs": "docker-compose logs -f"
  }
}
```

---

## 16. Testing Examples

### 16.1 Unit Test

```typescript
// src/patients/patients.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PatientsService } from './patients.service';
import { PatientEntity } from './entities/patient.entity';

describe('PatientsService', () => {
  let service: PatientsService;
  let mockRepository: any;

  beforeEach(async () => {
    mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatientsService,
        {
          provide: getRepositoryToken(PatientEntity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<PatientsService>(PatientsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create patient with auto-generated MRN', async () => {
      const createPatientDto = {
        name: 'John Doe',
        dateOfBirth: '1985-03-15',
      };

      const mockPatient = {
        id: 'uuid',
        mrn: 'MRN-123456',
        ...createPatientDto,
      };

      mockRepository.create.mockReturnValue(mockPatient);
      mockRepository.save.mockResolvedValue(mockPatient);

      const result = await service.create(createPatientDto, 'creator-id');

      expect(result.mrn).toBeDefined();
      expect(result.mrn).toMatch(/^MRN-/);
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });
});
```

---

## 17. Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Redis server running
- [ ] SSL/TLS certificates installed
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Logging configured
- [ ] Error handling tested
- [ ] API documentation accessible
- [ ] Health check endpoints working
- [ ] Third-party API credentials configured
- [ ] Backup strategy in place
- [ ] HIPAA audit logging enabled
- [ ] Database encryption enabled
- [ ] Monitoring & alerting setup
- [ ] Load balancing configured (if needed)

---

## 18. MongoDB Setup & Configuration

### 18.1 MongoDB Overview

MongoDB is a NoSQL document database optimized for:
- **Chat Messages** - Flexible schema for different message types
- **Conversations** - Fast queries for real-time chat
- **Real-time Data** - High write throughput for live updates
- **Scalability** - Horizontal scaling with sharding
- **Flexibility** - Dynamic document structure for evolving data

### 18.2 MongoDB Setup Options

#### Option 1: MongoDB Atlas (Recommended for Production)

1. **Create MongoDB Atlas Account**
   - Visit https://www.mongodb.com/cloud/atlas
   - Sign up and create a cluster
   - Choose cloud provider and region (same as Google Cloud Run)
   - Select M2 or higher tier for production

2. **Connection String**
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/consentmd?retryWrites=true&w=majority
   ```

3. **Environment Variables**
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/consentmd
   MONGODB_RETRIES=3
   MONGODB_TIMEOUT=30000
   ```

#### Option 2: Self-Hosted MongoDB

```bash
# Docker Compose
docker run -d \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  -v mongodb_data:/data/db \
  mongo:latest
```

### 18.3 NestJS MongoDB Configuration

**Installation:**
```bash
npm install @nestjs/mongoose mongoose
npm install -D @types/mongoose
```

**MongooseModule Configuration (app.module.ts):**

```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI, {
      retryAttempts: 3,
      retryDelay: 5000,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    }),
    // Other modules
  ],
})
export class AppModule {}
```

### 18.4 MongoDB Collections & Indexes

**Create Collections & Indexes:**

```javascript
// messages.collection.js
db.createCollection('messages', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['conversationId', 'senderId', 'content', 'timestamp'],
      properties: {
        _id: { bsonType: 'objectId' },
        conversationId: { bsonType: 'objectId' },
        senderId: { bsonType: 'string' },
        content: { bsonType: 'string' },
        type: { bsonType: 'string' },
        metadata: { bsonType: 'object' },
        isRead: { bsonType: 'bool' },
        timestamp: { bsonType: 'date' }
      }
    }
  }
});

// Create indexes for performance
db.messages.createIndex({ conversationId: 1, timestamp: -1 });
db.messages.createIndex({ senderId: 1, timestamp: -1 });
db.messages.createIndex({ timestamp: 1 }, { expireAfterSeconds: 7776000 }); // 90 days TTL

// conversations.collection.js
db.createCollection('conversations', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'type', 'participants'],
      properties: {
        _id: { bsonType: 'objectId' },
        name: { bsonType: 'string' },
        type: { bsonType: 'string' },
        participants: { bsonType: 'array' },
        lastMessage: { bsonType: 'string' },
        lastMessageTime: { bsonType: 'date' },
        createdAt: { bsonType: 'date' },
        updatedAt: { bsonType: 'date' }
      }
    }
  }
});

db.conversations.createIndex({ participants: 1 });
db.conversations.createIndex({ lastMessageTime: -1 });
```

### 18.5 Mongoose Schema Examples

**See Section 4: TypeORM Entities (now Mongoose Schemas) for complete schema definitions**

### 18.6 Connection Pooling

MongoDB automatically manages connection pooling:

```typescript
// Connection pool settings in MongooseModule
MongooseModule.forRoot(process.env.MONGODB_URI, {
  maxPoolSize: 50,      // Maximum connections
  minPoolSize: 10,      // Minimum connections
  maxIdleTimeMS: 45000, // Kill idle connections
  waitQueueTimeoutMS: 10000,
})
```

### 18.7 Data Backups

**MongoDB Atlas Automated Backups:**
- Daily snapshots (included)
- Point-in-time restore (14 days default)
- Manual snapshots available

**Export Backups to GCS:**
```bash
# Export collection to GCS
mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/consentmd" \
  --gzip \
  --archive=backup.gz

# Upload to GCS
gsutil cp backup.gz gs://consentmd-backups/
```

### 18.8 Monitoring & Performance

**Enable MongoDB Monitoring:**
- Atlas automatically monitors
- View in Atlas dashboard
- Set up alerts for CPU, memory, connections

**Query Optimization:**
```typescript
// Add indexes for frequent queries
db.messages.createIndex({ conversationId: 1, timestamp: -1 });
db.conversations.createIndex({ participants: 1, lastMessageTime: -1 });
```

### 18.9 Migration from SQL (if needed)

If migrating from SQL:
```bash
# 1. Export from PostgreSQL as JSON
psql -h host -U user -d dbname \
  -c "COPY (SELECT row_to_json(t) FROM table_name t) TO STDOUT" > data.json

# 2. Transform JSON structure to match MongoDB schema
# 3. Import to MongoDB
mongoimport --uri="mongodb+srv://user:pass@cluster" \
  --collection=collection_name \
  --file=data.json \
  --jsonArray
```

---

## 19. Google Cloud Storage (S3-Compatible) Setup

### 19.1 Configuration & Integration

Google Cloud Storage provides S3-compatible API for file storage.

**1. GCS Setup**
   ```bash
   # Create storage bucket
   gsutil mb -b on gs://consentmd-bucket

   # Set bucket CORS
   gsutil cors set gcs-cors.json gs://consentmd-bucket
   ```

**2. CORS Configuration (gcs-cors.json)**
   ```json
   [
     {
       "origin": ["https://consentmd.example.com"],
       "method": ["GET", "HEAD", "DELETE", "PUT", "POST"],
       "responseHeader": ["Content-Type", "x-goog-meta-*"],
       "maxAgeSeconds": 3600
     }
   ]
   ```

**3. Storage Service (storage.service.ts)**
   ```typescript
   import { Injectable } from '@nestjs/common';
   import { Storage } from '@google-cloud/storage';
   import { ConfigService } from '@nestjs/config';
   import * as path from 'path';

   @Injectable()
   export class StorageService {
     private storage: Storage;
     private bucket: string;

     constructor(private configService: ConfigService) {
       this.storage = new Storage({
         projectId: this.configService.get('GOOGLE_CLOUD_PROJECT_ID'),
         keyFilename: this.configService.get('GOOGLE_CLOUD_KEY_FILE'),
       });
       this.bucket = this.configService.get('GCS_BUCKET_NAME');
     }

     async uploadFile(
       file: Express.Multer.File,
       folder: string,
       fileName?: string
     ): Promise<{ url: string; path: string }> {
       const bucket = this.storage.bucket(this.bucket);
       const timestamp = Date.now();
       const safeFileName = fileName || `${timestamp}-${file.originalname}`;
       const filePath = `${folder}/${safeFileName}`;

       const file_obj = bucket.file(filePath);

       await file_obj.save(file.buffer, {
         metadata: {
           contentType: file.mimetype,
         },
         public: false,
       });

       // Generate signed URL (valid for 7 days)
       const [url] = await file_obj.getSignedUrl({
         version: 'v4',
         action: 'read',
         expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
       });

       return { url, path: filePath };
     }

     async deleteFile(filePath: string): Promise<void> {
       const bucket = this.storage.bucket(this.bucket);
       await bucket.file(filePath).delete();
     }

     async getSignedUrl(
       filePath: string,
       expirationDays: number = 7
     ): Promise<string> {
       const bucket = this.storage.bucket(this.bucket);
       const [url] = await bucket.file(filePath).getSignedUrl({
         version: 'v4',
         action: 'read',
         expires: Date.now() + expirationDays * 24 * 60 * 60 * 1000,
       });
       return url;
     }

     async uploadBase64(
       base64Data: string,
       folder: string,
       fileName: string
     ): Promise<{ url: string; path: string }> {
       const bucket = this.storage.bucket(this.bucket);
       const filePath = `${folder}/${fileName}`;
       const buffer = Buffer.from(base64Data, 'base64');

       const file_obj = bucket.file(filePath);
       await file_obj.save(buffer, {
         metadata: {
           contentType: 'application/octet-stream',
         },
       });

       const [url] = await file_obj.getSignedUrl({
         version: 'v4',
         action: 'read',
         expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
       });

       return { url, path: filePath };
     }
   }
   ```

**4. Files Module (files.controller.ts)**
   ```typescript
   import { Controller, Post, Delete, Param, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
   import { FileInterceptor } from '@nestjs/platform-express';
   import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
   import { StorageService } from './storage.service';
   import { ApiConsumes, ApiBody, ApiBearerAuth } from '@nestjs/swagger';

   @Controller('files')
   @UseGuards(JwtAuthGuard)
   export class FilesController {
     constructor(private storageService: StorageService) {}

     @Post('upload/:folder')
     @UseInterceptors(FileInterceptor('file'))
     @ApiConsumes('multipart/form-data')
     @ApiBearerAuth()
     async uploadFile(
       @UploadedFile() file: Express.Multer.File,
       @Param('folder') folder: string
     ) {
       return this.storageService.uploadFile(file, folder);
     }

     @Delete(':filePath')
     @ApiBearerAuth()
     async deleteFile(@Param('filePath') filePath: string) {
       await this.storageService.deleteFile(filePath);
       return { message: 'File deleted successfully' };
     }
   }
   ```

**5. Environment Variables**
   ```env
   # Google Cloud Storage
   GOOGLE_CLOUD_PROJECT_ID=your-project-id
   GOOGLE_CLOUD_KEY_FILE=path/to/service-account-key.json
   GCS_BUCKET_NAME=consentmd-bucket
   GCS_BUCKET_URL=https://storage.googleapis.com/consentmd-bucket
   ```

---

## 20. Real-Time Notification Services

### 20.1 Architecture Overview

ConsentMD implements multi-channel notifications:
- **In-app:** Real-time via WebSockets
- **Push:** Firebase Cloud Messaging (FCM)
- **Email:** SendGrid or Nodemailer
- **SMS:** Twilio (already configured)

### 20.2 Notification Types

```typescript
enum NotificationType {
  MESSAGE = 'message',
  CALL_INCOMING = 'call_incoming',
  CALL_MISSED = 'call_missed',
  PATIENT_ALERT = 'patient_alert',
  APPOINTMENT_REMINDER = 'appointment_reminder',
  NOTE_SHARED = 'note_shared',
  TEAM_INVITE = 'team_invite',
  SYSTEM_ALERT = 'system_alert',
  PRESCRIPTION_READY = 'prescription_ready',
  LAB_RESULTS = 'lab_results',
}

export interface NotificationPayload {
  type: NotificationType;
  userId: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  action?: string;
  timestamp: Date;
}
```

### 20.3 Notification Service Implementation

```typescript
// notifications.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { admin } from 'firebase-admin';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { NotificationEntity } from './entities/notification.entity';
import { GatewayService } from '../gateway/gateway.service';

@Injectable()
export class NotificationsService {
  private emailTransporter: nodemailer.Transporter;

  constructor(
    @InjectRepository(NotificationEntity)
    private notificationRepo: Repository<NotificationEntity>,
    private configService: ConfigService,
    private gatewayService: GatewayService,
  ) {
    // Initialize email transporter
    this.emailTransporter = nodemailer.createTransport({
      service: 'gmail', // or use SendGrid
      auth: {
        user: this.configService.get('EMAIL_USER'),
        pass: this.configService.get('EMAIL_PASSWORD'),
      },
    });
  }

  // Send real-time in-app notification
  async sendInAppNotification(payload: NotificationPayload): Promise<void> {
    // Save to database
    await this.notificationRepo.save({
      userId: payload.userId,
      type: payload.type,
      title: payload.title,
      body: payload.body,
      data: payload.data,
      isRead: false,
      createdAt: new Date(),
    });

    // Emit via WebSocket to connected user
    this.gatewayService.emitNotification(payload.userId, payload);
  }

  // Send Firebase Cloud Messaging (push notification)
  async sendPushNotification(
    userId: string,
    title: string,
    body: string,
    data?: Record<string, any>,
  ): Promise<void> {
    try {
      const user = await this.getUserFCMToken(userId);
      if (!user?.fcmToken) return;

      await admin.messaging().send({
        token: user.fcmToken,
        notification: { title, body },
        data: data || {},
        webpush: {
          fcmOptions: {
            link: '/notifications',
          },
          notification: {
            title,
            body,
            icon: '/logo.png',
          },
        },
      });
    } catch (error) {
      console.error('FCM send error:', error);
    }
  }

  // Send email notification
  async sendEmailNotification(
    email: string,
    subject: string,
    htmlBody: string,
  ): Promise<void> {
    try {
      await this.emailTransporter.sendMail({
        from: this.configService.get('EMAIL_USER'),
        to: email,
        subject,
        html: htmlBody,
      });
    } catch (error) {
      console.error('Email send error:', error);
    }
  }

  // Send SMS notification (Twilio)
  async sendSmsNotification(
    phoneNumber: string,
    message: string,
  ): Promise<void> {
    // Use Twilio service
    // Implementation in separate SMS service
  }

  // Get user's FCM token
  private async getUserFCMToken(userId: string): Promise<any> {
    // Query user from database and return FCM token
    return null; // Implement based on User entity
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<void> {
    await this.notificationRepo.update(notificationId, { isRead: true });
  }

  // Get user notifications
  async getUserNotifications(
    userId: string,
    limit: number = 20,
  ): Promise<NotificationEntity[]> {
    return this.notificationRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
```

### 20.4 WebSocket Gateway Enhancement for Notifications

```typescript
// gateway.service.ts - Add to existing Chat Gateway
import { WebSocketGateway, WebSocketServer, SubscribeMessage } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ namespace: '/notifications' })
export class NotificationGateway {
  @WebSocketServer() server: Server;

  private userSockets = new Map<string, Socket>();

  handleConnection(client: Socket) {
    const userId = client.handshake.auth.userId;
    if (userId) {
      this.userSockets.set(userId, client);
      client.emit('connected', { message: 'Connected to notifications' });
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.handshake.auth.userId;
    this.userSockets.delete(userId);
  }

  emitNotification(userId: string, payload: NotificationPayload) {
    const userSocket = this.userSockets.get(userId);
    if (userSocket) {
      userSocket.emit('notification', payload);
    }
  }

  @SubscribeMessage('notification:acknowledge')
  handleNotificationAck(client: Socket, data: { notificationId: string }) {
    // Mark notification as delivered
  }

  // Broadcast to multiple users
  broadcastNotification(userIds: string[], payload: NotificationPayload) {
    userIds.forEach(userId => this.emitNotification(userId, payload));
  }
}
```

### 20.5 Notification Entity

```typescript
// notification.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../users/entities/user.entity';

@Entity('notifications')
export class NotificationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.notifications, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  userId: string;

  @Column('enum', {
    enum: NotificationType,
    default: NotificationType.SYSTEM_ALERT,
  })
  type: NotificationType;

  @Column()
  title: string;

  @Column('text')
  body: string;

  @Column('jsonb', { nullable: true })
  data?: Record<string, any>;

  @Column({ default: false })
  isRead: boolean;

  @Column({ nullable: true })
  readAt?: Date;

  @Column({ nullable: true })
  action?: string;

  @CreateDateColumn()
  createdAt: Date;
}
```

### 20.6 Notification Controller

```typescript
// notifications.controller.ts
import { Controller, Get, Put, Param, UseGuards, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { NotificationsService } from './notifications.service';
import { User } from '../users/entities/user.entity';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  async getMyNotifications(
    @CurrentUser() user: User,
    @Query('limit') limit: number = 20,
  ) {
    return this.notificationsService.getUserNotifications(user.id, limit);
  }

  @Put(':id/read')
  async markAsRead(@Param('id') notificationId: string) {
    await this.notificationsService.markAsRead(notificationId);
    return { message: 'Notification marked as read' };
  }

  @Get('unread/count')
  async getUnreadCount(@CurrentUser() user: User) {
    return this.notificationsService.getUnreadCount(user.id);
  }
}
```

### 20.7 Environment Variables for Notifications

```env
# Firebase Cloud Messaging
FIREBASE_PROJECT_ID=your-firebase-project
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email

# Email Configuration
EMAIL_USER=noreply@consentmd.com
EMAIL_PASSWORD=your-email-password
EMAIL_FROM=ConsentMD <noreply@consentmd.com>

# Notification Preferences
NOTIFICATION_RETENTION_DAYS=30
MAX_RETRY_ATTEMPTS=3
```

---

## 21. Google Cloud Deployment

### 21.1 Cloud Run Deployment

**1. Build & Push Docker Image**
   ```bash
   # Build image
   docker build -t consentmd-backend .

   # Tag image for Artifact Registry
   docker tag consentmd-backend us-central1-docker.pkg.dev/PROJECT_ID/consentmd/backend:latest

   # Push to Artifact Registry
   docker push us-central1-docker.pkg.dev/PROJECT_ID/consentmd/backend:latest

   # Deploy to Cloud Run
   gcloud run deploy consentmd-backend \
     --image us-central1-docker.pkg.dev/PROJECT_ID/consentmd/backend:latest \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --set-env-vars "NODE_ENV=production,DATABASE_URL=..." \
     --memory 512Mi \
     --cpu 1 \
     --timeout 60s
   ```

**2. Cloud Run Configuration (cloudbuild.yaml)**
   ```yaml
   steps:
     # Build Docker image
     - name: 'gcr.io/cloud-builders/docker'
       args: ['build', '-t', 'us-central1-docker.pkg.dev/$PROJECT_ID/consentmd/backend:$SHORT_SHA', '.']

     # Push to Artifact Registry
     - name: 'gcr.io/cloud-builders/docker'
       args: ['push', 'us-central1-docker.pkg.dev/$PROJECT_ID/consentmd/backend:$SHORT_SHA']

     # Deploy to Cloud Run
     - name: 'gcr.io/cloud-builders/gke-deploy'
       args:
         - 'run'
         - '--filename=k8s/'
         - '--image=us-central1-docker.pkg.dev/$PROJECT_ID/consentmd/backend:$SHORT_SHA'
         - '--location=us-central1'
         - '--cluster=consentmd-cluster'

   images:
     - 'us-central1-docker.pkg.dev/$PROJECT_ID/consentmd/backend:$SHORT_SHA'
   ```

**3. Dockerfile for Cloud Run**
   ```dockerfile
   FROM node:18-alpine

   WORKDIR /app

   # Install dependencies
   COPY package*.json ./
   RUN npm ci --only=production

   # Copy application
   COPY . .

   # Build TypeScript
   RUN npm run build

   # Health check
   HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
     CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

   EXPOSE 3000

   CMD ["node", "dist/main.js"]
   ```

### 21.2 Cloud SQL Proxy for Neon (Optional)

If using Cloud SQL Proxy for connection pooling:

```bash
# Install Cloud SQL Proxy
curl -o cloud-sql-proxy https://dl.google.com/cloudsql/cloud_sql_proxy.linux.amd64
chmod +x cloud-sql-proxy

# Run in container
./cloud-sql-proxy <INSTANCE_CONNECTION_NAME> --port=5432
```

### 21.3 Environment Setup Script

```bash
#!/bin/bash
# gcloud-setup.sh

PROJECT_ID="your-project-id"
REGION="us-central1"

# Create service account
gcloud iam service-accounts create consentmd-backend \
  --display-name="ConsentMD Backend"

# Grant permissions
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member=serviceAccount:consentmd-backend@$PROJECT_ID.iam.gserviceaccount.com \
  --role=roles/storage.admin

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member=serviceAccount:consentmd-backend@$PROJECT_ID.iam.gserviceaccount.com \
  --role=roles/cloudmessaging.admin

# Create and download service account key
gcloud iam service-accounts keys create service-account-key.json \
  --iam-account=consentmd-backend@$PROJECT_ID.iam.gserviceaccount.com

# Set up Cloud Run secrets
gcloud secrets create database-url --data-file=- <<< "your-neon-connection-string"
gcloud secrets create firebase-key --data-file=service-account-key.json
```

---

## 22. Monitoring, Logging & Security

### 22.1 Google Cloud Project Setup

#### Enable Required APIs

```bash
# Enable all required Google Cloud APIs
gcloud services enable run.googleapis.com
gcloud services enable storage-api.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable artifactregistry.googleapis.com
gcloud services enable firebase.googleapis.com
gcloud services enable cloudmessaging.googleapis.com
gcloud services enable sqladmin.googleapis.com
gcloud services enable secretmanager.googleapis.com
gcloud services enable logging.googleapis.com
gcloud services enable monitoring.googleapis.com
gcloud services enable pubsub.googleapis.com
```

#### Create Service Accounts

```bash
# Create backend service account
gcloud iam service-accounts create consentmd-backend \
  --display-name="ConsentMD Backend Service"

# Create CI/CD service account
gcloud iam service-accounts create consentmd-cicd \
  --display-name="ConsentMD CI/CD Service"

# Grant permissions to backend service account
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member=serviceAccount:consentmd-backend@YOUR_PROJECT_ID.iam.gserviceaccount.com \
  --role=roles/storage.objectAdmin

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member=serviceAccount:consentmd-backend@YOUR_PROJECT_ID.iam.gserviceaccount.com \
  --role=roles/cloudmessaging.admin

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member=serviceAccount:consentmd-backend@YOUR_PROJECT_ID.iam.gserviceaccount.com \
  --role=roles/secretmanager.secretAccessor

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member=serviceAccount:consentmd-backend@YOUR_PROJECT_ID.iam.gserviceaccount.com \
  --role=roles/logging.logWriter

# Grant permissions to CI/CD service account
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member=serviceAccount:consentmd-cicd@YOUR_PROJECT_ID.iam.gserviceaccount.com \
  --role=roles/run.admin

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member=serviceAccount:consentmd-cicd@YOUR_PROJECT_ID.iam.gserviceaccount.com \
  --role=roles/storage.admin

# Create and download service account keys
gcloud iam service-accounts keys create backend-key.json \
  --iam-account=consentmd-backend@YOUR_PROJECT_ID.iam.gserviceaccount.com

gcloud iam service-accounts keys create cicd-key.json \
  --iam-account=consentmd-cicd@YOUR_PROJECT_ID.iam.gserviceaccount.com
```

### 22.2 Cloud Logging Setup

#### View Service Logs

```bash
# View logs for Cloud Run service
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=consentmd-backend" \
  --limit 50 \
  --format json

# Tail logs in real-time
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=consentmd-backend" \
  --follow \
  --format "table(timestamp, textPayload)" \
  --limit 100
```

#### Create Log Sinks

```bash
# Create sink to Cloud Pub/Sub for critical errors
gcloud logging sinks create critical-errors-sink pubsub.googleapis.com/projects/$PROJECT_ID/topics/critical-errors \
  --log-filter='severity >= ERROR'

# Create sink to BigQuery for analysis
gcloud logging sinks create all-logs-bigquery \
  bigquery.googleapis.com/projects/$PROJECT_ID/datasets/logs \
  --log-filter='resource.type=cloud_run_revision'

# Create audit log sink
gcloud logging sinks create audit-logs \
  bigquery.googleapis.com/projects/$PROJECT_ID/datasets/audit_logs \
  --log-filter='protoPayload.serviceName="storage.googleapis.com"'
```

### 22.3 Cloud Monitoring Setup

#### Create Uptime Checks

```bash
# Create uptime check for API health
gcloud monitoring uptime-checks create \
  --display-name="ConsentMD API Health" \
  --resource-type="uptime-url" \
  --monitored-url="https://YOUR-SERVICE-URL/health" \
  --http-check-use-ssl \
  --selected-regions="USA" \
  --period=60
```

#### View Metrics

```bash
# Monitor Cloud Run metrics
gcloud monitoring time-series list \
  --filter='metric.type="run.googleapis.com/request_count"'

# Check request latencies
gcloud monitoring time-series list \
  --filter='metric.type="run.googleapis.com/request_latencies"'

# Check concurrent requests
gcloud monitoring time-series list \
  --filter='metric.type="run.googleapis.com/instance_count"'
```

### 22.4 Secret Management

#### Store Secrets in Google Cloud Secret Manager

```bash
# Create secrets
gcloud secrets create DATABASE_URL \
  --replication-policy="automatic" \
  --data-file=- <<< "postgresql://user:password@ep-xxxx.neon.tech/neon?sslmode=require"

gcloud secrets create JWT_SECRET \
  --replication-policy="automatic" \
  --data-file=- <<< "your_super_secure_jwt_secret_key_here_min_32_chars"

gcloud secrets create FIREBASE_KEY \
  --replication-policy="automatic" \
  --data-file=firebase-key.json

gcloud secrets create GEMINI_API_KEY \
  --replication-policy="automatic" \
  --data-file=- <<< "your_gemini_api_key"

# Grant backend service account access
for secret in DATABASE_URL JWT_SECRET FIREBASE_KEY GEMINI_API_KEY; do
  gcloud secrets add-iam-policy-binding $secret \
    --member=serviceAccount:consentmd-backend@YOUR_PROJECT_ID.iam.gserviceaccount.com \
    --role=roles/secretmanager.secretAccessor
done

# Verify secrets
gcloud secrets versions access latest --secret="DATABASE_URL"
```

#### Use Secrets in Cloud Run

```bash
gcloud run deploy consentmd-backend \
  --image us-central1-docker.pkg.dev/YOUR_PROJECT_ID/consentmd/backend:latest \
  --update-secrets=DATABASE_URL=DATABASE_URL:latest \
  --update-secrets=JWT_SECRET=JWT_SECRET:latest \
  --update-secrets=FIREBASE_KEY=FIREBASE_KEY:latest \
  --update-secrets=GEMINI_API_KEY=GEMINI_API_KEY:latest
```

### 22.5 Network Security

#### Configure Firewall Rules

```bash
# Create VPC network
gcloud compute networks create consentmd-network \
  --subnet-mode=custom

# Create subnet
gcloud compute networks subnets create consentmd-subnet \
  --network=consentmd-network \
  --range=10.0.1.0/24 \
  --region=us-central1

# Create Cloud Armor security policy
gcloud compute security-policies create consentmd-policy \
  --description="ConsentMD API protection"

# Allow legitimate traffic
gcloud compute security-policies rules create 100 \
  --security-policy=consentmd-policy \
  --action=allow \
  --priority=100

# Rate limiting rule (100 requests per minute per IP)
gcloud compute security-policies rules create 110 \
  --security-policy=consentmd-policy \
  --action=rate-based-ban \
  --rate-limit-options-enforced-on-key=IP \
  --rate-limit-options-exceed-action=deny-429 \
  --rate-limit-options-rate-limit-threshold-count=100 \
  --rate-limit-options-rate-limit-threshold-interval-sec=60 \
  --ban-durationSec=600
```

### 22.6 HIPAA Compliance

#### Data Encryption at Rest

```bash
# Verify GCS bucket encryption
gsutil encryption get gs://consentmd-bucket

# Verify database encryption (Neon has encryption by default)
# Check in Neon console for encryption status
```

#### Data Residency

```bash
# Ensure all resources are in US regions for HIPAA compliance
# - Google Cloud Run: us-central1 or us-east1
# - Neon Database: US region
# - GCS Bucket: US multi-region
# - Artifact Registry: us-central1
```

#### Enable Versioning & Soft-Delete

```bash
# Enable versioning for data recovery
gsutil versioning set on gs://consentmd-bucket

# Set lifecycle policy
cat > gcs-lifecycle.json <<EOF
{
  "lifecycle": {
    "rule": [
      {
        "action": {"type": "Delete"},
        "condition": {"numNewerVersions": 3, "isLive": false}
      }
    ]
  }
}
EOF

gsutil lifecycle set gcs-lifecycle.json gs://consentmd-bucket
```

#### Audit Logging

```bash
# Enable access logging for all data access
gcloud storage buckets update gs://consentmd-bucket \
  --enable-object-hold

# View access logs
gcloud logging read "resource.type=gcs_bucket AND resource.labels.bucket_name=consentmd-bucket" \
  --format=json
```

### 22.7 Troubleshooting Common Issues

#### Cloud Run Service Timeout

```bash
# Increase timeout to 60s (max is 3600s)
gcloud run deploy consentmd-backend \
  --timeout 60s
```

#### Permission Denied Accessing GCS

```bash
# Check service account permissions
gcloud projects get-iam-policy YOUR_PROJECT_ID \
  --flatten="bindings[].members" \
  --filter="bindings.members:serviceAccount:consentmd-backend@*"

# Grant missing permissions
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member=serviceAccount:consentmd-backend@YOUR_PROJECT_ID.iam.gserviceaccount.com \
  --role=roles/storage.objectAdmin
```

#### Database Connection Failures

```bash
# Verify Neon connection string format
# postgresql://user:password@ep-xxxx-region.neon.tech/database?sslmode=require

# Test connection locally
psql "postgresql://user:password@ep-xxxx.neon.tech/neon?sslmode=require"

# Check connection pool limits in Neon dashboard
```

#### FCM Token Issues

```bash
# Verify Firebase credentials
gcloud firebase projects list

# Check service account has messaging permissions
gcloud projects get-iam-policy YOUR_PROJECT_ID \
  --flatten="bindings[].members" \
  --filter="bindings.members:*firebase*"
```

---

## 23. Development Workflow Commands

```bash
# Generate a new module
nest g resource patients

# Generate a service
nest g service auth

# Generate a controller
nest g controller chats

# Generate a guard
nest g guard auth/guards/jwt-auth

# Generate an interceptor
nest g interceptor common/interceptors/logging

# Run development server with hot reload
npm run start:dev

# Run tests with coverage
npm run test:cov

# Format code
npm run format

# Lint and fix
npm run lint

# Run migrations
npm run migration:run

# Docker operations
docker-compose up -d      # Start services
docker-compose down       # Stop services
docker-compose logs -f    # View logs
```

---

**Document Version:** 2.0 (Google Cloud & Notifications Ready)
**Last Updated:** February 2026
**Framework:** NestJS 10.x
**Database:** Neon (PostgreSQL serverless)
**Deployment:** Google Cloud Run
**Storage:** Google Cloud Storage (S3-compatible)
**Status:** Production Ready
**Total API Endpoints:** 60+
**Total Database Tables:** 15 (with notifications table)
**Real-time Features:** WebSocket support + FCM push notifications
**Notification Channels:** In-app, Push (FCM), Email, SMS (Twilio)
**AI Integration:** Gemini API ready
**Communication:** 100ms (calls/video) & Twilio (SMS) ready
**Cloud Services:** Cloud Run, Artifact Registry, Cloud Storage, Cloud Messaging, Cloud Build
