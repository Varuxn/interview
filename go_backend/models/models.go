package models

import "time"

// Question 面试问题模型
type Question struct {
	Content   string `json:"content"`
	Domain    string `json:"domain"`
	Difficulty string `json:"difficulty"`
}

// SubmissionRequest 提交答案请求
type SubmissionRequest struct {
	Question     string `json:"question"`
	TextResponse string `json:"text_response,omitempty"`
}

// FileInfo 上传文件信息
type FileInfo struct {
	FileName string `json:"file_name"`
	FilePath string `json:"file_path"`
}

// Submission 提交记录
type Submission struct {
	ID             string    `json:"id"`
	Question       string    `json:"question"`
	TextResponse   string    `json:"text_response,omitempty"`
	AudioFile      *FileInfo `json:"audio_file,omitempty"`
	VideoFile      *FileInfo `json:"video_file,omitempty"`
	TextAnalysis   *TextAnalysis   `json:"text_analysis,omitempty"`
	AudioAnalysis  *AudioAnalysis  `json:"audio_analysis,omitempty"`
	VideoAnalysis  *VideoAnalysis  `json:"video_analysis,omitempty"`
	Evaluation     *Evaluation     `json:"evaluation"`
	SubmissionTime time.Time `json:"submission_time"`
	ResultsPath    string    `json:"results_path"`
}

// TextAnalysis 文本分析结果
type TextAnalysis struct {
	ContentRelevance  float64 `json:"content_relevance"`
	LogicalStructure  float64 `json:"logical_structure"`
	ProfessionalLevel float64 `json:"professional_level"`
	Clarity           float64 `json:"clarity"`
	Keywords          []string `json:"keywords"`
	Summary           string   `json:"summary"`
}

// AudioAnalysis 音频分析结果
type AudioAnalysis struct {
	TranscriptText string  `json:"transcript_text"`
	SpeechRate     float64 `json:"speech_rate"`
	Pauses         int     `json:"pauses"`
	Confidence     float64 `json:"confidence"`
	Clarity        float64 `json:"clarity"`
	StressLevel    float64 `json:"stress_level"`
}

// VideoAnalysis 视频分析结果
type VideoAnalysis struct {
	FacialExpressions map[string]float64 `json:"facial_expressions"`
	EyeContact        float64            `json:"eye_contact"`
	BodyLanguage      map[string]float64 `json:"body_language"`
	Professionalism   float64            `json:"professionalism"`
	Confidence        float64            `json:"confidence"`
}

// Evaluation 评估结果
type Evaluation struct {
	LanguageExpression   float64 `json:"language_expression"`
	LogicalThinking      float64 `json:"logical_thinking"`
	ProfessionalKnowledge float64 `json:"professional_knowledge"`
	SkillMatching        float64 `json:"skill_matching"`
	Innovation           float64 `json:"innovation"`
	StressResponse       float64 `json:"stress_response"`
	OverallScore         float64 `json:"overall_score"`
	Feedback             string  `json:"feedback"`
}

// APIResponse API响应通用格式
type APIResponse struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
}

// QuestionGenerationRequest 问题生成请求
type QuestionGenerationRequest struct {
	Domain     string `json:"domain"`
	Difficulty string `json:"difficulty"`
}

// QuestionGenerationResponse 问题生成响应
type QuestionGenerationResponse struct {
	Question string `json:"question"`
}

// ResultsResponse 获取结果响应
type ResultsResponse struct {
	Question        string                 `json:"question"`
	Evaluation      *Evaluation            `json:"evaluation"`
	DetailedResults map[string]interface{} `json:"detailed_results"`
} 