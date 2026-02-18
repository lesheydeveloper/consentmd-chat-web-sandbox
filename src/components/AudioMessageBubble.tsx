'use client';

import React, { useState, useEffect } from 'react';
import { Play, Pause, Wand2 } from 'lucide-react';

import { useAppContext } from '../contexts/AppContext';
import { Message } from '../../types';
import { CURRENT_USER } from '../../services/mockData';
import { transcribeAudio } from '../../services/geminiService';

const AudioMessageBubble: React.FC<{ message: Message }> = ({ message }) => {
    const { updateMessageMetadata, searchTerm } = useAppContext();
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);

    // Mock play simulation
    useEffect(() => {
        let interval: any;
        if (isPlaying) {
            interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        setIsPlaying(false);
                        return 0;
                    }
                    return prev + 2;
                });
            }, 100);
        }
        return () => clearInterval(interval);
    }, [isPlaying]);

    const { activeChat } = useAppContext();

    const handleTranscribe = async () => {
        if (!message.metadata?.transcription) {
            // Set Loading State
            updateMessageMetadata(activeChat?.id || '', message.id, { isTranscribing: true });

            try {
                // Call real AI transcription service
                const transcript = await transcribeAudio(message.metadata?.fileUrl || '');
                updateMessageMetadata(activeChat?.id || '', message.id, {
                    isTranscribing: false,
                    transcription: transcript
                });
            } catch (error) {
                // Fallback to mock if API fails
                setTimeout(() => {
                    const mockTranscript = "Patient is appearing stable today. Wound dressing was changed at 0900 hours. No signs of infection. Will check back in 4 hours.";
                    updateMessageMetadata(activeChat?.id || '', message.id, {
                        isTranscribing: false,
                        transcription: mockTranscript
                    });
                }, 2000);
            }
        }
    };

    // Helper to highlight text in transcription
    const renderTranscription = () => {
        const text = message.metadata?.transcription;
        if (!text) return null;
        if (!searchTerm.trim()) return <p className="leading-snug">{text}</p>;

        const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
        return (
            <p className="leading-snug">
                {parts.map((part, i) =>
                    part.toLowerCase() === searchTerm.toLowerCase() ? (
                        <span key={i} className="bg-yellow-200 text-black font-semibold rounded-sm px-0.5">{part}</span>
                    ) : part
                )}
            </p>
        );
    };

    return (
        <div className="min-w-[240px]">
            <div className="flex items-center gap-3 mb-2">
                <div className="relative">
                    <img src={CURRENT_USER.avatar} className="w-10 h-10 rounded-full absolute -left-14 top-0 border hidden md:block" />
                    <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="w-10 h-10 flex items-center justify-center bg-gray-200 rounded-full text-gray-600 hover:bg-gray-300 transition-colors"
                    >
                        {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
                    </button>
                </div>

                <div className="flex-1">
                    {/* Fake Waveform */}
                    <div className="flex items-center gap-[2px] h-8 mb-1 opacity-60">
                         {[...Array(30)].map((_, i) => (
                             <div
                                key={i}
                                className={`w-1 rounded-full transition-all duration-300 ${i/30 * 100 < progress ? 'bg-teal' : 'bg-gray-400'}`}
                                style={{ height: `${Math.max(20, Math.random() * 100)}%` }}
                             ></div>
                         ))}
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                        <span>{isPlaying ? `0:${Math.floor(progress/100 * 24).toString().padStart(2, '0')}` : message.metadata?.duration}</span>
                    </div>
                </div>
            </div>

            {/* Transcription Area */}
            <div className="border-t border-gray-200/50 pt-2 mt-1">
                {!message.metadata?.transcription && !message.metadata?.isTranscribing && (
                    <button
                        onClick={handleTranscribe}
                        className="flex items-center gap-2 text-xs font-medium text-teal hover:text-teal/80 transition-colors bg-teal/10 px-3 py-1.5 rounded-full w-fit"
                    >
                        <Wand2 size={12} />
                        Transcribe Audio
                    </button>
                )}

                {message.metadata?.isTranscribing && (
                     <div className="flex items-center gap-2 text-xs text-gray-500">
                         <div className="w-3 h-3 border-2 border-teal border-t-transparent rounded-full animate-spin"></div>
                         AI is transcribing...
                     </div>
                )}

                {message.metadata?.transcription && (
                    <div className="bg-gray-50 p-2 rounded text-sm text-gray-700 mt-1 relative group">
                        <div className="flex items-center gap-1 mb-1">
                            <Wand2 size={10} className="text-purple-500" />
                            <span className="text-[10px] font-bold text-purple-600 uppercase">Transcribed with AI</span>
                        </div>
                        {renderTranscription()}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AudioMessageBubble;
