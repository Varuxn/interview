package handlers

import (
	"ai-reviewer/models"
	"ai-reviewer/services"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// QuestionHandler 问题生成处理器
type QuestionHandler struct {
	questionService *services.QuestionService
}

// NewQuestionHandler 创建一个新的QuestionHandler实例
func NewQuestionHandler(questionSvc *services.QuestionService) *QuestionHandler {
	return &QuestionHandler{
		questionService: questionSvc,
	}
}

// GenerateQuestion 生成面试问题
func (h *QuestionHandler) GenerateQuestion(c *gin.Context) {
	var req models.QuestionGenerationRequest
	
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Error:   "无效的请求格式",
		})
		return
	}
	
	question, err := h.questionService.GenerateQuestion(req.Domain, req.Difficulty)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Error:   fmt.Sprintf("问题生成失败: %v", err),
		})
		return
	}
	
	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data: models.QuestionGenerationResponse{
			Question: question,
		},
	})
}

// SubmissionHandler 提交处理器
type SubmissionHandler struct {
	submissionService *services.SubmissionService
	uploadFolder      string
}

// NewSubmissionHandler 创建一个新的SubmissionHandler实例
func NewSubmissionHandler(submissionSvc *services.SubmissionService, uploadFolder string) *SubmissionHandler {
	return &SubmissionHandler{
		submissionService: submissionSvc,
		uploadFolder:      uploadFolder,
	}
}

// SubmitResponse 提交面试回答
func (h *SubmissionHandler) SubmitResponse(c *gin.Context) {
	// 获取问题
	question := c.PostForm("question")
	if question == "" {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Error:   "未提供问题",
		})
		return
	}
	
	// 获取文本回答
	textResponse := c.PostForm("text_response")
	
	// 创建临时文件路径
	audioPath := ""
	videoPath := ""
	
	// 处理音频文件上传
	audioFile, audioHeader, err := c.Request.FormFile("audio_response")
	if err == nil {
		// 创建音频目录
		audioDir := filepath.Join(h.uploadFolder, "audio")
		os.MkdirAll(audioDir, 0755)
		
		// 生成唯一文件名
		audioFileName := fmt.Sprintf("%s%s", uuid.New().String(), filepath.Ext(audioHeader.Filename))
		audioPath = filepath.Join(audioDir, audioFileName)
		
		// 保存文件
		out, err := os.Create(audioPath)
		if err != nil {
			c.JSON(http.StatusInternalServerError, models.APIResponse{
				Success: false,
				Error:   fmt.Sprintf("创建音频文件失败: %v", err),
			})
			return
		}
		defer out.Close()
		
		_, err = io.Copy(out, audioFile)
		if err != nil {
			c.JSON(http.StatusInternalServerError, models.APIResponse{
				Success: false,
				Error:   fmt.Sprintf("保存音频文件失败: %v", err),
			})
			return
		}
	}
	
	// 处理视频文件上传
	videoFile, videoHeader, err := c.Request.FormFile("video_response")
	if err == nil {
		// 创建视频目录
		videoDir := filepath.Join(h.uploadFolder, "video")
		os.MkdirAll(videoDir, 0755)
		
		// 生成唯一文件名
		videoFileName := fmt.Sprintf("%s%s", uuid.New().String(), filepath.Ext(videoHeader.Filename))
		videoPath = filepath.Join(videoDir, videoFileName)
		
		// 保存文件
		out, err := os.Create(videoPath)
		if err != nil {
			c.JSON(http.StatusInternalServerError, models.APIResponse{
				Success: false,
				Error:   fmt.Sprintf("创建视频文件失败: %v", err),
			})
			return
		}
		defer out.Close()
		
		_, err = io.Copy(out, videoFile)
		if err != nil {
			c.JSON(http.StatusInternalServerError, models.APIResponse{
				Success: false,
				Error:   fmt.Sprintf("保存视频文件失败: %v", err),
			})
			return
		}
	}
	
	// 检查是否提供了任何回答
	if textResponse == "" && audioPath == "" && videoPath == "" {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Error:   "未提供任何回答（文本、音频或视频）",
		})
		return
	}
	
	// 处理提交
	submission, err := h.submissionService.ProcessSubmission(
		question,
		textResponse,
		audioPath,
		videoPath,
	)
	
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.APIResponse{
			Success: false,
			Error:   fmt.Sprintf("处理提交失败: %v", err),
		})
		return
	}
	
	// 返回响应
	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data: gin.H{
			"submission_id": submission.ID,
			"evaluation":   submission.Evaluation,
		},
	})
}

// GetResults 获取提交结果
func (h *SubmissionHandler) GetResults(c *gin.Context) {
	submissionID := c.Param("submission_id")
	if submissionID == "" {
		c.JSON(http.StatusBadRequest, models.APIResponse{
			Success: false,
			Error:   "未提供提交ID",
		})
		return
	}
	
	results, err := h.submissionService.GetResults(submissionID)
	if err != nil {
		c.JSON(http.StatusNotFound, models.APIResponse{
			Success: false,
			Error:   fmt.Sprintf("获取结果失败: %v", err),
		})
		return
	}
	
	c.JSON(http.StatusOK, models.APIResponse{
		Success: true,
		Data:    results,
	})
} 