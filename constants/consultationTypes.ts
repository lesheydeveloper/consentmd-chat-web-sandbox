import { ConsultationType, ConsultationTypeInfo } from '../types';

export const CONSULTATION_TYPES: Record<ConsultationType, ConsultationTypeInfo> = {
  initial_consultation: {
    id: 'initial_consultation',
    name: 'Initial Consultation',
    description: 'First visit with patient, comprehensive history',
    icon: 'UserPlus',
    aiContextModifier: 'This is an initial consultation. Focus on comprehensive patient history, establishing baseline, and initial assessment. Include detailed past medical history, social history, and family history.'
  },
  follow_up: {
    id: 'follow_up',
    name: 'Follow-up Visit',
    description: 'Return visit for ongoing care',
    icon: 'RefreshCw',
    aiContextModifier: 'This is a follow-up visit. Focus on interval changes, treatment response, medication compliance, and any new concerns since last visit.'
  },
  emergency: {
    id: 'emergency',
    name: 'Emergency Visit',
    description: 'Urgent/emergent medical situation',
    icon: 'AlertCircle',
    aiContextModifier: 'This is an emergency visit. Prioritize chief complaint, acute symptoms, time-sensitive interventions, and disposition planning.'
  },
  routine_checkup: {
    id: 'routine_checkup',
    name: 'Routine Check-up',
    description: 'Scheduled preventive care visit',
    icon: 'Heart',
    aiContextModifier: 'This is a routine check-up. Focus on preventive care, health maintenance, screening tests, and wellness counseling.'
  },
  annual_physical: {
    id: 'annual_physical',
    name: 'Annual Physical',
    description: 'Comprehensive yearly examination',
    icon: 'Activity',
    aiContextModifier: 'This is an annual physical examination. Include comprehensive review of systems, complete physical exam, age-appropriate screening, and preventive health measures.'
  },
  urgent_care: {
    id: 'urgent_care',
    name: 'Urgent Care',
    description: 'Non-emergent but timely medical need',
    icon: 'Clock',
    aiContextModifier: 'This is an urgent care visit. Address acute but non-life-threatening symptoms with focused assessment and treatment plan.'
  },
  telemedicine: {
    id: 'telemedicine',
    name: 'Telemedicine Visit',
    description: 'Virtual healthcare consultation',
    icon: 'Video',
    aiContextModifier: 'This is a telemedicine visit conducted remotely. Note any limitations in physical examination and emphasize patient-reported symptoms.'
  },
  post_op_followup: {
    id: 'post_op_followup',
    name: 'Post-Op Follow-up',
    description: 'Post-operative care visit',
    icon: 'Scissors',
    aiContextModifier: 'This is a post-operative follow-up. Focus on surgical site healing, complications, pain management, and recovery progress.'
  },
  pre_op_evaluation: {
    id: 'pre_op_evaluation',
    name: 'Pre-Op Evaluation',
    description: 'Pre-operative assessment',
    icon: 'FileCheck',
    aiContextModifier: 'This is a pre-operative evaluation. Focus on surgical risk assessment, medical optimization, and clearance documentation.'
  },
  medication_review: {
    id: 'medication_review',
    name: 'Medication Review',
    description: 'Medication management visit',
    icon: 'Pill',
    aiContextModifier: 'This is a medication review visit. Focus on current medications, adherence, side effects, drug interactions, and dosage adjustments.'
  },
  lab_results_review: {
    id: 'lab_results_review',
    name: 'Lab Results Review',
    description: 'Discussion of test results',
    icon: 'Flask',
    aiContextModifier: 'This is a lab results review. Focus on interpreting test results, clinical significance, and any needed follow-up or treatment changes.'
  }
};

export const getConsultationType = (type: ConsultationType): ConsultationTypeInfo => {
  return CONSULTATION_TYPES[type];
};

export const getAllConsultationTypes = (): ConsultationTypeInfo[] => {
  return Object.values(CONSULTATION_TYPES);
};
