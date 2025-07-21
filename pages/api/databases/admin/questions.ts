import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '../db_init';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        // 根据岗位ID获取问题
        const { position_id } = req.query;
        
        if (!position_id) {
          return res.status(400).json({
            success: false,
            message: '岗位ID不能为空'
          });
        }

        const [questions] = await pool.execute(
          'SELECT id, position_id, question, answer, difficulty, tags FROM questions WHERE position_id = ? ORDER BY id ASC',
          [position_id]
        ) as any;

        // 解析tags JSON字段，处理可能的解析错误
        const parsedQuestions = questions.map((q: any) => {
          let tags = [];
          try {
            if (q.tags && q.tags.trim() !== '') {
              tags = JSON.parse(q.tags);
              // 确保tags是数组
              if (!Array.isArray(tags)) {
                tags = [];
              }
            }
          } catch (error) {
            console.warn('Failed to parse tags for question', q.id, ':', error);
            tags = [];
          }
          return {
            ...q,
            tags
          };
        });
        
        return res.status(200).json({
          success: true,
          questions: parsedQuestions
        });

      case 'POST':
        // 添加新问题
        const { position_id: posId, question, answer, difficulty, tags } = req.body;
        
        if (!posId || !question || !answer) {
          return res.status(400).json({
            success: false,
            message: '岗位ID、问题和答案不能为空'
          });
        }

        // 验证岗位是否存在
        const [positionExists] = await pool.execute(
          'SELECT id FROM positions WHERE id = ?',
          [posId]
        ) as any;

        if (positionExists.length === 0) {
          return res.status(404).json({
            success: false,
            message: '岗位不存在'
          });
        }

        await pool.execute(
          'INSERT INTO questions (position_id, question, answer, difficulty, tags) VALUES (?, ?, ?, ?, ?)',
          [posId, question, answer, difficulty || 'medium', JSON.stringify(tags && Array.isArray(tags) ? tags : [])]
        );

        return res.status(201).json({
          success: true,
          message: '问题添加成功'
        });

      case 'PUT':
        // 更新问题
        const { id, question: updateQuestion, answer: updateAnswer, difficulty: updateDiff, tags: updateTags } = req.body;
        
        if (!id) {
          return res.status(400).json({
            success: false,
            message: '问题ID不能为空'
          });
        }

        await pool.execute(
          'UPDATE questions SET question = ?, answer = ?, difficulty = ?, tags = ? WHERE id = ?',
          [updateQuestion, updateAnswer, updateDiff, JSON.stringify(updateTags && Array.isArray(updateTags) ? updateTags : []), id]
        );

        return res.status(200).json({
          success: true,
          message: '问题更新成功'
        });

      case 'DELETE':
        // 删除问题
        const { id: deleteId } = req.query;
        
        if (!deleteId) {
          return res.status(400).json({
            success: false,
            message: '问题ID不能为空'
          });
        }

        await pool.execute('DELETE FROM questions WHERE id = ?', [deleteId]);

        return res.status(200).json({
          success: true,
          message: '问题删除成功'
        });

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
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