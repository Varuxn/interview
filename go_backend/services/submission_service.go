package services

import (
	"ai-reviewer/config"
	"ai-reviewer/models"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"time"

	"github.com/google/uuid"
)

// SubmissionService 负责处理用户提交
type SubmissionService struct {
	config       *config.Config
	openaiService *OpenAIService
	textProcessor  *TextProcessor
	audioProcessor *AudioProcessor
	videoProcessor *VideoProcessor
}

// NewSubmissionService 创建一个新的SubmissionService实例
func NewSubmissionService(
	cfg *config.Config, 
	openaiSvc *OpenAIService,
	textProc *TextProcessor,
	audioProc *AudioProcessor,
	videoProc *VideoProcessor,
) *SubmissionService {
	return &SubmissionService{
		config:        cfg,
		openaiService: openaiSvc,
		textProcessor:  textProc,
		audioProcessor: audioProc,
		videoProcessor: videoProc,
	}
}

// ProcessSubmission 处理用户提交
func (s *SubmissionService) ProcessSubmission(
	question string,
	textResponse string,
	audioFilePath string,
	videoFilePath string,
) (*models.Submission, error) {
	// 生成提交ID
	submissionID := fmt.Sprintf("submission_%s", uuid.New().String())
	
	// 创建提交文件夹
	submissionFolder := filepath.Join(s.config.UploadFolder, submissionID)
	if err := os.MkdirAll(submissionFolder, 0755); err != nil {
		return nil, fmt.Errorf("创建提交文件夹失败: %w", err)
	}
	
	// 初始化结果
	results := make(map[string]interface{})
	submission := &models.Submission{
		ID:             submissionID,
		Question:       question,
		TextResponse:   textResponse,
		SubmissionTime: time.Now(),
	}
	
	// 处理文本响应
	if textResponse != "" {
		textAnalysis, err := s.textProcessor.Process(textResponse, question)
		if err != nil {
			// 记录错误但继续处理其他部分
			fmt.Printf("文本处理错误: %v\n", err)
		} else {
			results["text_analysis"] = textAnalysis
			submission.TextAnalysis = textAnalysis
			
			// 保存文本响应
			textPath := filepath.Join(submissionFolder, "response.txt")
			if err := os.WriteFile(textPath, []byte(textResponse), 0644); err != nil {
				fmt.Printf("保存文本响应错误: %v\n", err)
			}
		}
	}
	
	// 处理音频文件
	if audioFilePath != "" {
		// 复制音频文件到提交文件夹
		audioFileName := filepath.Base(audioFilePath)
		destAudioPath := filepath.Join(submissionFolder, audioFileName)
		
		if err := copyFile(audioFilePath, destAudioPath); err != nil {
			fmt.Printf("复制音频文件错误: %v\n", err)
		} else {
			submission.AudioFile = &models.FileInfo{
				FileName: audioFileName,
				FilePath: destAudioPath,
			}
			
			// 处理音频
			audioAnalysis, err := s.audioProcessor.Process(destAudioPath)
			if err != nil {
				fmt.Printf("音频处理错误: %v\n", err)
			} else {
				results["audio_analysis"] = audioAnalysis
				submission.AudioAnalysis = audioAnalysis
			}
		}
	}
	
	// 处理视频文件
	if videoFilePath != "" {
		// 复制视频文件到提交文件夹
		videoFileName := filepath.Base(videoFilePath)
		destVideoPath := filepath.Join(submissionFolder, videoFileName)
		
		if err := copyFile(videoFilePath, destVideoPath); err != nil {
			fmt.Printf("复制视频文件错误: %v\n", err)
		} else {
			submission.VideoFile = &models.FileInfo{
				FileName: videoFileName,
				FilePath: destVideoPath,
			}
			
			// 处理视频
			videoAnalysis, err := s.videoProcessor.Process(destVideoPath)
			if err != nil {
				fmt.Printf("视频处理错误: %v\n", err)
			} else {
				results["video_analysis"] = videoAnalysis
				submission.VideoAnalysis = videoAnalysis
			}
		}
	}
	
	// 生成总体评估
	evaluation, err := s.openaiService.EvaluateResponse(question, results)
	if err != nil {
		fmt.Printf("评估生成错误: %v\n", err)
		// 创建一个默认评估
		submission.Evaluation = &models.Evaluation{
			LanguageExpression:   0.0,
			LogicalThinking:      0.0,
			ProfessionalKnowledge: 0.0,
			SkillMatching:        0.0,
			Innovation:           0.0,
			StressResponse:       0.0,
			OverallScore:         0.0,
			Feedback:             "评估生成失败",
		}
	} else {
		// 转换评估结果
		evalData, _ := json.Marshal(evaluation)
		var eval models.Evaluation
		json.Unmarshal(evalData, &eval)
		submission.Evaluation = &eval
	}
	
	// 保存结果
	resultsPath := filepath.Join(submissionFolder, "results.json")
	resultsData := map[string]interface{}{
		"question":        question,
		"evaluation":      submission.Evaluation,
		"detailed_results": results,
	}
	
	resultsJSON, err := json.MarshalIndent(resultsData, "", "  ")
	if err != nil {
		fmt.Printf("序列化结果错误: %v\n", err)
	} else {
		if err := os.WriteFile(resultsPath, resultsJSON, 0644); err != nil {
			fmt.Printf("保存结果错误: %v\n", err)
		}
		submission.ResultsPath = resultsPath
	}
	
	return submission, nil
}

// GetResults 获取提交结果
func (s *SubmissionService) GetResults(submissionID string) (*models.ResultsResponse, error) {
	resultsPath := filepath.Join(s.config.UploadFolder, submissionID, "results.json")
	
	// 检查文件是否存在
	if _, err := os.Stat(resultsPath); os.IsNotExist(err) {
		return nil, fmt.Errorf("未找到结果")
	}
	
	// 读取结果文件
	data, err := os.ReadFile(resultsPath)
	if err != nil {
		return nil, fmt.Errorf("读取结果失败: %w", err)
	}
	
	// 解析结果
	var results models.ResultsResponse
	if err := json.Unmarshal(data, &results); err != nil {
		return nil, fmt.Errorf("解析结果失败: %w", err)
	}
	
	return &results, nil
}

// 辅助函数 - 复制文件
func copyFile(src, dst string) error {
	source, err := os.Open(src)
	if err != nil {
		return err
	}
	defer source.Close()
	
	destination, err := os.Create(dst)
	if err != nil {
		return err
	}
	defer destination.Close()
	
	_, err = io.Copy(destination, source)
	return err
} 