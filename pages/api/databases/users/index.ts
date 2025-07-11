// pages/api/users/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import pool from '../db_init'; // 确保路径正确，根据您的项目结构调整
import { UserRequest, ApiResponse } from '../types';
import { ResultSetHeader } from 'mysql2'; // 导入 ResultSetHeader for DML operations

export default async function handler(
  req: NextApiRequest,
  // ApiResponse 将包含处理后的 UserRequest 数据
  res: NextApiResponse<ApiResponse<UserRequest>> // UserRequest 已经包含 id
) {
  if (req.method !== 'POST') {
    // 尽管是 ON DUPLICATE KEY UPDATE，但原始代码使用 POST，我们继续沿用
    // 如果您希望严格分离创建和更新，可以引入 PUT 方法和 /users/[id].ts
    return res.status(405).json({
      success: false,
      message: 'Method Not Allowed. Only POST is allowed for user processing.',
    });
  }

  try {
    const userData: UserRequest = req.body;

    // 验证必填字段：id
    if (!userData.id) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required.',
      });
    }

    // ON DUPLICATE KEY UPDATE 语句
    // 如果 id 存在，则更新 name；如果不存在，则插入新用户
    const query = `
      INSERT INTO users (id, name) VALUES (?, ?)
      ON DUPLICATE KEY UPDATE name = COALESCE(?, name)
    `;
    const params = [
      userData.id,
      userData.name || 'user', // 如果 name 未提供，默认使用 'user'
      userData.name              // 用于 ON DUPLICATE KEY UPDATE 的 name
    ];

    // Correctly type the result for INSERT ... ON DUPLICATE KEY UPDATE operation
    // This will be ResultSetHeader for DML operations.
    const [result]: [ResultSetHeader, any] = await pool.execute(query, params);

    // ResultSetHeader.affectedRows will be 1 for an INSERT, or 2 for an UPDATE.
    // ResultSetHeader.insertId will be 0 for an UPDATE, or the ID for an INSERT.

    // 可以根据 affectedRows 或 insertId 判断是插入还是更新，并返回更精确的消息
    let message = 'User processed successfully';
    if (result.affectedRows === 1) {
        message = 'User created successfully';
    } else if (result.affectedRows === 2) {
        message = 'User updated successfully';
    }

    const response: ApiResponse<UserRequest> = {
      success: true,
      message: message,
      data: userData // 返回原始请求数据，因为它包含 id 和处理后的 name
    };
    return res.status(200).json(response); // 200 OK for processed successfully
  } catch (error) {
    console.error('Error processing user:', error);

    let errorMessage = 'Failed to process user.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return res.status(500).json({
      success: false,
      message: errorMessage,
    });
  }
}