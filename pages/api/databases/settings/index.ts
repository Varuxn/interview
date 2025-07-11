// pages/api/databases/settings/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import pool from '../db_init';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    const settingData = req.body;

    if (!settingData.id) {
      return res.status(400).json({
        success: false,
        message: 'ID is required'
      });
    }

    const [result] = await pool.execute(
      `INSERT INTO settings (id, interviewer, position) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE 
         interviewer = COALESCE(?, interviewer),
         position = COALESCE(?, position)`,
      [
        settingData.id, 
        settingData.interviewer, 
        settingData.position,
        settingData.interviewer,
        settingData.position
      ]
    );

    return res.status(200).json({
      success: true,
      message: 'Setting processed successfully',
      data: settingData
    });
  } catch (error) {
    console.error('Error processing setting:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process setting'
    });
  }
}