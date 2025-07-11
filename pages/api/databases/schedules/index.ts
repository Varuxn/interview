// pages/api/schedules/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';
import pool from '../db_init'; // 确保路径正确，根据您的项目结构调整
import { ScheduleRequest, ApiResponse } from '../types';
import { ResultSetHeader } from 'mysql2'; // 导入 ResultSetHeader for UPDATE operations

export default async function handler(
  req: NextApiRequest,
  // ApiResponse 将包含更新后的 ScheduleRequest 数据，包括其 ID
  res: NextApiResponse<ApiResponse<{ id: number; } & ScheduleRequest>>
) {
  if (req.method !== 'PUT') { // PUT 是更新资源的标准方法
    return res.status(405).json({
      success: false,
      message: 'Method Not Allowed. Only PUT is allowed for updating schedules.',
    });
  }

  try {
    const { id } = req.query; // 从 URL 路径中获取 ID

    // 验证 ID 是否存在且为有效类型
    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Schedule ID is required and must be a string for update.',
      });
    }

    const scheduleData: ScheduleRequest = req.body;

    // 检查请求体中是否有要更新的字段
    // Note: user_id is typically not updated for a schedule after creation
    if (Object.keys(scheduleData).length === 0) {
        return res.status(400).json({
            success: false,
            message: 'No fields provided for update. Please provide sche_name, score, or description.',
        });
    }

    // 构建动态更新的 SQL 查询
    const updateFields: string[] = [];
    const params: any[] = [];

    if (scheduleData.sche_name !== undefined) {
      updateFields.push('sche_name = ?');
      params.push(scheduleData.sche_name);
    }
    // Handle score update, including the -1 default logic if desired
    if (scheduleData.score !== undefined) {
      updateFields.push('score = ?');
      params.push(scheduleData.score ?? -1);
    }
    if (scheduleData.description !== undefined) {
      updateFields.push('description = ?');
      params.push(scheduleData.description);
    }

    // You might also want to prevent updating user_id after creation
    // if (scheduleData.user_id !== undefined) {
    //   // Consider returning an error or ignoring this field
    // }


    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields (sche_name, score, description) to update provided in the request body.',
      });
    }

    const query = `
      UPDATE schedules SET
      ${updateFields.join(', ')}
      WHERE id = ?
    `;
    params.push(id); // 将 ID 添加到参数列表的末尾

    // Correctly type the result for an UPDATE operation
    const [result]: [ResultSetHeader, any] = await pool.execute(query, params);

    // 检查是否有行受到影响
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found or no changes made.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Schedule updated successfully.',
      // 合并 URL 中的 ID 和请求体中的更新数据
      data: { id: parseInt(id as string), ...scheduleData } as { id: number; } & ScheduleRequest,
    });
  } catch (error) {
    console.error('Error updating schedule:', error);

    let errorMessage = 'Failed to update schedule.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return res.status(500).json({
      success: false,
      message: errorMessage,
    });
  }
}