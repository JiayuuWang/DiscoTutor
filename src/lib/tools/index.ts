import { ToolExecuteRequest, ToolExecuteResponse } from '@/types';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

export async function executeTool(request: ToolExecuteRequest): Promise<ToolExecuteResponse> {
  try {
    switch (request.tool) {
      case 'python_executor':
        return await executePython(request.params);
      case 'file_reader':
        return await readFile(request.params);
      case 'file_writer':
        return await writeFile(request.params);
      case 'web_search':
        return await webSearch(request.params);
      default:
        return { result: null, error: `Unknown tool: ${request.tool}` };
    }
  } catch (error) {
    return { result: null, error: String(error) };
  }
}

async function executePython(params: Record<string, unknown>): Promise<ToolExecuteResponse> {
  const code = params.code as string;
  if (!code) {
    return { result: null, error: 'No code provided' };
  }

  try {
    const { stdout, stderr } = await execAsync(`python -c ${JSON.stringify(code)}`, {
      timeout: 30000,
    });

    if (stderr && !stdout) {
      return { result: null, error: stderr };
    }

    return { result: stdout || stderr };
  } catch (error: unknown) {
    const execError = error as { stderr?: string; message?: string };
    return { result: null, error: execError.stderr || execError.message || String(error) };
  }
}

async function readFile(params: Record<string, unknown>): Promise<ToolExecuteResponse> {
  const filePath = params.path as string;
  if (!filePath) {
    return { result: null, error: 'No path provided' };
  }

  try {
    const fullPath = path.resolve(filePath);
    const content = fs.readFileSync(fullPath, 'utf-8');
    return { result: content };
  } catch (error: unknown) {
    const fsError = error as { code?: string; message?: string };
    return {
      result: null,
      error: fsError.code === 'ENOENT' ? `File not found: ${filePath}` : fsError.message,
    };
  }
}

async function writeFile(params: Record<string, unknown>): Promise<ToolExecuteResponse> {
  const filePath = params.path as string;
  const content = params.content as string;

  if (!filePath || content === undefined) {
    return { result: null, error: 'Missing path or content' };
  }

  try {
    const fullPath = path.resolve(filePath);
    const dir = path.dirname(fullPath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(fullPath, content, 'utf-8');
    return { result: `File written successfully: ${filePath}` };
  } catch (error: unknown) {
    const fsError = error as { message?: string };
    return { result: null, error: fsError.message || String(error) };
  }
}

async function webSearch(params: Record<string, unknown>): Promise<ToolExecuteResponse> {
  const query = params.query as string;
  const numResults = (params.num_results as number) || 5;

  if (!query) {
    return { result: null, error: 'No query provided' };
  }

  const apis = [
    { url: `https://ddg-api.vercel.app/search?q=${encodeURIComponent(query)}&num=${numResults}`, timeout: 8000 },
    { url: `https://ddg.sanks.dev/search?q=${encodeURIComponent(query)}&num=${numResults}`, timeout: 8000 },
  ];

  for (const api of apis) {
    try {
      const response = await fetch(api.url, { signal: AbortSignal.timeout(api.timeout) });

      if (!response.ok) {
        continue;
      }

      const data = await response.json() as Array<{ title?: string; Text?: string; url?: string; FirstURL?: string; snippet?: string }>;

      if (!Array.isArray(data)) {
        continue;
      }

      return {
        result: data.map((r) => ({
          title: r.title || r.Text || '',
          url: r.url || r.FirstURL || '',
          snippet: r.snippet || ''
        }))
      };
    } catch {
      continue;
    }
  }

  return { result: null, error: 'Search failed - please try again later' };
}