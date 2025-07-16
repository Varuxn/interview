import { useState, useRef, useEffect, useCallback } from "react";
import Webcam from "react-webcam";
import { motion } from "framer-motion";
import { v4 as uuid } from "uuid";
import { fetchFile } from '@ffmpeg/ffmpeg';

import { useRouter } from 'next/router';
import { useAuth } from "@clerk/nextjs";
import { PositionRequest, InterviewerRequest } from './api/databases/types';
import { fetchUserSettingsAndDetails } from './api/databases/fetchUserSettings';

interface Device {
  deviceId: string;
  kind: string;
  label: string;
  groupId: string;
}

interface Message {
  id: string;
  text: string;
  sender: string;
}

interface LLMChatRequest {
  system_prompt: string;
  user_prompt: string;
  model?: string;
  temperature?: number;
}

interface LLMResponseMessage {
  role: string;
  content: string;
}

interface LLMResponseChoice {
  index: number;
  message: LLMResponseMessage;
  finish_reason: string;
}

interface LLMResponseUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

interface LLMChatResponse {
  success: boolean;
  llm_response: {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: LLMResponseChoice[];
    usage: LLMResponseUsage;
  };
}

const DualCameraRecorder = () => {
  // Refs
  const webcamRef1 = useRef<Webcam>(null);
  const webcamRef2 = useRef<Webcam>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  
  // State management
  const [recording, setRecording] = useState(false);
  const [countdown, setCountdown] = useState(150);
  const [messages, setMessages] = useState<Message[]>([
    // { id: uuid(), text: "你好，我是Alex！准备好开始面试了吗？", sender: "alex" },
    // { id: uuid(), text: "我已经准备好了，随时可以开始。", sender: "user" }
  ]);
  const [chatrecord, setChatRecord] = useState<string>("");
  const [chatinit, setChatInit] = useState<boolean>(false);
  const [systeminitprompt, setSystemInitPrompt] = useState<string>("你是一个面试官，负责对候选人进行技术面试。请根据候选人的回答给出反馈和建议。");

  // Device management
  const [videoDevices, setVideoDevices] = useState<Device[]>([]);
  const [audioDevices, setAudioDevices] = useState<Device[]>([]);
  const [selectedVideoDevice1, setSelectedVideoDevice1] = useState<string>("");
  const [selectedVideoDevice2, setSelectedVideoDevice2] = useState<string>("");
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<string>("");
  const [cameraLoaded, setCameraLoaded] = useState(false);
  const [recordingPermission, setRecordingPermission] = useState(false);
  const [deviceError, setDeviceError] = useState<string | null>(null);
  const [camera2Error, setCamera2Error] = useState(false);
  const [camera2Ready, setCamera2Ready] = useState(false);
  const [camera1Ready, setCamera1Ready] = useState(false);
  const { userId, isLoaded } = useAuth();
  const router = useRouter();
  const { stage } = router.query;
  const currentStage = typeof stage === 'string' ? stage : 'final';
  const stagename= currentStage === 'introduction' ? '自我介绍环节' : currentStage === 'technology' ? '技术问答环节' : currentStage === 'analysis' ? '情景分析环节' :'最终环节';

  const [questionIndex, setQuestionIndex] = useState(0);
  const question_total = 3; // 每个环节的问题数目/对话轮数
  const [generatedQuestion, setGeneratedQuestion] = useState<string>();
  const [generatedAudio, setGeneratedAudio] = useState<string | undefined>(); // 存储生成的语音
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioStarted, setAudioStarted] = useState(false);
  const [audioData, setAudioData] = useState(new Array(20).fill(0));



  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<PositionRequest | null>({
    id: 1,
    name: "人工智能",
    description: "机器学习工程师、算法研究员、NLP工程师...",
    difficulty: "hard",
  });
  const [selectedInterviewer, setSelectedInterviewer] = useState<InterviewerRequest | null>(
    // {
    // id: "Alex",
    // name: "Alex",
    // description: "高级算法工程师 | 性格：理性冷静｜面试风格：深挖技术细节，重视代码严谨性",
    // country : "CN",
    // level: "L4",
    // }
);

  // 录制和保存状态
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [transcript, setTranscript] = useState("");
  // FFmpeg实例
  const ffmpegRef = useRef<any>(null);
  
  // 初始化FFmpeg
  useEffect(() => {
    const initFFmpeg = async () => {
      const { createFFmpeg } = await import('@ffmpeg/ffmpeg');
      const ffmpeg = createFFmpeg({
        corePath: "https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js",
        log: true,
      });
      ffmpegRef.current = ffmpeg;
    };
    
    initFFmpeg();
  }, []);

  // 用户设置和面试官信息
  useEffect(() => {
    if (!isLoaded || !userId) {
      return;
    }
    const loadUserSettings = async () => {
      setLoading(true);
      try {
        const data = await fetchUserSettingsAndDetails(userId);
        if (data) {
          setSelected(data.selected);
          setSelectedInterviewer(data.selectedInterviewer);
          console.log("User settings and details loaded successfully:", data);
        } else {
          console.warn(`User settings or details not found for ID: ${userId}. 
                       Defaulting to null or consider setting default values.`);
          setSelected(null);
          setSelectedInterviewer(null); 
        }
      } catch (error) {
        console.error("Failed to load user settings and details:", error);
        setSelected(null); 
        setSelectedInterviewer(null);
      } finally {
        setLoading(false); 
      }
    };

    loadUserSettings();
  }, [userId, isLoaded]);

  useEffect(() => {
    if (selectedInterviewer && !chatinit) {
      addMessage(`面试官已切换为 ${selectedInterviewer.name}`, "system");
      addMessage("你好，我是Alex！准备好开始面试了吗？", selectedInterviewer.name);
      addMessage("我已经准备好了，随时可以开始。", "user");
      const system_prompt = `你是一名名为${selectedInterviewer.name}的面试官，负责对候选人进行${selected?.name}领域的面试。你的设定为${selectedInterviewer?.description}。请根据历史的聊天记录和候选人的回答给出上一步的衔接和下一步的询问。你只需要给出面试官说的话，不需要其他内容`;
      setSystemInitPrompt(system_prompt);
      setChatInit(true);
      getnextquestion();
    }
  }, [selectedInterviewer]); 

  // 初始化录制设置
  const initializeRecording = () => {
    setRecordedChunks([]);
    setRecording(false);
    setCountdown(150);
  };
  
  // 添加新消息到对话框
  const addMessage = (text: string, sender: string ) => {
    setMessages(prev => [...prev, { id: uuid(), text, sender }]);
    if(sender !== "system") {
      setChatRecord(prev => prev + `\n${sender}: ${text}`);
    }
  };
  
  // 获取设备列表
  const getDevices = useCallback(async () => {
    try {
      setDeviceError(null);
      setCamera2Error(false);
      
      // 首先请求摄像头和麦克风权限
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      // 关闭临时流
      stream.getTracks().forEach(track => track.stop());
      
      setRecordingPermission(true);
      
      // 然后枚举设备
      const devices = await navigator.mediaDevices.enumerateDevices();
      
      const videoDevices = devices.filter(device => device.kind === "videoinput");
      const audioDevices = devices.filter(device => device.kind === "audioinput");
      
      setVideoDevices(videoDevices);
      setAudioDevices(audioDevices);
      
      if (videoDevices.length > 0) {
        // 设置摄像头1 - 优先使用前置摄像头
        const frontCamera = videoDevices.find(d => 
          d.label.toLowerCase().includes("front") || 
          d.label.toLowerCase().includes("user") ||
          d.label.toLowerCase().includes("facetime")
        );
        
        if (frontCamera) {
          setSelectedVideoDevice1(frontCamera.deviceId);
        } else {
          setSelectedVideoDevice1(videoDevices[0].deviceId);
        }

        // 设置摄像头2 - 优先使用后置摄像头
        const backCamera = videoDevices.find(d => 
          d.label.toLowerCase().includes("back") || 
          d.label.toLowerCase().includes("rear") ||
          d.label.toLowerCase().includes("environment")
        );

        if (backCamera) {
          setSelectedVideoDevice2(backCamera.deviceId);
        } else if (videoDevices.length > 1) {
          setSelectedVideoDevice2(videoDevices[1].deviceId);
        } else {
          setSelectedVideoDevice2(videoDevices[0].deviceId);
        }
      }
      
      if (audioDevices.length > 0) {
        setSelectedAudioDevice(audioDevices[0].deviceId);
      }
      
      setCameraLoaded(true);
      // addMessage("设备已加载完成", "system");
    } catch (error) {
      console.error("获取设备列表失败:", error);
      setDeviceError("无法访问摄像头和麦克风，请检查权限设置");
      // addMessage("获取设备权限失败，请允许访问摄像头和麦克风", "system");
    }
  }, []);
  
  // 重新加载设备
  const reloadDevices = async () => {
    setCameraLoaded(false);
    setCamera2Error(false);
    setCamera2Ready(false);
    await getDevices();
  };

  // 处理数据可用事件
  const handleDataAvailable = useCallback(
    ({ data }: BlobEvent) => {
      if (data.size > 0) {
        setRecordedChunks(prev => prev.concat(data));
      }
    },
    [setRecordedChunks]
  );

  // 开始录制
  const startRecording = useCallback(() => {
    if (!webcamRef1.current || !cameraLoaded || !camera1Ready || !camera2Ready) return;
    
    try {
      // 获取视频流
      const stream1 = webcamRef1.current.stream;
      if (!stream1) {
        throw new Error("无法获取摄像头1的视频流");
      }
      
      // 创建媒体录制器
      mediaRecorderRef.current = new MediaRecorder(stream1);
      
      // 设置事件监听器
      mediaRecorderRef.current.addEventListener(
        "dataavailable",
        handleDataAvailable
      );
      
      // 开始录制
      mediaRecorderRef.current.start(1000); // 每1秒收集一次数据
      
      setRecording(true);
      addMessage("录制已开始", "system");
      console.log("录制已开始");
    } catch (error) {
      console.error("开始录制失败:", error);
      addMessage("开始录制失败，请检查设备权限", "system");
      setDeviceError("录制启动失败，请重试");
    }
  }, [cameraLoaded, camera1Ready, camera2Ready, handleDataAvailable]);
  
  // 停止录制
  const handleStopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.stream) {
    const audioTracks = mediaRecorderRef.current.stream.getAudioTracks();
    console.log("音频轨道数量:", audioTracks.length);
    audioTracks.forEach(track => {
      console.log("音频轨道状态:", track.readyState, "限制:", track.getConstraints());
    });
  }
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.removeEventListener(
        "dataavailable",
        handleDataAvailable
      );
    }
    
    setRecording(false);
    addMessage("录制已停止", "system");
    console.log("录制已停止");
    console.log("录制内容为：", recordedChunks.length, "个数据块");
    
    // 处理录制的视频数据
    if (recordedChunks.length > 0) {
      handleSaveRecording();
    }
  }, [recordedChunks, handleDataAvailable]);

  // 处理倒计时结束
  useEffect(() => {
    if (countdown === 0 && recording) {
      handleStopRecording();
    }
  }, [countdown, recording, handleStopRecording]);

  // 保存录制内容
  const handleSaveRecording = async () => {
    if (recordedChunks.length === 0) return;
    
    setIsProcessing(true);
    setStatus("处理中");

    try {
      const file = new Blob(recordedChunks, { type: `video/webm` });
      const unique_id = uuid();

      console.log("recordedChunks length:", recordedChunks.length);
      console.log("Blob size:", file.size);

      // 确保FFmpeg已初始化
      if (!ffmpegRef.current) {
        throw new Error("FFmpeg not initialized");
      }
      
      const ffmpeg = ffmpegRef.current;
      
      if (!ffmpeg.isLoaded()) {
        await ffmpeg.load();
      }

      // const inputFile = ffmpeg.FS("readFile", `${unique_id}.webm`);
      // if (inputFile.length === 0) {
      //   throw new Error("输入文件为空或写入失败");
      // }
      // console.log("输入文件大小:", inputFile.length, "bytes");
      // 1. 处理视频和音频
      setStatus("转换视频中...");
      ffmpeg.FS("writeFile", `${unique_id}.webm`, await fetchFile(file));
      
      await ffmpeg.run(
        "-i",
        `${unique_id}.webm`,
        "-vn",
        "-acodec",
        "libmp3lame",
        "-ac",
        "1",
        "-ar",
        "16000",
        "-f",
        "mp3",
        `${unique_id}.mp3`
      );

      const fileData = ffmpeg.FS("readFile", `${unique_id}.mp3`);
      const audioFile = new File([fileData.buffer], `${unique_id}.mp3`, {
        type: "audio/mp3",
      });

      // 2. 转录音频
      setStatus("转写音频中...");
      const transcribeForm = new FormData();
      transcribeForm.append("file", audioFile, `${unique_id}.mp3`);

      const transcribeRes = await fetch(
        `/api/transcribe`,
        {
          method: "POST",
          body: transcribeForm,
        }
      );
      
      if (!transcribeRes.ok) {
        const errorText = await transcribeRes.text();
        throw new Error(`转录失败: ${errorText}`);
      }
      
      const transcribeResult = await transcribeRes.json();

      let transcript = "";
      if (transcribeResult.transcript) {
        transcript = transcribeResult.transcript;
        setTranscript(transcript);
      } else {
        throw new Error(transcribeResult.error || "转写失败");
      }

      // 3. 准备保存文件
      const storagePath = `${userId}/${currentStage}`;
      const timestamp = new Date().getTime(); // 添加时间戳确保文件名唯一

      // 增强的保存函数，带重试逻辑
      const saveFileToBackend = async (
        dataBlob: Blob | File,
        filename: string,
        type: string,
        retries = 3
      ): Promise<boolean> => {
        const formData = new FormData();
        formData.append("file", dataBlob, filename);
        formData.append("path", storagePath);
        formData.append("type", type);

        for (let i = 0; i < retries; i++) {
          try {
            const response = await fetch("/api/saveFile", {
              method: "POST",
              body: formData,
            });

            if (!response.ok) {
              const errorText = await response.text();
              throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const result = await response.json();
            console.log(`保存 ${type} 成功:`, result);
            return true;
          } catch (error) {
            console.error(`保存 ${type} 第 ${i + 1} 次尝试失败:`, error);
            if (i === retries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // 指数退避
          }
        }
        return false;
      };

      setStatus("保存文件中...");

      // 使用时间戳生成唯一文件名
      const baseFilename = `${currentStage}_${questionIndex}`;

      // 保存文件
      await Promise.all([
        saveFileToBackend(
          file,
          `${baseFilename}.webm`,
          "video"
        ),
        saveFileToBackend(
          audioFile,
          `${baseFilename}.mp3`,
          "audio"
        ),
        saveFileToBackend(
          new Blob([transcript], { type: "text/plain" }),
          `${baseFilename}.txt`,
          "text"
        ),
      ]);

      // 清理
      ffmpeg.FS("unlink", `${unique_id}.webm`);
      ffmpeg.FS("unlink", `${unique_id}.mp3`);

      setIsProcessing(false);
      setIsSuccess(true);
      setStatus("保存完成!");

      setTimeout(() => {
        setIsSuccess(false);
        initializeRecording();
        setStatus("");
      }, 1500);
    } catch (error) {
      console.error("保存录制内容时出错:", error);
      setIsProcessing(false);
      setStatus("处理出错");
      
      // 5秒后清除错误状态
      setTimeout(() => {
        setStatus("");
      }, 5000);
    }
  };
  
  // 处理倒计时逻辑
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (recording && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [recording, countdown]);
  
  // 组件挂载时初始化
  useEffect(() => {
    initializeRecording();
    getDevices();
    
    // 组件卸载时清理
    return () => {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
    };
  }, [getDevices]);
  
  // 处理摄像头1准备就绪
  useEffect(() => {
    if (webcamRef1.current?.video?.readyState === 4) {
      setCamera1Ready(true);
    }
  }, [webcamRef1.current?.video?.readyState]);

  // 处理摄像头2准备就绪
  useEffect(() => {
    if (webcamRef2.current?.video?.readyState === 4) {
      setCamera2Ready(true);
    }
  }, [webcamRef2.current?.video?.readyState]);

  // 处理对话框输入
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const input = e.currentTarget;
      const text = input.value.trim();
      if (text) {
        addMessage(text,"user");
        input.value = "";
      }
    }
  };
  
  const handleSendMessage = (e: React.MouseEvent<HTMLButtonElement>) => {
    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
    const text = input.value.trim();
    if (text) {
      addMessage(text,"user");
      input.value = "";
    }
  };

  useEffect(() => {
    if (!audioRef.current) return;

    // const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaElementSource(audioRef.current);
    
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    analyser.fftSize = 64;
    
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const updateWaveform = () => {
      if (!audioStarted) return;
      
      analyser.getByteFrequencyData(dataArray);
      const reducedData = Array.from({length: 20}, (_, i) => {
        const start = Math.floor(i * bufferLength / 20);
        const end = Math.floor((i + 1) * bufferLength / 20);
        return Math.max(...dataArray.slice(start, end)) / 2.55;
      });
      setAudioData(reducedData);
      requestAnimationFrame(updateWaveform);
    };
    
    if (audioStarted) {
      updateWaveform();
    }
    
    return () => {
      source.disconnect();
      analyser.disconnect();
    };
  }, [audioStarted]);

  const [problemIsLoading, setProblemIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLLMResponse = async (
    system_prompt: string,
    user_prompt: string,
    setGeneratedQuestion: (content: string) => void,
    model: string = 'gpt-3.5-turbo',
    temperature: number = 0.7
  ) => {
    setProblemIsLoading(true);
    setError(null);

    try {
      const requestBody: LLMChatRequest = {
        system_prompt,
        user_prompt,
        model,
        temperature
      };

      const response = await fetch('/api/llm_chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`请求失败: ${response.status}`);
      }

      const data: LLMChatResponse = await response.json();

      console.log('llm_chat响应为:', data);
      // console.log('llm_chat响应内容为:', data.llm_response.choices[0].message.content);

      if (data.success && data.llm_response.choices.length > 0) {
        console.log('llm_chat响应内容为:', data.llm_response.choices[0].message.content);
        setGeneratedQuestion(data.llm_response.choices[0].message.content);
      } else {
        throw new Error('未获取到有效的响应内容');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误');
      console.error('调用LLM接口出错:', err);
    } finally {
      setProblemIsLoading(false);
    }
  };

  const synthesizeSpeech = useCallback(async () => {
    console.log('已进入音频生成函数');
    console.log('当前生成的问题:', generatedQuestion);
    if (!generatedQuestion) {
      // setStatus("Please provide text to synthesize.");
      console.log('Please provide text to synthesize.');
      return;
    }

    if (!selectedInterviewer) {
      console.error("Selected interviewer is not loaded yet. Cannot synthesize speech.");
      return;
    }

    setGeneratedAudio(undefined);
    console.log('开始尝试生成面试官音频');
    const person =
      selectedInterviewer.name === "Alex"
        ? `x5_lingfeiyi_flow`
        : selectedInterviewer.name === "Bob"
        ? `x4_lingfeizhe_oral`
        : `x5_lingyuyan_flow`;
    try {
      const response = await fetch('/api/synthesis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: generatedQuestion,
          voice: person, // Now safe
          debug: false
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.log('面试官音频生成失败', errorData);
        throw new Error(errorData.details || `HTTP error! Status: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      console.log('response为',response);
      console.log('audioBlob为',audioBlob,);
      console.log('audioUrl为',audioUrl);
      
      setGeneratedAudio(audioUrl);
      console.log('Audio generated successfully!');
      // console.log("音频路径:", generatedAudio);
      
      if (audioRef.current) {
        audioRef.current.play()
          .then(() => {
            setAudioStarted(true);
          })
          .catch(error => console.error("播放失败:", error));
      }

    } catch (err) {
      console.error('Error synthesizing speech:', err);
      setStatus(`Failed to synthesize speech: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [generatedQuestion]);

  useEffect(() => {
    // 自动重置音频 currentTime
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  }, [generatedAudio]);

  const getnextquestion = async () => {
    try {
      await fetchLLMResponse(
        systeminitprompt,
        `请根据以下对话内容和候选人的回答生成下一个问题，如果下面没有任何记录那么你需要发出一个疑问来开启这个面试流程\n面试官与候选人的对话:\n${chatrecord}`,
        setGeneratedQuestion
      );
      // console.log("生成的问题:", generatedQuestion);
      // synthesizeSpeech();
      // startAudio();
      // addMessage(`${generatedQuestion}`,selectedInterviewer?.name || "面试官");
      // setQuestionIndex(prev => prev + 1);
    } catch (err) {
      console.error('调用失败:', err);
    }
  };

  const [questionGenerating, setQuestionGenerating] = useState(false);  

  useEffect(() => {
    if (transcript)
    {
      console.log("转录文本:", transcript);
      addMessage(`${transcript}`,"user");
    }
  }, [transcript]); // 当 transcript 变化时触发

  useEffect(() => {
    // 检查条件：消息数量 > 3 且最后一条消息的发送者是 user
    const shouldProceed = messages.length > 3 && 
                        messages[messages.length - 1]?.sender === "user";
    if (shouldProceed) {
      if (questionIndex < question_total) {
        getnextquestion();
      }
      savechatrecord();
      
      if (questionIndex >= question_total) {
        addMessage(`恭喜您完成了该环节的面试，5秒后将自动跳转到staff界面`, "system");
        setTimeout(() => {
          router.push('/staff'); // 5秒后跳转
        }, 5000);
      }
    }
  }, [chatrecord]);

  useEffect(() => {
    if (generatedQuestion) {
        console.log("生成的问题:", generatedQuestion);
        synthesizeSpeech();
        // startAudio();
        addMessage(`${generatedQuestion}`,selectedInterviewer?.name || "面试官");
        setQuestionIndex(prev => prev + 1);
    }
  }, [generatedQuestion]); // 当 generatedQuestion 变化时触发

  const savechatrecord = async (): Promise<boolean> => {
    // 构造存储路径和唯一文件名
    const storagePath = `${userId}/${currentStage}`;
    const filename = `${currentStage}_chatrecord.txt`;

    // 创建文本Blob
    const textBlob = new Blob([chatrecord], { type: 'text/plain' });

    const formData = new FormData();
    formData.append('file', textBlob, filename);
    formData.append('path', storagePath);
    formData.append('type', 'text');

    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const response = await fetch('/api/saveFile', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`保存失败 (HTTP ${response.status}): ${errorText}`);
        }

        const result = await response.json();
        console.log(`文本文件保存成功: ${filename}`, result);
        return true;
      } catch (error) {
        console.error(`第 ${attempt + 1}/${5} 次尝试失败:`, error);
        
        if (attempt === 5 - 1) {
          throw error; // 最后一次尝试后抛出错误
        }
        
        // 指数退避等待 (1s, 2s, 4s...)
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
      }
    }
    return false;
  };

   return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">{stagename}</h1>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* 第一列 - 摄像头区域 */}
          <div className="w-full lg:w-1/3 flex flex-col gap-6">
            {/* 摄像头 1 - 固定高度容器 */}
            <div className="bg-gray-800 rounded-2xl overflow-hidden border-2 border-blue-500 flex-1 min-h-[300px] relative">
              <div className="p-3 bg-gray-900 bg-opacity-80 flex justify-between items-center">
                <span className="text-blue-400 font-semibold">摄像头 1 (本地)</span>
                <select
                  value={selectedVideoDevice1}
                  onChange={(e) => setSelectedVideoDevice1(e.target.value)}
                  className="bg-gray-700 text-white px-2 py-1 rounded text-sm"
                  disabled={recording}
                >
                  {videoDevices.map(device => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label || `摄像头 ${videoDevices.indexOf(device) + 1}`}
                    </option>
                  ))}
                </select>
              </div>
              {cameraLoaded && recordingPermission ? (
                <div className="w-full h-full aspect-video">
                  <Webcam
                    muted={true}
                    audio={true}
                    ref={webcamRef1}
                    className="w-full h-full object-cover"
                    screenshotFormat="image/jpeg"
                    videoConstraints={{ 
                      deviceId: selectedVideoDevice1,
                      facingMode: "user"
                    }}
                    forceScreenshotSourceSize={true}
                    mirrored={true}
                    onUserMedia={() => setCamera1Ready(true)}
                    onUserMediaError={() => {
                      setCamera1Ready(false);
                      // addMessage("摄像头1加载失败", "system");
                    }}
                  />
                </div>
              ) : (
                <div className="w-full h-[300px] bg-gray-700 flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-3"></div>
                    <p>加载摄像头中...</p>
                    {!recordingPermission && (
                      <p className="text-sm text-red-400 mt-2">请允许摄像头访问权限</p>
                    )}
                  </div>
                </div>
              )}
              {cameraLoaded && !camera1Ready && (
                <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
                  <div className="text-center p-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto mb-3"></div>
                    <p className="text-blue-300">正在初始化摄像头1...</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* 摄像头 2 - 固定高度容器 */}
            <div className="bg-gray-800 rounded-2xl overflow-hidden border-2 border-green-500 flex-1 min-h-[300px] relative">
              <div className="p-3 bg-gray-900 bg-opacity-80 flex justify-between items-center">
                <span className="text-green-400 font-semibold">摄像头 2</span>
                <select
                  value={selectedVideoDevice2}
                  onChange={(e) => setSelectedVideoDevice2(e.target.value)}
                  className="bg-gray-700 text-white px-2 py-1 rounded text-sm"
                  disabled={recording}
                >
                  {videoDevices.map(device => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label || `摄像头 ${videoDevices.indexOf(device) + 1}`}
                    </option>
                  ))}
                </select>
              </div>
              {cameraLoaded && recordingPermission ? (
                <div className="w-full h-full aspect-video">
                  <Webcam
                    audio={false}
                    ref={webcamRef2}
                    className="w-full h-full object-cover"
                    screenshotFormat="image/jpeg"
                    videoConstraints={{ 
                      deviceId: selectedVideoDevice2,
                      facingMode: "environment"
                    }}
                    forceScreenshotSourceSize={true}
                    mirrored={false}
                    onUserMedia={() => setCamera2Ready(true)}
                    onUserMediaError={() => {
                      setCamera2Error(true);
                      setCamera2Ready(false);
                      // addMessage("摄像头2加载失败", "system");
                    }}
                  />
                </div>
              ) : (
                <div className="w-full h-[300px] bg-gray-700 flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto mb-3"></div>
                    <p>加载摄像头中...</p>
                    {!recordingPermission && (
                      <p className="text-sm text-red-400 mt-2">请允许摄像头访问权限</p>
                    )}
                  </div>
                </div>
              )}
              {cameraLoaded && !camera2Ready && (
                <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
                  <div className="text-center p-4">
                    {camera2Error ? (
                      <>
                        <div className="text-red-400 mb-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        </div>
                        <p className="text-red-300">摄像头2加载失败</p>
                        <button 
                          onClick={() => {
                            setCamera2Error(false);
                            setCamera2Ready(false);
                          }}
                          className="mt-2 text-white bg-red-600 hover:bg-red-500 px-3 py-1 rounded text-sm"
                        >
                          重试
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500 mx-auto mb-3"></div>
                        <p className="text-green-300">正在初始化摄像头2...</p>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* 第二列 - 面试官和控制区域 */}
          <div className="w-full lg:w-1/4 flex flex-col gap-6">
            {/* 面试官图片 - 固定高度容器 */}
            <div className="bg-gray-800 rounded-2xl overflow-hidden flex-1 flex flex-col min-h-[300px] relative"> {/* 添加 relative 定位 */}
              {/* 标题栏 */}
              <div className="bg-gradient-to-r from-yellow-600 to-yellow-700 p-4 text-center font-semibold">
                <span className="text-white">面试官 {selectedInterviewer?.name || ""}</span>
              </div>

              {/* 内容区域（包含头像和波形图） */}
              <div className="flex-1 flex items-center justify-center p-4">
                <div className="relative w-full h-full"> {/* 确保容器可定位 */}
                  {/* 面试官头像 */}
                  <div className="flex justify-center">
                    <img 
                      src={`/placeholders/${selectedInterviewer?.name || "Alex"}.webp`} 
                      alt={selectedInterviewer?.name || "Alex"} 
                      className="w-48 h-48 rounded-full object-cover border-4 border-yellow-500 z-10 relative" /* 添加 z-index */
                    />
                    <div className="absolute bottom-5 right-[calc(50%-84px)] w-6 h-6 bg-green-500 rounded-full border-2 border-gray-900 z-20"></div>
                  </div>

                  {/* 音频波形图容器 */}
                  {audioStarted && (
                    <div className="absolute inset-0 top-auto h-1/3 flex items-end justify-center p-4 pb-8"> {/* 调整定位和间距 */}
                      <div className="w-full max-w-[300px] flex items-end justify-center space-x-1 opacity-80">
                        {audioData.map((value, i) => (
                          <div 
                            key={i}
                            className="w-1.5 bg-yellow-400 rounded-full"
                            style={{
                              height: `${value}%`,
                              transition: 'height 0.1s ease-in-out',
                              minHeight: '2px' // 确保最小高度可见
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* 控制面板 - 固定高度容器 */}
            <div className="bg-gray-800 rounded-2xl p-6 flex flex-col gap-6 min-h-[300px]">
  {/* 状态提示 */}
  <div className="text-center">
    {recording ? (
      <div className="flex items-center justify-center">
        <div className="w-3 h-3 bg-red-500 rounded-full mr-2 animate-pulse"></div>
        <span className="font-medium">
          录制中 - 剩余时间: {countdown}秒
        </span>
      </div>
    ) : isProcessing ? (
      <div className="flex items-center justify-center">
        <div className="w-3 h-3 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
        <span className="font-medium">{status}</span>
      </div>
    ) : cameraLoaded ? (
      camera1Ready && camera2Ready ? (
        <span className="text-green-400">设备准备就绪</span>
      ) : (
        <span className="text-yellow-400">初始化中...</span>
      )
    ) : (
      <span className="text-yellow-400">正在加载设备...</span>
    )}
  </div>
  
  {/* 麦克风选择 */}
  <div>
    <label className="block text-sm text-gray-400 mb-2">麦克风设备</label>
    <select
      value={selectedAudioDevice}
      onChange={(e) => setSelectedAudioDevice(e.target.value)}
      className="w-full bg-gray-700 text-white px-3 py-2 rounded"
      disabled={recording}
    >
      {audioDevices.map(device => (
        <option key={device.deviceId} value={device.deviceId}>
          {device.label || `麦克风 ${audioDevices.indexOf(device) + 1}`}
        </option>
      ))}
    </select>
  </div>
  
  {/* 控制按钮 */}
  <div className="flex flex-col gap-4">
    {/* 新增的音频播放按钮 - 修复版 */}
    {generatedAudio && (
      <button
        onClick={() => {
          if (audioRef.current) {
            audioRef.current.load();
            audioRef.current.play()
              .then(() => {
                console.log("音频开始播放");
                setAudioStarted(true);
              })
              .catch(error => {
                console.error("播放失败:", error);
                alert("播放失败: 请点击一次页面任意位置后重试");
              });
          }
        }}
        className="px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center bg-purple-600 hover:bg-purple-500"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
        </svg>
        播放问题音频
      </button>
    )}
    
    <button
      onClick={startRecording}
      disabled={recording || !cameraLoaded || !recordingPermission || !camera1Ready || !camera2Ready}
      className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center ${
        recording || !cameraLoaded || !recordingPermission || !camera1Ready || !camera2Ready
          ? "bg-gray-600 cursor-not-allowed"
          : "bg-green-600 hover:bg-green-500"
      }`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
      </svg>
      开始录制
    </button>
    
    <button
      onClick={handleStopRecording}
      disabled={!recording || isProcessing}
      className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center ${
        !recording || isProcessing
          ? "bg-gray-600 cursor-not-allowed"
          : "bg-red-600 hover:bg-red-500"
      }`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
      </svg>
      停止录制
    </button>
    
    {deviceError && (
      <div className="mt-4 p-3 bg-red-900 bg-opacity-50 rounded-lg">
        <p className="text-red-300 text-sm mb-2">{deviceError}</p>
        <button 
          onClick={reloadDevices}
          className="text-white bg-red-600 hover:bg-red-500 px-3 py-1 rounded text-sm w-full"
        >
          重新加载设备
        </button>
      </div>
    )}
  </div>
  
  {/* 隐藏的音频元素 - 确保添加在组件中 */}
  <audio 
    ref={audioRef} 
    src={generatedAudio}
    onError={(e) => console.error("音频加载错误", e)}
    className="hidden"
  />
</div>
          </div>
          
          {/* 第三列 - 聊天对话框和状态显示 */}
          <div className="w-full lg:w-2/5 h-full flex flex-col">
            {/* 状态显示框 - 位于对话框上方，大小与录制按钮相似 */}
            {status && (
              <div className="mb-4 bg-blue-600 text-white py-3 px-6 rounded-xl flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-white rounded-full mr-2 animate-pulse"></div>
                  <span>{status}</span>
                </div>
                {isProcessing && (
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                )}
              </div>
            )}
            
            {/* 聊天对话框 */}
            <div className="bg-gray-800 rounded-2xl flex flex-col overflow-hidden border border-gray-700 h-full min-h-[650px]">
              <div className="bg-gradient-to-r from-blue-700 to-blue-800 p-4 text-center font-semibold">
                面试对话
              </div>
              
              <div className="flex-1 p-4 overflow-y-auto" style={{ maxHeight: '500px' }}>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mb-4 flex ${
                      message.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                        message.sender === "user"
                          ? "bg-blue-600 rounded-br-none"
                          : message.sender === "system"
                          ? "bg-purple-600"
                          : "bg-gray-700 rounded-bl-none"
                      }`}
                    >
                      <div className="font-semibold text-xs mb-1 text-gray-300">
                        {message.sender === "user"
                          ? "你"
                          : message.sender === "system"
                          ? "系统"
                          : selectedInterviewer?.name || "面试官"}
                      </div>
                      <div>{message.text}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <div className="p-4 border-t border-gray-700 bg-gray-900">
                <div className="flex">
                  <input
                    type="text"
                    placeholder="输入消息..."
                    className="flex-1 bg-gray-800 rounded-l-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyDown={handleInputKeyDown}
                  />
                  <button
                    onClick={handleSendMessage}
                    className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-r-xl transition-colors"
                  >
                    发送
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* 底部状态栏 */}
        <div className="mt-8 text-center text-sm text-gray-400">
          {recordingPermission ? (
            <div className="flex items-center justify-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span>摄像头和麦克风权限已授权</span>
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
              <span>请允许摄像头和麦克风访问权限</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DualCameraRecorder;