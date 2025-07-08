import { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";
import path from "path";
import WebSocket from "ws";
import fs from "fs";
import util from "util";

// Promisify fs.writeFile and fs.unlink for async/await usage (not directly used in this TTS example, but good practice for file operations)
const writeFile = util.promisify(fs.writeFile);
const unlink = util.promisify(fs.unlink);

// --- iFlytek TTS Configuration ---
const xfyunConfigTTS = {
  APPID: process.env.XFYUN_APPID || "", // Your iFlytek App ID
  APIKey: process.env.XFYUN_API_KEY || "", // Your iFlytek TTS API Key
  APISecret: process.env.XFYUN_API_SECRET || "", // Your iFlytek TTS API Secret
  host: "cbm01.cn-huabei-1.xf-yun.com", // 修改为你的专用host
  path: "/v1/private/mcd9m97e6",        // 修改为你的专用path
};
async function xfyunTextToSpeech(
  text: string,
  voiceName: string = "x5_lingfeiyi_flow",
  speed: number = 50,
  volume: number = 50,
  pitch: number = 50
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    // 注意：date 需要单独变量，后续 encodeURIComponent
    const date = new Date().toUTCString();
    const signatureOrigin = `host: ${xfyunConfigTTS.host}\ndate: ${date}\nGET ${xfyunConfigTTS.path} HTTP/1.1`;
    const signatureSha = crypto
      .createHmac("sha256", xfyunConfigTTS.APISecret)
      .update(signatureOrigin)
      .digest("base64");
    const authorizationOrigin = `api_key="${xfyunConfigTTS.APIKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signatureSha}"`;
    const authorization = Buffer.from(authorizationOrigin).toString("base64");

    // 这里拼接的 url 也要用新的 host/path
    const url = `wss://${xfyunConfigTTS.host}${xfyunConfigTTS.path}?authorization=${encodeURIComponent(
      authorization
    )}&date=${encodeURIComponent(date)}&host=${xfyunConfigTTS.host}`;

    const ws = new WebSocket(url);
    const audioChunks: Buffer[] = [];

    ws.on("open", () => {
      console.log("WebSocket连接已建立 (TTS)");
    
      // Construct the request frame according to the provided example
      const frame = {
        header: {
          app_id: xfyunConfigTTS.APPID,
          status: 0, // <--- 修改这里：0 表示开始发送文本
        },
        parameter: {
          oral: {
            oral_level:"mid"
          },
          tts: {
            vcn: voiceName, // Voice role
            speed: speed, // Speech speed (0-100)
            volume: volume, // Volume (0-100)
            pitch: pitch, // Pitch (0-100)
            bgs: 0, // Background sound (0: off, 1: on)
            reg: 0,
            rdn: 0,
            rhy: 0,
            audio: {
              encoding: "lame", // Audio encoding: lame for MP3, pcm for raw
              sample_rate: 24000, // Sample rate, e.g., 16000, 24000
              channels: 1, // Number of channels
              bit_depth: 16, // Bit depth
              frame_size: 0, // Frame size, 0 for automatic
            },
          },
        },
        payload: {
          text: {
            encoding: "utf8",
            compress: "raw",
            format: "plain",
            status: 2, // <--- 保持这里：2 表示文本发送完毕 (对于单次发送)
            seq: 0, // Sequence number
            text: Buffer.from(text, "utf8").toString("base64"), // Base64 encoded text
          },
        },
      };
      console.log("发送消息：",frame)
      console.log("消息JSON格式:",JSON.stringify(frame))
      ws.send(JSON.stringify(frame));
    });

    ws.on("message", (data: WebSocket.Data) => {
      try {
        const jsonData = JSON.parse(data.toString());
    
        // 检查 jsonData.header 是否存在，避免 TypeError
        if (jsonData.header) {
          if (jsonData.header.code !== 0) {
            console.error("TTS错误:", jsonData);
            ws.close();
            return reject(
              new Error(`TTS错误: ${jsonData.header.message}, code: ${jsonData.header.code}`)
            );
          }
    
          if (jsonData.header.status === 2) {
            console.log("TTS完成");
            ws.close();
            resolve(Buffer.concat(audioChunks));
          }
        } else {
          // 如果没有 header，可以根据实际情况进行错误处理或日志记录
          console.warn("收到的消息缺少 header 字段:", jsonData);
          // 或者可以选择直接关闭连接并拒绝，取决于业务逻辑
          // ws.close();
          // return reject(new Error("收到的消息缺少 header 字段"));
        }
    
    
        if (jsonData.payload && jsonData.payload.audio && jsonData.payload.audio.audio) {
          audioChunks.push(Buffer.from(jsonData.payload.audio.audio, "base64"));
        }
    
      } catch (err) {
        console.error("消息解析错误 (TTS):", err);
        ws.close();
        reject(err);
      }
    });

    ws.on("error", (err: Error) => {
      console.error("WebSocket错误 (TTS):", err);
      reject(err);
    });

    ws.on("close", () => {
      console.log("WebSocket连接已关闭 (TTS)");
    });
  });
}

// --- Next.js API Route Handler for TTS ---
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { text, voice, speed, volume, pitch, debug } = req.body;

  if (!text&& !debug) {
    return res.status(400).json({ error: "Text is required" });
  }
  if (debug) {
    try {
      // 这里假设 es.mp3 位于项目根目录的上一级
      const filePath = path.resolve(process.cwd(), "es.mp3");
      const audioBuffer = await fs.promises.readFile(filePath);
      res.setHeader("Content-Type", "audio/mpeg");
      res.setHeader("Content-Length", audioBuffer.length);
      return res.status(200).send(audioBuffer);
    } catch (err) {
      console.error("调试模式读取音频文件失败:", err);
      return res.status(500).json({ error: "调试模式读取音频文件失败" });
    }
  }
  // Optional: You can define a default voice or validate supported voices
  const selectedVoice = voice || "xiaoyan"; // Default voice if not provided
  const selectedSpeed = typeof speed === 'number' ? speed : 50;
  const selectedVolume = typeof volume === 'number' ? volume : 50;
  const selectedPitch = typeof pitch === 'number' ? pitch : 50;

  let audioBuffer: Buffer | undefined;

  try {
    console.log(`开始调用科大讯飞语音合成服务，文本: "${text}", 角色: "${selectedVoice}"`);
    console.log("XFYUN_APPID:", xfyunConfigTTS.APPID);
    console.log("XFYUN_API_KEY:", xfyunConfigTTS.APIKey);
    console.log("XFYUN_API_SECRET:", xfyunConfigTTS.APISecret);
    audioBuffer = await xfyunTextToSpeech(
      text,
      selectedVoice,
      selectedSpeed,
      selectedVolume,
      selectedPitch
    );
    console.log("科大讯飞语音合成完成");

    // Set appropriate headers for audio response
    res.setHeader("Content-Type", "audio/mpeg"); // iFlytek TTS with "lame" encoding returns MP3
    res.setHeader("Content-Length", audioBuffer.length);
    res.status(200).send(audioBuffer);
  } catch (error) {
    console.error("服务器错误 (TTS):", error);
    res.status(500).json({
      error: "处理请求时发生错误",
      details: error instanceof Error ? error.message : String(error),
    });
  }
}