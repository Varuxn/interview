import fs from 'fs';
import path from 'path';
import { NextApiRequest, NextApiResponse } from 'next';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '仅支持POST请求' });
  }

  const filePath = path.join(process.cwd(), 'data', 'human_eval.csv');
  const newData = req.body;

  if (!Array.isArray(newData)) {
    return res.status(400).json({ error: '无效的数据格式' });
  }

  try {
    // 读取现有数据
    let existingData: any[] = [];
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      existingData = parse(fileContent, {
        columns: true,
        skip_empty_lines: true
      });
    }

    // 合并数据
    const mergedData = [...existingData, ...newData];
    
    // 转换为CSV
    const csvData = stringify(mergedData, {
      header: true,
      columns: ['user_id', 'session', 'metric', 'score']
    });

    // 保存文件
    fs.writeFileSync(filePath, csvData);

    res.status(200).json({ success: true, message: '评分保存成功' });
  } catch (error) {
    console.error('保存评分失败:', error);
    res.status(500).json({ error: '保存评分失败' });
  }
}