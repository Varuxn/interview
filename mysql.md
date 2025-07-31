## Mysql 表格格式

```sql
-- 创建用户名表
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,  -- 参照clerk提供的id信息
    name VARCHAR(50) DEFAULT 'user'  -- 默认为user
);

-- 创建设置表
CREATE TABLE settings (
    id VARCHAR(50) PRIMARY KEY,
    interviewer VARCHAR(100),  -- 面试官姓名/id
    position VARCHAR(100),  -- 面试岗位
    FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
);

-- 创建面试环节表
CREATE TABLE schedules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50),  -- 关联用户ID
    sche_name VARCHAR(100) NOT NULL,  -- 面试环节的名称
    score INT DEFAULT -1,  -- 该指标的得分，为-1表示未进行面试
    description TEXT,  -- 面试内容详细解释
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 创建评估结果表
CREATE TABLE evaluations (
    -- 基础信息列
    user_id VARCHAR(50) NOT NULL,
    description TEXT,
    
    -- 自我介绍环节(introduction)的7个指标
    introduction_expertise INT COMMENT '专业知识水平',
    introduction_proficiency INT COMMENT '技能匹配度',
    introduction_articulation INT COMMENT '语言表达能力',
    introduction_reasoning INT COMMENT '逻辑思维能力',
    introduction_innovation INT COMMENT '创新能力', 
    introduction_resilience INT COMMENT '应变抗压能力',
    introduction_total INT COMMENT '自我介绍总分',
    
    -- 技术问答环节(technology)的7个指标
    technology_expertise INT COMMENT '专业知识水平',
    technology_proficiency INT COMMENT '技能匹配度',
    technology_articulation INT COMMENT '语言表达能力',
    technology_reasoning INT COMMENT '逻辑思维能力',
    technology_innovation INT COMMENT '创新能力',
    technology_resilience INT COMMENT '应变抗压能力',
    technology_total INT COMMENT '技术问答总分',
    
    -- 情景案例分析环节(analysis)的7个指标
    analysis_expertise INT COMMENT '专业知识水平',
    analysis_proficiency INT COMMENT '技能匹配度',
    analysis_articulation INT COMMENT '语言表达能力',
    analysis_reasoning INT COMMENT '逻辑思维能力',
    analysis_innovation INT COMMENT '创新能力',
    analysis_resilience INT COMMENT '应变抗压能力',
    analysis_total INT COMMENT '情景分析总分',
    
    -- 最终评估的7个指标
    final_expertise INT COMMENT '专业知识水平',
    final_proficiency INT COMMENT '技能匹配度',
    final_articulation INT COMMENT '语言表达能力',
    final_reasoning INT COMMENT '逻辑思维能力',
    final_innovation INT COMMENT '创新能力',
    final_resilience INT COMMENT '应变抗压能力',
    final_total INT COMMENT '最终总分',
    
    -- 主键
    PRIMARY KEY (user_id)
);

-- 创建岗位信息表
CREATE TABLE positions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL COMMENT '岗位名称',
    description TEXT COMMENT '岗位描述',
    difficulty ENUM('easy', 'medium', 'hard') NOT NULL COMMENT '难度等级',
    INDEX idx_difficulty (difficulty)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='面试岗位表';

-- 创建面试官信息表
CREATE TABLE interviewers (
    id VARCHAR(50) PRIMARY KEY COMMENT '面试官ID',
    name VARCHAR(50) NOT NULL COMMENT '面试官姓名',
    description TEXT COMMENT '面试官描述',
    country CHAR(2) NOT NULL COMMENT '国家代码(ISO 3166-1 alpha-2)',
    level VARCHAR(10) NOT NULL COMMENT '职级(如L4/L6/L8)',
    INDEX idx_country (country),
    INDEX idx_level (level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='面试官信息表';

-- 创建角色表
CREATE TABLE roles (
  user_id VARCHAR(50) PRIMARY KEY,
  role ENUM('interviewer', 'candidate') NOT NULL DEFAULT 'candidate'
);

-- 创建问题表
CREATE TABLE questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  position_id INT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  difficulty ENUM('easy', 'medium', 'hard') NOT NULL DEFAULT 'medium',
  tags JSON,
  FOREIGN KEY (position_id) REFERENCES positions(id) ON DELETE CASCADE
);
```

## llm_chat 后端请求与响应格式

请求格式：

```json
{
  "system_prompt": "你是一个专业的AI助手，请用中文回答用户的问题。",
  "user_prompt": "请解释量子计算的基本原理",
  "model": "gpt-3.5-turbo", // 可选
  "temperature": 0.7 // 可选
}
```

响应格式:

```json
{
  "success": true,
  "llm_response": {
    "id": "chatcmpl-123",
    "object": "chat.completion",
    "created": 1677652288,
    "model": "gpt-3.5-turbo",
    "choices": [
      {
        "index": 0,
        "message": {
          "role": "assistant",
          "content": "量子计算是利用量子力学原理处理信息的计算方式..."
        },
        "finish_reason": "stop"
      }
    ],
    "usage": {
      "prompt_tokens": 56,
      "completion_tokens": 300,
      "total_tokens": 356
    }
  }
}
```

## 请求和响应示例

### 1. 用户创建/更新

**请求:**
```json
POST /api/users
{
  "id": "user123",
  "name": "John Doe"
}
```

**响应:**
```json
{
  "success": true,
  "message": "User processed successfully",
  "data": {
    "id": "user123",
    "name": "John Doe"
  }
}
```

### 2. 设置创建/更新

**请求:**
```json
POST /api/settings
{
  "id": "user123",
  "interviewer": "Alex",
  "position": "人工智能"
}
```

**响应:**
```json
{
  "success": true,
  "message": "Setting processed successfully",
  "data": {
    "id": "user123",
    "interviewer": "Alex",
    "position": "人工智能"
  }
}
```

### 3. 面试环节创建/更新

**创建请求:**
```json
POST /api/schedules
{
  "user_id": "user123",
  "sche_name": "技术面试",
  "score": 85,
  "description": "算法题表现良好"
}
```

**更新请求:**
```json
POST /api/schedules?updateById=1
{
  "sche_name": "技术面试",
  "score": 90,
  "description": "算法题表现优秀"
}
```

**响应:**
```json
{
  "success": true,
  "message": "Schedule processed successfully",
  "data": {
    "user_id": "user123",
    "sche_name": "技术面试",
    "score": 90,
    "description": "算法题表现优秀"
  }
}
```

### 4. 评估结果创建/更新

**创建请求:**
```json
POST /api/evaluations
{
  "user_id": "user123",
  "eval_name": "编码能力",
  "score": 88,
  "description": "代码整洁度高"
}
```

**更新请求:**
```json
POST /api/evaluations?updateById=1
{
  "eval_name": "编码能力",
  "score": 92,
  "description": "代码非常整洁"
}
```

**响应:**
```json
{
  "success": true,
  "message": "Evaluation processed successfully",
  "data": {
    "user_id": "user123",
    "eval_name": "编码能力",
    "score": 92,
    "description": "代码非常整洁"
  }
}
```

### 5. 岗位信息创建/更新

**创建请求:**
```json
POST /api/positions
{
  "name": "前端开发",
  "description": "负责Web界面开发",
  "difficulty": "medium"
}
```

**更新请求:**
```json
POST /api/positions
{
  "id": 1,
  "name": "人工智能",
  "description": "机器学习工程师、算法研究员、NLP工程师...",
  "difficulty": "hard"
}
```

**响应:**
```json
{
  "success": true,
  "message": "Position processed successfully",
  "data": {
    "id": 1,
    "name": "人工智能",
    "description": "机器学习工程师、算法研究员、NLP工程师...",
    "difficulty": "hard"
  }
}
```

### 6. 面试官信息创建/更新

**请求:**
```json
POST /api/interviewers
{
  "id": "Alex",
  "name": "Alex",
  "description": "高级算法工程师 | 性格：理性冷静",
  "country": "CN",
  "level": "L4"
}
```

**响应:**
```json
{
  "success": true,
  "message": "Interviewer processed successfully",
  "data": {
    "id": "Alex",
    "name": "Alex",
    "description": "高级算法工程师 | 性格：理性冷静",
    "country": "CN",
    "level": "L4"
  }
}
```

### 7. 查询

* 查询单个用户：

  请求URL:  GET /api/query?table=users&id=user123

  响应: 
```json
{
  "success": true,
  "message": "Record fetched",
  "data": {
    "id": "user123",
    "name": "John Doe"
  }
}
```

* 查询所有：

  请求URL:  GET /api/query?table=positions

  响应: 
```json
{
  "success": true,
  "message": "All records fetched",
  "data": [
    {
      "id": 1,
      "name": "人工智能",
      "description": "机器学习工程师、算法研究员...",
      "difficulty": "hard"
    },
    {
      "id": 2,
      "name": "大数据",
      "description": "大数据开发工程师...",
      "difficulty": "medium"
    }
  ]
}
```

## 关键设计说明

1. **UPSERT 操作**：使用 `ON DUPLICATE KEY UPDATE` 实现存在则更新、不存在则插入的逻辑
2. **参数化查询**：防止SQL注入
3. **事务处理**：虽然示例中没有展示，但实际应用中应考虑对相关操作使用事务
4. **错误处理**：统一的错误处理机制
5. **类型安全**：使用TypeScript确保类型安全
6. **RESTful设计**：遵循REST原则设计API端点

这个实现可以满足您的需求，处理所有表格的创建和更新操作，并提供清晰的请求响应格式。

跳转 demo 传递参数：

```js
// 在跳转的代码中（如按钮点击事件）
import { useRouter } from 'next/router';

function SomeComponent() {
  const router = useRouter();

  const navigateToDemo = (stage: string) => {
    router.push({
      pathname: '/demo',
      query: { stage }, // 传递环节标识
    });
  };

  return (
    <button onClick={() => navigateToDemo('technical')}>
      进入技术面试环节
    </button>
  );
}
```