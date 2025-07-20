import { promises as fs } from 'fs';
import path from 'path';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 直接从查询参数中获取值
  const { type, userId, sessionId, roundNum } = req.query;

  // 验证必需参数
  if (!type || !userId || !sessionId) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    // 安全验证 - 确保路径在data目录内
    const basePath = path.join(process.cwd(), 'data');
    const userPath = path.join(basePath, userId as string);
    
    // 防止路径遍历攻击
    const normalizedUserPath = path.normalize(userPath);
    if (!normalizedUserPath.startsWith(path.normalize(basePath))) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // 根据请求类型返回不同文件
    if (type === 'video') {
      if (!roundNum) {
        return res.status(400).json({ error: 'Missing roundNum for video' });
      }
      const filePath = path.join(userPath, sessionId as string, `${sessionId as string}_${roundNum}.webm`);
      const file = await fs.readFile(filePath);
      res.setHeader('Content-Type', 'video/webm');
      return res.send(file);
    }
    
    if (type === 'audio') {
      if (!roundNum) {
        return res.status(400).json({ error: 'Missing roundNum for audio' });
      }
      const filePath = path.join(userPath, sessionId as string, `${sessionId as string}_${roundNum}.mp3`);
      const file = await fs.readFile(filePath);
      res.setHeader('Content-Type', 'audio/mpeg');
      return res.send(file);
    }
    
    if (type === 'chat') {
      const filePath = path.join(userPath, sessionId as string, `${sessionId as string}_chatrecord.txt`);
      const content = await fs.readFile(filePath, 'utf-8');
      return res.json({ content });
    }
    
    return res.status(400).json({ error: 'Invalid file type' });
  } catch (error) {
    console.error('File access error:', error);
    return res.status(404).json({ error: 'File not found' });
  }
}