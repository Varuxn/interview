import os
import base64
from dashscope import MultiModalConversation

#  Base64 编码格式
def encode_audio(audio_file_path):
    with open(audio_file_path, "rb") as audio_file:
        return base64.b64encode(audio_file.read()).decode("utf-8")

# 请用您的本地音频的绝对路径替换 ABSOLUTE_PATH/welcome.mp3
audio_file_path = "/home/interview/es.mp3"
base64_audio = encode_audio(audio_file_path)


messages = [
    {
        "role": "system",
        "content": [{"text": "You are a helpful assistant."}]},
    {
        "role": "user",
        "content": [{"audio":f"data:audio/mp3;base64,{base64_audio}"},
                    {"text": "音频里在说什么? "}],
    }
]

response = MultiModalConversation.call(model="qwen-audio-turbo-latest",
                                       messages=messages,
                                       api_key="sk-e92e617afec8426490df8bc029a74ac2")
print(response.output.choices[0].message.content[0])