# AI测评系统 API 服务

这是一个Go语言开发的API服务，作为Python项目的API层，用于提供测评系统的后端服务。

## 项目结构

```
go_backend/
├── api/            # API路由定义
├── config/         # 配置文件
├── handlers/       # 请求处理函数
├── middleware/     # 中间件
├── models/         # 数据模型
├── services/       # 业务逻辑服务
├── utils/          # 工具函数
├── main.go         # 主程序入口
├── go.mod          # Go模块定义
└── README.md       # 项目说明
```

## 功能特性

- 基于Gin框架的RESTful API
- 与原Python项目的完整功能兼容
- 问题生成API
- 回答提交与评估API
- 文本、音频、视频处理支持
- 集成OpenAI API

## API 接口

### 1. 生成面试问题

- **URL**: `/api/v1/generate_question`
- **方法**: `POST`
- **请求体**:

```json
{
    "domain": "computer_networks",
    "difficulty": "medium"
}
```

- **响应**:

```json
{
    "success": true,
    "data": {
        "question": "请解释TCP三次握手过程及其必要性。"
    }
}
```

### 2. 提交回答

- **URL**: `/api/v1/submit_response`
- **方法**: `POST`
- **Content-Type**: `multipart/form-data`
- **表单字段**:
  - `question`: 面试问题
  - `text_response`: 文本回答
  - `audio_response`: 音频文件(可选)
  - `video_response`: 视频文件(可选)

- **响应**:

```json
{
    "success": true,
    "data": {
        "submission_id": "submission_1234567890",
        "evaluation": {
            "language_expression": 7.5,
            "logical_thinking": 8.0,
            "professional_knowledge": 7.8,
            "skill_matching": 7.0,
            "innovation": 6.5,
            "stress_response": 8.2,
            "overall_score": 7.5,
            "feedback": "回答详细且专业，展示了良好的网络协议理解..."
        }
    }
}
```

### 3. 获取评估结果

- **URL**: `/api/v1/results/{submission_id}`
- **方法**: `GET`
- **响应**:

```json
{
    "success": true,
    "data": {
        "question": "请解释TCP三次握手过程及其必要性。",
        "evaluation": {
            "language_expression": 7.5,
            "logical_thinking": 8.0,
            "professional_knowledge": 7.8,
            "skill_matching": 7.0,
            "innovation": 6.5,
            "stress_response": 8.2,
            "overall_score": 7.5,
            "feedback": "回答详细且专业，展示了良好的网络协议理解..."
        },
        "detailed_results": {
            "text_analysis": { /* 文本分析结果 */ },
            "audio_analysis": { /* 音频分析结果 */ },
            "video_analysis": { /* 视频分析结果 */ }
        }
    }
}
```

## 部署方式

### 前提条件

- Go 1.19 或更高版本
- 设置相关环境变量或创建 `.env` 文件

### 安装与运行

1. 克隆仓库
```bash
git clone <仓库地址>
cd go_backend
```

2. 安装依赖
```bash
go mod tidy
```

3. 构建项目
```bash
go build -o ai-reviewer
```

4. 运行服务
```bash
./ai-reviewer
```

默认情况下，服务器将在 0.0.0.0:8080 上启动。

### 环境变量配置

可以通过环境变量或 `.env` 文件配置以下参数:

- `HOST`: 服务器主机地址
- `PORT`: 服务器端口
- `DEBUG`: 调试模式
- `OPENAI_API_KEY`: OpenAI API密钥
- `OPENAI_API_BASE`: OpenAI API基础URL(用于ephone API)
- `UPLOAD_FOLDER`: 上传文件存储路径

## 与原Python项目的关系

本Go API服务封装了原Python项目的核心功能，包括：
- 问题生成
- 文本分析
- 音频处理
- 视频处理
- 综合评估

但相比原项目做了以下改进：
- 使用Go语言重构，提高了性能
- 采用更加模块化的设计
- 提供了更完善的API文档
- 错误处理更加健壮

## 许可证

[MIT](LICENSE) 