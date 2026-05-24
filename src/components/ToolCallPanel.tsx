'use client';

import React from 'react';
import { ToolCall } from '@/types';

interface ToolCallPanelProps {
  toolCall: ToolCall;
}

export function ToolCallPanel({ toolCall }: ToolCallPanelProps) {
  return (
    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-5 h-5 bg-black rounded flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-xs font-semibold text-gray-700">{toolCall.name}</p>
      </div>
      <pre className="text-xs text-gray-500 font-mono overflow-x-auto">
        {JSON.stringify(toolCall.input, null, 2)}
      </pre>
    </div>
  );
}