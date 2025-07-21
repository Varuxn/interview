import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '../../db_init';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'PUT':
        // 批量更新问题
        const { position_id, questions } = req.body;
        
        if (!position_id || !Array.isArray(questions)) {
          return res.status(400).json({
            success: false,
            message: '岗位ID和问题列表不能为空'
          });
        }

        // 验证岗位是否存在
        const [positionExists] = await pool.execute(
          'SELECT id FROM positions WHERE id = ?',
          [position_id]
        ) as any;

        if (positionExists.length === 0) {
          return res.status(404).json({
            success: false,
            message: '岗位不存在'
          });
        }

        // 开始事务
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
          // 批量更新现有问题
          for (const question of questions) {
            if (question.id) {
              // 更新现有问题
              await connection.execute(
                'UPDATE questions SET question = ?, answer = ?, difficulty = ?, tags = ? WHERE id = ? AND position_id = ?',
                [
                  question.question,
                  question.answer,
                  question.difficulty || 'medium',
                  JSON.stringify(question.tags && Array.isArray(question.tags) ? question.tags : []),
                  question.id,
                  position_id
                ]
              );
            }
          }

          await connection.commit();
          connection.release();

          return res.status(200).json({
            success: true,
            message: '问题批量更新成功'
          });

        } catch (error) {
          await connection.rollback();
          connection.release();
          throw error;
        }

      default:
        res.setHeader('Allow', ['PUT']);
        return res.status(405).json({
          success: false,
          message: `方法 ${req.method} 不被允许`
        });
    }
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
}