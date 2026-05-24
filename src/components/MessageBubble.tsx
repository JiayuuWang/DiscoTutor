'use client';

import React from 'react';
import { Message } from '@/types';
import { ThinkingPanel } from './ThinkingPanel';
import { ToolCallPanel } from './ToolCallPanel';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} px-6 py-1`}>
      <div
        className={`max-w-[75%] rounded-2xl px-5 py-3.5 ${
          isUser
            ? 'bg-gray-900 text-white'
            : 'bg-white border border-gray-200 shadow-sm'
        }`}
      >
        <div className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</div>

        {message.thinking && (
          <ThinkingPanel thinking={message.thinking} />
        )}

        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className="mt-4 space-y-2">
            {message.toolCalls.map((tc) => (
              <ToolCallPanel key={tc.id} toolCall={tc} />
            ))}
          </div>
        )}

        {message.toolResults && message.toolResults.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-xs font-medium text-gray-900">Results:</p>
            {message.toolResults.map((tr) => (
              <div key={tr.toolCallId} className="p-3 bg-gray-50 rounded-lg text-xs font-mono text-gray-800">
                {tr.error ? (
                  <span className="text-red-500">Error: {tr.error}</span>
                ) : (
                  String(tr.output)
                )}
              </div>
            ))}
          </div>
        )}

        <div className={`text-xs mt-2 ${isUser ? 'text-gray-400' : 'text-gray-400'}`}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}