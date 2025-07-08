package main

import (
	"fmt"
	"log"
	"os"
	"path/filepath"

	"ai-reviewer/api"
	"ai-reviewer/config"
)

func main() {
	// 加载配置
	cfg := config.LoadConfig()
	
	// 确保上传目录存在
	ensureDirectories(cfg)
	
	// 设置路由
	router := api.SetupRouter(cfg)
	
	// 启动服务器
	serverAddr := fmt.Sprintf("%s:%d", cfg.Host, cfg.Port)
	log.Printf("服务器启动于 %s", serverAddr)
	
	if err := router.Run(serverAddr); err != nil {
		log.Fatalf("启动服务器失败: %v", err)
	}
}

// 确保必要的目录存在
func ensureDirectories(cfg *config.Config) {
	// 上传根目录
	if err := os.MkdirAll(cfg.UploadFolder, 0755); err != nil {
		log.Fatalf("创建上传目录失败: %v", err)
	}
	
	// 文本目录
	if err := os.MkdirAll(filepath.Join(cfg.UploadFolder, "text"), 0755); err != nil {
		log.Fatalf("创建文本目录失败: %v", err)
	}
	
	// 音频目录
	if err := os.MkdirAll(filepath.Join(cfg.UploadFolder, "audio"), 0755); err != nil {
		log.Fatalf("创建音频目录失败: %v", err)
	}
	
	// 视频目录
	if err := os.MkdirAll(filepath.Join(cfg.UploadFolder, "video"), 0755); err != nil {
		log.Fatalf("创建视频目录失败: %v", err)
	}
} 