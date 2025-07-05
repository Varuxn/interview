import {
  createParser,
  ParsedEvent,
  ReconnectInterval,
} from "eventsource-parser";

// 保持原有类型和函数名不变
export type ChatGPTAgent = "user" | "system";
export interface ChatGPTMessage {
  role: ChatGPTAgent;
  content: string;
}
export interface OpenAIStreamPayload {
  model: string; // 允许动态传入 "gpt-3.5-turbo" 或 "qwen-omni-turbo"
  messages: ChatGPTMessage[];
  temperature?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  max_tokens?: number;
  stream: boolean;
  n?: number;
}

export async function OpenAIStream(payload: OpenAIStreamPayload) {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  // 根据模型选择 API 端点
  const isQwen = payload.model.toLowerCase().includes("qwen");
  // const apiUrl = isQwen
  //   ? "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions"
  //   : "https://api.openai.com/v1/chat/completions";
  const apiUrl = "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions";

  // 统一使用 OPENAI_API_KEY（实际调用 Qwen 时需确保此 Key 是阿里云的 DashScope Key）
  const res = await fetch(apiUrl, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY ?? ""}`,
    },
    method: "POST",
    body: JSON.stringify({
      ...payload,
      stream: true, // 强制开启 stream（Qwen 要求）
    }),
  });

  // 统一的流处理逻辑（兼容 OpenAI 和 Qwen 的响应结构）
  const stream = new ReadableStream({
    async start(controller) {
      function onParse(event: ParsedEvent | ReconnectInterval) {
        if (event.type === "event") {
          const data = event.data;
          if (data === "[DONE]") {
            controller.close();
            return;
          }
          try {
            const json = JSON.parse(data);
            // 兼容两种 API 的响应结构
            const text = json.choices?.[0]?.delta?.content || "";
            const queue = encoder.encode(text);
            controller.enqueue(queue);
          } catch (e) {
            controller.error(e);
          }
        }
      }

      const parser = createParser(onParse);
      for await (const chunk of res.body as any) {
        parser.feed(decoder.decode(chunk));
      }
    },
  });

  return stream;
}