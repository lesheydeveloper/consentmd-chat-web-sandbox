# ConsentMD - NestJS Backend Setup & Architecture Guide

## Project Overview

ConsentMD backend built with NestJS - A progressive Node.js framework for building efficient, scalable, and maintainable server-side applications.

**Technology Stack:**
- **Framework:** NestJS 10.x
- **Language:** TypeScript
- **Database:** PostgreSQL with TypeORM
- **Authentication:** JWT + Passport.js
- **API Documentation:** Swagger/OpenAPI
- **Real-time:** WebSockets (Socket.IO)
- **Cache:** Redis
- **Task Queue:** Bull (for async jobs)
- **AI Integration:** Google Gemini API
- **Communication:** 100ms SDK, Twilio SDK
- **Testing:** Jest
- **Validation:** class-validator, class-transformer

---

## 1. Project Setup

### 1.1 Installation & Initial Setup

```bash
# Install NestJS CLI globally
npm install -g @nestjs/cli

# Create new NestJS project
nest new consentmd-backend
cd consentmd-backend

# Install additional dependencies
npm install @nestjs/typeorm typeorm pg
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
npm install @nestjs/websockets @nestjs/platform-socket.io socket.io
npm install @nestjs/redis redis
npm install @nestjs/bull bull
npm install @nestjs/swagger swagger-ui-express
npm install class-validator class-transformer
npm install axios dotenv joi
npm install @google/generative-ai
npm install twilio
npm install 100ms-web
npm install bcryptjs speakeasy qrcode

# Dev dependencies
npm install -D @types/express @types/node
npm install -D jest @types/jest ts-jest
npm install -D @nestjs/testing
npm install -D prettier eslint
```

### 1.2 Project Structure

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
│   │   └── decorators/
│   │       ├── current-user.decorator.ts
│   │       └── roles.decorator.ts
│   │
│   ├── users/                         # Users module
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── users.module.ts
│   │   ├── entities/
│   │   │   └── user.entity.ts
│   │   └── dto/
│   │       ├── create-user.dto.ts
│   │       ├── update-user.dto.ts
│   │       └── user.dto.ts
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
│   │   ├── dto/
│   │   │   ├── create-chat.dto.ts
│   │   │   ├── send-message.dto.ts
│   │   │   └── update-chat.dto.ts
│   │   └── gateways/
│   │       └── chat.gateway.ts
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
│   │   │   └── rate-limit.guard.ts
│   │   └── constants/
│   │       └── constants.ts
│   │
│   ├── config/
│   │   ├── database.config.ts
│   │   ├── typeorm.config.ts
│   │   ├── jwt.config.ts
│   │   ├── redis.config.ts
│   │   └── env.validation.ts
│   │
│   ├── shared/
│   │   ├── services/
│   │   │   ├── gemini.service.ts
│   │   │   ├── hundred-ms.service.ts
│   │   │   └── twilio.service.ts
│   │   └── dto/
│   │       └── pagination.dto.ts
│   │
│   ├── app.module.ts
│   ├── app.controller.ts
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

## 2. Core Configuration Files

### 2.1 main.ts

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
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
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}

bootstrap();
```

### 2.2 app.module.ts

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from '@nestjs/redis';
import { BullModule } from '@nestjs/bull';
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

### 2.3 config/typeorm.config.ts

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
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV !== 'production',
};
```

### 2.4 config/env.validation.ts

```typescript
import * as joi from 'joi';

export const envValidation = joi.object({
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
});
```

---

## 3. Entity Examples

### 3.1 User Entity

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

### 3.2 Patient Entity

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

---

## 4. Service Examples

### 4.1 Auth Service

```typescript
// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
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

  async login(user: any) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: process.env.JWT_REFRESH_EXPIRATION,
      }),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const newAccessToken = this.jwtService.sign(
        { sub: payload.sub, email: payload.email, role: payload.role },
      );

      return { accessToken: newAccessToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
```

### 4.2 Patients Service

```typescript
// src/patients/patients.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PatientEntity } from './entities/patient.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { generateMRN } from '../common/utils/mrn.util';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(PatientEntity)
    private patientsRepository: Repository<PatientEntity>,
  ) {}

  async create(createPatientDto: CreatePatientDto, createdBy: string) {
    const mrn = generateMRN();

    const patient = this.patientsRepository.create({
      ...createPatientDto,
      mrn,
      createdBy: { id: createdBy },
    });

    return await this.patientsRepository.save(patient);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
  ) {
    const query = this.patientsRepository.createQueryBuilder('patient')
      .leftJoinAndSelect('patient.user', 'user')
      .leftJoinAndSelect('patient.diagnoses', 'diagnoses')
      .leftJoinAndSelect('patient.medications', 'medications')
      .leftJoinAndSelect('patient.allergies', 'allergies');

    if (search) {
      query.where(
        'patient.mrn ILIKE :search OR user.name ILIKE :search',
        { search: `%${search}%` },
      );
    }

    const [data, total] = await query
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

  async findById(id: string) {
    const patient = await this.patientsRepository.findOne({
      where: { id },
      relations: ['user', 'diagnoses', 'medications', 'allergies', 'vitals'],
    });

    if (!patient) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }

    return patient;
  }

  async findByMRN(mrn: string) {
    const patient = await this.patientsRepository.findOne({
      where: { mrn },
      relations: ['user', 'diagnoses', 'medications', 'allergies', 'vitals'],
    });

    if (!patient) {
      throw new NotFoundException(`Patient with MRN ${mrn} not found`);
    }

    return patient;
  }

  async update(id: string, updatePatientDto: UpdatePatientDto) {
    const patient = await this.findById(id);

    Object.assign(patient, updatePatientDto);

    return await this.patientsRepository.save(patient);
  }

  async delete(id: string) {
    const patient = await this.findById(id);
    return await this.patientsRepository.remove(patient);
  }
}
```

### 4.3 Scribe Service (Gemini Integration)

```typescript
// src/scribe/scribe.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ChatsService } from '../chats/chats.service';
import { ClinicalNotesService } from '../clinical-notes/clinical-notes.service';
import { GenerateNoteDto } from './dto/generate-note.dto';

@Injectable()
export class ScribeService {
  private genAI: GoogleGenerativeAI;

  constructor(
    private configService: ConfigService,
    private chatsService: ChatsService,
    private notesService: ClinicalNotesService,
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async generateNoteFromChat(generateNoteDto: GenerateNoteDto) {
    const { chatId, templateType, consultationType, visitReason } =
      generateNoteDto;

    // Get chat messages
    const chat = await this.chatsService.findById(chatId);
    const messages = chat.messages.map((m) => ({
      sender: m.sender.name,
      role: m.sender.role,
      content: m.content,
    }));

    // Build prompt
    const prompt = this.buildPrompt(
      messages,
      templateType,
      consultationType,
      visitReason,
    );

    // Generate with Gemini
    const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Parse response
    const noteContent = JSON.parse(responseText);

    return {
      sections: noteContent,
      suggestions: this.generateSuggestions(noteContent),
    };
  }

  private buildPrompt(
    messages: any[],
    templateType: string,
    consultationType?: string,
    visitReason?: string,
  ): string {
    let prompt = `You are a medical AI assistant. Generate a clinical note in the "${templateType}" format.

Consultation Type: ${consultationType || 'General'}
Visit Reason: ${visitReason || 'Not specified'}

Chat History:
${messages.map((m) => `${m.sender} (${m.role}): ${m.content}`).join('\n')}

Generate a structured clinical note as JSON with these keys:
`;

    switch (templateType) {
      case 'soap':
        prompt += `subjective, objective, assessment, plan`;
        break;
      case 'apso':
        prompt += `assessment, plan, subjective, objective`;
        break;
      case 'comprehensive':
        prompt += `chief_complaint, hpi, ros, past_medical, medications, allergies, physical_exam, assessment, plan`;
        break;
      default:
        prompt += `subjective, objective, assessment, plan`;
    }

    prompt += `

Respond ONLY with valid JSON, no additional text.`;

    return prompt;
  }

  private generateSuggestions(noteContent: any): any[] {
    const suggestions = [];

    // Example: Extract medication mentions
    if (noteContent.plan) {
      const medicationMatches = noteContent.plan.match(
        /(?:prescribe|give|administer)\s+(\w+)/gi,
      );
      if (medicationMatches) {
        medicationMatches.forEach((match) => {
          suggestions.push({
            section: 'plan',
            type: 'medication',
            text: match,
          });
        });
      }
    }

    return suggestions;
  }

  async summarizeCall(callId: string, transcription: string) {
    const prompt = `Summarize the following medical call transcription:

${transcription}

Provide a concise summary with key points discussed.`;

    const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);

    return {
      summary: result.response.text(),
    };
  }
}
```

---

## 5. Controllers

### 5.1 Auth Controller

```typescript
// src/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Public } from './decorators/public.decorator';
import { LoginDto } from './dto/login.dto';

@Controller('api/v1/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    return this.authService.login(user);
  }

  @Public()
  @Post('register')
  async register(@Body() registerDto: any) {
    // Implementation
  }

  @Post('refresh')
  async refreshToken(@Request() req) {
    return this.authService.refreshToken(req.body.refreshToken);
  }
}
```

### 5.2 Patients Controller

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
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Patients')
@ApiBearer Auth()
@Controller('api/v1/patients')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PatientsController {
  constructor(private patientsService: PatientsService) {}

  @Post()
  @Roles(UserRole.DOCTOR, UserRole.NURSE, UserRole.ADMIN)
  async create(
    @Body() createPatientDto: CreatePatientDto,
    @CurrentUser() user: any,
  ) {
    return this.patientsService.create(createPatientDto, user.id);
  }

  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
  ) {
    return this.patientsService.findAll(page, limit, search);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.patientsService.findById(id);
  }

  @Put(':id')
  @Roles(UserRole.DOCTOR, UserRole.NURSE, UserRole.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() updatePatientDto: UpdatePatientDto,
  ) {
    return this.patientsService.update(id, updatePatientDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async delete(@Param('id') id: string) {
    return this.patientsService.delete(id);
  }
}
```

---

## 6. WebSocket Gateway (Chat)

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
import { ChatsService } from '../chats.service';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  server: Server;

  constructor(private chatsService: ChatsService) {}

  afterInit(server: Server) {
    this.server = server;
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join-chat')
  async handleJoinChat(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    const { chatId, userId } = data;
    client.join(`chat-${chatId}`);
    this.server.to(`chat-${chatId}`).emit('user-joined', { userId });
  }

  @SubscribeMessage('message')
  async handleMessage(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ) {
    const { chatId, content, senderId } = data;
    const message = await this.chatsService.sendMessage(chatId, {
      content,
      senderId,
      type: 'text',
    });
    this.server.to(`chat-${chatId}`).emit('message-received', message);
  }

  @SubscribeMessage('typing')
  handleTyping(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    const { chatId, userId, isTyping } = data;
    this.server
      .to(`chat-${chatId}`)
      .emit('user-typing', { userId, isTyping });
  }
}
```

---

## 7. Guards & Decorators

### 7.1 JWT Auth Guard

```typescript
// src/auth/guards/jwt-auth.guard.ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

### 7.2 Roles Guard

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

### 7.3 Current User Decorator

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

### 7.4 Roles Decorator

```typescript
// src/auth/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
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
  IsEmail,
  IsPhoneNumber,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePatientDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsDateString()
  dateOfBirth: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsPhoneNumber()
  phoneNumber?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  emergencyContact?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  bloodType?: string;
}
```

### 8.2 Login DTO

```typescript
// src/auth/dto/login.dto.ts
import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  password: string;
}
```

---

## 9. Environment Variables (.env.example)

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
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRATION=1h
JWT_REFRESH_SECRET=your_refresh_secret_key_here
JWT_REFRESH_EXPIRATION=7d

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# 100ms
HUNDRED_MS_API_KEY=your_100ms_api_key
HUNDRED_MS_API_SECRET=your_100ms_api_secret

# Twilio
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# AWS S3
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_S3_BUCKET=your_bucket_name
AWS_REGION=us-east-1

# CORS
CORS_ORIGIN=http://localhost:3000
```

---

## 10. Docker Setup

### 10.1 Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Build
RUN npm run build

# Expose port
EXPOSE 3001

# Start
CMD ["npm", "run", "start:prod"]
```

### 10.2 docker-compose.yml

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: consentmd
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  app:
    build: .
    environment:
      NODE_ENV: development
      DB_HOST: postgres
      REDIS_HOST: redis
    ports:
      - "3001:3001"
    depends_on:
      - postgres
      - redis
    volumes:
      - .:/app

volumes:
  postgres_data:
```

---

## 11. Testing

### 11.1 Unit Test Example

```typescript
// src/patients/patients.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PatientsService } from './patients.service';
import { PatientEntity } from './entities/patient.entity';

describe('PatientsService', () => {
  let service: PatientsService;
  let repository: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatientsService,
        {
          provide: getRepositoryToken(PatientEntity),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PatientsService>(PatientsService);
    repository = module.get(getRepositoryToken(PatientEntity));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a patient with MRN', async () => {
      const createPatientDto = {
        name: 'John Doe',
        dateOfBirth: '1985-03-15',
      };

      const mockPatient = {
        id: 'uuid',
        mrn: 'MRN-001234',
        ...createPatientDto,
      };

      repository.create.mockReturnValue(mockPatient);
      repository.save.mockResolvedValue(mockPatient);

      const result = await service.create(createPatientDto, 'creator-id');

      expect(result.mrn).toBeDefined();
      expect(repository.save).toHaveBeenCalled();
    });
  });
});
```

### 11.2 E2E Test Example

```typescript
// test/auth.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Auth (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/api/v1/auth/login (POST)', () => {
    it('should login a user', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'user@example.com',
          password: 'password123',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.accessToken).toBeDefined();
          expect(res.body.refreshToken).toBeDefined();
        });
    });
  });
});
```

---

## 12. Development Scripts (package.json)

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
    "migration:run": "typeorm migration:run",
    "migration:revert": "typeorm migration:revert"
  }
}
```

---

## 13. Development Workflow

### 13.1 Generate Module

```bash
# Generate a new module
nest generate module chats
nest generate service chats
nest generate controller chats
nest generate entity chats

# Or all at once
nest g resource chats
```

### 13.2 Generate Entity

```bash
nest g class patients/entities/patient
```

### 13.3 Generate Guard

```bash
nest g guard auth/guards/jwt-auth
```

---

## 14. Best Practices

### 14.1 Code Organization
- One module per feature
- Separate concerns: Controller, Service, Entity
- Use DTOs for request/response validation
- Keep services focused on business logic

### 14.2 Error Handling
- Use NestJS HttpException for HTTP errors
- Create custom exception filters
- Log errors appropriately
- Return meaningful error messages

### 14.3 Security
- Always hash passwords with bcryptjs
- Validate all inputs
- Use JWT for authentication
- Implement rate limiting
- Sanitize data before storing

### 14.4 Testing
- Aim for 80%+ code coverage
- Write unit tests for services
- Write E2E tests for critical paths
- Mock external dependencies
- Use fixtures for test data

### 14.5 Database
- Use migrations for schema changes
- Add indexes for frequently queried fields
- Normalize data appropriately
- Use transactions for critical operations
- Implement soft deletes for HIPAA compliance

---

## 15. Deployment Checklist

- [ ] All tests passing (100%)
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Redis configured
- [ ] SSL certificates configured
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Logging configured
- [ ] Monitoring setup
- [ ] Backup strategy in place
- [ ] HIPAA audit logging enabled
- [ ] Third-party API keys secured

---

**Document Version:** 1.0 (NestJS Edition)
**Last Updated:** January 2024
**Framework:** NestJS 10.x
**Status:** Ready for Development
