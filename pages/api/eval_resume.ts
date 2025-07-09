// pages/api/eval_resume.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs/promises';
import path from 'path';

const LLM_API_URL = 'https://api.ephone.chat/v1/chat/completions';
const LLM_API_KEY = process.env.EPHONE_API_KEY;
const STORAGE_PATH = path.join(process.cwd(), 'data', 'resume', 'temp.json');

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 只处理POST请求
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({
      success: false,
      error: `Method ${req.method} Not Allowed`
    });
  }

  try {
    // 验证内容类型
    const contentType = req.headers['content-type'];
    if (!contentType || !contentType.includes('application/json')) {
      return res.status(400).json({
        success: false,
        error: 'Content-Type must be application/json'
      });
    }

    // 验证请求体
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: text'
      });
    }

    // 构造LLM请求
    const llmResponse = await fetch(LLM_API_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${LLM_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "你是一个专业的简历评估助手，请分析用户提供的简历内容并给出改进建议。"
          },
          {
            role: "user",
            content: `请评估以下简历内容：\n\n${text}`
          }
        ],
        stream: false,
        stream_options: {
          include_usage: true
        }
      })
    });

    // 检查LLM响应
    if (!llmResponse.ok) {
      const errorData = await llmResponse.json();
      throw new Error(`LLM API error: ${errorData.error?.message || llmResponse.statusText}`);
    }

    const llmData = await llmResponse.json();

    // 确保存储目录存在
    await fs.mkdir(path.dirname(STORAGE_PATH), { recursive: true });
    
    // 存储响应结果
    await fs.writeFile(
      STORAGE_PATH,
      JSON.stringify({
        originalText: text,
        analysis: llmData,
        timestamp: new Date().toISOString()
      }, null, 2)
    );

    // 返回LLM响应
    return res.status(200).json({
      success: true,
      analysis: llmData,
      storagePath: STORAGE_PATH
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