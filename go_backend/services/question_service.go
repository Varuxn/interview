package services

import (
	"ai-reviewer/config"
)

// QuestionService 负责生成面试问题
type QuestionService struct {
	config      *config.Config
	openaiService *OpenAIService
}

// NewQuestionService 创建一个新的QuestionService实例
func NewQuestionService(cfg *config.Config, openaiSvc *OpenAIService) *QuestionService {
	return &QuestionService{
		config:      cfg,
		openaiService: openaiSvc,
	}
}

// GenerateQuestion 生成面试问题
func (s *QuestionService) GenerateQuestion(domain, difficulty string) (string, error) {
	// 验证领域
	validDomain := s.validateDomain(domain)
	
	// 验证难度
	validDifficulty := s.validateDifficulty(difficulty)
	
	// 使用OpenAI服务生成问题
	return s.openaiService.GenerateQuestion(validDomain, validDifficulty)
}

// 验证领域
func (s *QuestionService) validateDomain(domain string) string {
	// 检查领域是否在配置的技术领域列表中
	for _, validDomain := range s.config.TechnicalDomains {
		if domain == validDomain {
			return domain
		}
	}
	
	// 如果不在列表中，返回默认领域
	return "computer_networks"
}

// 验证难度
func (s *QuestionService) validateDifficulty(difficulty string) string {
	// 检查难度是否有效
	validDifficulties := []string{"easy", "medium", "hard"}
	for _, validDifficulty := range validDifficulties {
		if difficulty == validDifficulty {
			return difficulty
		}
	}
	
	// 如果不是有效难度，返回默认难度
	return "medium"
} 