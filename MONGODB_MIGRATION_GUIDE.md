# MongoDB Migration Guide - NeonDB to MongoDB

## Overview

ConsentMD is transitioning from PostgreSQL (Neon) to MongoDB for optimal performance with chat, messaging, and real-time features.

---

## MongoDB Collections Schema

### 1. Users Collection

```javascript
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['laravelId', 'email', 'name', 'role'],
      properties: {
        _id: { bsonType: 'objectId' },
        laravelId: { bsonType: 'string', unique: true },   // Links to Laravel user
        email: { bsonType: 'string' },
        name: { bsonType: 'string' },
        phoneNumber: { bsonType: 'string' },
        role: { bsonType: 'string' },                       // doctor, nurse, patient, admin
        title: { bsonType: 'string' },
        avatar: { bsonType: 'string' },
        lastActiveAt: { bsonType: 'date' },
        createdAt: { bsonType: 'date' },
        updatedAt: { bsonType: 'date' }
      }
    }
  }
});

// Indexes
db.users.createIndex({ laravelId: 1 }, { unique: true });
db.users.createIndex({ email: 1 });
db.users.createIndex({ role: 1 });
```

### 2. Messages Collection

```javascript
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
        type: { bsonType: 'string' },                       // text, image, voice, file, call_log
        metadata: { bsonType: 'object' },
        isRead: { bsonType: 'bool' },
        readBy: { bsonType: 'array' },
        timestamp: { bsonType: 'date' }
      }
    }
  }
});

// Indexes
db.messages.createIndex({ conversationId: 1, timestamp: -1 });
db.messages.createIndex({ senderId: 1, timestamp: -1 });
db.messages.createIndex({ timestamp: 1 }, { expireAfterSeconds: 7776000 }); // 90 days TTL
```

### 3. Conversations Collection

```javascript
db.createCollection('conversations', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'type', 'participants'],
      properties: {
        _id: { bsonType: 'objectId' },
        name: { bsonType: 'string' },
        type: { bsonType: 'string' },                       // Direct, Group, Care Team
        participants: {
          bsonType: 'array',
          items: { bsonType: 'string' }                    // laravelIds
        },
        patientId: { bsonType: 'string' },                 // Optional, for patient chats
        lastMessage: { bsonType: 'string' },
        lastMessageTime: { bsonType: 'date' },
        lastMessageSenderId: { bsonType: 'string' },
        avatar: { bsonType: 'string' },
        pinned: { bsonType: 'bool' },
        createdAt: { bsonType: 'date' },
        updatedAt: { bsonType: 'date' }
      }
    }
  }
});

// Indexes
db.conversations.createIndex({ participants: 1 });
db.conversations.createIndex({ lastMessageTime: -1 });
db.conversations.createIndex({ patientId: 1 });
```

### 4. Clinical Notes Collection

```javascript
db.createCollection('clinicalNotes', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['conversationId', 'templateType'],
      properties: {
        _id: { bsonType: 'objectId' },
        conversationId: { bsonType: 'objectId' },
        patientId: { bsonType: 'string' },
        consultationType: { bsonType: 'string' },           // initial_consultation, follow_up, etc.
        visitReason: { bsonType: 'string' },
        templateType: { bsonType: 'string' },               // soap, cardiology, psychiatry, etc.
        sections: { bsonType: 'object' },
        suggestions: {
          bsonType: 'array',
          items: { bsonType: 'object' }
        },
        callId: { bsonType: 'string' },
        createdAt: { bsonType: 'date' },
        updatedAt: { bsonType: 'date' }
      }
    }
  }
});

// Indexes
db.clinicalNotes.createIndex({ conversationId: 1 });
db.clinicalNotes.createIndex({ patientId: 1 });
db.clinicalNotes.createIndex({ createdAt: -1 });
```

### 5. Notifications Collection

```javascript
db.createCollection('notifications', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['userId', 'type', 'title', 'body'],
      properties: {
        _id: { bsonType: 'objectId' },
        userId: { bsonType: 'string' },
        type: { bsonType: 'string' },                       // message, call_incoming, note_shared, etc.
        title: { bsonType: 'string' },
        body: { bsonType: 'string' },
        data: { bsonType: 'object' },
        isRead: { bsonType: 'bool' },
        readAt: { bsonType: 'date' },
        action: { bsonType: 'string' },
        createdAt: { bsonType: 'date' }
      }
    }
  }
});

// Indexes & TTL
db.notifications.createIndex({ userId: 1, createdAt: -1 });
db.notifications.createIndex({ isRead: 1 });
db.notifications.createIndex({ createdAt: 1 }, { expireAfterSeconds: 2592000 }); // 30 days TTL
```

### 6. FCM Tokens Collection

```javascript
db.createCollection('fcmTokens', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['userId', 'token'],
      properties: {
        _id: { bsonType: 'objectId' },
        userId: { bsonType: 'string' },
        token: { bsonType: 'string', unique: true },
        deviceInfo: { bsonType: 'object' },
        isActive: { bsonType: 'bool' },
        createdAt: { bsonType: 'date' },
        expiresAt: { bsonType: 'date' }
      }
    }
  }
});

// Indexes
db.fcmTokens.createIndex({ userId: 1 });
db.fcmTokens.createIndex({ token: 1 }, { unique: true });
db.fcmTokens.createIndex({ isActive: 1 });
```

### 7. Notification Preferences Collection

```javascript
db.createCollection('notificationPreferences', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['userId'],
      properties: {
        _id: { bsonType: 'objectId' },
        userId: { bsonType: 'string', unique: true },
        inAppEnabled: { bsonType: 'bool' },
        pushEnabled: { bsonType: 'bool' },
        emailEnabled: { bsonType: 'bool' },
        smsEnabled: { bsonType: 'bool' },
        messagesEnabled: { bsonType: 'bool' },
        callsEnabled: { bsonType: 'bool' },
        clinicalAlertsEnabled: { bsonType: 'bool' },
        quietHoursEnabled: { bsonType: 'bool' },
        quietHoursStart: { bsonType: 'string' },
        quietHoursEnd: { bsonType: 'string' },
        createdAt: { bsonType: 'date' },
        updatedAt: { bsonType: 'date' }
      }
    }
  }
});

// Indexes
db.notificationPreferences.createIndex({ userId: 1 }, { unique: true });
```

---

## Mongoose Schema Examples

### User Schema

```typescript
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true })
  laravelId: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  phoneNumber?: string;

  @Prop({ required: true })
  role: string;

  @Prop()
  title?: string;

  @Prop()
  avatar?: string;

  @Prop()
  lastActiveAt?: Date;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ laravelId: 1 }, { unique: true });
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
```

### Message Schema

```typescript
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Message extends Document {
  @Prop({ type: Types.ObjectId, required: true })
  conversationId: Types.ObjectId;

  @Prop({ required: true })
  senderId: string;

  @Prop({ required: true })
  content: string;

  @Prop()
  type: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @Prop({ default: false })
  isRead: boolean;

  @Prop({ type: [String] })
  readBy?: string[];

  @Prop()
  timestamp: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
MessageSchema.index({ conversationId: 1, timestamp: -1 });
MessageSchema.index({ senderId: 1, timestamp: -1 });
MessageSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 });
```

### Conversation Schema

```typescript
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Conversation extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  type: string;

  @Prop({ type: [String], required: true })
  participants: string[];

  @Prop()
  patientId?: string;

  @Prop()
  lastMessage?: string;

  @Prop()
  lastMessageTime?: Date;

  @Prop()
  lastMessageSenderId?: string;

  @Prop()
  avatar?: string;

  @Prop({ default: false })
  pinned: boolean;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
ConversationSchema.index({ participants: 1 });
ConversationSchema.index({ lastMessageTime: -1 });
ConversationSchema.index({ patientId: 1 });
```

---

## Environment Variables

Update your `.env` file:

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/consentmd?retryWrites=true&w=majority
MONGODB_RETRIES=3
MONGODB_TIMEOUT=30000

# Remove PostgreSQL variables:
# DATABASE_URL=...  (DELETE THIS)
# DATABASE_POOL_SIZE=...  (DELETE THIS)
```

---

## NestJS Module Setup

### app.module.ts

```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGODB_URI, {
      retryAttempts: parseInt(process.env.MONGODB_RETRIES || '3'),
      retryDelay: 5000,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      maxPoolSize: 50,
      minPoolSize: 10,
    }),
    // Other modules...
  ],
})
export class AppModule {}
```

---

## Migration Steps

### Step 1: Setup MongoDB

```bash
# Using Docker Compose for development
docker run -d \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  -v mongodb_data:/data/db \
  mongo:latest
```

### Step 2: Install Dependencies

```bash
npm uninstall @nestjs/typeorm typeorm pg
npm install @nestjs/mongoose mongoose
```

### Step 3: Create Mongoose Schemas

Replace TypeORM entities with Mongoose schemas in:
- `src/users/schemas/user.schema.ts`
- `src/chat/schemas/message.schema.ts`
- `src/chat/schemas/conversation.schema.ts`
- `src/clinical/schemas/clinical-note.schema.ts`
- `src/notifications/schemas/notification.schema.ts`

### Step 4: Create Collections & Indexes

```bash
# Connect to MongoDB and run:
mongo "mongodb+srv://username:password@cluster.mongodb.net/consentmd"

# Execute collection creation scripts above
```

### Step 5: Update Services

Replace repository calls with Mongoose model methods:

```typescript
// Before (TypeORM):
const user = await this.userRepository.findOne({ email });

// After (Mongoose):
const user = await this.userModel.findOne({ email });
```

### Step 6: Update Controllers

No changes needed - controllers work the same way.

### Step 7: Test

```bash
npm run test
npm run start:dev
```

---

## Performance Optimizations

### 1. Connection Pooling

MongoDB automatically pools connections:
```typescript
maxPoolSize: 50,      // Maximum connections
minPoolSize: 10,      // Minimum connections
maxIdleTimeMS: 45000, // Kill idle connections
```

### 2. Indexes

Create indexes for frequently queried fields:
```javascript
// Messages by conversation and time
db.messages.createIndex({ conversationId: 1, timestamp: -1 });

// Conversations by participant
db.conversations.createIndex({ participants: 1, lastMessageTime: -1 });
```

### 3. TTL Indexes (Auto-cleanup)

```javascript
// Auto-delete messages older than 90 days
db.messages.createIndex({ timestamp: 1 }, { expireAfterSeconds: 7776000 });

// Auto-delete notifications older than 30 days
db.notifications.createIndex({ createdAt: 1 }, { expireAfterSeconds: 2592000 });
```

---

## Backup & Recovery

### Automated Backups (MongoDB Atlas)

- Daily snapshots (included)
- Point-in-time restore (14 days)
- Manual snapshots available

### Export Backups to GCS

```bash
# Export all collections
mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/consentmd" \
  --gzip \
  --archive=backup.gz

# Upload to GCS
gsutil cp backup.gz gs://consentmd-backups/
```

### Restore from Backup

```bash
# Restore from archive
mongorestore --uri="mongodb+srv://user:pass@cluster.mongodb.net/consentmd" \
  --gzip \
  --archive=backup.gz
```

---

## Monitoring & Alerts

### MongoDB Atlas Monitoring

- CPU, Memory, Network usage
- Connection count
- Query latency
- Disk usage

### Set Alerts For:

- CPU > 80%
- Memory > 85%
- Connections > max_connections * 0.8
- Query latency > 100ms

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Connection timeout | Check network whitelist, verify credentials |
| Slow queries | Add indexes, check query plans with `.explain()` |
| High memory usage | Enable compression, archive old data |
| Replication lag | Add replica servers, check network |

---

## Key Differences: SQL vs MongoDB

| Aspect | PostgreSQL | MongoDB |
|--------|------------|---------|
| **Schema** | Fixed | Flexible |
| **Write Speed** | Slower | Faster |
| **Joins** | Native | Look up in code |
| **Scaling** | Vertical | Horizontal (Sharding) |
| **ACID** | Full transactions | Document-level |
| **Storage** | Rows & Tables | Collections & Documents |

---

## Rollback Plan

If needed to rollback:

1. Keep PostgreSQL instance running for 30 days
2. Export MongoDB collections to JSON
3. Restore to PostgreSQL from backup
4. Update application to use PostgreSQL
5. Decommission MongoDB cluster

---

**Document Version:** 1.0
**Last Updated:** February 2026
**Status:** Complete - Ready for Migration
