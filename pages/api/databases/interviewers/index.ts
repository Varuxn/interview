// routes/interviewers.ts
import { Router } from 'express';
import pool from '../db_init';
import { InterviewerRequest, ApiResponse } from '../types';

const router = Router();

router.post('/', async (req, res) => {
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

function handleError(res: any, error: any, entity: string) {
  console.error(`Error processing ${entity}:`, error);
  const response: ApiResponse<null> = {
    success: false,
    message: `Failed to process ${entity}`
  };
  res.status(500).json(response);
}

export default router;