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
        introduction_language, introduction_profession, introduction_logic, introduction_expressiveness, introduction_total,
        technology_language, technology_profession, technology_logic, technology_expressiveness, technology_total,
        analysis_language, analysis_profession, analysis_logic, analysis_expressiveness, analysis_total,
        final_language, final_profession, final_logic, final_expressiveness, final_total
      ) VALUES (
        ?, 
        ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?
      )
      ON DUPLICATE KEY UPDATE
        description = VALUES(description),
        introduction_language = VALUES(introduction_language),
        introduction_profession = VALUES(introduction_profession),
        introduction_logic = VALUES(introduction_logic),
        introduction_expressiveness = VALUES(introduction_expressiveness),
        introduction_total = VALUES(introduction_total),
        technology_language = VALUES(technology_language),
        technology_profession = VALUES(technology_profession),
        technology_logic = VALUES(technology_logic),
        technology_expressiveness = VALUES(technology_expressiveness),
        technology_total = VALUES(technology_total),
        analysis_language = VALUES(analysis_language),
        analysis_profession = VALUES(analysis_profession),
        analysis_logic = VALUES(analysis_logic),
        analysis_expressiveness = VALUES(analysis_expressiveness),
        analysis_total = VALUES(analysis_total),
        final_language = VALUES(final_language),
        final_profession = VALUES(final_profession),
        final_logic = VALUES(final_logic),
        final_expressiveness = VALUES(final_expressiveness),
        final_total = VALUES(final_total)
    `;

    // All scores initialize to -1 and description to '未测试'
    const initializationValues = [
      userId,
      '未测试',
      // introduction metrics
      -1, -1, -1, -1, -1,
      // technology metrics
      -1, -1, -1, -1, -1,
      // analysis metrics
      -1, -1, -1, -1, -1,
      // final metrics
      -1, -1, -1, -1, -1
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