import type { NextApiRequest, NextApiResponse } from 'next';
import formidable, { Fields, Files } from 'formidable';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';

const rename = promisify(fs.rename);
const exists = promisify(fs.exists);
const mkdir = promisify(fs.mkdir);
const unlink = promisify(fs.unlink);

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  // Create temp directory if it doesn't exist
  const tempDir = path.join(process.cwd(), 'data', 'temp');
  if (!await exists(tempDir)) {
    await mkdir(tempDir, { recursive: true });
  }

  const form = formidable({
    uploadDir: tempDir,
    keepExtensions: true,
    maxFileSize: 100 * 1024 * 1024,
  });

  let tempFilePath: string | undefined;

  try {
    const [fields, files] = await new Promise<[Fields, Files]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          return reject(err);
        }
        resolve([fields, files]);
      });
    });

    const uploadedFile = files.file ? (Array.isArray(files.file) ? files.file[0] : files.file) : undefined;
    const targetPath = fields.path ? (Array.isArray(fields.path) ? fields.path[0] : fields.path) : undefined;
    const fileType = fields.type ? (Array.isArray(fields.type) ? fields.type[0] : fields.type) : undefined;

    if (!uploadedFile || !targetPath || !fileType) {
      return res.status(400).json({ success: false, message: 'Missing file, path, or type in request.' });
    }

    tempFilePath = uploadedFile.filepath;

    // Validate and sanitize paths
    const baseSaveDir = path.join(process.cwd(), 'data');
    const finalSaveDirPath = path.join(baseSaveDir, targetPath.replace(/\.\./g, '')); // Prevent directory traversal
    const originalFilename = path.basename(uploadedFile.originalFilename || path.basename(uploadedFile.filepath));
    const finalSaveFilePath = path.join(finalSaveDirPath, originalFilename);

    // Create target directory if it doesn't exist
    if (!await exists(finalSaveDirPath)) {
      await mkdir(finalSaveDirPath, { recursive: true });
    }

    // Verify temp file exists before moving
    if (!await exists(tempFilePath)) {
      throw new Error(`Temporary file not found: ${tempFilePath}`);
    }

    // Move file using promise-based API
    await rename(tempFilePath, finalSaveFilePath);
    tempFilePath = undefined; // Mark as successfully moved

    return res.status(200).json({
      success: true,
      message: 'File saved successfully!',
      filename: originalFilename,
      filePath: finalSaveFilePath,
      type: fileType,
    });

  } catch (error: any) {
    console.error('Error saving file:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error saving file',
      error: error.message,
      tempFilePath // Include temp path in error for debugging
    });
  } finally {
    // Clean up temp file if it still exists
    if (tempFilePath && await exists(tempFilePath)) {
      try {
        await unlink(tempFilePath);
      } catch (cleanupError) {
        console.error('Error cleaning up temporary file:', cleanupError);
      }
    }
  }
}