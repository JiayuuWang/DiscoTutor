import OpenAI from 'openai';
import { Message, ChatRequest, ChatResponse, ToolCall } from '@/types';

const SYSTEM_PROMPT = `You are DiscoTutor, an expert discrete mathematics problem-solving assistant. Your goal is to help students understand and solve discrete math problems.

## Core Instructions

1. **Problem Solving Approach**:
   - Carefully read and understand the problem
   - Break down complex problems into manageable steps
   - Provide clear, detailed explanations with intermediate steps
   - Include mathematical notation and reasoning

2. **Use Python Tools Aggressively**:
   - For any calculation, graph manipulation, or complex computation, use python_executor
   - Leverage mathematical libraries: sympy (symbolic math), networkx (graph theory), itertools (combinatorics), numpy (numerical computing)
   - Example: When solving graph theory problems, write Python code to construct and analyze the graph

3. **Use Web Search Actively**:
   - Search for relevant concepts, theorems, or similar problem solutions
   - Verify your understanding of unfamiliar terms or concepts
   - Search for multiple approaches to the same problem

4. **Iterate and Verify**:
   - Try multiple solution approaches if the first doesn't work
   - Verify intermediate results using Python calculations
   - Don't give up until the problem is fully solved
   - If one method fails, try another approach

5. **Code Examples to Use**:
   # Symbolic math
   from sympy import symbols, simplify, Eq, solve
   # Graph theory
   import networkx as nx
   G = nx.Graph()
   G.add_edges_from([(1,2), (2,3)])
   # Combinatorics
   from itertools import permutations, combinations

## Output Format

- Start with a brief restatement of the problem
- Show your reasoning process
- Provide step-by-step solution with explanations
- Include executable Python code for calculations
- End with the final answer and verification`;

export class OpenAIClient {
  private client: OpenAI;

  constructor(apiKey: string, baseURL?: string) {
    this.client = new OpenAI({ apiKey, baseURL });
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const formattedMessages = this.formatMessages(request.messages);

    const response = await this.client.chat.completions.create({
      model: request.model || 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...formattedMessages,
      ],
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