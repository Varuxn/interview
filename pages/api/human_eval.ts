import fs from 'fs';
import path from 'path';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const filePath = path.join(process.cwd(), 'data', 'human_eval.csv');
  
  if (!fs.existsSync(filePath)) {
    return res.status(200).json({ success: true, data: [] });
  }

  try {
    const results: any[] = [];
    
    // 使用csv-parser解析CSV文件
    const csv = require('csv-parser');
    const stream = fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data: any) => results.push(data))
      .on('end', () => {
        res.status(200).json({ success: true, data: results });
      });
  } catch (error) {
    console.error('读取人工评估文件失败:', error);
    res.status(500).json({ error: '读取人工评估文件失败' });
  }
}