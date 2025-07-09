// utils/pdf-parser.ts
import { PDFDocument } from 'pdf-lib';
import pdfParse from 'pdf-parse';

export const pdf = {
  /**
   * 解析PDF文件内容
   * @param fileBuffer - PDF文件的ArrayBuffer或Buffer
   * @returns 提取的文本内容
   */
  parse: async (fileBuffer: ArrayBuffer | Buffer): Promise<string> => {
    try {
      // 将ArrayBuffer转换为Buffer（如果需要）
      const buffer = fileBuffer instanceof Buffer 
        ? fileBuffer 
        : Buffer.from(fileBuffer);

      // 使用pdf-parse解析
      const data = await pdfParse(buffer);
      return data.text;

    } catch (error) {
      throw new Error(`PDF解析失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
};