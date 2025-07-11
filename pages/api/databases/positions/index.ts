// pages/api/databases/positions/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import pool from '../db_init'; // Adjust path as needed
import { PositionRequest, ApiResponse } from '../types';
// Import ResultSetHeader along with RowDataPacket from mysql2
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<{ id: number; } & PositionRequest>>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method Not Allowed. Only POST is allowed for creating positions.',
    });
  }

  try {
    const positionData: PositionRequest = req.body;

    // Validate required fields for creation
    if (!positionData.name || !positionData.difficulty) {
      return res.status(400).json({
        success: false,
        message: 'Name and difficulty are required to create a position.',
      });
    }

    // Ensure 'id' is NOT present for creation requests to avoid ambiguity
    if (positionData.id !== undefined && positionData.id !== null) {
        return res.status(400).json({
            success: false,
            message: 'Do not provide an ID when creating a new position. Use PUT for updates.',
        });
    }

    const query = `
      INSERT INTO positions
      (name, description, difficulty)
      VALUES (?, ?, ?)
    `;
    const params = [
      positionData.name,
      positionData.description,
      positionData.difficulty,
    ];

    // --- FIX START ---
    // Correctly type the result for an INSERT operation.
    // The first element is ResultSetHeader, not RowDataPacket[].
    const [result]: [ResultSetHeader, any] = await pool.execute(query, params);
    const insertedId = result.insertId; // Now 'insertId' is safely accessible
    // --- FIX END ---

    return res.status(201).json({ // 201 Created for successful resource creation
      success: true,
      message: 'Position created successfully.',
      data: { id: insertedId, ...positionData } as { id: number; } & PositionRequest,
    });
  } catch (error) {
    console.error('Error creating position:', error);

    let errorMessage = 'Failed to create position.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return res.status(500).json({
      success: false,
      message: errorMessage,
    });
  }
}