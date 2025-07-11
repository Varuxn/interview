import { RowDataPacket } from 'mysql2';
export interface UserRequest {
    id: string;
    name?: string;
  }
  
  export interface SettingRequest {
    id: string;
    interviewer?: string;
    position?: string;
  }
  
  export interface ScheduleRequest {
    user_id: string;
    sche_name: string;
    score?: number;
    description?: string;
  }
  
  export interface EvaluationRequest {
    user_id: string;
    eval_name: string;
    score?: number;
    description?: string;
  }
  
  export interface PositionRequest {
    id?: number;
    name: string;
    description?: string;
    difficulty: 'easy' | 'medium' | 'hard';
  }
  
  export interface InterviewerRequest {
    id: string;
    name: string;
    description?: string;
    country: string;
    level: string;
  }
  
  export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
  }
  
  export interface RowData extends RowDataPacket {
      id?: number | string;
      // 添加其他你需要的字段
  }

  export interface QueryRequest {
      table: string;
      id?: number | string;
  }

  export interface QueryResponse<T = RowData | RowData[] | null> {
      success: boolean;
      message: string;
      data?: T;
  }