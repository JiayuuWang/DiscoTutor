import { ChatRequest, ChatResponse } from '@/types';
import { OpenAIClient } from './openai';
import { AnthropicClient } from './anthropic';

export class LLMClient {
  private openaiClient: OpenAIClient | null = null;
  private anthropicClient: AnthropicClient | null = null;

  setOpenAI(apiKey: string, baseURL?: string) {
    this.openaiClient = new OpenAIClient(apiKey, baseURL);
  }

  setAnthropic(apiKey: string, baseURL?: string) {
    this.anthropicClient = new AnthropicClient(apiKey, baseURL);
  }

  setCustom(apiKey: string, baseURL: string) {
    this.openaiClient = new OpenAIClient(apiKey, baseURL);
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    if (request.provider === 'openai') {
      if (!this.openaiClient) {
        throw new Error('OpenAI client not initialized');
      }
      return this.openaiClient.chat(request);
    } else if (request.provider === 'custom') {
      if (!this.openaiClient) {
        throw new Error('Custom client not initialized');
      }
      return this.openaiClient.chat(request);
    } else {
      if (!this.anthropicClient) {
        throw new Error('Anthropic client not initialized');
      }
      return this.anthropicClient.chat(request);
    }
  }

  hasProvider(provider: 'openai' | 'anthropic' | 'custom'): boolean {
    if (provider === 'openai' || provider === 'custom') {
      return this.openaiClient !== null;
    }
    return this.anthropicClient !== null;
  }
}

export const llmClient = new LLMClient();