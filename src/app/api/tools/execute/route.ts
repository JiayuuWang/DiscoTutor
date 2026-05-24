import { NextRequest, NextResponse } from 'next/server';
import { executeTool } from '@/lib/tools';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tool, params } = body;

    if (!tool) {
      return NextResponse.json({ error: 'Missing tool name' }, { status: 400 });
    }

    const result = await executeTool({ tool, params: params || {} });
    return NextResponse.json(result);
  } catch (error) {
    console.error('Tool execution error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}