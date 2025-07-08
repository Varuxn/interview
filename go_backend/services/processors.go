package services

import (
	"ai-reviewer/config"
	"ai-reviewer/models"
	"fmt"
	"os"
	"path/filepath"
)

// TextProcessor 文本处理器
type TextProcessor struct {
	config *config.Config
	openaiService *OpenAIService
}

// NewTextProcessor 创建一个新的TextProcessor实例
func NewTextProcessor(cfg *config.Config, openaiSvc *OpenAIService) *TextProcessor {
	return &TextProcessor{
		config: cfg,
		openaiService: openaiSvc,
	}
}

// Process 处理文本响应
func (p *TextProcessor) Process(text string, question string) (*models.TextAnalysis, error) {
	// 检查文本长度
	if len(text) > p.config.MaxTextLength {
		text = text[:p.config.MaxTextLength]
	}
	
	// 这里是占位实现，实际应用中应该使用NLP技术或调用OpenAI API进行文本分析
	// 本示例返回一个模拟的分析结果
	return &models.TextAnalysis{
		ContentRelevance:  0.85,
		LogicalStructure:  0.78,
		ProfessionalLevel: 0.82,
		Clarity:           0.9,
		Keywords:          []string{"TCP", "网络协议", "握手过程", "可靠传输"},
		Summary:           "回答详细阐述了TCP三次握手的过程和必要性，包括同步序列号、确认连接和防止旧连接请求的作用。",
	}, nil
}

// AudioProcessor 音频处理器
type AudioProcessor struct {
	config *config.Config
}

// NewAudioProcessor 创建一个新的AudioProcessor实例
func NewAudioProcessor(cfg *config.Config) *AudioProcessor {
	return &AudioProcessor{
		config: cfg,
	}
}

// Process 处理音频文件
func (p *AudioProcessor) Process(audioPath string) (*models.AudioAnalysis, error) {
	// 检查文件是否存在
	if _, err := os.Stat(audioPath); os.IsNotExist(err) {
		return nil, fmt.Errorf("音频文件不存在: %s", audioPath)
	}
	
	// 检查文件扩展名
	ext := filepath.Ext(audioPath)
	if ext != ".mp3" && ext != ".wav" && ext != ".ogg" {
		return nil, fmt.Errorf("不支持的音频格式: %s", ext)
	}
	
	// 这里是占位实现，实际应用中应该使用讯飞API或其他语音处理工具
	// 本示例返回一个模拟的分析结果
	return &models.AudioAnalysis{
		TranscriptText: "TCP三次握手是TCP协议中建立连接的过程，它的必要性在于确保客户端和服务器之间可以可靠地建立连接...",
		SpeechRate:     150.0, // 每分钟词数
		Pauses:         5,
		Confidence:     0.92,
		Clarity:        0.88,
		StressLevel:    0.15,
	}, nil
}

// VideoProcessor 视频处理器
type VideoProcessor struct {
	config *config.Config
}

// NewVideoProcessor 创建一个新的VideoProcessor实例
func NewVideoProcessor(cfg *config.Config) *VideoProcessor {
	return &VideoProcessor{
		config: cfg,
	}
}

// Process 处理视频文件
func (p *VideoProcessor) Process(videoPath string) (*models.VideoAnalysis, error) {
	// 检查文件是否存在
	if _, err := os.Stat(videoPath); os.IsNotExist(err) {
		return nil, fmt.Errorf("视频文件不存在: %s", videoPath)
	}
	
	// 检查文件扩展名
	ext := filepath.Ext(videoPath)
	if ext != ".mp4" && ext != ".avi" && ext != ".webm" {
		return nil, fmt.Errorf("不支持的视频格式: %s", ext)
	}
	
	// 这里是占位实现，实际应用中应该使用OpenCV或其他视频处理工具
	// 本示例返回一个模拟的分析结果
	return &models.VideoAnalysis{
		FacialExpressions: map[string]float64{
			"neutral":  0.75,
			"thinking": 0.15,
			"confused": 0.05,
			"confident": 0.05,
		},
		EyeContact:      0.82,
		BodyLanguage:    map[string]float64{
			"relaxed":    0.7,
			"attentive":  0.2,
			"nervous":    0.1,
		},
		Professionalism: 0.85,
		Confidence:      0.78,
	}, nil
} 