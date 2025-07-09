// pages/api/parse-pdf.ts
import { NextApiRequest, NextApiResponse } from "next";
import { pdf } from "@/utils/pdf-parser";
import formidable, { File, Files } from "formidable";
import fs from "fs/promises";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "仅支持POST请求" });
  }

  try {
    // 1. 解析表单数据
    const form = formidable();
    const parsed = await new Promise<{ files: Files }>((resolve, reject) => {
      form.parse(req, (err, _, files) => {
        if (err) reject(err);
        else resolve({ files });
      });
    });

    // 2. 安全地获取上传的文件
    const uploadedFile = parsed.files.file;
    let file: File | null = null;

    if (Array.isArray(uploadedFile)) {
      file = uploadedFile[0]; // 如果是数组，取第一个文件
    } else if (uploadedFile) {
      file = uploadedFile; // 如果是单个文件对象
    }

    if (!file) {
      return res.status(400).json({ error: "未上传文件" });
    }

    // 3. 验证文件类型
    if (file.mimetype !== "application/pdf") {
      return res.status(400).json({ error: "仅支持PDF文件" });
    }

    // 4. 读取文件并解析
    const fileBuffer = await fs.readFile(file.filepath);
    const text = await pdf.parse(fileBuffer);

    // 5. 删除临时文件
    await fs.unlink(file.filepath);

    return res.status(200).json({ 
      success: true, 
      text: text.slice(0, 10000)
    });

} catch (error) {
    console.error("PDF解析错误:", error);
    
    // 安全地获取错误信息
    let errorMessage = "服务器内部错误";
    
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    }
  
    return res.status(500).json({ 
      success: false, 
      error: errorMessage
    });
  }
}