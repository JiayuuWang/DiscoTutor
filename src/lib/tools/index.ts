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

  try {
    const response = await fetch(
      `https://cn.bing.com/search?q=${encodeURIComponent(query)}&format=rss&count=${numResults}`,
      { signal: AbortSignal.timeout(15000) }
    );

    if (!response.ok) {
      return { result: null, error: `Search failed: HTTP ${response.status}` };
    }

    const text = await response.text();
    const items: Array<{ title: string; url: string; snippet: string }> = [];

    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    while ((match = itemRegex.exec(text)) !== null && items.length < numResults) {
      const item = match[1];
      const title = (item.match(/<title>([^<]*)<\/title>/)?.[1] || '').replace(/&amp;/g, '&');
      const link = (item.match(/<link>([^<]*)<\/link>/)?.[1] || '').replace(/&amp;/g, '&');
      const rawDesc = item.match(/<description>([^<]*)<\/description>/)?.[1] || '';
      const description = rawDesc.replace(/<[^>]+>/g, '').substring(0, 200).replace(/&amp;/g, '&');

      if (title && link) {
        items.push({ title, url: link, snippet: description });
      }
    }

    if (items.length === 0) {
      return { result: null, error: 'No results found' };
    }

    return { result: items };
  } catch (error: unknown) {
    const err = error as { name?: string; message?: string };
    if (err.name === 'TimeoutError' || err.message?.includes('timeout')) {
      return { result: null, error: 'Search timeout - please try again' };
    }
    return { result: null, error: err.message || 'Search failed' };
  }
}