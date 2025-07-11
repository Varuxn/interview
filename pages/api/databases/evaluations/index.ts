// pages/api/databases/evaluations/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import pool from '../db_init'; // 确保路径正确

// 导入 RowDataPacket 应该直接从 'mysql2'
import { RowDataPacket } from 'mysql2'; 

// 从你的 types 文件导入 EvaluationRequest 和 ApiResponse
import { EvaluationRequest, ApiResponse } from '../types'; 

export default async function handler(
  req: NextApiRequest,
  // 保持 ApiResponse 的类型参数，因为它需要一个类型
  res: NextApiResponse<ApiResponse<{ id: number; } & EvaluationRequest>>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method Not Allowed. Only POST is allowed for creating evaluations.',
    });
  }

  try {
    const evalData: EvaluationRequest = req.body;

    // 验证必填字段
    if (!evalData.user_id || !evalData.eval_name) {
      return res.status(400).json({
        success: false,
        message: 'user_id and eval_name are required.',
      });
    }

    const query = `
      INSERT INTO evaluations
      (user_id, eval_name, score, description)
      VALUES (?, ?, ?, ?)
    `;
    const params = [
      evalData.user_id,
      evalData.eval_name,
      evalData.score,
      evalData.description,
    ];

    // 明确 result 的类型，特别是对于 insertId
    const [result]: [RowDataPacket[], any] = await pool.execute(query, params);

    // 确保 insertId 存在，通常在 INSERT 操作后会有
    const insertedId = (result as any).insertId; 

    return res.status(201).json({ // 201 Created for successful creation
      success: true,
      message: 'Evaluation created successfully.',
      // 返回新创建的ID和原始数据，并进行类型断言
      data: { id: insertedId, ...evalData } as { id: number; } & EvaluationRequest, 
    });
  } catch (error) {
    console.error('Error creating evaluation:', error);

    let errorMessage = 'Failed to create evaluation.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return res.status(500).json({
      success: false,
      message: errorMessage,
    });
  }
}