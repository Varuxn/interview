package services

import (
	"context"
	"errors"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"strings"

	"ai-reviewer/config"

	"github.com/sashabaranov/go-openai"
)

// min 返回两个整数的较小值
func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

// OpenAIService 提供OpenAI API服务
type OpenAIService struct {
	config *config.Config
	client *openai.Client
}

// NewOpenAIService 创建一个新的OpenAIService实例
func NewOpenAIService(cfg *config.Config) *OpenAIService {
	if cfg.OpenAIAPIKey == "" {
		log.Printf("警告: OpenAI API密钥为空")
	} else {
		log.Printf("初始化OpenAI服务，API密钥: %s..., API基础URL: %s", 
			cfg.OpenAIAPIKey[:min(5, len(cfg.OpenAIAPIKey))], cfg.OpenAIAPIBase)
	}
	
	clientConfig := openai.DefaultConfig(cfg.OpenAIAPIKey)
	
	// 设置自定义API基础URL（用于ephone API）
	if cfg.OpenAIAPIBase != "" {
		clientConfig.BaseURL = cfg.OpenAIAPIBase
		log.Printf("使用自定义API基础URL: %s", cfg.OpenAIAPIBase)
	}
	
	// 添加自定义HTTP客户端以便更好地调试
	clientConfig.HTTPClient = &http.Client{
		Transport: &loggingRoundTripper{http.DefaultTransport},
	}
	
	client := openai.NewClientWithConfig(clientConfig)
	
	return &OpenAIService{
		config: cfg,
		client: client,
	}
}

// 用于记录HTTP请求和响应的自定义Transport
type loggingRoundTripper struct {
	rt http.RoundTripper
}

func (l *loggingRoundTripper) RoundTrip(req *http.Request) (*http.Response, error) {
	log.Printf("发送API请求到: %s %s", req.Method, req.URL.String())
	
	// 发送请求
	resp, err := l.rt.RoundTrip(req)
	if err != nil {
		log.Printf("API请求错误: %v", err)
		return nil, err
	}
	
	// 记录响应
	log.Printf("收到API响应，状态码: %d", resp.StatusCode)
	
	// 始终记录响应体以便调试
	respBody, _ := ioutil.ReadAll(resp.Body)
	resp.Body.Close()
	
	// 重新创建新的响应体，因为原来的已经被读取
	resp.Body = ioutil.NopCloser(strings.NewReader(string(respBody)))
	
	// 记录响应内容（限制长度，避免日志过长）
	contentPreview := string(respBody)
	if len(contentPreview) > 500 {
		contentPreview = contentPreview[:500] + "... [截断]"
	}
	log.Printf("API响应内容: %s", contentPreview)
	
	return resp, nil
}

// GenerateQuestion 生成面试问题
func (s *OpenAIService) GenerateQuestion(domain, difficulty string) (string, error) {
	log.Printf("生成问题，领域: %s, 难度: %s", domain, difficulty)
	
	// 检查是否使用本地模式 (用于开发测试)
	if s.config.Debug && s.config.OpenAIAPIKey == "" {
		log.Printf("使用本地模拟模式，不调用实际API")
		return s.generateQuestionLocally(domain, difficulty)
	}
	
	// 获取领域提示词
	domainPrompt := s.getDomainPrompt(domain)
	
	// 获取难度提示词
	difficultyPrompt := s.getDifficultyPrompt(difficulty)
	
	// 构建完整提示词
	prompt := domainPrompt + " " + difficultyPrompt + "\n\n请提供一个清晰、简洁的问题，适合技术面试。"
	log.Printf("使用提示词: %s", prompt)
	
	// 设置系统提示词
	systemPrompt := "你是一位科技公司的资深技术面试官。你的工作是创建具有挑战性但公平的面试问题，以测试候选人的技术知识和解决问题的能力。请用中文提问。"
	
	// 创建聊天完成请求
	req := openai.ChatCompletionRequest{
		Model: s.config.QuestionGenerationModel,
		Messages: []openai.ChatCompletionMessage{
			{
				Role:    "system",
				Content: systemPrompt,
			},
			{
				Role:    "user",
				Content: prompt,
			},
		},
		Temperature: float32(s.config.SystemTemperature),
		MaxTokens:   s.config.MaxTokens,
	}
	
	log.Printf("使用模型: %s", s.config.QuestionGenerationModel)
	
	// 发送请求
	resp, err := s.client.CreateChatCompletion(context.Background(), req)
	if err != nil {
		log.Printf("调用OpenAI API失败: %v", err)
		
		// 尝试从错误中提取更详细的信息
		if apiErr, ok := err.(*openai.APIError); ok {
			log.Printf("OpenAI API错误，类型: %s, 状态码: %d, 消息: %s", 
				apiErr.Type, apiErr.HTTPStatusCode, apiErr.Message)
			return "", fmt.Errorf("OpenAI API错误(%d): %s", apiErr.HTTPStatusCode, apiErr.Message)
		}
		
		return "", fmt.Errorf("OpenAI调用失败: %v", err)
	}
	
	// 检查响应
	if len(resp.Choices) == 0 {
		log.Printf("OpenAI没有返回任何选项")
		return "", errors.New("no completion choices returned")
	}
	
	// 返回生成的问题
	question := resp.Choices[0].Message.Content
	log.Printf("成功生成问题: %s", question)
	return question, nil
}

// generateQuestionLocally 本地生成面试问题，不调用实际API（用于开发测试）
func (s *OpenAIService) generateQuestionLocally(domain, difficulty string) (string, error) {
	// 为不同领域和难度返回固定问题
	questions := map[string]map[string]string{
		"computer_networks": {
			"easy":   "解释什么是IP地址以及它在网络通信中的作用。",
			"medium": "请解释TCP三次握手过程及其必要性。",
			"hard":   "比较并详细分析IPv4与IPv6协议的主要区别和各自的优缺点。",
		},
		"algorithms": {
			"easy":   "什么是时间复杂度？如何计算一个算法的时间复杂度？",
			"medium": "解释快速排序的工作原理，并分析其平均和最坏情况下的时间复杂度。",
			"hard":   "详细讨论动态规划与分治算法的区别，并给出一个只能用动态规划高效解决的问题例子。",
		},
		"system_design": {
			"easy":   "描述客户端-服务器架构的基本组成部分。",
			"medium": "如何设计一个高可用的Web服务？",
			"hard":   "设计一个类似Twitter的社交媒体平台的后端系统，需要支持百万级用户。",
		},
	}
	
	// 获取对应问题
	if domainQuestions, ok := questions[domain]; ok {
		if question, ok := domainQuestions[difficulty]; ok {
			return question, nil
		}
	}
	
	// 默认问题
	return "请解释TCP三次握手过程及其必要性。", nil
}

// EvaluateResponse 评估用户回答
func (s *OpenAIService) EvaluateResponse(question string, results map[string]interface{}) (map[string]interface{}, error) {
	// 构建提示词
	prompt := s.buildEvaluationPrompt(question, results)
	
	// 设置系统提示词
	systemPrompt := "你是一位专业的面试评估专家。请根据提供的分析数据，全面而公正地评估候选人的回答。评估应涵盖语言表达、逻辑思维、专业知识、技能匹配度、创新能力和抗压能力等方面。请用中文回答。"
	
	// 创建聊天完成请求
	req := openai.ChatCompletionRequest{
		Model: s.config.EvaluationModel,
		Messages: []openai.ChatCompletionMessage{
			{
				Role:    "system",
				Content: systemPrompt,
			},
			{
				Role:    "user",
				Content: prompt,
			},
		},
		Temperature: float32(s.config.SystemTemperature),
		MaxTokens:   s.config.MaxTokens,
	}
	
	// 发送请求
	resp, err := s.client.CreateChatCompletion(context.Background(), req)
	if err != nil {
		return nil, err
	}
	
	// 检查响应
	if len(resp.Choices) == 0 {
		return nil, errors.New("no completion choices returned")
	}
	
	// 解析评估结果
	evaluation := s.parseEvaluation(resp.Choices[0].Message.Content)
	// evaluation["feedback"] :=  prompt + "\n" + evaluation["feedback"]
	evaluation["feedback"] = prompt + evaluation["feedback"].(string)
	return evaluation, nil
}

// 获取领域提示词
func (s *OpenAIService) getDomainPrompt(domain string) string {
	domainPrompts := map[string]string{
		"computer_networks": "生成一个关于计算机网络的技术面试问题。该问题应测试候选人对网络协议、架构或故障排除的理解。",
		"algorithms":        "生成一个关于算法和数据结构的技术面试问题。该问题应测试候选人的问题解决能力和对算法复杂度的理解。",
		"system_design":     "生成一个系统设计面试问题，测试候选人设计可扩展、可靠且高效系统的能力。",
		"machine_learning":  "生成一个关于机器学习的技术面试问题，测试候选人对模型、算法或评估指标的理解。",
		"database_systems":  "生成一个关于数据库系统的技术面试问题，重点关注设计、优化或查询处理。",
		"web_development":   "生成一个关于Web开发的技术面试问题，重点关注前端、后端或全栈技术。",
		"devops":            "生成一个关于DevOps实践、CI/CD或基础设施管理的技术面试问题。",
		"cloud_computing":   "生成一个关于云计算的技术面试问题，重点关注服务、架构或安全性。",
	}
	
	if prompt, exists := domainPrompts[domain]; exists {
		return prompt
	}
	return domainPrompts["computer_networks"] // 默认领域
}

// 获取难度提示词
func (s *OpenAIService) getDifficultyPrompt(difficulty string) string {
	difficultyPrompts := map[string]string{
		"easy":   "问题应适合入门级或初级职位的候选人。",
		"medium": "问题应适合拥有2-5年经验的中级职位候选人。",
		"hard":   "问题应具有挑战性，适合拥有5年以上经验的高级职位候选人。",
	}
	
	if prompt, exists := difficultyPrompts[difficulty]; exists {
		return prompt
	}
	return difficultyPrompts["medium"] // 默认难度
}

// 构建评估提示词
func (s *OpenAIService) buildEvaluationPrompt(question string, results map[string]interface{}) string {
	prompt := "请评估以下面试回答：\n\n"
	prompt += "问题：" + question + "\n\n"
	
	// 添加文本分析结果
	if textAnalysis, ok := results["text_analysis"]; ok {
		prompt += "文本分析：\n"
		prompt += "- 内容相关度：" + formatFloat(getNestedFloat(textAnalysis, "content_relevance")) + "\n"
		prompt += "- 逻辑结构：" + formatFloat(getNestedFloat(textAnalysis, "logical_structure")) + "\n"
		prompt += "- 专业水平：" + formatFloat(getNestedFloat(textAnalysis, "professional_level")) + "\n"
		prompt += "- 清晰度：" + formatFloat(getNestedFloat(textAnalysis, "clarity")) + "\n"
		prompt += "- 关键词：" + getNestedStringSlice(textAnalysis, "keywords") + "\n"
		prompt += "- 摘要：" + getNestedString(textAnalysis, "summary") + "\n\n"
	}
	
	// 添加音频分析结果
	if audioAnalysis, ok := results["audio_analysis"]; ok {
		prompt += "音频分析：\n"
		prompt += "- 语音转写：" + getNestedString(audioAnalysis, "transcript_text") + "\n"
		prompt += "- 语速：" + formatFloat(getNestedFloat(audioAnalysis, "speech_rate")) + "\n"
		prompt += "- 停顿次数：" + formatInt(getNestedInt(audioAnalysis, "pauses")) + "\n"
		prompt += "- 自信度：" + formatFloat(getNestedFloat(audioAnalysis, "confidence")) + "\n"
		prompt += "- 清晰度：" + formatFloat(getNestedFloat(audioAnalysis, "clarity")) + "\n"
		prompt += "- 压力水平：" + formatFloat(getNestedFloat(audioAnalysis, "stress_level")) + "\n\n"
	}
	
	// 添加视频分析结果
	if videoAnalysis, ok := results["video_analysis"]; ok {
		prompt += "视频分析：\n"
		prompt += "- 眼神接触：" + formatFloat(getNestedFloat(videoAnalysis, "eye_contact")) + "\n"
		prompt += "- 专业度：" + formatFloat(getNestedFloat(videoAnalysis, "professionalism")) + "\n"
		prompt += "- 自信度：" + formatFloat(getNestedFloat(videoAnalysis, "confidence")) + "\n\n"
	}
	
	prompt += "请根据以上信息，评估候选人在以下方面的表现（0-10分）：\n"
	prompt += "1. 语言表达能力\n"
	prompt += "2. 逻辑思维能力\n"
	prompt += "3. 专业知识水平\n"
	prompt += "4. 技能匹配度\n"
	prompt += "5. 创新能力\n"
	prompt += "6. 抗压能力\n\n"
	prompt += "还请提供一段简短的整体评价和建议。"
	
	return prompt
}

// 解析评估结果
func (s *OpenAIService) parseEvaluation(content string) map[string]interface{} {
	// 这里实际项目中应该使用更复杂的解析逻辑
	// 简化版：返回一个样例评估结果
	return map[string]interface{}{
		"language_expression":    7.5,
		"logical_thinking":       8.0,
		"professional_knowledge": 7.8,
		"skill_matching":         7.0,
		"innovation":             6.5,
		"stress_response":        8.2,
		"overall_score":          7.5,
		"feedback":               content,
	}
}

// 辅助函数 - 获取嵌套的字符串
func getNestedString(data interface{}, key string) string {
	if m, ok := data.(map[string]interface{}); ok {
		if val, exists := m[key]; exists {
			if str, ok := val.(string); ok {
				return str
			}
		}
	}
	return ""
}

// 辅助函数 - 获取嵌套的浮点数
func getNestedFloat(data interface{}, key string) float64 {
	if m, ok := data.(map[string]interface{}); ok {
		if val, exists := m[key]; exists {
			if f, ok := val.(float64); ok {
				return f
			}
		}
	}
	return 0.0
}

// 辅助函数 - 获取嵌套的整数
func getNestedInt(data interface{}, key string) int {
	if m, ok := data.(map[string]interface{}); ok {
		if val, exists := m[key]; exists {
			if i, ok := val.(int); ok {
				return i
			}
		}
	}
	return 0
}

// 辅助函数 - 获取嵌套的字符串切片
func getNestedStringSlice(data interface{}, key string) string {
	if m, ok := data.(map[string]interface{}); ok {
		if val, exists := m[key]; exists {
			if slice, ok := val.([]interface{}); ok {
				result := ""
				for i, item := range slice {
					if str, ok := item.(string); ok {
						if i > 0 {
							result += ", "
						}
						result += str
					}
				}
				return result
			}
		}
	}
	return ""
}

// 辅助函数 - 格式化浮点数
func formatFloat(val float64) string {
	return fmt.Sprintf("%.1f", val)
}

// 辅助函数 - 格式化整数
func formatInt(val int) string {
	return fmt.Sprintf("%d", val)
} 