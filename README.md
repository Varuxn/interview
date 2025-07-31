# 多模态AI面试评估系统

本系统的UI界面基于 Next.js 的 pages 路由

## 前端文件

* `_app.tsx` : 导航栏与侧边栏的设计展示
* `index.tsx` : 主界面/登录界面
* `admin.tsx` : 管理员界面，支持题库维护，人员权限管理
* `demo.tsx` : 面试主界面，支持双机位自动化面试
* `boss.tsx` : 面试者分数查询界面，支持面试者分数能力信息等多维度展示
* `humaneval.tsx` : 面试官评分界面，支持查看面试者面试过程数据，并有可视化分析和打分模块
* `home.tsx` : 面试者设置界面，支持简历上传、面试官岗位选取、基础信息设置等操作
* `staff.tsx` : 面试结果查询界面，支持查看各环节各指标得分和评语建议

## 后端文件

* `ai_eval.ts` : 读取 AI面试官 给出的评分结果
* `human_eval.ts` : 读取 人类面试官 给出的评分结果
* `save_human_eval.ts` : 保存人类面试官给出的评分
* `datafile.ts` : 读取 `./data` 目录下的数据文件
* `eval_resume.ts` : 对简历文件进行评估并保存（此功能已移除）
* `initialize-user-evaluation.ts` : 对面试者的相关数据库信息进行初始化
* `llm_chat.ts` : 调用 LLM API 进行交互
* `llmApi.ts` : 获取 LLM 响应的函数
* `parse-pdf.ts` : 解析 PDF 文件获取内容
* `saveFile.ts` : 文件保存
* `synthesis.ts` : 调用科大讯飞的 API 进行语音合成
* `transcribe.ts` : 调用科大讯飞的 API 进行语音转文本的操作
* `/databases` : 数据库有关的内容读取和写入

## 使用文档

按照 `.env.example` 的格式创建 `.env` 文件，并配置密钥等信息

使用 `npm run build` 完成环境配置，执行 `npm run dev` 后服务启动，可在 `http://localhost:3000/` 访问面试平台。

在 `./page/demo.tsx` 文件下，有 `debug` 和 `test` 变量用于控制是否开启调试模式

数据库相关设置可参考 `./mysql.md`