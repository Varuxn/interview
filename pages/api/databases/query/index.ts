// pages/api/query.ts
import { NextApiRequest, NextApiResponse } from 'next';
import pool from '../db_init'; // 确保路径正确，根据您的项目结构调整
import { QueryRequest, QueryResponse, RowData } from '../types'; // 确保路径正确
import { RowDataPacket } from 'mysql2'; // 导入 RowDataPacket 直接从 mysql2

export default async function handler(
  req: NextApiRequest,
  // NextApiResponse 的泛型参数直接使用 QueryResponse，
  // 因为 QueryResponse 本身已经有默认的泛型类型处理了 data 字段
  res: NextApiResponse<QueryResponse<RowData | RowData[] | null>>
) {
  // query 路由通常使用 GET 方法来获取数据
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method Not Allowed. Only GET is allowed for queries.',
      data: null // 根据 QueryResponse 类型，data 可以是 null
    });
  }

  try {
    // 从 req.query 中解析参数
    const queryParams: QueryRequest = {
      table: req.query.table as string, // req.query.table 可能是 string | string[] | undefined
      id: req.query.id
        ? isNaN(Number(req.query.id)) // 检查是否是数字，因为 id 可以是 string 或 number
          ? req.query.id.toString()
          : Number(req.query.id)
        : undefined
    };

    const validTables = ['users', 'settings', 'schedules', 'evaluations', 'positions', 'interviewers'];
    if (!queryParams.table || !validTables.includes(queryParams.table)) {
      const response: QueryResponse = {
        success: false,
        message: 'Invalid or missing table name',
        data: null
      };
      return res.status(400).json(response);
    }

    let query: string;
    let params: (string | number)[] = [];

    if (queryParams.id !== undefined) {
      query = `SELECT * FROM ${queryParams.table} WHERE id = ?`;
      params = [queryParams.id];
    } else {
      query = `SELECT * FROM ${queryParams.table}`;
    }

    // 执行查询，并明确指定结果的类型为 RowDataPacket[]
    const [rows]: [RowDataPacket[], any] = await pool.query(query, params);

    // 将 RowDataPacket[] 转换为 RowData[]。
    // 由于 RowData 扩展了 RowDataPacket，直接断言通常是安全的。
    const typedRows = rows as RowData[];

    // 根据是否存在 ID 参数，返回单个记录或记录数组
    const responseData = queryParams.id !== undefined
      ? typedRows.length > 0
        ? typedRows[0] // 如果有 ID，返回第一条记录
        : null         // 如果有 ID 但未找到记录，返回 null
      : typedRows;     // 如果没有 ID，返回所有记录数组

    const response: QueryResponse<RowData | RowData[] | null> = { // 明确泛型类型
      success: true,
      message: queryParams.id !== undefined
        ? (responseData ? 'Record fetched successfully' : 'Record not found')
        : 'All records fetched successfully',
      data: responseData
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Query error:', error);
    let errorMessage = 'Database query failed';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    const response: QueryResponse<null> = { // 错误时 data 为 null
      success: false,
      message: errorMessage,
      data: null
    };
    return res.status(500).json(response);
  }
}