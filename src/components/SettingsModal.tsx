'use client';

import React, { useState } from 'react';
import { ChatSettings } from '@/types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ChatSettings;
  onSave: (settings: Partial<ChatSettings>) => void;
}

export function SettingsModal({ isOpen, onClose, settings, onSave }: SettingsModalProps) {
  const [provider, setProvider] = useState<'openai' | 'anthropic' | 'custom'>(settings.provider);
  const [apiKey, setApiKey] = useState(settings.apiKey);
  const [model, setModel] = useState(settings.model);
  const [baseURL, setBaseURL] = useState(settings.baseURL || '');

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({ provider, apiKey, model, baseURL: baseURL || undefined });
    onClose();
  };

  const defaultBaseURLs = {
    openai: 'https://api.openai.com/v1',
    anthropic: 'https://api.minimax.io/anthropic',
    custom: '',
  };

  const defaultModels = {
    openai: 'gpt-4o',
    anthropic: 'MiniMax-M2.7',
    custom: 'gpt-4o',
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Settings</h2>
        <p className="text-sm text-gray-700 mb-5">Configure your AI provider</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1.5">Provider</label>
            <select
              value={provider}
              onChange={(e) => {
                setProvider(e.target.value as typeof provider);
                setBaseURL(defaultBaseURLs[e.target.value as keyof typeof defaultBaseURLs]);
                setModel(defaultModels[e.target.value as keyof typeof defaultModels]);
              }}
              className="w-full p-3 border border-gray-200 rounded-xl bg-white text-sm focus:outline-none focus:border-gray-400 transition-colors"
            >
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-400 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Model</label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder={defaultModels[provider]}
              className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-400 transition-colors"
            />
          </div>

          {(provider === 'custom' || provider === 'anthropic') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Base URL</label>
              <input
                type="text"
                value={baseURL}
                onChange={(e) => setBaseURL(e.target.value)}
                placeholder={defaultBaseURLs[provider]}
                className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-gray-400 transition-colors"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-sm text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2.5 text-sm bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}