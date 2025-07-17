import { LLMChatRequest, LLMChatResponse } from '../components/types'; // 假设类型定义

/**
 * 调用 LLM API 获取响应
 * 
 * @param system_prompt 系统提示
 * @param user_prompt 用户提示
 * @param model 使用的模型 (默认: 'gpt-3.5-turbo')
 * @param temperature 温度参数 (默认: 0.7)
 * @returns 包含响应数据和状态的 Promise
 */
export const fetchLLMResponse = async (
  system_prompt: string,
  user_prompt: string,
  model: string = 'gpt-3.5-turbo',
  temperature: number = 0.7
): Promise<{
  data: LLMChatResponse | null;
  isLoading: boolean;
  error: string | null;
}> => {
  let isLoading = true;
  let error: string | null = null;
  let data: LLMChatResponse | null = null;

  try {
    const requestBody: LLMChatRequest = {
      system_prompt,
      user_prompt,
      model,
      temperature
    };

    const response = await fetch('/api/llm_chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`请求失败: ${response.status}`);
    }

    const responseData: LLMChatResponse = await response.json();

    if (responseData.success && responseData.llm_response?.choices?.length > 0) {
      data = responseData;
    } else {
      throw new Error('未获取到有效的响应内容');
    }
  } catch (err) {
    error = err instanceof Error ? err.message : '未知错误';
    console.error('调用LLM接口出错:', err);
  } finally {
    isLoading = false;
  }

  return { data, isLoading, error };
};