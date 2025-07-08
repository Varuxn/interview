package api

import (
	"ai-reviewer/config"
	"ai-reviewer/handlers"
	"ai-reviewer/services"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

// SetupRouter 配置API路由
func SetupRouter(cfg *config.Config) *gin.Engine {
	// 根据配置设置运行模式
	if !cfg.Debug {
		gin.SetMode(gin.ReleaseMode)
	}
	
	// 创建路由
	router := gin.Default()
	
	// 配置CORS
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))
	
	// 创建服务实例
	openaiService := services.NewOpenAIService(cfg)
	
	textProcessor := services.NewTextProcessor(cfg, openaiService)
	audioProcessor := services.NewAudioProcessor(cfg)
	videoProcessor := services.NewVideoProcessor(cfg)
	
	questionService := services.NewQuestionService(cfg, openaiService)
	submissionService := services.NewSubmissionService(
		cfg,
		openaiService,
		textProcessor,
		audioProcessor,
		videoProcessor,
	)
	
	// 创建处理器实例
	questionHandler := handlers.NewQuestionHandler(questionService)
	submissionHandler := handlers.NewSubmissionHandler(submissionService, cfg.UploadFolder)
	
	// 健康检查
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "ok",
		})
	})
	
	// API路由组
	api := router.Group("/api")
	{
		// V1 版本路由组
		v1 := api.Group("/v1")
		{
			// 问题生成
			v1.POST("/generate_question", questionHandler.GenerateQuestion)
			
			// 提交回答
			v1.POST("/submit_response", submissionHandler.SubmitResponse)
			
			// 获取结果
			v1.GET("/results/:submission_id", submissionHandler.GetResults)
		}
	}
	
	return router
} 