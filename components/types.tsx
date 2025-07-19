export interface FeedbackData {
  expertise: number,       // 专业知识水平 (Expertise)  
  proficiency: number,     // 技能匹配度 (Proficiency)  
  articulation: number,   // 语言表达能力 (Articulation)  
  reasoning: number,        // 逻辑思维能力 (Reasoning)  
  innovation: number,        // 创新能力 (Innovation)  
  resilience: number,       // 应变抗压能力 (Resilience)  
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

  export interface FullEvaluationData {
  user_id: string;
  description: string;
  
  // Introduction Section
  introduction_expertise: number;       // 专业知识水平 (Expertise)
  introduction_proficiency: number;     // 技能匹配度 (Proficiency)
  introduction_articulation: number;    // 语言表达能力 (Articulation)
  introduction_reasoning: number;       // 逻辑思维能力 (Reasoning)
  introduction_innovation: number;      // 创新能力 (Innovation)
  introduction_resilience: number;      // 应变抗压能力 (Resilience)
  introduction_total: number;           // 总分
  
  // Technology Section
  technology_expertise: number;
  technology_proficiency: number;
  technology_articulation: number;
  technology_reasoning: number;
  technology_innovation: number;
  technology_resilience: number;
  technology_total: number;
  
  // Analysis Section
  analysis_expertise: number;
  analysis_proficiency: number;
  analysis_articulation: number;
  analysis_reasoning: number;
  analysis_innovation: number;
  analysis_resilience: number;
  analysis_total: number;
  
  // Final Section
  final_expertise: number;
  final_proficiency: number;
  final_articulation: number;
  final_reasoning: number;
  final_innovation: number;
  final_resilience: number;
  final_total: number;
}
export interface Position {
  id: number;
  name: string;
  description: string;
}

export interface Interviewer {
  id: string;
  name: string;
  description: string;
  level: string;
  avatar: string;
}


export interface local_UserData {
  resumeSetupData: {
    fullName: string;
    email: string;
    phone: string;
    expertise: string;
    position: Position; // 实际应该是 Position 类型
    interviewer: Interviewer; // 实际应该是 Interviewer 类型
    selectedSkills: string[];
  };
  resumeKeywords: string[];
  resumeContent: string;
  interviewerAvatars: { [key: string]: string };
}
export interface AllUserData {
  [userId: string]: local_UserData;
}