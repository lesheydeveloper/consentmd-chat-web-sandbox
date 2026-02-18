'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname, useParams } from 'next/navigation';
import {
  MessageSquare, Users, Phone, Video, Mic, Paperclip, Send,
  Settings, LogOut, Calendar, X, Check, CheckCheck,
  MoreVertical, Search, FileText, Stethoscope, Plus, Smile, Image as ImageIcon,
  PhoneOff, Play, Pause, Download, Share2, ChevronLeft, ChevronRight,
  File, ZoomIn, ZoomOut, Minimize2, Wand2, PhoneCall, MessageCircle, PhoneIncoming, PhoneOutgoing, PhoneMissed,
  Bell, Ban, ThumbsDown, Lock, Wifi, Pin, PinOff, MonitorUp, Captions, Type, Delete, Grid, ArrowDownLeft, ArrowUpRight,
  ClipboardList, Sparkles, RefreshCw, Save, Trash2, Edit3, CheckCircle2, CirclePause, CirclePlay, Loader2,
  Heart, User as UserIcon, Clock, Info, ExternalLink, Maximize2, Map as MapIcon, ArrowLeft, MicOff, VideoOff,
  Camera, Eye, UserPlus, FileCheck, AlertCircle,
  Copy, ChevronDown, ChevronUp, WifiOff, Shield, BellOff
} from 'lucide-react';

import { useAppContext } from '../../contexts/AppContext';
import { User, Chat, Message, GroupType, UserRole, PatientProfile, CallLog, ClinicalNote, SoapSection, NoteTemplateType, UserPreferences, ConsultationType } from '../../../types';
import { MOCK_CALLS, USERS } from '../../../services/mockData';
import { NOTE_TEMPLATES, getAllTemplates } from '../../../templates/noteTemplates';
import { CONSULTATION_TYPES, getAllConsultationTypes } from '../../../constants/consultationTypes';

const PatientView: React.FC = () => {
    const { patients, selectedPatientId, setSelectedPatientId, addPatient } = useAppContext() as any;
    const [isAddingPatient, setIsAddingPatient] = useState(false);
    const [newPatientForm, setNewPatientForm] = useState({ name: '', dob: '', address: '' });

    const selectedPatient = patients.find((p: PatientProfile) => p.id === selectedPatientId);
    const selectedUser = selectedPatientId ? USERS.find(u => u.id === selectedPatient?.userId) : null;

    const handleAddPatient = () => {
        if (!newPatientForm.name || !newPatientForm.dob) {
            alert('Please fill in name and date of birth');
            return;
        }
        addPatient(newPatientForm);
        setNewPatientForm({ name: '', dob: '', address: '' });
        setIsAddingPatient(false);
    };

    return (
        <div className="h-full flex bg-white overflow-hidden">
            {/* Patient List - Left Panel */}
            <div className="w-full md:w-80 border-r border-gray-200 flex flex-col bg-gray-50">
                <div className="p-4 md:p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-lg md:text-xl font-bold text-navy">Patients</h1>
                        <button
                            onClick={() => setIsAddingPatient(!isAddingPatient)}
                            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                            title="Add Patient"
                        >
                            <Plus size={20} className="text-teal" />
                        </button>
                    </div>

                    {/* Add Patient Form */}
                    {isAddingPatient && (
                        <div className="space-y-3 bg-white p-4 rounded-xl border border-teal/20">
                            <input
                                type="text"
                                placeholder="Patient Name"
                                value={newPatientForm.name}
                                onChange={(e) => setNewPatientForm(prev => ({ ...prev, name: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-teal focus:ring-2 focus:ring-teal/20"
                            />
                            <input
                                type="date"
                                value={newPatientForm.dob}
                                onChange={(e) => setNewPatientForm(prev => ({ ...prev, dob: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-teal focus:ring-2 focus:ring-teal/20"
                            />
                            <input
                                type="text"
                                placeholder="Address (optional)"
                                value={newPatientForm.address}
                                onChange={(e) => setNewPatientForm(prev => ({ ...prev, address: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-teal focus:ring-2 focus:ring-teal/20"
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={handleAddPatient}
                                    className="flex-1 px-3 py-2 bg-teal text-white rounded-lg font-bold text-sm hover:bg-teal/90 transition-all"
                                >
                                    Add
                                </button>
                                <button
                                    onClick={() => setIsAddingPatient(false)}
                                    className="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg font-bold text-sm hover:bg-gray-300 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Patient List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {patients.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">No patients yet</div>
                    ) : (
                        <div className="space-y-2 p-4">
                            {patients.map((patient: PatientProfile) => (
                                <button
                                    key={patient.id}
                                    onClick={() => setSelectedPatientId(patient.id)}
                                    className={`w-full text-left p-4 rounded-lg transition-all ${
                                        selectedPatientId === patient.id
                                            ? 'bg-white border-2 border-teal shadow-md'
                                            : 'bg-white border border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <div className="font-bold text-navy text-sm">{USERS.find(u => u.id === patient.userId)?.name || 'Unknown'}</div>
                                    <div className="text-xs text-teal font-bold mt-1">MRN: {patient.mrn}</div>
                                    <div className="text-xs text-gray-500 mt-1">{patient.dob}</div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Patient Details - Right Panel */}
            {selectedPatient && selectedUser ? (
                <div className="flex-1 p-4 md:p-8 overflow-y-auto custom-scrollbar animate-[fadeIn_0.3s_ease-out]">
                    <div className="max-w-4xl">
                        {/* Patient Header */}
                        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 mb-8 bg-gray-50 p-6 md:p-10 rounded-3xl border border-gray-100 shadow-sm">
                            <img src={selectedUser.avatar} className="w-24 h-24 md:w-32 md:h-32 rounded-3xl object-cover border-4 border-white shadow-xl" />
                            <div className="text-center md:text-left flex-1">
                                <h1 className="text-2xl md:text-4xl font-black text-navy mb-2">{selectedUser.name}</h1>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-gray-500 text-xs font-bold uppercase tracking-wider">
                                    <span className="flex items-center gap-2 bg-teal text-white px-3 py-1 rounded-full">MRN: {selectedPatient.mrn}</span>
                                    <span className="flex items-center gap-2"><Calendar size={14} className="text-teal"/> {selectedPatient.dob}</span>
                                    <span className="flex items-center gap-2"><MapIcon size={14} className="text-teal"/> {selectedPatient.address || 'No address'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Patient Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                            {/* Diagnosis */}
                            <div className="bg-white border border-gray-100 p-6 md:p-8 rounded-[28px] shadow-sm">
                                <h2 className="font-black text-navy mb-4 md:mb-6 flex items-center gap-3 text-base md:text-lg uppercase tracking-tight">
                                    <Stethoscope size={20} className="text-teal" /> Diagnosis
                                </h2>
                                <div className="flex flex-wrap gap-2">
                                    {selectedPatient.diagnosis.length === 0 ? (
                                        <span className="text-gray-500 text-sm">No diagnoses recorded</span>
                                    ) : (
                                        selectedPatient.diagnosis.map((d: string) => (
                                            <span key={d} className="px-4 py-2 bg-red-50 text-red-700 rounded-xl text-xs font-black border border-red-100">
                                                {d}
                                            </span>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Medications */}
                            <div className="bg-white border border-gray-100 p-6 md:p-8 rounded-[28px] shadow-sm">
                                <h2 className="font-black text-navy mb-4 md:mb-6 flex items-center gap-3 text-base md:text-lg uppercase tracking-tight">
                                    <FileText size={20} className="text-teal" /> Medications
                                </h2>
                                <div className="space-y-3">
                                    {selectedPatient.medications.length === 0 ? (
                                        <span className="text-gray-500 text-sm">No medications recorded</span>
                                    ) : (
                                        selectedPatient.medications.map((m: any) => (
                                            <div key={m.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                                                <span className="font-black text-navy text-sm">{m.name}</span>
                                                <span className="bg-white px-3 py-1 rounded-lg border border-gray-100 text-xs font-black text-teal">{m.dosage}</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Allergies */}
                            <div className="bg-white border border-gray-100 p-6 md:p-8 rounded-[28px] shadow-sm">
                                <h2 className="font-black text-navy mb-4 md:mb-6 flex items-center gap-3 text-base md:text-lg uppercase tracking-tight">
                                    <AlertCircle size={20} className="text-orange-500" /> Allergies
                                </h2>
                                <div className="flex flex-wrap gap-2">
                                    {selectedPatient.allergies.length === 0 ? (
                                        <span className="text-gray-500 text-sm">No allergies recorded</span>
                                    ) : (
                                        selectedPatient.allergies.map((a: string) => (
                                            <span key={a} className="px-4 py-2 bg-orange-50 text-orange-700 rounded-xl text-xs font-black border border-orange-100">
                                                {a}
                                            </span>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center text-gray-400">
                    <div className="text-center">
                        <Users size={48} className="mx-auto mb-4 opacity-30" />
                        <p>Select a patient to view details</p>
                    </div>
                </div>
            )}
        </div>
    );
};
export default PatientView;