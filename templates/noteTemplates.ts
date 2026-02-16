import { NoteTemplate, NoteTemplateType, TemplateSection } from '../types';

export const NOTE_TEMPLATES: Record<NoteTemplateType, NoteTemplate> = {
  soap: {
    id: 'soap',
    name: 'SOAP Note',
    description: 'Standard Subjective, Objective, Assessment, Plan format',
    icon: 'FileText',
    sections: [
      {
        id: 'subjective',
        label: 'S',
        fullName: 'Subjective',
        placeholder: 'Patient complaints, symptoms, history...',
        required: true
      },
      {
        id: 'objective',
        label: 'O',
        fullName: 'Objective',
        placeholder: 'Vital signs, physical exam findings...',
        required: true
      },
      {
        id: 'assessment',
        label: 'A',
        fullName: 'Assessment',
        placeholder: 'Clinical diagnosis and interpretation...',
        required: true
      },
      {
        id: 'plan',
        label: 'P',
        fullName: 'Plan',
        placeholder: 'Treatment plan, medications, follow-up...',
        required: true
      }
    ]
  },

  apso: {
    id: 'apso',
    name: 'APSO Note',
    description: 'Assessment-first reordered format (Assessment, Plan, Subjective, Objective)',
    icon: 'FileText',
    sections: [
      { id: 'assessment', label: 'A', fullName: 'Assessment', required: true },
      { id: 'plan', label: 'P', fullName: 'Plan', required: true },
      { id: 'subjective', label: 'S', fullName: 'Subjective', required: true },
      { id: 'objective', label: 'O', fullName: 'Objective', required: true }
    ]
  },

  comprehensive: {
    id: 'comprehensive',
    name: 'Comprehensive Note',
    description: '16-section detailed clinical documentation',
    icon: 'ClipboardList',
    sections: [
      { id: 'chief_complaint', label: 'CC', fullName: 'Chief Complaint', required: true },
      { id: 'hpi', label: 'HPI', fullName: 'History of Present Illness', required: true },
      { id: 'review_systems', label: 'ROS', fullName: 'Review of Systems' },
      { id: 'past_medical', label: 'PMH', fullName: 'Past Medical History' },
      { id: 'medications', label: 'Meds', fullName: 'Current Medications' },
      { id: 'allergies', label: 'All', fullName: 'Allergies' },
      { id: 'family_history', label: 'FH', fullName: 'Family History' },
      { id: 'social_history', label: 'SH', fullName: 'Social History' },
      { id: 'physical_exam', label: 'PE', fullName: 'Physical Examination', required: true },
      { id: 'labs', label: 'Labs', fullName: 'Laboratory Results' },
      { id: 'imaging', label: 'Img', fullName: 'Imaging Studies' },
      { id: 'assessment', label: 'A', fullName: 'Assessment', required: true },
      { id: 'plan', label: 'P', fullName: 'Plan', required: true },
      { id: 'prescriptions', label: 'Rx', fullName: 'Prescriptions' },
      { id: 'patient_instructions', label: 'PI', fullName: 'Patient Instructions' },
      { id: 'follow_up', label: 'F/U', fullName: 'Follow-up Plan' }
    ]
  },

  psychiatry: {
    id: 'psychiatry',
    name: 'Psychiatry Note',
    description: 'Mental health and psychiatric evaluation',
    icon: 'Brain',
    specialty: 'Psychiatry',
    aiPromptModifier:
      'Focus on mental health symptoms, psychiatric history, mental status examination, mood assessment, thought content and process, risk assessment, and therapeutic interventions. Use DSM terminology.',
    sections: [
      { id: 'chief_complaint', label: 'CC', fullName: 'Chief Complaint', required: true },
      { id: 'hpi', label: 'HPI', fullName: 'History of Present Illness', required: true },
      { id: 'psychiatric_history', label: 'Psych Hx', fullName: 'Psychiatric History' },
      { id: 'substance_use', label: 'Subst', fullName: 'Substance Use History' },
      { id: 'mental_status', label: 'MSE', fullName: 'Mental Status Exam', required: true },
      { id: 'appearance', label: 'App', fullName: 'Appearance & Behavior' },
      { id: 'mood_affect', label: 'M/A', fullName: 'Mood & Affect', required: true },
      { id: 'thought_process', label: 'TP', fullName: 'Thought Process' },
      { id: 'thought_content', label: 'TC', fullName: 'Thought Content', required: true },
      { id: 'perceptions', label: 'Perc', fullName: 'Perceptions' },
      { id: 'cognition', label: 'Cog', fullName: 'Cognition & Insight' },
      { id: 'risk_assessment', label: 'Risk', fullName: 'Risk Assessment', required: true },
      { id: 'diagnosis', label: 'Dx', fullName: 'Diagnosis', required: true },
      { id: 'treatment_plan', label: 'Tx', fullName: 'Treatment Plan', required: true }
    ]
  },

  cardiology: {
    id: 'cardiology',
    name: 'Cardiology Note',
    description: 'Cardiovascular focused documentation',
    icon: 'Heart',
    specialty: 'Cardiology',
    aiPromptModifier:
      'Emphasize cardiovascular symptoms, cardiac risk factors, cardiac examination findings, EKG/echocardiogram results, and cardiac-specific management.',
    sections: [
      { id: 'chief_complaint', label: 'CC', fullName: 'Chief Complaint', required: true },
      { id: 'hpi', label: 'HPI', fullName: 'History of Present Illness', required: true },
      { id: 'cardiac_risk', label: 'Risk', fullName: 'Cardiovascular Risk Factors', required: true },
      { id: 'cardiac_history', label: 'Hx', fullName: 'Cardiac History' },
      { id: 'medications', label: 'Meds', fullName: 'Current Medications' },
      { id: 'physical_exam', label: 'PE', fullName: 'Physical Examination', required: true },
      { id: 'cardiac_exam', label: 'CV', fullName: 'Cardiovascular Exam', required: true },
      { id: 'ekg', label: 'EKG', fullName: 'Electrocardiogram' },
      { id: 'echo', label: 'Echo', fullName: 'Echocardiogram' },
      { id: 'labs', label: 'Labs', fullName: 'Cardiac Biomarkers/Labs' },
      { id: 'assessment', label: 'A', fullName: 'Assessment', required: true },
      { id: 'plan', label: 'P', fullName: 'Management Plan', required: true }
    ]
  },

  emergency: {
    id: 'emergency',
    name: 'Emergency Medicine Note',
    description: 'ER/triage focused format',
    icon: 'Siren',
    specialty: 'Emergency Medicine',
    aiPromptModifier:
      'Prioritize triage assessment, time-sensitive interventions, acute management, and disposition planning. Include ESI triage level.',
    sections: [
      { id: 'chief_complaint', label: 'CC', fullName: 'Chief Complaint', required: true },
      { id: 'triage', label: 'ESI', fullName: 'Triage/ESI Level', required: true },
      { id: 'hpi', label: 'HPI', fullName: 'History of Present Illness', required: true },
      { id: 'vital_signs', label: 'VS', fullName: 'Vital Signs', required: true },
      { id: 'physical_exam', label: 'PE', fullName: 'Physical Examination', required: true },
      { id: 'diagnostics', label: 'Tests', fullName: 'Diagnostic Studies' },
      { id: 'procedures', label: 'Proc', fullName: 'Procedures Performed' },
      { id: 'assessment', label: 'A', fullName: 'ED Assessment', required: true },
      { id: 'treatment', label: 'Tx', fullName: 'ED Treatment', required: true },
      { id: 'disposition', label: 'Disp', fullName: 'Disposition', required: true },
      { id: 'discharge_instructions', label: 'D/C', fullName: 'Discharge Instructions' }
    ]
  },

  oncology: {
    id: 'oncology',
    name: 'Oncology Note',
    description: 'Cancer care and treatment documentation',
    icon: 'Activity',
    specialty: 'Oncology',
    aiPromptModifier:
      'Focus on cancer type/stage, treatment history, current symptoms, performance status, treatment response, and oncology-specific management.',
    sections: [
      { id: 'chief_complaint', label: 'CC', fullName: 'Chief Complaint', required: true },
      { id: 'cancer_history', label: 'CA Hx', fullName: 'Cancer History', required: true },
      { id: 'treatment_history', label: 'Tx Hx', fullName: 'Treatment History', required: true },
      {
        id: 'current_symptoms',
        label: 'Sx',
        fullName: 'Current Symptoms/Side Effects',
        required: true
      },
      { id: 'performance_status', label: 'ECOG', fullName: 'Performance Status' },
      { id: 'physical_exam', label: 'PE', fullName: 'Physical Examination' },
      { id: 'labs_tumor_markers', label: 'Labs', fullName: 'Labs & Tumor Markers' },
      { id: 'imaging', label: 'Img', fullName: 'Imaging Studies' },
      { id: 'assessment', label: 'A', fullName: 'Assessment/Response', required: true },
      { id: 'plan', label: 'P', fullName: 'Treatment Plan', required: true }
    ]
  },

  wellchild: {
    id: 'wellchild',
    name: 'Well Child Visit',
    description: 'Pediatric wellness check format',
    icon: 'Baby',
    specialty: 'Pediatrics',
    aiPromptModifier:
      'Focus on growth parameters, developmental milestones, immunization status, age-appropriate screening, and anticipatory guidance.',
    sections: [
      { id: 'age', label: 'Age', fullName: 'Age & Visit Type', required: true },
      { id: 'interval_history', label: 'IH', fullName: 'Interval History' },
      { id: 'growth', label: 'Growth', fullName: 'Growth Parameters', required: true },
      { id: 'development', label: 'Dev', fullName: 'Developmental Milestones', required: true },
      { id: 'nutrition', label: 'Nutr', fullName: 'Nutrition & Feeding' },
      { id: 'physical_exam', label: 'PE', fullName: 'Physical Examination', required: true },
      { id: 'screening', label: 'Screen', fullName: 'Age-Appropriate Screening' },
      { id: 'immunizations', label: 'Imm', fullName: 'Immunizations', required: true },
      {
        id: 'anticipatory_guidance',
        label: 'AG',
        fullName: 'Anticipatory Guidance',
        required: true
      },
      { id: 'assessment', label: 'A', fullName: 'Assessment' },
      { id: 'plan', label: 'P', fullName: 'Plan & Follow-up' }
    ]
  },

  diet: {
    id: 'diet',
    name: 'Nutrition/Dietitian Note',
    description: 'Nutritional assessment and counseling',
    icon: 'Apple',
    specialty: 'Nutrition/Dietetics',
    aiPromptModifier:
      'Focus on dietary history, nutritional assessment, dietary restrictions, meal planning, and nutrition education.',
    sections: [
      { id: 'reason', label: 'Reason', fullName: 'Reason for Consult', required: true },
      { id: 'dietary_history', label: 'Diet Hx', fullName: 'Dietary History', required: true },
      { id: 'anthropometrics', label: 'Anthro', fullName: 'Anthropometric Data' },
      { id: 'labs', label: 'Labs', fullName: 'Relevant Lab Values' },
      { id: 'intake', label: 'Intake', fullName: 'Dietary Intake Assessment', required: true },
      { id: 'restrictions', label: 'Restrict', fullName: 'Dietary Restrictions/Allergies' },
      { id: 'nutrition_assessment', label: 'NA', fullName: 'Nutrition Assessment', required: true },
      { id: 'diagnosis', label: 'Dx', fullName: 'Nutrition Diagnosis' },
      { id: 'goals', label: 'Goals', fullName: 'Nutrition Goals', required: true },
      { id: 'intervention', label: 'Int', fullName: 'Nutrition Intervention', required: true },
      { id: 'education', label: 'Edu', fullName: 'Education Provided' },
      { id: 'follow_up', label: 'F/U', fullName: 'Follow-up Plan' }
    ]
  },

  psychology: {
    id: 'psychology',
    name: 'Psychology/Therapy Note',
    description: 'Psychotherapy session documentation',
    icon: 'MessageCircle',
    specialty: 'Psychology/Counseling',
    aiPromptModifier:
      'Focus on presenting concerns, session content, therapeutic interventions, client progress, and treatment goals.',
    sections: [
      { id: 'presenting_concern', label: 'PC', fullName: 'Presenting Concern', required: true },
      { id: 'session_focus', label: 'Focus', fullName: 'Session Focus', required: true },
      { id: 'content', label: 'Content', fullName: 'Session Content', required: true },
      { id: 'interventions', label: 'Int', fullName: 'Interventions Used', required: true },
      { id: 'progress', label: 'Prog', fullName: 'Client Progress', required: true },
      { id: 'homework', label: 'HW', fullName: 'Homework/Between-Session Tasks' },
      { id: 'assessment', label: 'A', fullName: 'Clinical Assessment' },
      { id: 'plan', label: 'P', fullName: 'Treatment Plan Updates', required: true }
    ]
  },

  lactation: {
    id: 'lactation',
    name: 'Lactation Consultation',
    description: 'Breastfeeding and lactation support',
    icon: 'Baby',
    specialty: 'Lactation Consulting',
    aiPromptModifier:
      'Focus on breastfeeding history, infant feeding patterns, latch assessment, milk supply concerns, and lactation support strategies.',
    sections: [
      { id: 'reason', label: 'Reason', fullName: 'Reason for Consult', required: true },
      { id: 'infant_info', label: 'Infant', fullName: 'Infant Information', required: true },
      { id: 'feeding_history', label: 'Feed Hx', fullName: 'Feeding History', required: true },
      { id: 'maternal_health', label: 'Mat', fullName: 'Maternal Health' },
      { id: 'breast_assessment', label: 'Breast', fullName: 'Breast Assessment', required: true },
      { id: 'latch_observation', label: 'Latch', fullName: 'Latch & Positioning', required: true },
      { id: 'feeding_observation', label: 'Feed', fullName: 'Feeding Observation', required: true },
      { id: 'milk_transfer', label: 'Transfer', fullName: 'Milk Transfer Assessment' },
      { id: 'assessment', label: 'A', fullName: 'Lactation Assessment', required: true },
      { id: 'recommendations', label: 'Rec', fullName: 'Recommendations', required: true },
      { id: 'education', label: 'Edu', fullName: 'Education Provided' },
      { id: 'follow_up', label: 'F/U', fullName: 'Follow-up Plan', required: true }
    ]
  }
};

export const getTemplate = (templateType: NoteTemplateType): NoteTemplate => {
  return NOTE_TEMPLATES[templateType];
};

export const getTemplateSections = (templateType: NoteTemplateType): TemplateSection[] => {
  return NOTE_TEMPLATES[templateType].sections;
};

export const getAllTemplates = (): NoteTemplate[] => {
  return Object.values(NOTE_TEMPLATES);
};
