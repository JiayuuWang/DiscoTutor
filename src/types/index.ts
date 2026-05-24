export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  thinking?: string;
  toolCalls?: ToolCall[];
  toolResults?: ToolResult[];
  timestamp: number;
}

export interface ToolCall {
  id: string;
  name: string;
  input: Record<string, unknown>;
}

export interface ToolResult {
  toolCallId: string;
  output: unknown;
  error?: string;
}

export interface ChatSettings {
  provider: 'openai' | 'anthropic' | 'custom';
  model: string;
  apiKey: string;
  baseURL?: string;
}

export type ChatMode = 'fast' | 'agent';

export interface ChatState {
  messages: Message[];
  mode: ChatMode;
  settings: ChatSettings;
  isLoading: boolean;
  error: string | null;
}

export interface ChatRequest {
  messages: Message[];
  mode: ChatMode;
  provider: 'openai' | 'anthropic' | 'custom';
  model: string;
  apiKey: string;
  baseURL?: string;
}

export interface ChatResponse {
  content: string;
  thinking?: string;
  toolCalls?: ToolCall[];
}

export interface ToolExecuteRequest {
  tool: string;
  params: Record<string, unknown>;
}

export interface ToolExecuteResponse {
  result: unknown;
  error?: string;
}

export interface Tool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, { type: string; description?: string }>;
    required?: string[];
  };
}

export const AVAILABLE_TOOLS: Tool[] = [
  {
    name: 'python_executor',
    description: 'Execute Python code and return the result',
    inputSchema: {
      type: 'object',
      properties: {
        code: { type: 'string', description: 'Python code to execute' },
      },
      required: ['code'],
    },
  },
  {
    name: 'file_reader',
    description: 'Read content from a local file',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Path to the file to read' },
      },
      required: ['path'],
    },
  },
  {
    name: 'file_writer',
    description: 'Write content to a local file',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Path to the file to write' },
        content: { type: 'string', description: 'Content to write to the file' },
      },
      required: ['path', 'content'],
    },
  },
  {
    name: 'web_search',
    description: 'Search the web for information',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query' },
        num_results: { type: 'number', description: 'Number of results to return' },
      },
      required: ['query'],
    },
  },
];