import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '../db_init';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        // 获取所有岗位
        const [positions] = await pool.execute(
          'SELECT id, name, description, difficulty FROM positions ORDER BY id ASC'
        );
        
        return res.status(200).json({
          success: true,
          positions
        });

      case 'POST':
        // 添加新岗位
        const { name, description, difficulty } = req.body;
        
        if (!name) {
          return res.status(400).json({
            success: false,
            message: '岗位名称不能为空'
          });
        }

        await pool.execute(
          'INSERT INTO positions (name, description, difficulty) VALUES (?, ?, ?)',
          [name, description || '', difficulty || 'medium']
        );

        return res.status(201).json({
          success: true,
          message: '岗位添加成功'
        });

      case 'PUT':
        // 更新岗位信息
        const { id, name: updateName, description: updateDesc, difficulty: updateDiff } = req.body;
        
        if (!id) {
          return res.status(400).json({
            success: false,
            message: '岗位ID不能为空'
          });
        }

        await pool.execute(
          'UPDATE positions SET name = ?, description = ?, difficulty = ? WHERE id = ?',
          [updateName, updateDesc, updateDiff, id]
        );

        return res.status(200).json({
          success: true,
          message: '岗位更新成功'
        });

      case 'DELETE':
        // 删除岗位
        const { id: deleteId } = req.query;
        
        if (!deleteId) {
          return res.status(400).json({
            success: false,
            message: '岗位ID不能为空'
          });
        }

        await pool.execute('DELETE FROM positions WHERE id = ?', [deleteId]);

        return res.status(200).json({
          success: true,
          message: '岗位删除成功'
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