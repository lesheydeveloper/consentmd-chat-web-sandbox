'use client';

import React, { useState } from 'react';
import { X, CheckCircle2 } from 'lucide-react';

import { ConsultationType } from '../../../types';
import { getAllConsultationTypes } from '../../../constants/consultationTypes';

const ConsultationTypePicker: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: ConsultationType, reason?: string) => void;
}> = ({ isOpen, onClose, onSelect }) => {
  const [selectedType, setSelectedType] = useState<ConsultationType | null>(null);
  const [visitReason, setVisitReason] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!selectedType) {
      alert('Please select a consultation type');
      return;
    }
    onSelect(selectedType, visitReason.trim() || undefined);
    setSelectedType(null);
    setVisitReason('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[260] flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-2xl font-bold">Select Consultation Type</h2>
            <p className="text-sm text-blue-100">Choose the type of visit for context-aware documentation</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {/* Consultation Type Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
            {getAllConsultationTypes().map(type => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`text-left p-4 rounded-xl border-2 transition-all hover:shadow-md ${
                  selectedType === type.id
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-gray-900">{type.name}</h3>
                  {selectedType === type.id && (
                    <CheckCircle2 size={20} className="text-blue-500 shrink-0" />
                  )}
                </div>
                <p className="text-xs text-gray-600">{type.description}</p>
              </button>
            ))}
          </div>

          {/* Visit Reason (Optional) */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Visit Reason (Optional)
            </label>
            <textarea
              value={visitReason}
              onChange={(e) => setVisitReason(e.target.value)}
              placeholder="Brief description of visit reason (e.g., 'Chest pain x 2 days', 'Diabetes follow-up', 'Annual wellness exam')..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-none"
              rows={3}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-6 flex gap-3 justify-end bg-gray-50 shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-100 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedType}
            className={`px-6 py-2.5 rounded-xl font-bold transition-all shadow-md ${
              selectedType
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Continue to Scribe
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConsultationTypePicker;
