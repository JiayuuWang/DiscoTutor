'use client';

import React, { useState, useCallback } from 'react';
import { useChat } from '@/store/chat';
import { MessageList } from './MessageList';
import { InputArea } from './InputArea';
import { SettingsModal } from './SettingsModal';

export function ChatContainer() {
  const {
    messages,
    mode,
    settings,
    isLoading,
    error,
    addMessage,
    updateMessage,
    clearMessages,
    setMode,
    setSettings,
    setLoading,
    setError,
  } = useChat();

  const [showSettings, setShowSettings] = useState(false);

  const handleSend = useCallback(
    async (content: string, file?: File) => {
      if (!settings.apiKey) {
        setError('Please configure API Key in settings');
        return;
      }

      let imageData: string | undefined;
      if (file) {
        const reader = new FileReader();
        imageData = await new Promise((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      }

      addMessage({
        role: 'user',
        content: imageData ? `${content}\n[image uploaded]` : content,
      });

      setLoading(true);
      setError(null);

      try {
        if (mode === 'fast') {
          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messages: [
                ...messages.map((m) => ({
                  role: m.role,
                  content: m.content,
                })),
                { role: 'user', content: imageData ? `${content}\n\n![image](${imageData})` : content },
              ],
              mode,
              provider: settings.provider,
              model: settings.model,
              apiKey: settings.apiKey,
              baseURL: settings.baseURL,
            }),
          });

          const data = await response.json();
          if (!response.ok) throw new Error(data.error || 'Request failed');

          addMessage({
            role: 'assistant',
            content: data.content,
            thinking: data.thinking,
            toolCalls: data.toolCalls,
          });
        } else {
          await runAgentMode(messages, content, imageData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    },
    [settings, mode, messages, addMessage, setLoading, setError]
  );

  const runAgentMode = async (
    existingMessages: typeof messages,
    newContent: string,
    imageData?: string
  ) => {
    const allMessages = [
      ...existingMessages.map((m) => ({ role: m.role, content: m.content })),
      { role: 'user' as const, content: imageData ? `${newContent}\n\n![image](${imageData})` : newContent },
    ];

    let currentMessages = allMessages;
    let iteration = 0;
    const maxIterations = 10;

    while (iteration < maxIterations) {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: currentMessages,
          mode: 'agent',
          provider: settings.provider,
          model: settings.model,
          apiKey: settings.apiKey,
          baseURL: settings.baseURL,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Request failed');

      const assistantMsg = addMessage({
        role: 'assistant',
        content: data.content,
        thinking: data.thinking,
        toolCalls: data.toolCalls,
      });

      if (!data.toolCalls || data.toolCalls.length === 0) {
        break;
      }

      const toolResults = [];
      for (const toolCall of data.toolCalls) {
        const result = await fetch('/api/tools/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tool: toolCall.name,
            params: toolCall.input,
          }),
        });
        const toolResult = await result.json();
        toolResults.push({
          toolCallId: toolCall.id,
          output: toolResult.result,
          error: toolResult.error,
        });
      }

      updateMessage(assistantMsg.id, { toolResults });

      currentMessages = [
        ...currentMessages.map((m) => ({ role: m.role, content: m.content })),
        {
          role: 'assistant' as const,
          content: data.content + toolResults.map((r) => `\n\n[Tool: ${r.toolCallId}] ${r.error || String(r.output)}`).join(''),
        },
      ];

      iteration++;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gray-900 rounded-xl flex items-center justify-center">
            <span className="text-white font-semibold text-lg">D</span>
          </div>
          <div>
            <h1 className="text-base font-medium text-gray-900">DiscoTutor</h1>
            <p className="text-xs text-gray-400">Discrete Math Solver</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {messages.length > 0 && (
            <button
              onClick={clearMessages}
              className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Clear
            </button>
          )}
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </header>

      {error && (
        <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg">
          {error}
        </div>
      )}

      <MessageList messages={messages} />

      <InputArea
        mode={mode}
        isLoading={isLoading}
        onSend={handleSend}
        onModeChange={setMode}
      />

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSave={setSettings}
      />
    </div>
  );
}