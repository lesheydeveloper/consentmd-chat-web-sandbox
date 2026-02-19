'use client';

import React from 'react';
import { X, Type, Heart, CheckCircle2 } from 'lucide-react';

import { useAppContext } from '../../contexts/AppContext';
import { NoteTemplateType } from '../../../types';
import { NOTE_TEMPLATES, getAllTemplates } from '../../../templates/noteTemplates';

const TemplatePickerModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSelect: (templateType: NoteTemplateType) => void;
  currentTemplate?: NoteTemplateType;
}> = ({ isOpen, onClose, onSelect, currentTemplate }) => {
  const { userPreferences } = useAppContext();
  const favorites = userPreferences.favoriteTemplates || [];

  if (!isOpen) return null;

  const handleSelect = (templateId: NoteTemplateType) => {
    onSelect(templateId);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-teal text-white p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <Type size={24} />
            <h2 className="text-2xl font-bold">Choose Note Template</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          {/* Favorites Section */}
          {favorites.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-2">
                <Heart size={16} className="text-red-500" />
                Your Favorites
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                {favorites.map(fav => {
                  const template = NOTE_TEMPLATES[fav];
                  return (
                    <button
                      key={template.id}
                      onClick={() => handleSelect(template.id)}
                      className={`text-left p-4 rounded-xl border-2 transition-all hover:shadow-md ${
                        currentTemplate === template.id
                          ? 'border-red-300 bg-red-50'
                          : 'border-red-200 bg-red-50/50 hover:border-red-300'
                      }`}
                    >
                      <h4 className="font-bold text-gray-900 mb-1">{template.name}</h4>
                      <p className="text-xs text-gray-600">{template.description}</p>
                      {template.specialty && (
                        <span className="inline-block mt-2 px-2 py-1 bg-red-100 text-red-700 rounded-full text-[10px] font-bold">
                          {template.specialty}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              <hr className="mb-8" />
            </div>
          )}

          {/* All Templates Section */}
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">
            All Templates
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {getAllTemplates().map(template => (
              <button
                key={template.id}
                onClick={() => handleSelect(template.id)}
                className={`text-left p-4 rounded-xl border-2 transition-all hover:shadow-md ${
                  currentTemplate === template.id
                    ? 'border-teal bg-teal/5 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-bold text-gray-900">{template.name}</h4>
                  {currentTemplate === template.id && (
                    <CheckCircle2 size={18} className="text-teal shrink-0" />
                  )}
                </div>
                <p className="text-xs text-gray-600 mb-2">{template.description}</p>
                {template.specialty && (
                  <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-[10px] font-bold">
                    {template.specialty}
                  </span>
                )}
                <div className="mt-2 flex flex-wrap gap-1">
                  {template.sections.slice(0, 4).map(section => (
                    <span key={section.id} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[9px] font-medium">
                      {section.label}
                    </span>
                  ))}
                  {template.sections.length > 4 && (
                    <span className="px-1.5 py-0.5 text-gray-400 text-[9px]">
                      +{template.sections.length - 4}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-4 flex justify-end gap-3 bg-gray-50 shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-100 transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplatePickerModal;
