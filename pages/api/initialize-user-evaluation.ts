// pages/api/initialize-user-evaluation.ts
import { NextApiRequest, NextApiResponse } from 'next';
import pool from './databases/db_init';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { ApiResponse, UserRequest } from './databases/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<string | UserRequest | null>>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method Not Allowed. Only POST is allowed for initialization.',
    });
  }

  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: 'User ID is required for initialization.',
    });
  }

  try {
    // 1. Check if user exists in the 'users' table
    const [userRows]: [RowDataPacket[], any] = await pool.query(
      `SELECT id FROM users WHERE id = ?`,
      [userId]
    );

    let isNewUser = false;
    if (userRows.length === 0) {
      // User not found, initialize in 'users' table
      isNewUser = true;
      const [insertUserResult]: [ResultSetHeader, any] = await pool.execute(
        `INSERT INTO users (id, name) VALUES (?, ?)`,
        [userId, `User_${userId}`]
      );

      if (insertUserResult.affectedRows === 0) {
        throw new Error('Failed to add user to the users table.');
      }
    }

    // 2. Initialize evaluation record in 'evaluations' table with new structure
    const initializeEvaluationQuery = `
  INSERT INTO evaluations (
    user_id, 
    description,
    introduction_expertise, introduction_proficiency, introduction_articulation, 
    introduction_reasoning, introduction_innovation, introduction_resilience, introduction_total,
    technology_expertise, technology_proficiency, technology_articulation,
    technology_reasoning, technology_innovation, technology_resilience, technology_total,
    analysis_expertise, analysis_proficiency, analysis_articulation,
    analysis_reasoning, analysis_innovation, analysis_resilience, analysis_total,
    final_expertise, final_proficiency, final_articulation,
    final_reasoning, final_innovation, final_resilience, final_total
  ) VALUES (
    ?, 
    ?,
    ?, ?, ?, ?, ?, ?, ?,
    ?, ?, ?, ?, ?, ?, ?,
    ?, ?, ?, ?, ?, ?, ?,
    ?, ?, ?, ?, ?, ?, ?
  )
  ON DUPLICATE KEY UPDATE
    description = VALUES(description),
    introduction_expertise = VALUES(introduction_expertise),
    introduction_proficiency = VALUES(introduction_proficiency),
    introduction_articulation = VALUES(introduction_articulation),
    introduction_reasoning = VALUES(introduction_reasoning),
    introduction_innovation = VALUES(introduction_innovation),
    introduction_resilience = VALUES(introduction_resilience),
    introduction_total = VALUES(introduction_total),
    technology_expertise = VALUES(technology_expertise),
    technology_proficiency = VALUES(technology_proficiency),
    technology_articulation = VALUES(technology_articulation),
    technology_reasoning = VALUES(technology_reasoning),
    technology_innovation = VALUES(technology_innovation),
    technology_resilience = VALUES(technology_resilience),
    technology_total = VALUES(technology_total),
    analysis_expertise = VALUES(analysis_expertise),
    analysis_proficiency = VALUES(analysis_proficiency),
    analysis_articulation = VALUES(analysis_articulation),
    analysis_reasoning = VALUES(analysis_reasoning),
    analysis_innovation = VALUES(analysis_innovation),
    analysis_resilience = VALUES(analysis_resilience),
    analysis_total = VALUES(analysis_total),
    final_expertise = VALUES(final_expertise),
    final_proficiency = VALUES(final_proficiency),
    final_articulation = VALUES(final_articulation),
    final_reasoning = VALUES(final_reasoning),
    final_innovation = VALUES(final_innovation),
    final_resilience = VALUES(final_resilience),
    final_total = VALUES(final_total)
`;
    // All scores initialize to -1 and description to '未测试'
    const initializationValues = [
      userId,
      '未测试',
      // introduction metrics
      -1, -1, -1, -1, -1, -1, -1,
      // technology metrics
      -1, -1, -1, -1, -1, -1, -1,
      // analysis metrics
      -1, -1, -1, -1, -1, -1, -1,
      // final metrics
      -1, -1, -1, -1, -1, -1, -1
    ];

    const [insertEvalResult]: [ResultSetHeader, any] = await pool.execute(
      initializeEvaluationQuery,
      initializationValues
    );

    if (insertEvalResult.affectedRows === 0 && !isNewUser) {
      throw new Error('Failed to initialize evaluation records.');
    }

    return res.status(200).json({
      success: true,
      message: isNewUser
        ? `User ${userId} initialized and evaluation records created successfully.`
        : `User ${userId} already exists. Evaluation records initialized/re-initialized successfully.`,
      data: null
    });

  } catch (error) {
    console.error('Error during user/evaluation initialization:', error);
    let errorMessage = 'Failed to initialize user and evaluation data.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return res.status(500).json({
      success: false,
      message: errorMessage,
      data: null
    });
  }
}