# ConsentMD - Architecture & System Diagrams

Comprehensive Mermaid diagrams showing system architecture, data flow, and interconnections.

---

## 1. System Architecture Diagram

```mermaid
graph TB
    subgraph Frontend["🖥️ Frontend Layer"]
        Web["React Web App"]
        Mobile["Mobile App"]
    end

    subgraph Gateway["🌐 API Gateway Layer"]
        CloudRun["Google Cloud Run<br/>(NestJS Backend)"]
        LoadBalancer["Cloud Load Balancer"]
    end

    subgraph Services["🔧 Service Layer"]
        Auth["Auth Service<br/>(Laravel Identity)"]
        Chat["Chat Service"]
        Clinical["Clinical Notes<br/>Service"]
        Notifications["Notifications<br/>Service"]
        Storage["Storage<br/>Service"]
        AI["AI Service<br/>(Gemini)"]
    end

    subgraph Database["💾 Data Layer"]
        MongoDB["MongoDB<br/>(Chat, Messages)"]
        Collections["Collections:<br/>- messages<br/>- conversations<br/>- participants"]
    end

    subgraph Storage["☁️ Cloud Storage"]
        GCS["Google Cloud<br/>Storage"]
        Files["Clinical Notes<br/>Call Recordings<br/>User Uploads"]
    end

    subgraph External["🔗 External Services"]
        Laravel["Laravel Backend<br/>(Identity Provider)"]
        Gemini["Google Gemini<br/>API"]
        FCM["Firebase Cloud<br/>Messaging"]
        Twilio["Twilio<br/>(SMS)"]
        HundredMS["100ms SDK<br/>(Video Calls)"]
    end

    subgraph Cache["⚡ Cache Layer"]
        Redis["Redis<br/>(Session Cache)"]
    end

    Frontend -->|HTTP/WebSocket| LoadBalancer
    LoadBalancer --> CloudRun

    CloudRun --> Auth
    CloudRun --> Chat
    CloudRun --> Clinical
    CloudRun --> Notifications
    CloudRun --> Storage
    CloudRun --> AI

    Chat --> MongoDB
    MongoDB --> Collections

    Storage --> GCS
    GCS --> Files

    Auth --> Laravel
    AI --> Gemini
    Notifications --> FCM
    Notifications --> Twilio
    CloudRun --> HundredMS

    CloudRun --> Redis

    style Frontend fill:#e1f5ff
    style Gateway fill:#fff3e0
    style Services fill:#f3e5f5
    style Database fill:#e8f5e9
    style Storage fill:#fce4ec
    style External fill:#f1f8e9
    style Cache fill:#fff8e1
```

---

## 2. Authentication Flow Diagram

```mermaid
sequenceDiagram
    participant User as User/Browser
    participant Frontend as React Frontend
    participant Laravel as Laravel Backend<br/>(Identity Provider)
    participant NestJS as NestJS Backend
    participant DB as MongoDB

    User->>Frontend: Enter credentials
    Frontend->>Laravel: POST /api/login
    Laravel->>Laravel: Validate credentials
    Laravel->>Laravel: Generate JWT token
    Laravel-->>Frontend: Return JWT + User Data
    Frontend->>Frontend: Store JWT in localStorage

    Frontend->>NestJS: Request with JWT<br/>(Authorization header)
    NestJS->>NestJS: Validate JWT signature
    NestJS->>NestJS: Extract user payload
    NestJS->>DB: Find/Sync user
    DB-->>NestJS: User data
    NestJS-->>Frontend: Access granted + Response

    Frontend->>Frontend: Display authenticated UI

    Note over NestJS: All subsequent requests<br/>include JWT token
```

---

## 3. Chat & Messaging Architecture

```mermaid
graph LR
    subgraph Client["Client Layer"]
        Browser["React Browser"]
        Mobile["Mobile App"]
    end

    subgraph Real-Time["Real-Time Layer"]
        WebSocket["WebSocket Gateway<br/>(Socket.IO)"]
        Rooms["Chat Rooms"]
    end

    subgraph Processing["Processing Layer"]
        ChatService["Chat Service"]
        MessageProcessor["Message Processor"]
        Validator["Message Validator"]
    end

    subgraph Storage["MongoDB Storage"]
        Messages["Messages<br/>Collection"]
        Conversations["Conversations<br/>Collection"]
        Participants["Participants<br/>Collection"]
        Metadata["Message Metadata<br/>Collection"]
    end

    subgraph Notifications["Notification System"]
        FCM["Firebase<br/>Notifications"]
        WebNotif["In-App<br/>WebSocket"]
    end

    Client -->|Connect| WebSocket
    WebSocket -->|Create/Join| Rooms
    Rooms -->|Emit| ChatService

    ChatService --> Validator
    Validator --> MessageProcessor

    MessageProcessor -->|Save| Messages
    MessageProcessor -->|Update| Conversations
    MessageProcessor -->|Track| Participants
    MessageProcessor -->|Store| Metadata

    MessageProcessor -->|Notify| FCM
    MessageProcessor -->|Broadcast| WebNotif

    WebNotif -->|Deliver| Client

    style Client fill:#e3f2fd
    style Real-Time fill:#fff3e0
    style Processing fill:#f3e5f5
    style Storage fill:#c8e6c9
    style Notifications fill:#fce4ec
```

---

## 4. Clinical Scribe Workflow

```mermaid
sequenceDiagram
    participant Dr as Doctor
    participant App as Frontend App
    participant Scribe as Scribe Service
    participant Gemini as Google Gemini AI
    participant Storage as GCS Storage
    participant DB as MongoDB

    Dr->>App: Start call + Select patient
    App->>Scribe: Initialize call session
    Scribe->>Scribe: Start transcription capture

    Dr->>App: Have patient conversation
    App->>Scribe: Stream call audio
    Scribe->>Scribe: Transcribe in real-time
    App->>App: Display live transcription

    Dr->>App: End call
    App->>Scribe: Finalize scribe session

    Scribe->>Scribe: Compile full transcript
    Scribe->>Gemini: Generate clinical note<br/>(with consultation type context)
    Gemini-->>Scribe: Generated note

    Scribe->>Scribe: Format with template
    Scribe->>Storage: Save note file
    Scribe->>DB: Save note metadata<br/>(with patientId, consultationType)

    Scribe-->>App: Return formatted note
    App->>App: Display for review

    Dr->>App: Edit and finalize
    App->>DB: Update note in MongoDB
    App->>App: Notify patient

    Note over Gemini: Consultation type<br/>influences AI context
```

---

## 5. MongoDB Data Model

```mermaid
graph TB
    subgraph Messages["Messages Collection"]
        M1["_id: ObjectId"]
        M2["conversationId: ObjectId"]
        M3["senderId: String (laravelId)"]
        M4["content: String"]
        M5["type: String (text/image/voice/file)"]
        M6["metadata: Object"]
        M7["timestamp: Date"]
        M8["isRead: Boolean"]
        M9["readBy: Array"]
    end

    subgraph Conversations["Conversations Collection"]
        C1["_id: ObjectId"]
        C2["name: String"]
        C3["type: String (Direct/Group/Care Team)"]
        C4["participants: Array"]
        C5["patientId: ObjectId (optional)"]
        C6["lastMessage: String"]
        C7["lastMessageTime: Date"]
        C8["createdAt: Date"]
        C9["updatedAt: Date"]
    end

    subgraph ClinicalNotes["Clinical Notes Collection"]
        CN1["_id: ObjectId"]
        CN2["conversationId: ObjectId"]
        CN3["patientId: String (laravelId)"]
        CN4["consultationType: String"]
        CN5["visitReason: String"]
        CN6["templateType: String"]
        CN7["sections: Object"]
        CN8["suggestions: Array"]
        CN9["callId: String"]
        CN10["createdAt: Date"]
        CN11["updatedAt: Date"]
    end

    subgraph Notifications["Notifications Collection"]
        N1["_id: ObjectId"]
        N2["userId: String (laravelId)"]
        N3["type: String"]
        N4["title: String"]
        N5["body: String"]
        N6["data: Object"]
        N7["isRead: Boolean"]
        N8["createdAt: Date"]
    end

    subgraph Users["Users Collection"]
        U1["_id: ObjectId"]
        U2["laravelId: String (unique)"]
        U3["email: String"]
        U4["name: String"]
        U5["avatar: String"]
        U6["role: String"]
        U7["phoneNumber: String"]
        U8["lastActiveAt: Date"]
    end

    Conversations --> C1
    Messages --> M1
    Messages --> M2
    ClinicalNotes --> CN1
    Notifications --> N1
    Users --> U1

    M2 -.->|references| C1
    CN2 -.->|references| C1
    C4 -.->|references| U2
    N2 -.->|references| U2

    style Messages fill:#bbdefb
    style Conversations fill:#c8e6c9
    style ClinicalNotes fill:#ffe0b2
    style Notifications fill:#f8bbd0
    style Users fill:#e1bee7
```

---

## 6. AI Clinical Note Generation Flow

```mermaid
graph TD
    Start["Call Ends"] --> Transcript["Extract Full<br/>Transcript"]

    Transcript --> Gather["Gather Context"]

    Gather --> Patient["Patient Info<br/>(MongoDB)"]
    Gather --> ConsultType["Consultation Type<br/>(from form)"]
    Gather --> Template["Template Type<br/>(SOAP/Cardiology/etc)"]

    Patient --> BuildPrompt["Build AI Prompt"]
    ConsultType --> BuildPrompt
    Template --> BuildPrompt

    BuildPrompt --> AddModifiers["Add Context<br/>Modifiers"]
    AddModifiers --> SpecialtyContext["Specialty Context"]
    AddModifiers --> ConsultContext["Consultation Type<br/>Context"]

    SpecialtyContext --> GeminiCall["Call Google<br/>Gemini API"]
    ConsultContext --> GeminiCall

    GeminiCall --> Parse["Parse Response"]

    Parse --> Format["Format into<br/>Template Sections"]
    Format --> Structure["Structure Data"]

    Structure --> Generate["Generate Suggestions<br/>(Medications, Actions)"]

    Generate --> Save["Save to MongoDB"]
    Save --> Notify["Notify User"]
    Notify --> Display["Display for Review"]

    Display --> Final["Final Note<br/>in Database"]

    style Start fill:#ffcdd2
    style Transcript fill:#ffecb3
    style Gather fill:#c8e6c9
    style Patient fill:#bbdefb
    style ConsultType fill:#f0f4c3
    style Template fill:#dcedc1
    style BuildPrompt fill:#ffe0b2
    style AddModifiers fill:#ffccbc
    style GeminiCall fill:#ce93d8
    style Parse fill:#f48fb1
    style Format fill:#80deea
    style Generate fill:#a1887f
    style Save fill:#90caf9
    style Final fill:#81c784
```

---

## 7. Notification Flow & Multi-Channel Distribution

```mermaid
graph TB
    Event["Event Triggered<br/>(Message, Call, Alert)"]

    Event --> NotifService["Notifications<br/>Service"]

    NotifService --> SaveDB["1. Save to<br/>MongoDB"]
    NotifService --> CheckPrefs["2. Get User<br/>Preferences"]

    SaveDB --> DB1["Store in<br/>Notifications Collection"]

    CheckPrefs --> InApp{In-App<br/>Enabled?}
    CheckPrefs --> Push{Push<br/>Enabled?}
    CheckPrefs --> Email{Email<br/>Enabled?}
    CheckPrefs --> SMS{SMS<br/>Enabled?}

    InApp -->|Yes| WebSocket["Emit via<br/>WebSocket"]
    InApp -->|No| Skip1["Skip"]

    Push -->|Yes| FCM["Send Firebase<br/>Cloud Message"]
    Push -->|No| Skip2["Skip"]

    Email -->|Yes| EmailSvc["Send Email<br/>via Nodemailer"]
    Email -->|No| Skip3["Skip"]

    SMS -->|Yes| Twilio["Send SMS<br/>via Twilio"]
    SMS -->|No| Skip4["Skip"]

    WebSocket --> User1["User Device<br/>(In-App)"]
    FCM --> User2["Mobile/Web<br/>(Push)"]
    EmailSvc --> User3["Email Client"]
    Twilio --> User4["Phone<br/>(SMS)"]

    User1 --> Delivered1["Delivered"]
    User2 --> Delivered2["Delivered"]
    User3 --> Delivered3["Delivered"]
    User4 --> Delivered4["Delivered"]

    style Event fill:#ffebee
    style NotifService fill:#fce4ec
    style SaveDB fill:#e0f2f1
    style WebSocket fill:#fff9c4
    style FCM fill:#c5e1a5
    style EmailSvc fill:#b3e5fc
    style Twilio fill:#ffe0b2
    style Delivered1 fill:#c8e6c9
    style Delivered2 fill:#c8e6c9
    style Delivered3 fill:#c8e6c9
    style Delivered4 fill:#c8e6c9
```

---

## 8. Use Case Diagram - Clinical Scribe System

```mermaid
graph TB
    subgraph Users["Actors"]
        Doctor["👨‍⚕️ Doctor/Clinician"]
        Patient["👤 Patient"]
        System["🤖 AI System"]
    end

    subgraph UseCases["Use Cases"]
        UC1["Start Video Call"]
        UC2["Live Transcription"]
        UC3["Auto-Generate Note"]
        UC4["Select Consultation Type"]
        UC5["Link to Patient"]
        UC6["Edit & Finalize"]
        UC7["Share with Patient"]
        UC8["Generate Suggestions"]
        UC9["Send Notifications"]
    end

    Doctor -->|Initiates| UC1
    UC1 -->|Starts| UC2
    UC2 -->|Audio Input| System
    System -->|Generates| UC3

    Doctor -->|Selects| UC4
    Doctor -->|Chooses| UC5
    UC4 -->|Context for| UC3
    UC5 -->|Associates| UC3

    System -->|Creates| UC8
    UC8 -->|Suggests| UC6

    Doctor -->|Reviews & Edits| UC6
    Doctor -->|Finalizes| UC7
    UC7 -->|Notifies| Patient
    UC7 -->|Triggers| UC9

    UC9 -->|Delivered to| Patient
    UC9 -->|Delivered to| Doctor

    style Doctor fill:#e3f2fd
    style Patient fill:#f3e5f5
    style System fill:#fff9c4
    style UC1 fill:#c8e6c9
    style UC2 fill:#ffccbc
    style UC3 fill:#ffe0b2
    style UC4 fill:#b3e5fc
    style UC5 fill:#f8bbd0
    style UC6 fill:#dcedc1
    style UC7 fill:#c5e1a5
    style UC8 fill:#ffccbc
    style UC9 fill:#fce4ec
```

---

## 9. Message Processing Pipeline

```mermaid
graph LR
    Msg["Message<br/>Received"] --> Parse["Parse<br/>Message"]

    Parse --> Validate["Validate<br/>Format"]

    Validate -->|Valid| Auth["Check<br/>Authorization"]
    Validate -->|Invalid| Error1["Reject<br/>Invalid"]

    Auth -->|Authorized| Process["Process<br/>Message"]
    Auth -->|Unauthorized| Error2["Reject<br/>Unauthorized"]

    Process --> Enrich["Enrich with<br/>Metadata"]

    Enrich --> Store["Save to<br/>MongoDB"]

    Store --> Index["Update<br/>Conversation"]

    Index --> Notify["Trigger<br/>Notifications"]

    Notify --> Broadcast["Broadcast to<br/>Connected Users"]

    Broadcast --> Done["Message<br/>Delivered"]

    Error1 --> Return["Return<br/>Error"]
    Error2 --> Return
    Return --> Done

    style Msg fill:#ffebee
    style Parse fill:#ffe0b2
    style Validate fill:#fff9c4
    style Auth fill:#b3e5fc
    style Process fill:#c8e6c9
    style Enrich fill:#f8bbd0
    style Store fill:#d1c4e9
    style Index fill:#bbdefb
    style Notify fill:#fce4ec
    style Broadcast fill:#c5e1a5
    style Done fill:#a5d6a7
    style Error1 fill:#ffcdd2
    style Error2 fill:#ffcdd2
```

---

## 10. Data Flow: Chat Message from Creation to Delivery

```mermaid
sequenceDiagram
    participant User as User 1
    participant Frontend as React Frontend
    participant WS as WebSocket Gateway
    participant Service as Chat Service
    participant DB as MongoDB
    participant Notif as Notification Service
    participant User2 as User 2

    User->>Frontend: Type and send message
    Frontend->>WS: Emit 'send-message' via WebSocket

    WS->>Service: Process message
    Service->>Service: Validate message
    Service->>Service: Add metadata<br/>(timestamp, type)

    Service->>DB: Save to Messages<br/>collection
    DB-->>Service: Message saved<br/>with _id

    Service->>DB: Update Conversations<br/>collection
    DB-->>Service: Conversation updated

    Service->>Notif: Trigger notification

    Notif->>DB: Save to Notifications<br/>collection

    Notif->>WS: Emit to User 2<br/>(if connected)
    WS-->>User2: Deliver message
    User2->>Frontend: Display message

    Notif->>Notif: Check User 2<br/>preferences
    Notif-->>User2: Send FCM push<br/>(if enabled)

    Service-->>Frontend: Confirm message sent
    Frontend->>User: Update UI<br/>with checkmark

    Note over DB: All data persisted<br/>in MongoDB collections
```

---

## 11. Google Cloud Infrastructure

```mermaid
graph TB
    subgraph Internet["Internet"]
        Users["🌍 Users"]
    end

    subgraph GCP["Google Cloud Platform"]
        LB["Cloud Load<br/>Balancer"]

        subgraph CloudRun["Cloud Run<br/>(Serverless)"]
            Instances["NestJS Backend<br/>Instances"]
        end

        subgraph Storage["Cloud Storage"]
            GCS["Google Cloud<br/>Storage Bucket"]
        end

        subgraph SecretMgr["Secret Manager"]
            Secrets["JWT Secrets<br/>API Keys<br/>DB Credentials"]
        end

        subgraph Logging["Cloud Logging"]
            Logs["Application Logs<br/>Error Logs<br/>Access Logs"]
        end

        subgraph Monitoring["Cloud Monitoring"]
            Metrics["CPU/Memory<br/>Request Latency<br/>Error Rate"]
        end

        subgraph Build["Cloud Build"]
            Pipeline["CI/CD Pipeline"]
        end

        subgraph Registry["Artifact Registry"]
            Images["Docker Images"]
        end
    end

    subgraph External["External Services"]
        MongoDB["MongoDB<br/>(Atlas or<br/>Self-Hosted)"]
        Redis["Redis<br/>(Cloud Memorystore)"]
        Laravel["Laravel Backend<br/>(Identity Provider)"]
        FCM["Firebase Cloud<br/>Messaging"]
    end

    Users -->|HTTPS| LB
    LB -->|Route Traffic| CloudRun

    CloudRun -->|Read/Write| MongoDB
    CloudRun -->|Cache| Redis
    CloudRun -->|Verify User| Laravel
    CloudRun -->|Send Notifications| FCM

    CloudRun -->|Store Files| GCS
    CloudRun -->|Fetch Secrets| SecretMgr
    CloudRun -->|Log Events| Logging
    CloudRun -->|Report Metrics| Monitoring

    Pipeline -->|Build & Push| Images
    Images -->|Deploy| CloudRun

    style GCP fill:#f1f5fe
    style CloudRun fill:#fff3e0
    style Storage fill:#e8f5e9
    style SecretMgr fill:#fce4ec
    style Logging fill:#f3e5f5
    style Monitoring fill:#ffe0b2
    style External fill:#e0f2f1
```

---

## 12. Server-Side Event (SSE) vs WebSocket Decision

```mermaid
graph TB
    Requirement["Real-Time<br/>Communication<br/>Needed"]

    Requirement -->|Chat Messages<br/>Instant Delivery| WebSocket["✅ Use WebSocket<br/>(Socket.IO)"]
    Requirement -->|Notifications<br/>One-Way Push| SSE["✅ Use FCM<br/>+ In-App Polling"]

    WebSocket --> WS1["Bidirectional<br/>Communication"]
    WebSocket --> WS2["Low Latency"]
    WebSocket --> WS3["Stateful<br/>Connection"]
    WebSocket --> WS4["Multiplexing<br/>Support"]

    SSE --> SSE1["Simpler Setup"]
    SSE --> SSE2["HTTP Based"]
    SSE --> SSE3["Mobile<br/>Friendly via FCM"]
    SSE --> SSE4["Battery<br/>Efficient"]

    WS1 --> Choice1["Chat:<br/>WebSocket"]
    WS2 --> Choice1
    WS3 --> Choice1
    WS4 --> Choice1

    SSE1 --> Choice2["Notifications:<br/>FCM + MongoDB"]
    SSE3 --> Choice2
    SSE4 --> Choice2

    style Requirement fill:#ffebee
    style WebSocket fill:#c8e6c9
    style SSE fill:#bbdefb
    style Choice1 fill:#fff9c4
    style Choice2 fill:#fff9c4
```

---

## 13. Data Consistency & Durability

```mermaid
graph TB
    Write["Write Operation"]

    Write --> Journal["MongoDB<br/>Journal"]

    Journal --> Memory["In-Memory<br/>Cache"]

    Memory --> Commit["Commit to<br/>Disk"]

    Commit --> Replicas["Replicate to<br/>Secondary Nodes"]

    Replicas --> Durable["Data Durable"]

    Durable --> Backup["Daily Backups<br/>to GCS"]

    Backup --> Archive["Archive to<br/>Cold Storage"]

    disaster["Disaster/Failure"] -.->|Recover from| Backup
    disaster -.->|Recover from| Archive

    style Write fill:#ffebee
    style Journal fill:#ffe0b2
    style Memory fill:#fff9c4
    style Commit fill:#c8e6c9
    style Replicas fill:#b3e5fc
    style Durable fill:#a5d6a7
    style Backup fill:#bbdefb
    style Archive fill:#e1bee7
    style disaster fill:#ffcdd2
```

---

## 14. Security & Authentication Layers

```mermaid
graph TB
    User["User Request"]

    User -->|HTTPS| TLS["TLS/SSL<br/>Encryption"]

    TLS --> CORS["CORS<br/>Validation"]

    CORS --> Auth["JWT<br/>Validation"]

    Auth --> Laravel{Check with<br/>Laravel?}

    Laravel -->|Optional| LaravelAPI["Call Laravel<br/>Verify Endpoint"]
    LaravelAPI -->|Valid| AuthPass["✅ Authorized"]
    LaravelAPI -->|Invalid| AuthFail["❌ Unauthorized"]

    Laravel -->|Direct| TokenSig["Verify Token<br/>Signature"]
    TokenSig -->|Valid| AuthPass
    TokenSig -->|Invalid| AuthFail

    AuthPass --> RBAC["Role-Based<br/>Access Control"]

    RBAC --> Resource["Access<br/>Resource"]

    Resource -->|Save/Update| Audit["Audit Log<br/>to MongoDB"]

    AuthFail --> Reject["Reject Request<br/>401/403"]

    style User fill:#e3f2fd
    style TLS fill:#c8e6c9
    style CORS fill:#bbdefb
    style Auth fill:#ffe0b2
    style AuthPass fill:#a5d6a7
    style AuthFail fill:#ffcdd2
    style RBAC fill:#f8bbd0
    style Resource fill:#b3e5fc
    style Audit fill:#e1bee7
```

---

**Note:** These diagrams are Mermaid-compatible. You can render them using:
- Mermaid Live Editor: https://mermaid.live
- GitHub (in README.md or .md files)
- Confluence, Notion, and other platforms with Mermaid support
- VS Code with Markdown Preview Enhanced extension

