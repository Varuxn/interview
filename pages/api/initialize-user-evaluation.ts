// pages/api/initialize-user-evaluation.ts
import { NextApiRequest, NextApiResponse } from 'next';
import pool from './databases/db_init'; // Adjust path as needed for your project structure

// --- FIX START ---
// Import RowDataPacket and ResultSetHeader directly from 'mysql2'
import { RowDataPacket, ResultSetHeader } from 'mysql2'; 
// Import your custom types from your types file
import { ApiResponse, UserRequest, EvaluationRequest } from './databases/types'; 
// --- FIX END ---

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<string | UserRequest | EvaluationRequest[] | null>>
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
        [userId, `User_${userId}`] // You might want a more sophisticated default name
      );

      if (insertUserResult.affectedRows === 0) {
        throw new Error('Failed to add user to the users table.');
      }
    }

    // 2. Initialize evaluation records in 'evaluations' table
    // Define the evaluation sections and metrics
    const sections = ['introduction', 'technology', 'analysis'];
    const metrics = ['language', 'profession', 'logic', 'expressiveness', 'total'];

    // Collect all evaluation records to insert
    const evaluationRecords: Omit<EvaluationRequest, 'user_id'>[] = []; // Omit user_id as it's added below

    sections.forEach(section => {
      metrics.forEach(metric => {
        // e.g., introduction_language, introduction_total
        evaluationRecords.push({
          eval_name: `${section}_${metric}`,
          score: -1,
          description: '未测试'
        });
      });
    });

    // Add final metrics
    metrics.forEach(metric => {
      // e.g., final_language, final_total
      evaluationRecords.push({
        eval_name: `final_${metric}`,
        score: -1,
        description: '未测试'
      });
    });

    // Prepare batch insert values
    const insertValues: any[] = [];
    let placeholders: string[] = [];

    evaluationRecords.forEach(record => {
      insertValues.push(userId, record.eval_name, record.score, record.description);
      placeholders.push('(?, ?, ?, ?)');
    });

    const insertEvaluationsQuery = `
      INSERT INTO evaluations (user_id, eval_name, score, description)
      VALUES ${placeholders.join(', ')}
    `;

    const [insertEvalResult]: [ResultSetHeader, any] = await pool.execute(
      insertEvaluationsQuery,
      insertValues
    );

    if (insertEvalResult.affectedRows === 0) {
      throw new Error('Failed to initialize evaluation records.');
    }

    return res.status(200).json({
      success: true,
      message: isNewUser
        ? `User ${userId} initialized and evaluation records created successfully.`
        : `User ${userId} already exists. Evaluation records initialized/re-initialized successfully.`,
      data: null // Or you could return the created evaluation records
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