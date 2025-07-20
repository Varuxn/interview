import fs from 'fs';
import path from 'path';
import { NextApiRequest, NextApiResponse } from 'next';
import csv from 'csv-parser';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const filePath = path.join(process.cwd(), 'data', 'ai_eval.csv');
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'AI评估文件不存在' });
  }

  try {
    const results: any[] = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        res.status(200).json({ success: true, data: results });
      });
  } catch (error) {
    console.error('读取AI评估文件失败:', error);
    res.status(500).json({ error: '读取AI评估文件失败' });
  }
}