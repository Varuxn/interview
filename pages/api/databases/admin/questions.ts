import { NextApiRequest, NextApiResponse } from 'next';
import pool from '../db_init';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { position_id } = req.query;
    
    if (!position_id) {
      return res.status(400).json({ message: '缺少岗位ID参数' });
    }
    
    try {
      const [rows] = await pool.query(
        'SELECT id, content, difficulty, tags FROM questions WHERE position_id = ?',
        [position_id]
      );
      res.status(200).json(rows);
    } catch (error) {
      res.status(500).json({ message: '获取问题失败' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}