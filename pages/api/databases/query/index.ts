// pages/api/databases/query.ts
import { NextApiRequest, NextApiResponse } from 'next';
import pool from '../db_init'; // 确保路径正确，根据您的项目结构调整
import { QueryRequest, QueryResponse, RowData } from '../types'; // 确保路径正确
import { RowDataPacket } from 'mysql2'; // 导入 RowDataPacket 直接从 mysql2

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<QueryResponse<RowData | RowData[] | null>>
) {
  try {
    if (req.method === 'GET') {
      await handleGetRequest(req, res);
    } else if (req.method === 'POST') {
      await handlePostRequest(req, res);
    } else {
      return res.status(405).json({
        success: false,
        message: 'Method Not Allowed. Only GET and POST are allowed.',
        data: null
      });
    }
  } catch (error) {
    console.error('API handler error:', error);
    let errorMessage = 'An unexpected error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return res.status(500).json({
      success: false,
      message: errorMessage,
      data: null
    });
  }
}

async function handleGetRequest(
  req: NextApiRequest,
  res: NextApiResponse<QueryResponse<RowData | RowData[] | null>>
) {
  // 从 req.query 中解析参数
  const queryParams: QueryRequest = {
    table: req.query.table as string,
    id: req.query.id
      ? isNaN(Number(req.query.id))
        ? req.query.id.toString()
        : Number(req.query.id)
      : undefined
  };
  console.log('Query 参数为:', queryParams);

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

  const [rows]: [RowDataPacket[], any] = await pool.query(query, params);
  const typedRows = rows as RowData[];

  const responseData = queryParams.id !== undefined
    ? typedRows.length > 0
      ? typedRows[0]
      : null
    : typedRows;

  const response: QueryResponse<RowData | RowData[] | null> = {
    success: true,
    message: queryParams.id !== undefined
      ? (responseData ? 'Record fetched successfully' : 'Record not found')
      : 'All records fetched successfully',
    data: responseData
  };

  console.log('Query 响应为:', response);
  return res.status(200).json(response);
}

async function handlePostRequest(
  req: NextApiRequest,
  res: NextApiResponse<QueryResponse<null>>
) {
  const { table, action, criteria, values } = req.body;

  if (!table || !action) {
    return res.status(400).json({
      success: false,
      message: 'Missing table or action in request body',
      data: null
    });
  }

  const validTables = ['users', 'settings', 'schedules', 'evaluations', 'positions', 'interviewers'];
  if (!validTables.includes(table)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid table name',
      data: null
    });
  }

  try {
    if (action === 'update') {
      if (!criteria || !values) {
        return res.status(400).json({
          success: false,
          message: 'Missing criteria or values for update action',
          data: null
        });
      }

      // Construct SET clause
      const setClauses: string[] = [];
      const setValues: (string | number)[] = [];
      for (const key in values) {
        if (Object.prototype.hasOwnProperty.call(values, key)) {
          setClauses.push(`${key} = ?`);
          setValues.push(values[key]);
        }
      }

      // Construct WHERE clause
      const whereClauses: string[] = [];
      const whereValues: (string | number)[] = [];
      for (const key in criteria) {
        if (Object.prototype.hasOwnProperty.call(criteria, key)) {
          whereClauses.push(`${key} = ?`);
          whereValues.push(criteria[key]);
        }
      }

      if (setClauses.length === 0 || whereClauses.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No valid fields to update or criteria provided',
          data: null
        });
      }

      const query = `UPDATE ${table} SET ${setClauses.join(', ')} WHERE ${whereClauses.join(' AND ')}`;
      const params = [...setValues, ...whereValues];

      console.log('UPDATE query:', query, 'with params:', params);
      const [result]: [any, any] = await pool.query(query, params);

      if (result.affectedRows > 0) {
        return res.status(200).json({
          success: true,
          message: 'Record updated successfully',
          data: null
        });
      } else {
        return res.status(404).json({
          success: false,
          message: 'Record not found or no changes made',
          data: null
        });
      }
    } else if (action === 'insert') {
        if (!values) {
            return res.status(400).json({
                success: false,
                message: 'Missing values for insert action',
                data: null
            });
        }

        const columns = Object.keys(values).join(', ');
        const placeholders = Object.values(values).map(() => '?').join(', ');
        const insertValues = Object.values(values);

        const query = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;
        const [result]: [any, any] = await pool.query(query, insertValues);

        if (result.affectedRows > 0) {
            return res.status(201).json({
                success: true,
                message: 'Record inserted successfully',
                data: null
            });
        } else {
            return res.status(500).json({
                success: false,
                message: 'Failed to insert record',
                data: null
            });
        }
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid action specified. Supported actions: update, insert.',
        data: null
      });
    }
  } catch (error) {
    console.error('POST request error:', error);
    let errorMessage = 'Database operation failed';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return res.status(500).json({
      success: false,
      message: errorMessage,
      data: null
    });
  }
}