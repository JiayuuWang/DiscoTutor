'use client';

import React from 'react';

interface ThinkingPanelProps {
  thinking: string;
}

export function ThinkingPanel({ thinking }: ThinkingPanelProps) {
  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
        <p className="text-xs font-medium text-gray-900">Thinking</p>
      </div>
      <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{thinking}</p>
    </div>
  );
}