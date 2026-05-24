import { NextRequest, NextResponse } from 'next/server';
import { llmClient } from '@/lib/llm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, provider, model, apiKey, mode, baseURL } = body;

    if (!messages || !provider || !apiKey) {
      return NextResponse.json(
        { error: 'Missing required fields: messages, provider, apiKey' },
        { status: 400 }
      );
    }

    if (provider === 'openai') {
      llmClient.setOpenAI(apiKey, baseURL);
    } else if (provider === 'anthropic') {
      llmClient.setAnthropic(apiKey, baseURL || 'https://api.minimax.io/anthropic');
    } else if (provider === 'custom') {
      if (!baseURL) {
        return NextResponse.json({ error: 'Base URL is required for custom provider' }, { status: 400 });
      }
      llmClient.setCustom(apiKey, baseURL);
    } else {
      return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });
    }

    const modelName = model || (provider === 'openai' ? 'gpt-4o' : provider === 'anthropic' ? 'MiniMax-M2.7' : 'gpt-4o');

    const response = await llmClient.chat({
      messages,
      mode,
      provider,
      model: modelName,
      apiKey,
      baseURL,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}