import { IncomingForm } from "formidable";
import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import crypto from "crypto";
import WebSocket from "ws";

const ffmpeg = require("fluent-ffmpeg");

export const config = {
  api: {
    bodyParser: false,
  },
};

const xfyunConfig = {
  APPID: process.env.XFYUN_APPID || "",
  APIKey: process.env.XFYUN_API_KEY || "",
  APISecret: process.env.XFYUN_API_SECRET || "",
  host: "iat-api.xfyun.cn",
  path: "/v2/iat",
};

async function xfyunSpeechToText(audioPath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const date = new Date().toUTCString();
    const signatureOrigin = `host: ${xfyunConfig.host}\ndate: ${date}\nGET ${xfyunConfig.path} HTTP/1.1`;
    const signatureSha = crypto
      .createHmac("sha256", xfyunConfig.APISecret)
      .update(signatureOrigin)
      .digest("base64");
    const authorizationOrigin = `api_key="${xfyunConfig.APIKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signatureSha}"`;
    const authorization = Buffer.from(authorizationOrigin).toString("base64");

    const url = `wss://${xfyunConfig.host}${
      xfyunConfig.path
    }?authorization=${authorization}&date=${encodeURIComponent(
      date
    )}&host=${xfyunConfig.host}`;

    const ws = new WebSocket(url);
    let resultText = "";

    ws.on("open", () => {
      console.log("WebSocket连接已建立");

      // 这里修改了 chunk 的类型注解
      const fileStream = fs.createReadStream(audioPath, { highWaterMark: 1280 });
      let frameIndex = 0;

      fileStream.on("data", (chunk: string | Buffer) => { // <-- 修改这里
        // 确保 chunk 是 Buffer 类型，因为我们要用 toString('base64')
        const bufferChunk = typeof chunk === 'string' ? Buffer.from(chunk) : chunk;

        if (ws.readyState === WebSocket.OPEN) {
          const status = frameIndex === 0 ? 0 : 1;

          const frame: any = {
            data: {
              status: status,
              format: "audio/L16;rate=16000",
              encoding: "raw",
              audio: bufferChunk.toString("base64"), // 使用 bufferChunk
            },
          };

          if (frameIndex === 0) {
            frame.common = {
              app_id: xfyunConfig.APPID,
            };
            frame.business = {
              language: "zh_cn",
              domain: "iat",
              accent: "mandarin",
            };
          }

          ws.send(JSON.stringify(frame));
          frameIndex++;
        } else {
          fileStream.destroy();
        }
      });

      fileStream.on("end", () => {
        console.log("音频文件读取完毕，发送结束帧");
        if (ws.readyState === WebSocket.OPEN) {
          const endFrame = { data: { status: 2 } };
          ws.send(JSON.stringify(endFrame));
        }
      });

      fileStream.on("error", (err) => {
        console.error("文件读取流错误:", err);
        ws.close();
        reject(err);
      });
    });

    ws.on("message", (data: WebSocket.Data) => {
      try {
        const jsonData = JSON.parse(data.toString());
        
        if (jsonData.data && jsonData.data.result) {
          const text = jsonData.data.result.ws
            .map((item: any) => item.cw[0].w)
            .join("");
          resultText += text;
        }

        if (jsonData.code === 0 && jsonData.data.status === 2) {
          console.log("识别完成:", resultText);
          ws.close();
          resolve(resultText);
        } else if (jsonData.code !== 0) {
          console.error("识别错误:", jsonData);
          ws.close();
          reject(new Error(`识别错误: ${jsonData.message}`));
        }
      } catch (err) {
        console.error("消息解析错误:", err);
        ws.close();
        reject(err);
      }
    });

    ws.on("error", (err: Error) => {
      console.error("WebSocket错误:", err);
      reject(err);
    });

    ws.on("close", () => {
      console.log("WebSocket连接已关闭");
    });
  });
}

async function convertAudio(inputPath: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .inputFormat('mp3')
      .audioFrequency(16000)
      .audioChannels(1)
      .format('s16le')
      .audioCodec('pcm_s16le')
      .on("error", (err: Error) => {
        console.error("音频转换错误:", err);
        reject(err);
      })
      .on("end", () => {
        console.log("音频转换完成");
        resolve();
      })
      .save(outputPath);
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  let audioFilePath: string | undefined; // 声明在 try 块外部，以便 finally 块访问
  let convertedPath: string | undefined;

  try {
    const fData = await new Promise<{ fields: any; files: any }>(
      (resolve, reject) => {
        const form = new IncomingForm({
          multiples: false,
          uploadDir: "/tmp",
          keepExtensions: true,
        });
        form.parse(req, (err, fields, files) => {
          if (err) return reject(err);
          resolve({ fields, files });
        });
      }
    );

    audioFilePath = fData.files.file?.filepath;
    console.log("接收到音频文件，临时路径:", audioFilePath);

    if (!audioFilePath) {
      throw new Error("未接收到音频文件");
    }
    console.log("准备转换音频：", audioFilePath);

    convertedPath = "/tmp/converted.pcm";
    console.log("开始音频格式转换...");
    await convertAudio(audioFilePath, convertedPath);
    console.log("音频格式转换完成.");

    console.log("开始调用科大讯飞语音转文字服务...");
    const transcript = await xfyunSpeechToText(convertedPath);
    console.log("科大讯飞识别结果:", transcript);

    res.status(200).json({ transcript });
  } catch (error) {
    console.error("服务器错误:", error);
    res.status(500).json({
      error: "处理请求时发生错误",
      details: error instanceof Error ? error.message : String(error),
    });
  } finally {
    // 清理临时文件
    if (audioFilePath && fs.existsSync(audioFilePath)) {
        fs.unlink(audioFilePath, (err) => {
            if (err) console.error("删除原始临时文件失败:", err);
            else console.log("原始临时文件已删除:", audioFilePath);
        });
    }
    if (convertedPath && fs.existsSync(convertedPath)) {
        fs.unlink(convertedPath, (err) => {
            if (err) console.error("删除转换后临时文件失败:", err);
            else console.log("转换后临时文件已删除:", convertedPath);
        });
    }
  }
}