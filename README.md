
# ConsentMD - Clinical Communication Hub

ConsentMD is a HIPAA-ready, secure communication platform tailored for Home Healthcare providers. It combines the ease of use of WhatsApp with advanced AI-powered documentation tools to streamline clinical workflows.

## 🚀 Key Features

### 💬 Secure Messaging (WhatsApp-Style)
- **Familiar UI/UX**: Intuitive direct and group messaging interface optimized for both mobile and desktop. Includes native-feeling message bubbles, read receipts, and timestamps.
- **Clinical Attachments**: Securely share high-resolution images (wounds, prescriptions) and documents (PDFs, lab results).
- **In-Chat Audio Transcription**: Long-press the microphone to dictate clinical notes or messages, automatically transcribed using state-of-the-art medical speech-to-text models.

### 🎙️ AI Clinical Scribe
- **Real-time Monitoring**: The scribe acts continuously in the background, analyzing chat conversations in real-time to extract symptoms, medications, and action items.
- **Voice-to-SOAP**: Advanced medical transcription that captures clinician dictation and maps it directly to actionable insights.
- **Automated SOAP Note Generation**: Instantly synthesize a full Subjective, Objective, Assessment, and Plan (SOAP) narrative from the entire conversation context with a single click.
- **Intelligent Suggestions Feed**: Drafted insights appear in the intelligence feed overlay, allowing clinicians to review, edit, and finalize records into official documentation.

### 🏥 Patient & Care Management
- **Integrated Profiles**: Quick access to patient DOB, diagnosis history, allergies, and active medications.
- **Care Team Hubs**: Specialized group chats for multidisciplinary care coordination.
- **Virtual Consult Logs**: Comprehensive history of voice and video calls with AI-generated narrative summaries ready for EHR entry.

### 📱 Mobile-First Excellence
- **Responsive Layout**: Seamless transition from a desktop sidebar/panel view to a highly focused mobile navigation experience.
- **Adaptive Routing**: On mobile devices, the interface intelligently switches between the contact list and active chat window to maximize screen real estate.
- **Overlay Panels**: Scribe tools and Contact Info panels morph into full-screen immersive overlays on mobile to ensure usability without zooming or horizontal scrolling.

## 🛠️ Recent Changes & Refinements

1. **Streamlined Experience**: Removed legacy "Vitals" and "AI Assistant" modules to completely focus the product on its core strength: intelligent communication and documentation.
2. **True Mobile Adaptivity**: 
   - Rebuilt the navigation sidebar as a sticky bottom-nav for mobile devices.
   - Implemented conditional responsive rendering (hiding the chat list automatically when a chat thread is selected on mobile).
   - Added explicit mobile "Back" navigation within the chat view.
3. **Enhanced Scribe UI**: Updated the `NotesPanel` with a streamlined SOAP tab system and localized finalize/edit actions for AI suggestions.
4. **WhatsApp Styling**: Implemented signature message tails, chat backgrounds, and color palettes for a familiar, high-performance feel.

## 🔒 Security Architecture
- **HIPAA-Ready Architecture**: All communication data and AI transcription logic processed via secure API layers.
- **Protected File Previews**: Intercepted and isolated viewing of medical imagery to prevent accidental saving to local unencrypted camera rolls.
