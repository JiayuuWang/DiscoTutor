'use client';

import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { Message, ChatMode, ChatSettings, ToolCall, ToolResult } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface ChatStore {
  messages: Message[];
  mode: ChatMode;
  settings: ChatSettings;
  isLoading: boolean;
  error: string | null;
}

type ChatAction =
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'UPDATE_MESSAGE'; payload: { id: string; updates: Partial<Message> } }
  | { type: 'CLEAR_MESSAGES' }
  | { type: 'SET_MODE'; payload: ChatMode }
  | { type: 'SET_SETTINGS'; payload: Partial<ChatSettings> }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

interface ChatContextValue extends ChatStore {
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => Message;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  clearMessages: () => void;
  setMode: (mode: ChatMode) => void;
  setSettings: (settings: Partial<ChatSettings>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const initialState: ChatStore = {
  messages: [],
  mode: 'fast',
  settings: {
    provider: 'openai',
    model: 'gpt-4o',
    apiKey: '',
    baseURL: '',
  },
  isLoading: false,
  error: null,
};

function chatReducer(state: ChatStore, action: ChatAction): ChatStore {
  switch (action.type) {
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] };
    case 'UPDATE_MESSAGE':
      return {
        ...state,
        messages: state.messages.map((m) =>
          m.id === action.payload.id ? { ...m, ...action.payload.updates } : m
        ),
      };
    case 'CLEAR_MESSAGES':
      return { ...state, messages: [] };
    case 'SET_MODE':
      return { ...state, mode: action.payload };
    case 'SET_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  const addMessage = useCallback((message: Omit<Message, 'id' | 'timestamp'>): Message => {
    const newMessage: Message = {
      ...message,
      id: uuidv4(),
      timestamp: Date.now(),
    };
    dispatch({ type: 'ADD_MESSAGE', payload: newMessage });
    return newMessage;
  }, []);

  const updateMessage = useCallback((id: string, updates: Partial<Message>) => {
    dispatch({ type: 'UPDATE_MESSAGE', payload: { id, updates } });
  }, []);

  const clearMessages = useCallback(() => {
    dispatch({ type: 'CLEAR_MESSAGES' });
  }, []);

  const setMode = useCallback((mode: ChatMode) => {
    dispatch({ type: 'SET_MODE', payload: mode });
  }, []);

  const setSettings = useCallback((settings: Partial<ChatSettings>) => {
    dispatch({ type: 'SET_SETTINGS', payload: settings });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  return (
    <ChatContext.Provider
      value={{
        ...state,
        addMessage,
        updateMessage,
        clearMessages,
        setMode,
        setSettings,
        setLoading,
        setError,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}