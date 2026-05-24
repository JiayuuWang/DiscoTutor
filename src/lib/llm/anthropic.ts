import Anthropic from '@anthropic-ai/sdk';
import { Message, ChatRequest, ChatResponse, ToolCall } from '@/types';

export class AnthropicClient {
  private client: Anthropic;

  constructor(apiKey: string, baseURL?: string) {
    this.client = new Anthropic({
      apiKey,
      baseURL: baseURL || 'https://api.minimax.io/anthropic',
    });
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const formattedMessages = this.formatMessages(request.messages);

    const response = await this.client.messages.create({
      model: request.model || 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: formattedMessages as Anthropic.MessageParam[],
      tools: this.getTools() as Anthropic.Tool[],
    });

    const toolCalls = this.extractToolCalls(response.content);
    const thinking = this.extractThinking(response.content);
    const content = this.extractContent(response.content);

    return {
      content,
      thinking,
      toolCalls,
    };
  }

  private formatMessages(messages: Message[]) {
    return messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));
  }

  private getTools() {
    return [
      {
        name: 'python_executor',
        description: 'Execute Python code and return the result',
        input_schema: {
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
        input_schema: {
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
        input_schema: {
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
        input_schema: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Search query' },
            num_results: { type: 'number', description: 'Number of results to return' },
          },
          required: ['query'],
        },
      },
    ];
  }

  private extractContent(content: Anthropic.Message['content']): string {
    return content
      .filter((c) => c.type === 'text')
      .map((c) => c.text)
      .join('\n');
  }

  private extractThinking(content: Anthropic.Message['content']): string | undefined {
    for (const item of content) {
      if (item.type === 'thinking') {
        return item.thinking;
      }
    }
    return undefined;
  }

  private extractToolCalls(content: Anthropic.Message['content']): ToolCall[] | undefined {
    const toolCalls: ToolCall[] = [];
    for (const item of content) {
      if (item.type === 'tool_use') {
        toolCalls.push({
          id: item.id,
          name: item.name,
          input: item.input as Record<string, unknown>,
        });
      }
    }
    return toolCalls.length > 0 ? toolCalls : undefined;
  }
}