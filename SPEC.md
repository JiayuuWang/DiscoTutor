# 离散数学解题 Chatbot - 项目规格

## 1. 项目概述

- **项目名称**: MathMind - 离散数学解题助手
- **类型**: 交互式 AI 对话应用
- **核心功能**: 输入离散数学题目截图或文件，调用大语言模型生成题解，支持快速对话和 Agent 模式
- **目标用户**: 学习离散数学的学生和教师

## 2. 技术栈

- **前端**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **后端**: Next.js API Routes
- **LLM 提供商**: OpenAI GPT-4o / Anthropic Claude (通过配置切换)
- **工具调用**: Python 执行、文件读写、网络搜索

## 3. 功能与界面规格

### 3.1 核心功能

#### 输入模式
- **截图粘贴**: 支持 Ctrl+V 粘贴截图
- **文件上传**: 支持上传图片、PDF、TXT 文件
- **文本输入**: 支持直接输入题目文本

#### 对话模式
- **快速对话模式**: 单次模型输出，适合简单题目
- **Agent 模式**: 支持多轮 tool calling，模型可自主调用工具完成任务

#### 输出内容
- **题解生成**: 分步讲解，包含数学公式渲染
- **思考过程**: 显示模型的推理过程
- **Tool Calling 信息**: 显示调用的工具名称、参数、结果

### 3.2 UI 布局

```
┌─────────────────────────────────────────────────┐
│  Logo    MathMind - 离散数学解题助手      [设置] │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │         对话历史区域                      │   │
│  │  (消息列表、思考过程、tool调用信息)        │   │
│  │                                         │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
├─────────────────────────────────────────────────┤
│  [模式切换: 快速对话 | Agent模式]               │
│  ┌─────────────────────────────────────────┐   │
│  │ 输入框 (支持拖拽/粘贴)                    │   │
│  └─────────────────────────────────────────┘   │
│  [发送] [清空]                                 │
└─────────────────────────────────────────────────┘
```

### 3.3 组件列表

| 组件 | 功能 |
|------|------|
| `ChatContainer` | 主容器，管理对话状态 |
| `MessageList` | 显示消息列表、思考过程、tool调用 |
| `MessageBubble` | 单条消息气泡 |
| `ThinkingPanel` | 模型思考过程展示 |
| `ToolCallPanel` | Tool calling 信息展示 |
| `InputArea` | 输入框、文件上传、模式切换 |
| `SettingsModal` | API 配置、模型选择 |
| `FileDropzone` | 文件拖拽上传区域 |

### 3.4 交互行为

- **发送消息**: Enter 发送，Shift+Enter 换行
- **清空对话**: 清空所有消息和状态
- **切换模式**: 快速对话/Agent 模式切换
- **设置**: 点击设置图标打开配置弹窗

## 4. Tool Calling 规格

### 4.1 可用工具

| 工具 | 功能 | 参数 |
|------|------|------|
| `python_executor` | 执行 Python 代码 | `code: string` |
| `file_reader` | 读取本地文件 | `path: string` |
| `file_writer` | 写入本地文件 | `path: string, content: string` |
| `web_search` | 网络搜索 | `query: string, num_results: number` |

### 4.2 Tool Calling 流程 (Agent 模式)

1. 用户输入题目
2. 模型生成初始解答
3. 如果需要执行工具，返回 tool_calls
4. 系统执行工具，返回结果
5. 模型基于结果继续生成
6. 重复步骤 3-5 直到完成
7. 最终答案输出

## 5. API 设计

### 5.1 对话 API

```
POST /api/chat
Body: {
  messages: Message[],
  mode: "fast" | "agent",
  model: "openai" | "anthropic"
}
Response: {
  content: string,
  thinking?: string,
  toolCalls?: ToolCall[]
}
```

### 5.2 Tool Execution API

```
POST /api/tools/execute
Body: {
  tool: string,
  params: object
}
Response: {
  result: any
}
```

## 6. 配置项

通过 `SettingsModal` 配置:
- OpenAI API Key
- Anthropic API Key
- 默认模型选择
- Agent 模式开关

## 7. 验收标准

- [ ] 可以粘贴/上传截图或文件作为输入
- [ ] 快速对话模式返回单次模型输出
- [ ] Agent 模式支持多次 tool calling
- [ ] 显示模型思考过程
- [ ] 显示 tool calling 信息（工具名、参数、结果）
- [ ] 可以切换 OpenAI / Anthropic 模型
- [ ] UI 简洁清晰，响应式布局