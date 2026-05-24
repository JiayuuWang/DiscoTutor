# DiscoTutor

An AI-powered discrete mathematics problem solver with conversation and tool calling capabilities.

## Features

- **Multiple AI Providers**: Support for OpenAI, Anthropic (MiniMax), and Custom endpoints
- **Input Modes**: Text, image paste, or file upload
- **Dual Modes**:
  - **Fast Mode**: Single response for quick answers
  - **Agent Mode**: Multi-turn conversations with tool calling (code execution, file operations, web search)
- **Thinking Process Display**: Shows AI reasoning steps
- **Tool Calling Visibility**: Displays tool invocations and results
- **Modern UI**: Clean black and white design

## Prerequisites

- Node.js 18+ installed
- API keys for your chosen AI provider

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Configure API Settings

Click the settings icon (top right) and configure:

| Field | Description |
|-------|-------------|
| Provider | Select OpenAI, Anthropic, or Custom |
| API Key | Your API key |
| Model | Model name (e.g., `gpt-4o`, `MiniMax-M2.7`) |
| Base URL | API endpoint (required for Custom provider) |

### 4. Start Chatting

- Type your discrete math problem in the input box
- Press Enter or click Send
- Use Fast mode for single responses
- Use Agent mode for problems requiring tool calling

## Supported Tools (Agent Mode)

| Tool | Description |
|------|-------------|
| `python_executor` | Execute Python code and return results |
| `file_reader` | Read content from local files |
| `file_writer` | Write content to local files |
| `web_search` | Search the web for information |

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── chat/route.ts      # Chat API endpoint
│   │   └── tools/execute/route.ts  # Tool execution API
│   ├── page.tsx               # Main page
│   └── layout.tsx             # Root layout
├── components/                # UI components
├── lib/
│   ├── llm/                   # LLM client implementations
│   └── tools/                 # Tool implementations
├── store/
│   └── chat.tsx              # Chat state management
└── types/
    └── index.ts              # TypeScript types
```

## Configuration Examples

### MiniMax (Anthropic Compatible)

| Field | Value |
|-------|-------|
| Provider | Anthropic |
| API Key | `sk-cp-...` |
| Model | `MiniMax-M2.7` |
| Base URL | `https://api.minimax.io/anthropic` |

### OpenAI

| Field | Value |
|-------|-------|
| Provider | OpenAI |
| API Key | `sk-...` |
| Model | `gpt-4o` |
| Base URL | `https://api.openai.com/v1` |

### Custom Provider (e.g., local LLM)

| Field | Value |
|-------|-------|
| Provider | Custom |
| API Key | Your API key |
| Model | Your model name |
| Base URL | `http://localhost:11434/v1` (Ollama example) |

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI SDKs**: OpenAI, Anthropic
- **State Management**: React Context + useReducer

## Build

```bash
npm run build
```

## License

MIT