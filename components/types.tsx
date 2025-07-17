export interface FeedbackData {
  language: number;
  profession: number;
  logic: number;
  expressiveness: number;
  total: number;
  description: string;
}
export interface LLMChatRequest {
  system_prompt: string;
  user_prompt: string;
  model?: string;
  temperature?: number;
}

export interface LLMResponseMessage {
  role: string;
  content: string;
}

export interface LLMResponseChoice {
  index: number;
  message: LLMResponseMessage;
  finish_reason: string;
}

export interface LLMResponseUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface LLMChatResponse {
  success: boolean;
  llm_response: {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: LLMResponseChoice[];
    usage: LLMResponseUsage;
  };
}