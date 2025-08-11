# 多模态AI面试评估系统 (伯乐多模态AI面试系统)

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14.1.0-black.svg)](https://nextjs.org/)

本系统是一个多模态AI面试评估平台，支持自动化面试、AI与人类面试官协同评估、简历分析以及多维度数据可视化。系统基于Next.js全栈框架构建，集成了语音合成、语音识别、数据库管理和用户认证等功能。适用于招聘场景，提供面试官、面试者和管理员三种角色。

## 系统概述

系统支持三种用户角色，每个角色有专属界面和功能：

### 1. 面试官角色
- **面试者分数查询界面 (`boss.tsx`)**: 显示面试者基础信息卡片，支持查询特定范围的面试者（例如同一岗位、同一AI面试官或搜索姓名）。查看面试结果，包括评估指标分数、关键能力分析、AI面试官评语，以及用户姓名、面试岗位、面试官、邮箱、联系方式和能力标签。
- **面试官评分界面 (`humaneval.tsx`)**: 展示面试过程数据可视化，包括：
  - 面试视频（主/副机位）。
  - AI与人类面试官评分雷达图对比。
  - 面试对话文本。
  - 语速和声音响度变化曲线。
  - 打分模块，提供优雅的打分体验。

![](/public/img/humaneval.png)
![](/public/img/boss.png)

### 2. 面试者角色
- **基本信息设置界面 (`home.tsx`)**: 支持：
  - 上传简历，分析内容并提取能力关键词。
  - 填写个人信息，勾选技能标签。
  - 选择面试岗位和AI面试官。
- **AI面试界面 (`demo.tsx`)**: 主面试流程，支持双机位自动化面试，包括：
  - 主摄像头（前方，记录表情）。
  - 第二机位（后方，监督防作弊）。
  - 面试官语音/文本提问。
  - 控制组件（开始/停止录制、麦克风选择、自动化流程）。
  - 对话组件（文本记录，支持输入）。
  
  **自动化面试流程**:
  1. AI面试官基于前文、简历和岗位生成问题，输出文本并播放音频。
  2. 问题结束后，提供5秒思考时间，然后自动开始录制。
  3. 回答过程中，超过3秒静音自动停止录制，提交语音转文本，然后循环到下一个问题。

- **面试结果查询界面 (`staff.tsx`)**: 展示AI与人类面试官评估结果，包括各环节指标分数、综合分数、评价分析、能力雷达图，以及进入每个环节的测试入口。

![](/public/img/setting.PNG)
![](/public/img/main.png)
![](/public/img/staff.png)

### 3. 管理员角色
- **管理员界面 (`admin.tsx`)**: 支持题库/知识库管理和用户权限管理，包括：
  - 岗位管理（添加新岗位）。
  - 问题管理（每个岗位独立题库）。
  - 人员管理（切换用户面试官/面试者身份）。

![](/public/img/admin.png)

## 特性
- 多模态支持：视频、语音、文本交互。
- AI集成：语音合成/识别（科大讯飞API）、LLM聊天。
- 数据可视化：雷达图、语速曲线、图表（Chart.js、Recharts）。
- 安全与限流：用户认证（Clerk）、API速率限制（Upstash）。
- 数据库：MySQL存储用户、设置、评估、岗位、面试官、角色和题库。

## 技术栈

### 前端核心库与框架
- **核心框架**: Next.js (^14.1.0) with Pages Router, React (^18.3.1).
- **UI 与样式**: Tailwind CSS (^3.4.17), Headless UI (^1.7.14), Heroicons (^1.0.6), Lucide React (^0.525.0), React Icons (^5.4.0), Framer Motion (^10.18.0) for animations.
- **数据可视化**: Chart.js (^4.5.0), react-chartjs-2 (^5.3.0), Recharts (^3.1.0).
- **用户认证**: @clerk/nextjs.

### 后端响应式处理技术
- **数据库交互**: MySQL with mysql2 (^3.14.1) connection pool.
- **文件处理**: PDF解析 (pdf-parse, formidable), 音视频处理 (fluent-ffmpeg).
- **第三方AI服务**: 科大讯飞API for 语音合成 (Text-to-Speech) and 语音识别 (Speech-to-Text) via WebSocket.
- **API安全**: @upstash/ratelimit and @upstash/redis for rate limiting.
- **其他**: LLM交互 (llm_chat.ts, llmApi.ts), 文件保存 (saveFile.ts).

### 数据库表结构
| 表名          | 主要字段                          | 功能描述                  |
|---------------|-----------------------------------|---------------------------|
| user         | id, name                         | 存储用户名               |
| settings     | id, interviewer, position        | 存储面试者设置           |
| evaluations  | user_id, description, link_metric| 存储面试者得分和评价     |
| positions    | id, name, description, difficulty| 存储岗位信息             |
| interviewers | id, name, description, level, country | 存储面试官信息       |
| roles        | user_id, role                    | 存储用户身份             |
| questions    | id, position_id, question, answer, difficulty, tag | 存储知识库/题库内容 |

### 后端API配置
- 数据库交互API：读写用户数据、设置、评估等。
- 文档解析API：解析PDF简历，提取关键信息 (`parse-pdf.ts`)。
- 语音转文本API：调用科大讯飞STT，实现语音到文本转换 (`transcribe.ts`)。
- 文本转语音API：调用科大讯飞TTS，实现文本到语音合成 (`synthesis.ts`)。
- 其他：AI评估 (`ai_eval.ts`, `human_eval.ts`), 初始化 (`initialize-user-evaluation.ts`), LLM交互 (`llm_chat.ts`), 文件保存 (`saveFile.ts`)。

## 前端文件概述
- `_app.tsx`: 导航栏与侧边栏。
- `index.tsx`: 主界面/登录界面。
- `admin.tsx`: 管理员界面。
- `demo.tsx`: 面试主界面（支持调试模式：设置`debug`和`test`变量）。
- `boss.tsx`: 面试者分数查询界面。
- `humaneval.tsx`: 面试官评分界面。
- `home.tsx`: 面试者设置界面。
- `staff.tsx`: 面试结果查询界面。

## 后端文件概述
- `ai_eval.ts`: 读取AI面试官评分。
- `human_eval.ts`: 读取人类面试官评分。
- `save_human_eval.ts`: 保存人类面试官评分。
- `datafile.ts`: 读取`./data`目录数据。
- `initialize-user-evaluation.ts`: 初始化面试者数据库信息。
- `llm_chat.ts`: 调用LLM API交互。
- `llmApi.ts`: 获取LLM响应。
- `parse-pdf.ts`: 解析PDF文件。
- `saveFile.ts`: 文件保存。
- `synthesis.ts`: 语音合成（科大讯飞API）。
- `transcribe.ts`: 语音转文本（科大讯飞API）。
- `/databases`: 数据库读写操作。

**注意**: `eval_resume.ts`功能已移除。

## 部署与安装

### 先决条件
- Node.js >= 18.x
- MySQL数据库
- 科大讯飞API密钥（用于语音服务）
- Clerk、Upstash等服务密钥（可选，用于认证和限流）

### 步骤
1. **克隆仓库**:
   ```
   git clone <repository-url>
   cd <repository-directory>
   ```

2. **安装依赖**:
   ```
   npm install
   ```

3. **配置环境变量**:
   - 复制`.env.example`为`.env`。
   - 配置密钥（如MySQL连接、科大讯飞API密钥、Clerk密钥等）。
   ```
    OPENAI_API_KEY=
    XFYUN_APPID=
    XFYUN_API_KEY=
    XFYUN_API_SECRET=

    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
    CLERK_SECRET_KEY=

    EPHONE_API_KEY=
   ```

4. **数据库配置**:
   - 参考`./mysql.md`设置MySQL数据库。
   - 创建上述数据库表。
   - 初始化连接池（在后端代码中已配置）。

5. **构建与运行**:
   - 构建项目：
     ```
     npm run build
     ```
   - 启动开发服务器：
     ```
     npm run dev
     ```
   - 访问`http://localhost:3000/`。

6. **生产部署**:
   - 使用Vercel（推荐，Next.js原生支持）或其他Node.js主机。
   - 运行`npm start`启动生产模式。
   - 确保环境变量在生产环境中设置。

### 调试模式
- 在`./pages/demo.tsx`中，设置`debug`和`test`变量为`true`以开启调试（例如，模拟面试流程）。

## 使用说明
- **登录**: 通过Clerk处理，访问根路径(`/`)进入登录界面。
- **导航**: 根据角色自动重定向到对应界面。
- **API端点**: 所有后端API位于`/pages/api/`，例如`/api/parse-pdf`用于简历解析。
- **扩展性**: 添加新岗位/题库通过管理员界面；集成更多AI服务通过后端API。

## 常见问题
- **数据库连接失败**: 检查`.env`中的DATABASE_URL。
- **API密钥无效**: 验证科大讯飞/Clerk密钥。
- **视频/语音问题**: 确保浏览器支持WebRTC和媒体设备。

## 贡献
欢迎PR！请遵循代码规范，使用Tailwind CSS保持样式一致。

## 许可证
MIT License.