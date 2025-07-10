import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import pool from './db_init';
import {
  UserRequest, SettingRequest, ScheduleRequest,
  EvaluationRequest, PositionRequest, InterviewerRequest,
  ApiResponse,QueryRequest, QueryResponse
} from './types';

const app = express();
app.use(bodyParser.json());
app.use(cors());

const PORT = 3000;

// 通用错误处理
const handleError = (res: express.Response, error: any, entity: string) => {
  console.error(`Error processing ${entity}:`, error);
  const response: ApiResponse<null> = {
    success: false,
    message: `Failed to process ${entity}`
  };
  res.status(500).json(response);
};

// 1. 用户创建/更新
app.post('/api/users', async (req, res) => {
  try {
    const userData: UserRequest = req.body;
    const [result] = await pool.execute(
      `INSERT INTO users (id, name) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE name = COALESCE(?, name)`,
      [userData.id, userData.name || 'user', userData.name]
    );

    const response: ApiResponse<UserRequest> = {
      success: true,
      message: 'User processed successfully',
      data: userData
    };
    res.json(response);
  } catch (error) {
    handleError(res, error, 'user');
  }
});

// 2. 设置创建/更新
app.post('/api/settings', async (req, res) => {
  try {
    const settingData: SettingRequest = req.body;
    const [result] = await pool.execute(
      `INSERT INTO settings (id, interviewer, position) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE 
         interviewer = COALESCE(?, interviewer),
         position = COALESCE(?, position)`,
      [
        settingData.id, 
        settingData.interviewer, 
        settingData.position,
        settingData.interviewer,
        settingData.position
      ]
    );

    const response: ApiResponse<SettingRequest> = {
      success: true,
      message: 'Setting processed successfully',
      data: settingData
    };
    res.json(response);
  } catch (error) {
    handleError(res, error, 'setting');
  }
});

// 3. 面试环节创建/更新
app.post('/api/schedules', async (req, res) => {
  try {
    const scheduleData: ScheduleRequest = req.body;
    let query: string;
    let params: any[];

    if (req.query.updateById) {
      // 根据ID更新现有记录
      query = `UPDATE schedules SET 
               sche_name = ?, score = ?, description = ?
               WHERE id = ?`;
      params = [
        scheduleData.sche_name,
        scheduleData.score ?? -1,
        scheduleData.description,
        req.query.updateById
      ];
    } else {
      // 创建新记录
      query = `INSERT INTO schedules 
               (user_id, sche_name, score, description) 
               VALUES (?, ?, ?, ?)`;
      params = [
        scheduleData.user_id,
        scheduleData.sche_name,
        scheduleData.score ?? -1,
        scheduleData.description
      ];
    }

    const [result] = await pool.execute(query, params);
    const response: ApiResponse<ScheduleRequest> = {
      success: true,
      message: 'Schedule processed successfully',
      data: scheduleData
    };
    res.json(response);
  } catch (error) {
    handleError(res, error, 'schedule');
  }
});

// 4. 评估结果创建/更新
app.post('/api/evaluations', async (req, res) => {
  try {
    const evalData: EvaluationRequest = req.body;
    let query: string;
    let params: any[];

    if (req.query.updateById) {
      // 根据ID更新现有记录
      query = `UPDATE evaluations SET 
               eval_name = ?, score = ?, description = ?
               WHERE id = ?`;
      params = [
        evalData.eval_name,
        evalData.score,
        evalData.description,
        req.query.updateById
      ];
    } else {
      // 创建新记录
      query = `INSERT INTO evaluations 
               (user_id, eval_name, score, description) 
               VALUES (?, ?, ?, ?)`;
      params = [
        evalData.user_id,
        evalData.eval_name,
        evalData.score,
        evalData.description
      ];
    }

    const [result] = await pool.execute(query, params);
    const response: ApiResponse<EvaluationRequest> = {
      success: true,
      message: 'Evaluation processed successfully',
      data: evalData
    };
    res.json(response);
  } catch (error) {
    handleError(res, error, 'evaluation');
  }
});

// 5. 岗位信息创建/更新
app.post('/api/positions', async (req, res) => {
  try {
    const positionData: PositionRequest = req.body;
    let query: string;
    let params: any[];

    if (positionData.id) {
      // 更新现有岗位
      query = `UPDATE positions SET 
               name = ?, description = ?, difficulty = ?
               WHERE id = ?`;
      params = [
        positionData.name,
        positionData.description,
        positionData.difficulty,
        positionData.id
      ];
    } else {
      // 创建新岗位
      query = `INSERT INTO positions 
               (name, description, difficulty) 
               VALUES (?, ?, ?)`;
      params = [
        positionData.name,
        positionData.description,
        positionData.difficulty
      ];
    }

    const [result] = await pool.execute(query, params);
    const response: ApiResponse<PositionRequest> = {
      success: true,
      message: 'Position processed successfully',
      data: positionData
    };
    res.json(response);
  } catch (error) {
    handleError(res, error, 'position');
  }
});

// 6. 面试官信息创建/更新
app.post('/api/interviewers', async (req, res) => {
  try {
    const interviewerData: InterviewerRequest = req.body;
    const [result] = await pool.execute(
      `INSERT INTO interviewers 
       (id, name, description, country, level) 
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
         name = VALUES(name),
         description = VALUES(description),
         country = VALUES(country),
         level = VALUES(level)`,
      [
        interviewerData.id,
        interviewerData.name,
        interviewerData.description,
        interviewerData.country,
        interviewerData.level
      ]
    );

    const response: ApiResponse<InterviewerRequest> = {
      success: true,
      message: 'Interviewer processed successfully',
      data: interviewerData
    };
    res.json(response);
  } catch (error) {
    handleError(res, error, 'interviewer');
  }
});

// 通用查询接口
app.get('/api/query', async (req, res) => {
  try {
    const queryParams: QueryRequest = {
      table: req.query.table as QueryRequest['table'],
      id: req.query.id 
        ? isNaN(Number(req.query.id)) 
          ? req.query.id.toString() 
          : Number(req.query.id)
        : undefined
    };

    // 验证表名是否有效
    const validTables = ['users', 'settings', 'schedules', 'evaluations', 'positions', 'interviewers'];
    if (!validTables.includes(queryParams.table)) {
      const response: QueryResponse = {
        success: false,
        message: 'Invalid table name'
      };
      return res.status(400).json(response);
    }

    let query: string;
    let params: any[] = [];

    if (queryParams.id) {
      // 查询单条记录
      query = `SELECT * FROM ${queryParams.table} WHERE id = ?`;
      params = [queryParams.id];
    } else {
      // 查询整个表
      query = `SELECT * FROM ${queryParams.table}`;
    }

    const [rows] = await pool.execute(query, params);

    const response: QueryResponse = {
      success: true,
      message: queryParams.id ? 'Record fetched' : 'All records fetched',
      data: queryParams.id ? rows[0] : rows
    };

    res.json(response);
  } catch (error) {
    console.error('Query error:', error);
    const response: QueryResponse = {
      success: false,
      message: 'Database query failed'
    };
    res.status(500).json(response);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});