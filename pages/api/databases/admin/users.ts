import type { NextApiRequest, NextApiResponse } from 'next';
import pool from '../db_init';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        // 获取所有用户及其角色信息
        const [users] = await pool.execute(`
          SELECT 
            u.id,
            u.name,
            COALESCE(r.role, 'candidate') as role
          FROM users u
          LEFT JOIN roles r ON u.id = r.user_id
          ORDER BY u.name ASC
        `);
        
        return res.status(200).json({
          success: true,
          users
        });

      case 'POST':
        // 添加新用户
        const { id, name } = req.body;
        
        if (!id) {
          return res.status(400).json({
            success: false,
            message: '用户ID不能为空'
          });
        }

        // 检查用户是否已存在
        const [existingUser] = await pool.execute(
          'SELECT id FROM users WHERE id = ?',
          [id]
        ) as any;

        if (existingUser.length > 0) {
          return res.status(400).json({
            success: false,
            message: '用户已存在'
          });
        }

        // 插入用户
        await pool.execute(
          'INSERT INTO users (id, name) VALUES (?, ?)',
          [id, name || 'user']
        );

        // 自动设置为面试者角色
        await pool.execute(
          'INSERT INTO roles (user_id, role) VALUES (?, ?)',
          [id, 'candidate']
        );

        return res.status(201).json({
          success: true,
          message: '用户添加成功'
        });

      case 'PUT':
        // 更新用户角色
        const { user_id, role } = req.body;
        
        if (!user_id || !role) {
          return res.status(400).json({
            success: false,
            message: '用户ID和角色不能为空'
          });
        }

        if (!['interviewer', 'candidate'].includes(role)) {
          return res.status(400).json({
            success: false,
            message: '无效的角色类型'
          });
        }

        // 检查用户是否存在
        const [userExists] = await pool.execute(
          'SELECT id FROM users WHERE id = ?',
          [user_id]
        ) as any;

        if (userExists.length === 0) {
          return res.status(404).json({
            success: false,
            message: '用户不存在'
          });
        }

        // 更新或插入角色记录
        await pool.execute(`
          INSERT INTO roles (user_id, role) VALUES (?, ?)
          ON DUPLICATE KEY UPDATE role = VALUES(role)
        `, [user_id, role]);

        return res.status(200).json({
          success: true,
          message: '用户角色更新成功'
        });

      case 'DELETE':
        // 删除用户
        const { id: deleteId } = req.query;
        
        if (!deleteId) {
          return res.status(400).json({
            success: false,
            message: '用户ID不能为空'
          });
        }

        // 先删除角色记录
        await pool.execute('DELETE FROM roles WHERE user_id = ?', [deleteId]);
        
        // 再删除用户记录
        await pool.execute('DELETE FROM users WHERE id = ?', [deleteId]);

        return res.status(200).json({
          success: true,
          message: '用户删除成功'
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