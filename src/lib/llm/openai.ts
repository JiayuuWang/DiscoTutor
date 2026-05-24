import OpenAI from 'openai';
import { Message, ChatRequest, ChatResponse, ToolCall } from '@/types';

export class OpenAIClient {
  private client: OpenAI;

  constructor(apiKey: string, baseURL?: string) {
    this.client = new OpenAI({ apiKey, baseURL });
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const formattedMessages = this.formatMessages(request.messages);

    const response = await this.client.chat.completions.create({
      model: request.model || 'gpt-4o',
      messages: formattedMessages,
      tools: this.getTools(),
    });

    const message = response.choices[0]?.message;
    if (!message) {
      throw new Error('No response from OpenAI');
    }

    const toolCalls = message.tool_calls?.map((tc) => {
      const fn = (tc as unknown as { function: { name: string; arguments: string } }).function;
      return {
        id: tc.id,
        name: fn.name,
        input: JSON.parse(fn.arguments),
      };
    }) || undefined;

    return {
      content: message.content || '',
      toolCalls,
    };
  }

  private formatMessages(messages: Message[]) {
    return messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: (m.role === 'assistant' ? 'assistant' : m.role) as 'user' | 'assistant',
        content: m.content,
      }));
  }

  private getTools() {
    return [
      {
        type: 'function' as const,
        function: {
          name: 'python_executor',
          description: 'Execute Python code and return the result',
          parameters: {
            type: 'object',
            properties: {
              code: { type: 'string', description: 'Python code to execute' },
            },
            required: ['code'],
          },
        },
      },
      {
        type: 'function' as const,
        function: {
          name: 'file_reader',
          description: 'Read content from a local file',
          parameters: {
            type: 'object',
            properties: {
              path: { type: 'string', description: 'Path to the file to read' },
            },
            required: ['path'],
          },
        },
      },
      {
        type: 'function' as const,
        function: {
          name: 'file_writer',
          description: 'Write content to a local file',
          parameters: {
            type: 'object',
            properties: {
              path: { type: 'string', description: 'Path to the file to write' },
              content: { type: 'string', description: 'Content to write to the file' },
            },
            required: ['path', 'content'],
          },
        },
      },
      {
        type: 'function' as const,
        function: {
          name: 'web_search',
          description: 'Search the web for information',
          parameters: {
            type: 'object',
            properties: {
              query: { type: 'string', description: 'Search query' },
              num_results: { type: 'number', description: 'Number of results to return' },
            },
            required: ['query'],
          },
        },
      },
    ];
  }
}