'use client';

import React, { useState, useRef, KeyboardEvent } from 'react';
import { ChatMode } from '@/types';

interface InputAreaProps {
  mode: ChatMode;
  isLoading: boolean;
  onSend: (content: string, file?: File) => void;
  onModeChange: (mode: ChatMode) => void;
}

export function InputArea({ mode, isLoading, onSend, onModeChange }: InputAreaProps) {
  const [input, setInput] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (input.trim() || file) {
      onSend(input.trim(), file || undefined);
      setInput('');
      setFile(null);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const imageFile = item.getAsFile();
        if (imageFile) {
          setFile(imageFile);
        }
        break;
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  return (
    <div className="border-t border-gray-200 bg-white px-4 py-3">
      {file && (
        <div className="mb-3 flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-sm text-gray-700">{file.name}</span>
            <button
              onClick={() => setFile(null)}
              className="ml-1 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div
        className={`flex items-end gap-2 border rounded-xl px-4 py-3 transition-colors ${
          isDragging ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder="Message MathMind..."
          className="flex-1 resize-none bg-transparent outline-none text-sm min-h-[24px] max-h-48"
          disabled={isLoading}
          rows={1}
        />

        <div className="flex items-center gap-2">
          <label
            htmlFor="file-upload"
            className="p-2 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </label>
          <input
            type="file"
            accept="image/*,.pdf,.txt"
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
          />

          <div className="w-px h-5 bg-gray-200" />

          <button
            onClick={handleSend}
            disabled={isLoading || (!input.trim() && !file)}
            className="p-2 rounded-lg bg-black text-white hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onModeChange('fast')}
            className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
              mode === 'fast'
                ? 'bg-black text-white border-black'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
            }`}
          >
            Fast
          </button>
          <button
            onClick={() => onModeChange('agent')}
            className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
              mode === 'agent'
                ? 'bg-black text-white border-black'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
            }`}
          >
            Agent
          </button>
        </div>
        <span className="text-xs text-gray-400">
          {mode === 'fast' ? 'Single response' : 'Tool calling enabled'}
        </span>
      </div>
    </div>
  );
}