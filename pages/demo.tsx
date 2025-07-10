import { AnimatePresence, motion } from "framer-motion";
import { RadioGroup } from "@headlessui/react";
import { v4 as uuid } from "uuid";
import Link from "next/link";
import { useRef, useState, useEffect, useCallback } from "react";
import Webcam from "react-webcam";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import { FlagIcon } from '../components/FlagIcon';

const questions = [ //面试问题
  {
    id: 1,
    name: "人工智能",
    description: "机器学习工程师、算法研究员、NLP工程师...",
    difficulty: "hard",
  },
  {
    id: 2,
    name: "大数据",
    description: "大数据开发工程师、数据仓库工程师、数据分析师...",
    difficulty: "medium",
  },
  {
    id: 3,
    name: "物联网",
    description: "嵌入式开发工程师、物联网系统架构师、传感器算法工程师...",
    difficulty: "medium",
  },
  {
    id: 4,
    name: "智能系统",
    description: "自动驾驶系统工程师、机器人控制工程师、智能硬件产品经理...",
    difficulty: "hard",
  }
];

const interviewers = [ //面试官
  {
    id: "Alex",
    name: "Alex",
    description: "高级算法工程师 | 性格：理性冷静｜面试风格：深挖技术细节，重视代码严谨性",
    country : "CN",
    level: "L4",
  },
  {
    id: "Bob",
    name: "Bob",
    description: "CTO｜性格：强势直接｜面试风格：高压追问，模拟极端场景",
    country : "EN",
    level: "L8",
  },
  {
    id: "Coty",
    name: "Coty",
    description: "产品总监｜性格：亲和力强但逻辑缜密｜面试风格：关注用户需求和商业化落地",
    country : "CN",
    level: "L6",
  }
];

//初始化FFmpeg
const ffmpeg = createFFmpeg({
  // corePath: `http://localhost:3000/ffmpeg/dist/ffmpeg-core.js`,
  // I've included a default import above (and files in the public directory), but you can also use a CDN like this:
  corePath: "https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js",
  log: true,
});

//辅助函数：合并多个CSS类名，并且过滤掉空值
function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function DemoPage() {
  const [selected, setSelected] = useState(questions[0]); //问题类型
  const [selectedInterviewer, setSelectedInterviewer] = useState( //面试官类型
    interviewers[0]
  );
  const [step, setStep] = useState(1);//面试步骤
  const [loading, setLoading] = useState(true);//加载状态
  const webcamRef = useRef<Webcam | null>(null);//存储 Webcam 组件.current未挂载=null，挂载指向组件实例
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);//引用媒体录制器
  const [capturing, setCapturing] = useState(false);//是否正在录制
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);//存储录制的视频数据块
  const [seconds, setSeconds] = useState(150);//倒计时秒数
  const [videoEnded, setVideoEnded] = useState(false);//视频是否结束
  const [recordingPermission, setRecordingPermission] = useState(true);//录制权限
  const [cameraLoaded, setCameraLoaded] = useState(false);//摄像头是否加载
  const vidRef = useRef<HTMLVideoElement>(null);//引用视频元素，语法同webcamRef
  const [isSubmitting, setSubmitting] = useState(false);//是否正在提交数据
  const [status, setStatus] = useState("Processing");//当前状态
  const [isSuccess, setIsSuccess] = useState(false);//成功
  const [isVisible, setIsVisible] = useState(true);//控制某些UI元素是否可见
  const [isDesktop, setIsDesktop] = useState(false);//是否为桌面设备
  const [completed, setCompleted] = useState(false);//是否开始
  const [transcript, setTranscript] = useState("");//转录文本
  const [generatedFeedback, setGeneratedFeedback] = useState("");//生成的反馈
  const [generatedQuestion, setGeneratedQuestion] = useState("");//生成的问题
  const [generatedAudio,setGeneratedAudio] = useState<string | undefined>(undefined)//存储生成的语音
  const audioRef = useRef<HTMLAudioElement>(null);
  // 控制音频是否播放完毕
  const [audioEnded, setAudioEnded] = useState(false);
  // 控制音频是否已经手动触发过播放
  const [audioStarted, setAudioStarted] = useState(false);
  


  useEffect(() => {//设备检测
    setIsDesktop(window.innerWidth >= 768);
  }, []);

  useEffect(() => {
    if (videoEnded) {
      const element = document.getElementById("startTimer");

      if (element) {
        element.style.display = "flex";// 显示计时器UI
      }

      setCapturing(true);
      setIsVisible(false);

      //初始化媒体录制器
      mediaRecorderRef.current = new MediaRecorder(
        webcamRef?.current?.stream as MediaStream
      );
      mediaRecorderRef.current.addEventListener(//视频数据监听调用handleDataAvailable
        "dataavailable",
        handleDataAvailable
      );
      mediaRecorderRef.current.start();//开始录制
    }
  }, [videoEnded, webcamRef, setCapturing, mediaRecorderRef]);

  const handleStartCaptureClick = useCallback(() => {//开始录制
    const startTimer = document.getElementById("startTimer");
    if (startTimer) {
      startTimer.style.display = "none";
    }

    if (vidRef.current) {
      vidRef.current.play();//播放引导视频
    }
  }, [webcamRef, setCapturing, mediaRecorderRef]);

  const handleDataAvailable = useCallback(//视频数据收集到recordedChunks
    ({ data }: BlobEvent) => {
      if (data.size > 0) {
        setRecordedChunks((prev) => prev.concat(data));
      }
    },
    [setRecordedChunks]
  );

  const handleStopCaptureClick = useCallback(() => {//停止录制
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    setCapturing(false);
  }, [mediaRecorderRef, webcamRef, setCapturing]);

  useEffect(() => {//倒计时控制
    let timer: any = null;
    if (capturing) {
      timer = setInterval(() => {
        setSeconds((seconds) => seconds - 1);
      }, 1000);
      if (seconds === 0) {
        handleStopCaptureClick();
        setCapturing(false);
        setSeconds(0);
      }
    }
    return () => {
      clearInterval(timer);
    };
  });

  const getQuestion = async () => {
    const response = await fetch("http://localhost:5000/api/v1/generate_question", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        domain: selected.description,
        difficulty: selected.difficulty,
      }),
    });
    const result = await response.json();
    if (result.success && result.data && result.data.question) {
      setGeneratedQuestion(result.data.question);
      // console.log("generatedQuestion内容设置为:",result.data.question,generatedQuestion)
    } else {
      setGeneratedQuestion("未能生成面试问题，请重试。");
    }
  };

  const synthesizeSpeech = async () => {
    console.log('已进入音频生成函数');
    if (!generatedQuestion) {
      setStatus("Please provide text to synthesize.");
      console.log('Please provide text to synthesize.');
      return;
    }

    setGeneratedAudio(undefined); // Clear previous audio
    console.log('开始尝试生成面试官音频');
    const person = 
    selectedInterviewer.name === "Alex"
      ? `x5_lingfeiyi_flow`
      : selectedInterviewer.name === "Bob"
      ? `x4_lingfeizhe_oral`
      : `x5_lingyuyan_flow`
    try {
      const response = await fetch('/api/synthesis', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: generatedQuestion,
          voice: person, // Use selectedName as the voice parameter
          debug: true
          // You can add speed, volume, pitch here if needed, e.g.:
          // speed: 50,
          // volume: 50,
          // pitch: 50,
        }),
      });

      if (!response.ok) {
        // Attempt to parse JSON error from the server
        const errorData = await response.json();
        console.log('面试官音频生成失败',errorData);
        throw new Error(errorData.details || `HTTP error! Status: ${response.status}`);
      }

      // Get the audio data as a Blob
      const audioBlob = await response.blob();
      // Create a URL for the Blob which can be used in an <audio> tag
      const audioUrl = URL.createObjectURL(audioBlob);
      setGeneratedAudio(audioUrl);
      console.log('Audio generated successfully!');

    } catch (err) {
      console.error('Error synthesizing speech:', err);
      setStatus(`Failed to synthesize speech: ${err instanceof Error ? err.message : String(err)}`);
    } 
  };

  //生成题目
  useEffect(() => {
    if (step === 3) {
      getQuestion();
      // console.log("generatedQuestion内容: ", generatedQuestion)
      synthesizeSpeech()
    }
  }, [step]);

  useEffect(() => {
      synthesizeSpeech()
  }, [generatedQuestion]);

  const handleDownload = async () => {
    if (recordedChunks.length) {
      setSubmitting(true);
      setStatus("Processing");
  
      const file = new Blob(recordedChunks, { type: `video/webm` });
      const unique_id = uuid();
      
      console.log("recordedChunks 的长度为:", recordedChunks.length); // 检查是否有数据
      console.log("Blob size:", file.size); // 检查生成的 Blob 是否有效

      if (!ffmpeg.isLoaded()) {
        await ffmpeg.load();
      }
  
      ffmpeg.FS("writeFile", `${unique_id}.webm`, await fetchFile(file));
      console.log("FFmpeg FS的文件:", ffmpeg.FS("readdir", "/")); // 检查文件是否写入

      await ffmpeg.run(
        "-i", `${unique_id}.webm`,
        "-vn", "-acodec", "libmp3lame",
        "-ac", "1", "-ar", "16000", "-f", "mp3",
        `${unique_id}.mp3`
      );
  
      const fileData = ffmpeg.FS("readFile", `${unique_id}.mp3`);
      const audioFile = new File([fileData.buffer], `${unique_id}.mp3`, { type: "audio/mp3" });

      console.log("MP3 文件大小:", fileData.length); // 检查输出文件是否有效

      // 1. 先转写音频
      const transcribeForm = new FormData();
      transcribeForm.append("file", audioFile, `${unique_id}.mp3`);
      // transcribeForm.append("model", "whisper-1");
  
      const question = generatedQuestion;
  
      setStatus("Transcribing");
      
      console.log("FormData内容:");
      for (const [key, value] of transcribeForm.entries()) {
        console.log(key, value); // 检查字段名和文件是否附加成功
      }
      const transcribeRes = await fetch(
        `/api/transcribe?question=${encodeURIComponent(question)}`,
        {
          method: "POST",
          body: transcribeForm,
        }
      );
      const transcribeResult = await transcribeRes.json();
  
      let transcript = "";
      if (transcribeRes.ok && transcribeResult.transcript) {
        transcript = transcribeResult.transcript;
        setTranscript(transcript);
      } else {
        setTranscript(transcribeResult.error || "转写失败");
        setSubmitting(false);
        return;
      }
  
      console.log("组装多模态表单")
      // 2. 再组装多模态表单，上传到 submit_response
      const formData = new FormData();
      formData.append("question", question);
      formData.append("text_response", transcript); // 用转写文本
      formData.append("audio_response", audioFile, `${unique_id}.mp3`);
      formData.append("video_response", file, `${unique_id}.webm`);
  
      setStatus("提交中...");
  
      const upload = await fetch("http://localhost:5000/api/v1/submit_response", {
        method: "POST",
        body: formData,
      });
  
      const results = await upload.json();
      setSubmitting(false);
  
      if (upload.ok && results.success) {
        setIsSuccess(true);
        setCompleted(true);
        const evaluation = results.data.evaluation;
        // setGeneratedFeedback(evaluation.feedback);
        setGeneratedFeedback(
          `语言表达: ${evaluation.language_expression}\n` +
          `逻辑思维: ${evaluation.logical_thinking}\n` +
          `专业知识: ${evaluation.professional_knowledge}\n` +
          `技能匹配: ${evaluation.skill_matching}\n` +
          `创新能力: ${evaluation.innovation}\n` +
          `抗压表现: ${evaluation.stress_response}\n` +
          `综合评分: ${evaluation.overall_score}\n` +
          `详细反馈: ${evaluation.feedback}`
        );
      } else {
        setIsSuccess(false);
        setGeneratedFeedback("提交失败，请重试。");
      }
  
      setTimeout(function () {
        setRecordedChunks([]);
      }, 1500);
    }
  };

  // 视频 onPlay 时，音频只在第一次播放
  const handleVideoPlay = () => {
    if (!audioStarted) {
      const audio = audioRef.current;
      if (audio) {
        audio.currentTime = 0;
        audio.play();
        setAudioEnded(false);
        setAudioStarted(true);
      }
    }
  };

  // 音频 onEnded 时，暂停视频
  const handleAudioEnded = () => {
    setAudioEnded(true);
    const video = vidRef.current;
    if (video) {
      video.pause();
    }
    setVideoEnded(true); // 新增：音频结束时也触发 videoEnded
  };

  // 视频 onEnded 时，如果音频未结束则循环播放视频，否则不循环
  const handleVideoEnded = () => {
    if (!audioEnded) {
      // 循环播放视频，但不再重播音频
      const video = vidRef.current;
      if (video) {
        video.currentTime = 0;
        video.play();
      }
    }
    else setVideoEnded(true);
    // 如果音频已结束，视频自然停止
  };

  // 如果 generatedAudio 变化，重置 audioEnded 和 audioStarted
  useEffect(() => {
    setAudioEnded(false);
    setAudioStarted(false);
    // 自动重置音频 currentTime
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  }, [generatedAudio]);

  //数值重置函数
  function restartVideo() {
    setRecordedChunks([]);
    setVideoEnded(false);
    setCapturing(false);
    setIsVisible(true);
    setSeconds(150);
  }

  const videoConstraints = isDesktop
    ? { width: 1280, height: 720, facingMode: "user" }
    : { width: 480, height: 640, facingMode: "user" };

  //处理摄像头成功加载后的回调
  const handleUserMedia = () => {
    setTimeout(() => {
      setLoading(false);
      setCameraLoaded(true);
    }, 1000);
  };

  return (
    <AnimatePresence>
      {step === 3 ? (
        <div className="w-full min-h-screen flex flex-col px-4 pt-2 pb-8 md:px-8 md:py-2 bg-[#FCFCFC] relative overflow-x-hidden">

          {completed ? (
            <div className="w-full flex flex-col max-w-[1080px] mx-auto mt-[10vh] overflow-y-auto pb-8 md:pb-12">
              <motion.div
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.35, ease: [0.075, 0.82, 0.165, 1] }}
                className="relative md:aspect-[16/9] w-full max-w-[1080px] overflow-hidden bg-[#1D2B3A] rounded-lg ring-1 ring-gray-900/5 shadow-md flex flex-col items-center justify-center"
              >
                <video
                  className="w-full h-full rounded-lg"
                  controls
                  crossOrigin="anonymous"
                  autoPlay
                >
                  <source
                    src={URL.createObjectURL(
                      new Blob(recordedChunks, { type: "video/mp4" })
                    )}
                    type="video/mp4"
                  />
                </video>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.5,
                  duration: 0.15,
                  ease: [0.23, 1, 0.82, 1],
                }}
                className="flex flex-col md:flex-row items-center mt-2 md:mt-4 md:justify-between space-y-1 md:space-y-0"
              >
                <div className="flex flex-row items-center space-x-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-4 h-4 text-[#407BBF] shrink-0"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                    />
                  </svg>
                  <p className="text-[14px] font-normal leading-[20px] text-[#1a2b3b]">
                    视频不会存储在服务器上，并且会在您离开页面后消失。
                  </p>
                </div>
                <Link
                  href="https://github.com/Tameyer41/liftoff"
                  target="_blank"
                  className="group rounded-full pl-[8px] min-w-[180px] pr-4 py-2 text-[13px] font-semibold transition-all flex items-center justify-center bg-[#1E2B3A] text-white hover:[linear-gradient(0deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1)), #0D2247] no-underline flex gap-x-2  active:scale-95 scale-100 duration-75"
                  style={{
                    boxShadow:
                      "0px 1px 4px rgba(13, 34, 71, 0.17), inset 0px 0px 0px 1px #061530, inset 0px 0px 0px 2px rgba(255, 255, 255, 0.1)",
                  }}
                >
                  <span className="w-5 h-5 rounded-full bg-[#407BBF] flex items-center justify-center">
                    <svg
                      className="w-[16px] h-[16px] text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4.75 7.75C4.75 6.64543 5.64543 5.75 6.75 5.75H17.25C18.3546 5.75 19.25 6.64543 19.25 7.75V16.25C19.25 17.3546 18.3546 18.25 17.25 18.25H6.75C5.64543 18.25 4.75 17.3546 4.75 16.25V7.75Z"
                      ></path>
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5.5 6.5L12 12.25L18.5 6.5"
                      ></path>
                    </svg>
                  </span>
                  Star on Github
                </Link>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.5,
                  duration: 0.15,
                  ease: [0.23, 1, 0.82, 1],
                }}
                className="mt-8 flex flex-col"
              >
                <div>
                  <h2 className="text-xl font-semibold text-left text-[#1D2B3A] mb-2">
                    Transcript
                  </h2>
                  <p className="prose prose-sm max-w-none">
                    {transcript.length > 0
                      ? transcript
                      : "Don't think you said anything. Want to try again?"}
                  </p>
                </div>
                <div className="mt-8">
                  <h2 className="text-xl font-semibold text-left text-[#1D2B3A] mb-2">
                    Feedback
                  </h2>
                  <div className="mt-4 text-sm flex gap-2.5 rounded-lg border border-[#EEEEEE] bg-[#FAFAFA] p-4 leading-6 text-gray-900 min-h-[100px]">
                    <p className="prose prose-sm max-w-none">
                      {generatedFeedback}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="h-full w-full items-center flex flex-col mt-[10vh]">
              {recordingPermission ? (
                <div className="w-full flex flex-col max-w-[1080px] mx-auto justify-center">
                  <h2 className="text-2xl font-semibold text-left text-[#1D2B3A] mb-2">
                    {generatedQuestion}
                  </h2>
                  <span className="text-[14px] leading-[20px] text-[#1a2b3b] font-normal mb-4">
                    请在点击按钮和问题说明后，开始回答问题。
                  </span>
                  <motion.div
                    initial={{ y: -20 }}
                    animate={{ y: 0 }}
                    transition={{
                      duration: 0.35,
                      ease: [0.075, 0.82, 0.965, 1],
                    }}
                    className="relative aspect-[16/9] w-full max-w-[1080px] overflow-hidden bg-[#1D2B3A] rounded-lg ring-1 ring-gray-900/5 shadow-md"
                  >
                    {!cameraLoaded && (
                      <div className="text-white absolute top-1/2 left-1/2 z-20 flex items-center">
                        <svg
                          className="animate-spin h-4 w-4 text-white mx-auto my-0.5"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth={3}
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      </div>
                    )}
                    <div className="relative z-10 h-full w-full rounded-lg">
                      <div className="absolute top-5 lg:top-10 left-5 lg:left-10 z-20">
                        <span className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-0.5 text-sm font-medium text-gray-800">
                          {new Date(seconds * 1000).toISOString().slice(14, 19)}
                        </span>
                      </div>
                      {isVisible && ( // If the video is visible (on screen) we show it
                        <div className="block absolute top-[10px] sm:top-[20px] lg:top-[40px] left-auto right-[10px] sm:right-[20px] md:right-10 h-[80px] sm:h-[140px] md:h-[180px] aspect-video rounded z-20">
                          <div className="h-full w-full aspect-video rounded md:rounded-lg lg:rounded-xl">
                            <video
                              id="question-video"
                              ref={vidRef}
                              onPlay={handleVideoPlay}
                              onEnded={handleVideoEnded}
                              controls={false}
                              playsInline
                              className="h-full object-cover w-full rounded-md md:rounded-[12px] aspect-video"
                              crossOrigin="anonymous"
                              muted
                            >
                              <source
                                src={
                                  selectedInterviewer.name === "Alex"
                                    ? "https://liftoff-public.s3.amazonaws.com/JohnTechnical.mp4"
                                    : selectedInterviewer.name === "Bob"
                                    ? "https://liftoff-public.s3.amazonaws.com/RichardTechnical.mp4"
                                    : "https://liftoff-public.s3.amazonaws.com/SarahTechnical.mp4"
                                }
                                type="video/mp4"
                              />
                            </video>
                            {/* 音频播放，视频开始时播放，音频结束时暂停视频 */}
                            <audio
                              id="generated-audio-player"
                              ref={audioRef}
                              src={generatedAudio}
                              onEnded={handleAudioEnded}
                              // controls // 可选：开发时调试用
                            />
                          </div>
                      </div>
                      )}
                      <Webcam
                        mirrored
                        audio
                        muted
                        ref={webcamRef}
                        videoConstraints={videoConstraints}
                        onUserMedia={handleUserMedia}
                        onUserMediaError={(error) => {
                          setRecordingPermission(false);
                        }}
                        className="absolute z-10 min-h-[100%] min-w-[100%] h-auto w-auto object-cover"
                      />
                    </div>
                    {loading && (
                      <div className="absolute flex h-full w-full items-center justify-center">
                        <div className="relative h-[112px] w-[112px] rounded-lg object-cover text-[2rem]">
                          <div className="flex h-[112px] w-[112px] items-center justify-center rounded-[0.5rem] bg-[#4171d8] !text-white">
                            Loading...
                          </div>
                        </div>
                      </div>
                    )}

                    {cameraLoaded && (
                      <div className="absolute bottom-0 left-0 z-50 flex h-[82px] w-full items-center justify-center">
                        {recordedChunks.length > 0 ? (
                          <>
                            {isSuccess ? (
                              <button
                                className="cursor-disabled group rounded-full min-w-[140px] px-4 py-2 text-[13px] font-semibold group inline-flex items-center justify-center text-sm text-white duration-150 bg-green-500 hover:bg-green-600 hover:text-slate-100 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 active:scale-100 active:bg-green-800 active:text-green-100"
                                style={{
                                  boxShadow:
                                    "0px 1px 4px rgba(27, 71, 13, 0.17), inset 0px 0px 0px 1px #5fc767, inset 0px 0px 0px 2px rgba(255, 255, 255, 0.1)",
                                }}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5 mx-auto"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={2}
                                >
                                  <motion.path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 0.5 }}
                                  />
                                </svg>
                              </button>
                            ) : (
                              <div className="flex flex-row gap-2">
                                {!isSubmitting && (
                                  <button
                                    onClick={() => restartVideo()}
                                    className="group rounded-full px-4 py-2 text-[13px] font-semibold transition-all flex items-center justify-center bg-white text-[#1E2B3A] hover:[linear-gradient(0deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1)), #0D2247] no-underline flex gap-x-2  active:scale-95 scale-100 duration-75"
                                  >
                                    Restart
                                  </button>
                                )}
                                <button
                                  onClick={handleDownload}
                                  disabled={isSubmitting}
                                  className="group rounded-full min-w-[140px] px-4 py-2 text-[13px] font-semibold transition-all flex items-center justify-center bg-[#1E2B3A] text-white hover:[linear-gradient(0deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1)), #0D2247] no-underline flex  active:scale-95 scale-100 duration-75  disabled:cursor-not-allowed"
                                  style={{
                                    boxShadow:
                                      "0px 1px 4px rgba(13, 34, 71, 0.17), inset 0px 0px 0px 1px #061530, inset 0px 0px 0px 2px rgba(255, 255, 255, 0.1)",
                                  }}
                                >
                                  <span>
                                    {isSubmitting ? (
                                      <div className="flex items-center justify-center gap-x-2">
                                        <svg
                                          className="animate-spin h-5 w-5 text-slate-50 mx-auto"
                                          xmlns="http://www.w3.org/2000/svg"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                        >
                                          <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth={3}
                                          ></circle>
                                          <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                          ></path>
                                        </svg>
                                        <span>{status}</span>
                                      </div>
                                    ) : (
                                      <div className="flex items-center justify-center gap-x-2">
                                        <span>Process transcript</span>
                                        <svg
                                          className="w-5 h-5"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          xmlns="http://www.w3.org/2000/svg"
                                        >
                                          <path
                                            d="M13.75 6.75L19.25 12L13.75 17.25"
                                            stroke="white"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                          />
                                          <path
                                            d="M19 12H4.75"
                                            stroke="white"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                          />
                                        </svg>
                                      </div>
                                    )}
                                  </span>
                                </button>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="absolute bottom-[6px] md:bottom-5 left-5 right-5">
                            <div className="lg:mt-4 flex flex-col items-center justify-center gap-2">
                              {capturing ? (
                                <div
                                  id="stopTimer"
                                  onClick={handleStopCaptureClick}
                                  className="flex h-10 w-10 flex-col items-center justify-center rounded-full bg-transparent text-white hover:shadow-xl ring-4 ring-white  active:scale-95 scale-100 duration-75 cursor-pointer"
                                >
                                  <div className="h-5 w-5 rounded bg-red-500 cursor-pointer"></div>
                                </div>
                              ) : (
                                <button
                                  id="startTimer"
                                  onClick={handleStartCaptureClick}
                                  className="flex h-8 w-8 sm:h-8 sm:w-8 flex-col items-center justify-center rounded-full bg-red-500 text-white hover:shadow-xl ring-4 ring-white ring-offset-gray-500 ring-offset-2 active:scale-95 scale-100 duration-75"
                                ></button>
                              )}
                              <div className="w-12"></div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    <div
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 text-5xl text-white font-semibold text-center"
                      id="countdown"
                    ></div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.5,
                      duration: 0.15,
                      ease: [0.23, 1, 0.82, 1],
                    }}
                    className="flex flex-row space-x-1 mt-4 items-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-4 h-4 text-[#407BBF]"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                      />
                    </svg>
                    <p className="text-[14px] font-normal leading-[20px] text-[#1a2b3b]">
                      Video is not stored on our servers, it is solely used for
                      transcription.
                    </p>
                  </motion.div>
                </div>
              ) : (
                <div className="w-full flex flex-col max-w-[1080px] mx-auto justify-center">
                  <motion.div
                    initial={{ y: 20 }}
                    animate={{ y: 0 }}
                    transition={{
                      duration: 0.35,
                      ease: [0.075, 0.82, 0.165, 1],
                    }}
                    className="relative md:aspect-[16/9] w-full max-w-[1080px] overflow-hidden bg-[#1D2B3A] rounded-lg ring-1 ring-gray-900/5 shadow-md flex flex-col items-center justify-center"
                  >
                    <p className="text-white font-medium text-lg text-center max-w-3xl">
                      Camera permission is denied. We don{`'`}t store your
                      attempts anywhere, but we understand not wanting to give
                      us access to your camera. Try again by opening this page
                      in an incognito window {`(`}or enable permissions in your
                      browser settings{`)`}.
                    </p>
                  </motion.div>
                  <div className="flex flex-row space-x-4 mt-8 justify-end">
                    <button
                      onClick={() => setStep(1)}
                      className="group max-w-[200px] rounded-full px-4 py-2 text-[13px] font-semibold transition-all flex items-center justify-center bg-[#f5f7f9] text-[#1E2B3A] no-underline active:scale-95 scale-100 duration-75"
                      style={{
                        boxShadow: "0 1px 1px #0c192714, 0 1px 3px #0c192724",
                      }}
                    >
                      Restart demo
                    </button>
                    <Link
                      href="https://github.com/Tameyer41/liftoff"
                      target="_blank"
                      className="group rounded-full pl-[8px] min-w-[180px] pr-4 py-2 text-[13px] font-semibold transition-all flex items-center justify-center bg-[#1E2B3A] text-white hover:[linear-gradient(0deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1)), #0D2247] no-underline flex gap-x-2  active:scale-95 scale-100 duration-75"
                      style={{
                        boxShadow:
                          "0px 1px 4px rgba(13, 34, 71, 0.17), inset 0px 0px 0px 1px #061530, inset 0px 0px 0px 2px rgba(255, 255, 255, 0.1)",
                      }}
                    >
                      <span className="w-5 h-5 rounded-full bg-[#407BBF] flex items-center justify-center">
                        <svg
                          className="w-[16px] h-[16px] text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4.75 7.75C4.75 6.64543 5.64543 5.75 6.75 5.75H17.25C18.3546 5.75 19.25 6.64543 19.25 7.75V16.25C19.25 17.3546 18.3546 18.25 17.25 18.25H6.75C5.64543 18.25 4.75 17.3546 4.75 16.25V7.75Z"
                          ></path>
                          <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5.5 6.5L12 12.25L18.5 6.5"
                          ></path>
                        </svg>
                      </span>
                      Star on Github
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col md:flex-row w-full md:overflow-hidden justify-center items-center min-h-screen">
          <div className="w-full min-h-[60vh] md:w-1/2 md:h-screen flex flex-col px-4 pt-2 pb-8 md:px-0 md:py-2 bg-[#FCFCFC] justify-center">
            <div className="h-full w-full items-center justify-center flex flex-col">
              {step === 1 ? (
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -40 }}
                  key="step-1"
                  transition={{
                    duration: 0.95,
                    ease: [0.165, 0.84, 0.44, 1],
                  }}
                  className="max-w-lg mx-auto px-4 lg:px-0"
                >
                  <h2 className="text-4xl font-bold text-[#1E2B3A]">
                    请选择你想要应聘的岗位
                  </h2>
                  <p className="text-[14px] leading-[20px] text-[#1a2b3b] font-normal my-4">
                    我们提供多个岗位供你选择，请选择你想要应聘的岗位，我们将围绕这个岗位对你展开面试。
                  </p>
                  <div>
                    <RadioGroup value={selected} onChange={setSelected}>
                      <RadioGroup.Label className="sr-only">
                        Server size
                      </RadioGroup.Label>
                      <div className="space-y-4">
                        {questions.map((question) => (
                          <RadioGroup.Option
                            key={question.name}
                            value={question}
                            className={({ checked, active }) =>
                              classNames(
                                checked
                                  ? "border-transparent"
                                  : "border-gray-300",
                                active
                                  ? "border-blue-500 ring-2 ring-blue-200"
                                  : "",
                                "relative cursor-pointer rounded-lg border bg-white px-6 py-4 shadow-sm focus:outline-none flex justify-between"
                              )
                            }
                          >
                            {({ active, checked }) => (
                              <>
                                <span className="flex items-center">
                                  <span className="flex flex-col text-sm">
                                    <RadioGroup.Label
                                      as="span"
                                      className="font-medium text-gray-900"
                                    >
                                      {question.name}
                                    </RadioGroup.Label>
                                    <RadioGroup.Description
                                      as="span"
                                      className="text-gray-500"
                                    >
                                      <span className="block">
                                        {question.description}
                                      </span>
                                    </RadioGroup.Description>
                                  </span>
                                </span>
                                <RadioGroup.Description
                                  as="span"
                                  className="flex text-sm ml-4 mt-0 flex-col text-right items-center justify-center"
                                >
                                  <span className=" text-gray-500">
                                    {question.difficulty === "Easy" ? (
                                      <svg
                                        className="h-full w-[16px]"
                                        viewBox="0 0 22 25"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                      >
                                        <rect
                                          y="13.1309"
                                          width="6"
                                          height="11"
                                          rx="1"
                                          fill="#4E7BBA"
                                        />
                                        <rect
                                          x="8"
                                          y="8.13086"
                                          width="6"
                                          height="16"
                                          rx="1"
                                          fill="#E1E1E1"
                                        />
                                        <rect
                                          x="16"
                                          y="0.130859"
                                          width="6"
                                          height="24"
                                          rx="1"
                                          fill="#E1E1E1"
                                        />
                                      </svg>
                                    ) : (
                                      <svg
                                        className="h-full w-[16px]"
                                        viewBox="0 0 22 25"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                      >
                                        <rect
                                          y="13.1309"
                                          width="6"
                                          height="11"
                                          rx="1"
                                          fill="#4E7BBA"
                                        />
                                        <rect
                                          x="8"
                                          y="8.13086"
                                          width="6"
                                          height="16"
                                          rx="1"
                                          fill="#4E7BBA"
                                        />
                                        <rect
                                          x="16"
                                          y="0.130859"
                                          width="6"
                                          height="24"
                                          rx="1"
                                          fill="#E1E1E1"
                                        />
                                      </svg>
                                    )}
                                  </span>
                                  <span className="font-medium text-gray-900">
                                    {question.difficulty}
                                  </span>
                                </RadioGroup.Description>
                                <span
                                  className={classNames(
                                    active ? "border" : "border-2",
                                    checked
                                      ? "border-blue-500"
                                      : "border-transparent",
                                    "pointer-events-none absolute -inset-px rounded-lg"
                                  )}
                                  aria-hidden="true"
                                />
                              </>
                            )}
                          </RadioGroup.Option>
                        ))}
                      </div>
                    </RadioGroup>
                  </div>
                  <div className="flex gap-[15px] justify-end mt-8">
                    <div>
                      <Link
                        href="/"
                        className="group rounded-full px-4 py-2 text-[13px] font-semibold transition-all flex items-center justify-center bg-[#f5f7f9] text-[#1E2B3A] no-underline active:scale-95 scale-100 duration-75"
                        style={{
                          boxShadow: "0 1px 1px #0c192714, 0 1px 3px #0c192724",
                        }}
                      >
                        Back to home
                      </Link>
                    </div>
                    <div>
                      <button
                        onClick={() => {
                          setStep(2);
                        }}
                        className="group rounded-full px-4 py-2 text-[13px] font-semibold transition-all flex items-center justify-center bg-[#1E2B3A] text-white hover:[linear-gradient(0deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1)), #0D2247] no-underline flex gap-x-2  active:scale-95 scale-100 duration-75"
                        style={{
                          boxShadow:
                            "0px 1px 4px rgba(13, 34, 71, 0.17), inset 0px 0px 0px 1px #061530, inset 0px 0px 0px 2px rgba(255, 255, 255, 0.1)",
                        }}
                      >
                        <span> Continue </span>
                        <svg
                          className="w-5 h-5"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M13.75 6.75L19.25 12L13.75 17.25"
                            stroke="#FFF"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M19 12H4.75"
                            stroke="#FFF"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : step === 2 ? (
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -40 }}
                  key="step-2"
                  transition={{
                    duration: 0.95,
                    ease: [0.165, 0.84, 0.44, 1],
                  }}
                  className="max-w-lg mx-auto px-4 lg:px-0"
                >
                  <h2 className="text-4xl font-bold text-[#1E2B3A]">
                    选择你的面试官
                  </h2>
                  <p className="text-[14px] leading-[20px] text-[#1a2b3b] font-normal my-4">
                    选择让你感到舒适的面试官，以便于我们更好的交流面试。
                  </p>
                  <div>
                    <RadioGroup
                      value={selectedInterviewer}
                      onChange={setSelectedInterviewer}
                    >
                      <RadioGroup.Label className="sr-only">
                        Server size
                      </RadioGroup.Label>
                      <div className="space-y-4">
                        {interviewers.map((interviewer) => (
                          <RadioGroup.Option
                            key={interviewer.name}
                            value={interviewer}
                            className={({ checked, active }) =>
                              classNames(
                                checked
                                  ? "border-transparent"
                                  : "border-gray-300",
                                active
                                  ? "border-blue-500 ring-2 ring-blue-200"
                                  : "",
                                "relative cursor-pointer rounded-lg border bg-white px-6 py-4 shadow-sm focus:outline-none flex justify-between"
                              )
                            }
                          >
                            {({ active, checked }) => (
                              <>
                                <span className="flex items-center">
                                  <span className="flex flex-col text-sm">
                                    <RadioGroup.Label
                                      as="span"
                                      className="font-medium text-gray-900"
                                    >
                                      {interviewer.name}
                                    </RadioGroup.Label>
                                    <RadioGroup.Description
                                      as="span"
                                      className="text-gray-500"
                                    >
                                      <span className="block">
                                        {interviewer.description}
                                      </span>
                                    </RadioGroup.Description>
                                  </span>
                                </span>
                                <RadioGroup.Description
                                  as="span"
                                  className="flex text-sm ml-4 mt-0 flex-col text-right items-center justify-center"
                                >
                                  <span className=" text-gray-500">
                                  <FlagIcon country={interviewer.country} />
                                  </span>
                                  <span className="font-medium text-gray-900">
                                  {interviewer.country}
                                  </span>
                                </RadioGroup.Description>
                                <span
                                  className={classNames(
                                    active ? "border" : "border-2",
                                    checked
                                      ? "border-blue-500"
                                      : "border-transparent",
                                    "pointer-events-none absolute -inset-px rounded-lg"
                                  )}
                                  aria-hidden="true"
                                />
                              </>
                            )}
                          </RadioGroup.Option>
                        ))}
                      </div>
                    </RadioGroup>
                  </div>
                  <div className="flex gap-[15px] justify-end mt-8">
                    <div>
                      <button
                        onClick={() => setStep(1)}
                        className="group rounded-full px-4 py-2 text-[13px] font-semibold transition-all flex items-center justify-center bg-[#f5f7f9] text-[#1E2B3A] no-underline active:scale-95 scale-100 duration-75"
                        style={{
                          boxShadow: "0 1px 1px #0c192714, 0 1px 3px #0c192724",
                        }}
                      >
                        Previous step
                      </button>
                    </div>
                    <div>
                      <button
                        onClick={() => {
                          setStep(3);
                        }}
                        className="group rounded-full px-4 py-2 text-[13px] font-semibold transition-all flex items-center justify-center bg-[#1E2B3A] text-white hover:[linear-gradient(0deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1)), #0D2247] no-underline flex gap-x-2  active:scale-95 scale-100 duration-75"
                        style={{
                          boxShadow:
                            "0px 1px 4px rgba(13, 34, 71, 0.17), inset 0px 0px 0px 1px #061530, inset 0px 0px 0px 2px rgba(255, 255, 255, 0.1)",
                        }}
                      >
                        <span> Continue </span>
                        <svg
                          className="w-5 h-5"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M13.75 6.75L19.25 12L13.75 17.25"
                            stroke="#FFF"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M19 12H4.75"
                            stroke="#FFF"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <p>Step 3</p>
              )}
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
