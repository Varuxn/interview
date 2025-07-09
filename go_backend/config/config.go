package config

import (
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

// Config 存储应用的配置信息
type Config struct {
	// 服务器配置
	Host string
	Port int
	Debug bool

	// API密钥
	OpenAIAPIKey string
	OpenAIAPIBase string
	XunfeiAppID string
	XunfeiAPIKey string
	XunfeiAPISecret string

	// 模型配置
	DefaultLLMModel string
	QuestionGenerationModel string
	EvaluationModel string
	SystemTemperature float64
	MaxTokens int

	// 音频处理
	AudioSampleRate int
	AudioMaxDuration int

	// 视频处理
	VideoFrameRate int
	FaceDetectionConfidence float64
	PoseDetectionConfidence float64

	// 文本处理
	MaxTextLength int

	// 面试领域
	TechnicalDomains []string

	// 评估权重
	EvaluationWeights map[string]float64

	// 上传文件夹路径
	UploadFolder string
	TextFolder string
	AudioFolder string
	VideoFolder string
}

// LoadConfig 从环境变量或.env文件加载配置
func LoadConfig() *Config {
	// 尝试加载.env文件
	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: .env file not found, using environment variables")
	}

	// 获取调试模式设置
	debug := getEnvAsBool("DEBUG", false)
	if debug {
		log.Println("DEBUG模式已启用")
	}

	// 设置默认值
	config := &Config{
		Host:                 getEnv("HOST", "0.0.0.0"),
		Port:                 getEnvAsInt("PORT", 5000),
		Debug:                debug,
		OpenAIAPIKey:         getEnv("OPENAI_API_KEY", ""),
		OpenAIAPIBase:        getEnv("OPENAI_API_BASE", "https://api.ephone.chat/v1"),
		XunfeiAppID:          getEnv("XUNFEI_APP_ID", ""),
		XunfeiAPIKey:         getEnv("XUNFEI_API_KEY", ""),
		XunfeiAPISecret:      getEnv("XUNFEI_API_SECRET", ""),
		DefaultLLMModel:      getEnv("DEFAULT_LLM_MODEL", "gpt-3.5-turbo"),
		QuestionGenerationModel: getEnv("QUESTION_GENERATION_MODEL", "gpt-3.5-turbo"),
		EvaluationModel:      getEnv("EVALUATION_MODEL", "gpt-3.5-turbo"),
		SystemTemperature:    getEnvAsFloat("SYSTEM_TEMPERATURE", 0.7),
		MaxTokens:            getEnvAsInt("MAX_TOKENS", 1000),
		AudioSampleRate:      getEnvAsInt("AUDIO_SAMPLE_RATE", 16000),
		AudioMaxDuration:     getEnvAsInt("AUDIO_MAX_DURATION", 180),
		VideoFrameRate:       getEnvAsInt("VIDEO_FRAME_RATE", 10),
		FaceDetectionConfidence: getEnvAsFloat("FACE_DETECTION_CONFIDENCE", 0.7),
		PoseDetectionConfidence: getEnvAsFloat("POSE_DETECTION_CONFIDENCE", 0.7),
		MaxTextLength:        getEnvAsInt("MAX_TEXT_LENGTH", 5000),
		TechnicalDomains: []string{
			"computer_networks",
			"algorithms",
			"system_design",
			"machine_learning",
			"database_systems",
			"web_development",
			"devops",
			"cloud_computing",
		},
		EvaluationWeights: map[string]float64{
			"language_expression":   0.20,
			"logical_thinking":      0.20,
			"professional_knowledge": 0.25,
			"skill_matching":        0.15,
			"innovation":            0.10,
			"stress_response":       0.10,
		},
		UploadFolder: getEnv("UPLOAD_FOLDER", "./uploads"),
	}

	// 设置子文件夹路径
	config.TextFolder = config.UploadFolder + "/text"
	config.AudioFolder = config.UploadFolder + "/audio"
	config.VideoFolder = config.UploadFolder + "/video"

	return config
}

// 辅助函数 - 从环境变量获取字符串
func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}

// 辅助函数 - 从环境变量获取整数
func getEnvAsInt(key string, fallback int) int {
	if value, exists := os.LookupEnv(key); exists {
		intValue, err := strconv.Atoi(value)
		if err != nil {
			return fallback
		}
		return intValue
	}
	return fallback
}

// 辅助函数 - 从环境变量获取布尔值
func getEnvAsBool(key string, fallback bool) bool {
	if value, exists := os.LookupEnv(key); exists {
		boolValue, err := strconv.ParseBool(value)
		if err != nil {
			return fallback
		}
		return boolValue
	}
	return fallback
}

// 辅助函数 - 从环境变量获取浮点数
func getEnvAsFloat(key string, fallback float64) float64 {
	if value, exists := os.LookupEnv(key); exists {
		floatValue, err := strconv.ParseFloat(value, 64)
		if err != nil {
			return fallback
		}
		return floatValue
	}
	return fallback
} 