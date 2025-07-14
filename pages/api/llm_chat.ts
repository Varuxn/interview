import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs/promises';
import path from 'path';

const LLM_API_URL = 'https://api.ephone.chat/v1/chat/completions';
const LLM_API_KEY = process.env.EPHONE_API_KEY;
const CHAT_LOG_PATH = path.join(process.cwd(), 'data', 'chat_logs', 'conversations.json');

interface ChatRequest {
  system_prompt: string;
  user_prompt: string;
  model?: string;
  temperature?: number;
}

interface ChatResponse {
  success: boolean;
  message?: string;
  llm_response?: any;
  error?: string;
  details?: string;
}

// 类型守卫函数
function isErrorWithCode(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && 'code' in error;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ChatResponse>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({
      success: false,
      error: `Method ${req.method} Not Allowed`
    });
  }

  try {
    const contentType = req.headers['content-type'];
    if (!contentType || !contentType.includes('application/json')) {
      return res.status(400).json({
        success: false,
        error: 'Content-Type must be application/json'
      });
    }

    const { system_prompt, user_prompt, model = 'gpt-3.5-turbo', temperature = 0.7 }: ChatRequest = req.body;
    
    if (!system_prompt || !user_prompt) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: system_prompt and user_prompt are both required'
      });
    }

    const llmResponse = await fetch(LLM_API_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${LLM_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: system_prompt },
          { role: "user", content: user_prompt }
        ],
        temperature,
        stream: false,
        stream_options: { include_usage: true }
      })
    });

    if (!llmResponse.ok) {
      const errorData = await llmResponse.json();
      throw new Error(`LLM API error: ${errorData.error?.message || llmResponse.statusText}`);
    }

    const llmData = await llmResponse.json();

    await fs.mkdir(path.dirname(CHAT_LOG_PATH), { recursive: true });
    
    let chatLogs = [];
    try {
      const existingData = await fs.readFile(CHAT_LOG_PATH, 'utf-8');
      chatLogs = JSON.parse(existingData);
    } catch (err) {
      if (isErrorWithCode(err) && err.code !== 'ENOENT') {
        throw err;
      }
    }

    chatLogs.push({
      system_prompt,
      user_prompt,
      llm_response: llmData,
      timestamp: new Date().toISOString()
    });

    await fs.writeFile(CHAT_LOG_PATH, JSON.stringify(chatLogs, null, 2));

    return res.status(200).json({
      success: true,
      llm_response: llmData
    });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}