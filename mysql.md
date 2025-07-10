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