
import { GoogleGenAI, Type } from "@google/genai";
import { ConsultationType } from "../types";
import { CONSULTATION_TYPES } from "../constants/consultationTypes";

// Use the latest gemini-3-flash-preview for basic text tasks
export const generateCallSummary = async (durationSeconds: number, transcript?: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const content = transcript || "Standard check-in call regarding vitals and medication adherence.";

    const prompt = `
      You are a medical scribe assistant for ConsentMD.
      Please summarize the following raw transcript from a healthcare voice call into a structured clinical note.
      
      Format:
      **Call Summary**
      - **Duration:** ${Math.floor(durationSeconds / 60)}m ${durationSeconds % 60}s
      - **Key Observations:** (Bulleted list)
      - **Action Items:** (Bulleted list)
      
      Raw Content:
      "${content}"
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Summary generation failed.";
  } catch (error) {
    console.error("Gemini Transcription Error:", error);
    return "Transcript generation unavailable.";
  }
};

// Use the latest gemini-3-flash-preview for clinical analysis
export const scribeAnalyzeMessage = async (message: string, currentNote: any): Promise<any> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `
      Act as a clinical scribe. Analyze the following message from a medical chat.
      Extract clinical findings and categorize them into SOAP sections (subjective, objective, assessment, plan).
      Also identify medications, symptoms, or action items.
      Return a JSON object matching this schema:
      {
        "suggestions": [
          { "section": "objective", "text": "Extracted finding", "type": "symptom|medication|action" }
        ],
        "professionalDraft": "A professional version of the input text"
      }
      
      Message: "${message}"
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Scribe Error:", error);
    return null;
  }
};

// Use the latest gemini-3-flash-preview for SOAP note generation
export const generateFullSoapNote = async (messages: any[]): Promise<any> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const chatContext = messages.map(m => `${m.senderId === 'u1' ? 'Clinician' : 'Patient/Family'}: ${m.content}`).join('\n');

    const prompt = `
      Generate a complete SOAP note based on the following conversation context.
      Be concise, professional, and use clinical terminology.
      
      Conversation:
      ${chatContext}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subjective: { type: Type.STRING },
            objective: { type: Type.STRING },
            assessment: { type: Type.STRING },
            plan: { type: Type.STRING }
          },
          required: ["subjective", "objective", "assessment", "plan"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Full SOAP Error:", error);
    return null;
  }
};

// Use the latest gemini-3-flash-preview for audio transcription
export const transcribeAudio = async (base64Audio: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'audio/webm',
              data: base64Audio,
            },
          },
          { text: "Transcribe this clinical recording exactly as spoken. Focus on medical terminology." },
        ],
      },
    });
    return response.text || "";
  } catch (error) {
    console.error("Transcription Error:", error);
    return "Error transcribing audio.";
  }
};

// Generate notes in any template format
export const generateTemplatedNote = async (
  messages: any[],
  template: any,
  consultationType?: ConsultationType,
  visitReason?: string
): Promise<any> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // Build conversation context
    const chatContext = messages.map(m => `${m.senderId === 'u1' ? 'Clinician' : 'Patient/Family'}: ${m.content}`).join('\n');

    // Build section list for prompt
    const sectionNames = template.sections.map((s: any) => s.fullName).join(', ');
    const requiredSections = template.sections
      .filter((s: any) => s.required)
      .map((s: any) => s.fullName)
      .join(', ');

    // Add specialty context if available
    const specialtyContext = template.aiPromptModifier || '';

    // Add consultation type context
    const consultationContext = consultationType
      ? CONSULTATION_TYPES[consultationType]?.aiContextModifier || ''
      : '';

    const visitReasonContext = visitReason
      ? `\n**Visit Reason:** ${visitReason}`
      : '';

    // Build comprehensive prompt
    const prompt = `
      You are a medical documentation AI assistant. Generate a complete clinical note in ${template.name} format based on the following conversation between a healthcare provider and patient/family.

      Template Format: ${template.name}
      Description: ${template.description}
      ${template.specialty ? `Specialty: ${template.specialty}` : ''}
      ${consultationType ? `Consultation Type: ${CONSULTATION_TYPES[consultationType]?.name}` : ''}${visitReasonContext}

      Required Sections: ${requiredSections}
      Optional Sections: ${sectionNames}

      ${specialtyContext}

      ${consultationContext}

      Instructions:
      - Extract relevant clinical information from the conversation
      - Format each section appropriately for ${template.specialty || 'general'} practice
      - Use standard medical terminology and abbreviations
      - Be concise and professional
      - Maintain HIPAA-compliant language
      - Only include sections where relevant information is available
      - For required sections, provide content even if limited
      ${consultationType ? `- Frame the documentation in the context of a ${CONSULTATION_TYPES[consultationType]?.name.toLowerCase()}` : ''}

      Conversation Transcript:
      ${chatContext}

      Generate the note with all applicable sections.
    `.trim();

    // Build dynamic response schema
    const properties: any = {};
    const required: string[] = [];

    template.sections.forEach((section: any) => {
      properties[section.id] = {
        type: Type.STRING,
        description: section.fullName
      };
      if (section.required) {
        required.push(section.id);
      }
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties,
          required: required.length > 0 ? required : undefined
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error(`Template Note Generation Error (${template.name}):`, error);
    return null;
  }
};

// Use the latest gemini-3-pro-preview for complex reasoning assistant
export const askAssistant = async (query: string, history: { role: string, parts: { text: string }[] }[]): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const chat = ai.chats.create({
      model: 'gemini-3-pro-preview',
      config: {
        systemInstruction: "You are the ConsentMD AI Assistant. You help healthcare providers with clinical guidelines, procedural questions, and app usage. Be professional, accurate, and concise. Always include a disclaimer that you are an AI assistant.",
      },
    });

    const result = await chat.sendMessage({ message: query });
    return result.text || "I'm sorry, I couldn't process that request.";
  } catch (error) {
    console.error("Assistant Error:", error);
    return "The AI assistant is currently unavailable.";
  }
};
