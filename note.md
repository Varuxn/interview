## 架构说明

使用 pages 路由，文件大多在 `./pages` 目录下

* `_app.tsx` 导航栏侧边栏的设计（未做）
* `index.tsx` 主界面
* `fileupload.tsx` 简历上传解析界面
* `demo.tsx` 面试的简单流程

**api目录下**

* `eval_resume.ts` 调用llm对简历的文本进行评估，结果储存到了 `interview/data/resume/temp.txt` 中
* `transcribe.ts` 语音听写的后端，调用科大讯飞的 api
* `synthesis.ts` 语音合成的后端
* `db_init.ts` 数据库后端初始化部分
* `/databases` 数据库后端主体部分
* `types.ts` 数据库请求格式规范

**未做**

* `main_page.tsx` 登录后的主界面（可以直接默认为面试者的界面）可以导向四个主要界面。
* `staff.tsx` 面试者主界面，显示面试的各个环境，已完成的环节显示分数，未完成的环节显示未完成，点击可进入对应的环节（各环节统一采用demo里后半段的面试流程）
* `boss.tsx` 面试官主界面，显示当前正在面试的各个人员，点进去可以实时观看面试过程，或者说将面试的mp4存储下来，点进去就可以播放对应的视频。
* `eval_result.tsx` 显示面试人员的面试结果，各个指标的可视化报告
* `setting.tsx` 引导面试者进行面试岗位的选择和面试官的选择

* 面试界面双机位
* 功能表
* 小组讨论

### 评估环节

1. 自我介绍 introduction
2. 技术问答 technology
3. 情景案例分析 analysis

### 评估指标

1. 语言表达 language
2. 专业能力 profession
3. 逻辑思维 logic
4. 表现力 expressiveness
5. 综合 total

指标的具体名称是 `环节_指标` ,比如 `introduction_total`
各个环节的最终指标前缀为 `final_指标`

根据上面的评估环节和指标设计一个函数，如果在users的表中找不到userId
则进行初始化：向users表中加入userId，并且向evaluations的表中初始化userId的相关信息
将上述涉及的4*5=20个指标创建对应的行，得分score设置为-1，description设置为"未测试"

### 其他

* 面试人员信息

```json
{
    "id" : "参照clerk提供的id信息",
    "name" : "默认为user，后续可以在setting里添加",
    "schedule" : [
        {
            "name" : "面试环节的名称",
            "score" : "该指标的得分，为-1表示未进行面试",
            "description" : "面试内容详细解释"
        }
    ],
    "eval" : [
        {
            "name" : "指标的名称",
            "score" : "该指标的得分",
            "description" : "更细致的评估内容"
        }
    ]
}
```

后面也可以加一个岗位的表或者面试官的表

## 使用文档
`.next`目录是根据`./pages/api`目录的内容生成的，可以使用下面代码重新生成

```
rm -rf .next
npm run build
```

先运行 `go_backend` 的后端 `./ai-interviewer` 启动后端服务

然后使用 `npm run dev` 开始调试模式。

在`./page/demo.tsx` 文件下 `synthesizeSpeech` 函数发送报文 `debug=true` 只会返回固定的音频，改为 `debug=false` 才会生成指定音频。
在`./page/demo.tsx` 文件下 全局变量`debug=true`时不会调用生成问题的api和评估的api。

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
    
    -- 自我介绍环节(introduction)的5个指标
    introduction_language INT,
    introduction_profession INT,
    introduction_logic INT,
    introduction_expressiveness INT,
    introduction_total INT,
    
    -- 技术问答环节(technology)的5个指标
    technology_language INT,
    technology_profession INT,
    technology_logic INT,
    technology_expressiveness INT,
    technology_total INT,
    
    -- 情景案例分析环节(analysis)的5个指标
    analysis_language INT,
    analysis_profession INT,
    analysis_logic INT,
    analysis_expressiveness INT,
    analysis_total INT,
    
    -- 最终评估的5个指标
    final_language INT,
    final_profession INT,
    final_logic INT,
    final_expressiveness INT,
    final_total INT,
    
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
```