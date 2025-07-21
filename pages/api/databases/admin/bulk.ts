import { NextApiRequest, NextApiResponse } from 'next';
import pool from '../db_init';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { positionId, questions } = req.body;
    
    if (!positionId || !questions || !Array.isArray(questions)) {
      return res.status(400).json({ message: '无效请求参数' });
    }
    
    try {
      // 删除该岗位所有现有问题
      await pool.query('DELETE FROM questions WHERE position_id = ?', [positionId]);
      
      // 插入新问题
      const values = questions.map(q => [
        positionId,
        q.content,
        q.difficulty,
        q.tags ? JSON.stringify(q.tags) : null
      ]);
      
      if (values.length > 0) {
        await pool.query(
          `INSERT INTO questions (position_id, content, difficulty, tags) 
           VALUES ?`,
          [values]
        );
      }
      
      res.status(200).json({ message: '问题保存成功' });
    } catch (error) {
      console.error('保存问题失败:', error);
      res.status(500).json({ message: '保存问题失败' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}