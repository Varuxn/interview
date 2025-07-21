import { NextApiRequest, NextApiResponse } from 'next';
import pool from '../db_init';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      // 获取所有用户及其角色（如果没有则默认为'candidate'）
      const [users] = await pool.query(`
        SELECT u.id, u.name, COALESCE(r.role, 'candidate') AS role 
        FROM users u
        LEFT JOIN roles r ON u.id = r.user_id
      `);
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ message: '获取用户角色失败' });
    }
  } else if (req.method === 'PUT') {
    const { userId, role } = req.body;
    
    if (!userId || !['interviewer', 'candidate'].includes(role)) {
      return res.status(400).json({ message: '无效请求参数' });
    }
    
    try {
      // 使用REPLACE INTO确保每个用户只有一个角色
      await pool.query(`
        REPLACE INTO roles (user_id, role) VALUES (?, ?)
      `, [userId, role]);
      
      res.status(200).json({ message: '用户角色更新成功' });
    } catch (error) {
      res.status(500).json({ message: '更新用户角色失败' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}