import { NextApiRequest, NextApiResponse } from 'next';
import pool from '../db_init';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const [rows] = await pool.query('SELECT * FROM positions');
      res.status(200).json(rows);
    } catch (error) {
      res.status(500).json({ message: '获取岗位失败' });
    }
  } else if (req.method === 'POST') {
    const { name, difficulty } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: '岗位名称不能为空' });
    }
    
    try {
      const [result] = await pool.query(
        'INSERT INTO positions (name, difficulty) VALUES (?, ?)',
        [name, difficulty]
      );
      
      res.status(201).json({ 
        id: (result as any).insertId, 
        name, 
        difficulty 
      });
    } catch (error) {
      res.status(500).json({ message: '创建岗位失败' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}