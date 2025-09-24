// pages/humaneval.tsx
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';

// 注册Chart.js组件
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

// 用户数据类型定义
interface Round {
  id: string;
  video: string;
  audio: string;
  chatRecord: string;
  questions: string[];
  answers: string[];
}

interface Session {
  id: string;
  name: string;
  rounds: Round[];
  aiScores: number[];  // 修改：从 defaultScores 改为 aiScores
  humanScores: number[]; // 修改：从 currentScores 改为 humanScores
}

interface User {
  id: string;
  fullName: string;
  position: string;
  avatar: string;
  status: string;
  sessions: Session[];
}

// 雷达图数据配置
const radarOptions = {
  scales: {
    r: {
      angleLines: {
        display: true,
        color: 'rgba(0, 0, 0, 0.1)'
      },
      suggestedMin: 0,
      suggestedMax: 100,
      ticks: {
        stepSize: 20,
        backdropColor: 'transparent'
      },
      pointLabels: {
        font: {
          size: 10,
          family: 'sans-serif'
        }
      },
      grid: {
        color: 'rgba(0, 0, 0, 0.1)'
      }
    }
  },
  elements: {
    line: {
      borderWidth: 2,
    },
    point: {
      radius: 3,
      hoverRadius: 5
    }
  },
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        usePointStyle: true,
        boxWidth: 10
      }
    }
  }
};

// 指标名称
const metrics = [
  '专业知识水平', '技能匹配度', 
  '语言表达能力', '逻辑思维能力',
  '创新能力', '应变抗压能力'
];

// 环节名称映射
const sessionNames = {
  introduction: '自我介绍',
  technology: '技术问答',
  analysis: '案例分析'
};

// 指标英文到中文映射
const metricMap: Record<string, string> = {
  expertise: '专业知识水平',
  proficiency: '技能匹配度',
  articulation: '语言表达能力',
  reasoning: '逻辑思维能力',
  innovation: '创新能力',
  resilience: '应变抗压能力'
};

const HumanEvalPage = () => {
  const [activeUser, setActiveUser] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // 1. 获取所有用户id
        const usersResponse = await fetch('/api/databases/query?table=users');
        const usersResult = await usersResponse.json();
        
        if (!usersResult.success || !Array.isArray(usersResult.data)) {
          throw new Error(usersResult.message || 'Failed to fetch users');
        }
        
        // 2. 获取AI评估数据和人工评估数据
        let aiEvalData: any[] = [];
        let humanEvalData: any[] = [];
        
        try {
          // 获取AI评估数据
          const aiEvalResponse = await fetch('/api/ai_eval');
          if (aiEvalResponse.ok) {
            const aiEvalResult = await aiEvalResponse.json();
            aiEvalData = aiEvalResult.data || [];
          }
          
          // 获取人工评估数据
          const humanEvalResponse = await fetch('/api/human_eval');
          if (humanEvalResponse.ok) {
            const humanEvalResult = await humanEvalResponse.json();
            humanEvalData = humanEvalResult.data || [];
          }
        } catch (err) {
          console.error('获取评估数据失败:', err);
        }
        
        const fetchedUsers: User[] = [];
        
        for (const user of usersResult.data) {
          try {
            // 3. 从localStorage获取用户fullname
            let fullName = user.id;
            let positionName = user.position || '待定职位';
            try {
              const userDataKey = "userdata";
              const allUserDataJSON = localStorage.getItem(userDataKey);
              
              if (allUserDataJSON) {
                const allUserData = JSON.parse(allUserDataJSON);
                const resumeSetupData = allUserData[user.id]?.resumeSetupData;
                
                if (resumeSetupData?.fullName) {
                  fullName = resumeSetupData.fullName;
                }
                if (resumeSetupData?.position?.name) {
                  positionName = resumeSetupData?.position?.name;
                }
              }
            } catch (err) {
              console.error('从localStorage获取用户数据失败:', err);
            }
            
            // 4. 构建用户数据结构
            const userData: User = {
              id: user.id,
              fullName,
              position: positionName,
              avatar: user.avatar || '/avatar-default.svg',
              status: user.status || '评估中',
              sessions: []
            };
            
            // 5. 构建环节数据
            const sessions = [
              { id: 'introduction', name: sessionNames.introduction },
              { id: 'technology', name: sessionNames.technology },
              { id: 'analysis', name: sessionNames.analysis }
            ];
            
            for (const session of sessions) {
              // 获取该环节的AI评分
              const aiScores = Array(metrics.length).fill(0);
              const sessionAIMetrics = aiEvalData.filter(
                (item: any) => 
                  item.user_id === user.id && 
                  item.session === session.id &&
                  item.metric !== 'total'
              );
              
              // 按指标映射填充AI评分
              sessionAIMetrics.forEach((item: any) => {
                const metricName = metricMap[item.metric];
                if (metricName) {
                  const index = metrics.indexOf(metricName);
                  if (index !== -1) {
                    aiScores[index] = parseInt(item.score) || 0;
                  }
                }
              });
              
              // 获取该环节的人工评分（优先使用human_eval.csv中的数据）
              let humanScores = [...aiScores]; // 默认使用AI评分
              const sessionHumanMetrics = humanEvalData.filter(
                (item: any) => 
                  item.user_id === user.id && 
                  item.session === session.id &&
                  item.metric !== 'total'
              );
              
              // 如果存在人工评分，使用人工评分
              if (sessionHumanMetrics.length > 0) {
                humanScores = Array(metrics.length).fill(0);
                sessionHumanMetrics.forEach((item: any) => {
                  const metricName = metricMap[item.metric];
                  if (metricName) {
                    const index = metrics.indexOf(metricName);
                    if (index !== -1) {
                      humanScores[index] = parseInt(item.score) || 0;
                    }
                  }
                });
              }
              
              const sessionData: Session = {
                id: session.id,
                name: session.name,
                rounds: [],
                aiScores, // 改为aiScores
                humanScores // 改为humanScores
              };
              
              // 获取环节轮次文件
              try {
                // 检查轮次文件
                let roundNum = 1;
                const rounds: Round[] = [];
                
                while (true) {
                  // 检查视频文件是否存在
                  const videoCheck = await fetch(
                    `/api/datafile?type=video&userId=${user.id}&sessionId=${session.id}&roundNum=${roundNum}`
                  );
                  
                  if (videoCheck.status === 404) break;
                  
                  // 获取聊天记录
                  let questions: string[] = [];
                  let answers: string[] = [];
                  
                  try {
                    const chatResponse = await fetch(
                      `/api/datafile?type=chat&userId=${user.id}&sessionId=${session.id}`
                    );
                    
                    if (chatResponse.ok) {
                      const chatResult = await chatResponse.json();
                      const chatContent = chatResult.content || '';
                      
                      // 解析聊天记录 - 按指定格式解析
                      if (chatContent) {
                        // 添加类型注解: string
                        const lines = chatContent.split('\n')
                          .map((line: string) => line.trim()) // 明确指定 line 类型为 string
                          .filter((line: string) => line !== ''); // 明确指定 line 类型为 string
                        
                        // 按照需求格式解析：第i轮的问题在第2*i+2行，回答在第2*i+3行
                        for (let i = 0; ; i++) {
                          const questionLine = 2 * i + 2; // 数组索引从0开始，所以+1而不是+2
                          const answerLine = 2 * i + 3;   // 数组索引从0开始，所以+2而不是+3
                          
                          if (questionLine >= lines.length || answerLine >= lines.length) {
                            break; // 没有更多轮次
                          }
                          
                          questions.push(lines[questionLine]);
                          answers.push(lines[answerLine]);
                        }
                      }
                    }
                  } catch (err) {
                    console.error('获取聊天记录失败:', err);
                  }
                  
                  // 修改轮次数据构建逻辑
                  const roundData: Round = {
                    id: `round_${roundNum}`,
                    video: `/api/datafile?type=video&userId=${user.id}&sessionId=${session.id}&roundNum=${roundNum}`,
                    audio: `/api/datafile?type=audio&userId=${user.id}&sessionId=${session.id}&roundNum=${roundNum}`,
                    chatRecord: '', // 初始为空，通过API获取
                    questions,
                    answers
                  };
                  
                  rounds.push(roundData);
                  roundNum++;
                }
                
                if (rounds.length > 0) {
                  sessionData.rounds = rounds;
                } else {
                  // 添加一个默认轮次以防数据获取失败
                  sessionData.rounds.push({
                    id: 'default',
                    video: '',
                    audio: '',
                    chatRecord: '无聊天记录',
                    questions: [],
                    answers: []
                  });
                }
              } catch (err) {
                console.error(`获取用户 ${user.id} 环节 ${session.id} 数据失败:`, err);
                // 添加一个默认轮次以防数据获取失败
                sessionData.rounds.push({
                  id: 'default',
                  video: '',
                  audio: '',
                  chatRecord: '无聊天记录',
                  questions: [],
                  answers: []
                });
              }
              
              userData.sessions.push(sessionData);
            }
            
            fetchedUsers.push(userData);
          } catch (err) {
            console.error(`处理用户 ${user.id} 数据失败:`, err);
          }
        }
        
        setUsers(fetchedUsers);
        setLoading(false);
      } catch (err) {
        setError('获取用户数据失败，请刷新页面重试');
        setLoading(false);
        console.error('获取用户数据失败:', err);
      }
    };
    
    fetchUsers();
  }, []);
  
  const toggleUser = (userId: string) => {
    setActiveUser(activeUser === userId ? null : userId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">正在加载用户数据...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-6 bg-white rounded-xl shadow-md max-w-md">
          <div className="text-red-500 mb-4">
            <ExclamationCircleIcon className="w-16 h-16 mx-auto" />
          </div>
          <h2 className="text-xl font-bold mb-2">数据加载失败</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            刷新页面
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            面试评估系统
          </h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input 
                type="text" 
                placeholder="搜索候选人..." 
                className="pl-10 pr-4 py-2 rounded-lg border border-cyan-400/30 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
              />
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-400 w-5 h-5" />
            </div>
            <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all flex items-center shadow-lg shadow-blue-500/20">
              <PlusIcon className="w-5 h-5 mr-1" />
              添加候选人
            </button>
          </div>
        </div>
        
        {users.length === 0 ? (
          <div className="bg-gray-800 rounded-xl border border-cyan-400/20 shadow-lg shadow-cyan-500/10 p-8 text-center">
            <FolderOpenIcon className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">暂无候选人数据</h2>
            <p className="text-gray-400 mb-6">当前没有可评估的候选人，请添加新的候选人</p>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-xl border border-cyan-400/20 shadow-lg shadow-cyan-500/10 overflow-hidden mb-6">
            <div className="space-y-4 p-4">
              {users.map(user => (
                <UserCard 
                  key={user.id} 
                  user={user} 
                  isExpanded={activeUser === user.id}
                  toggleExpand={toggleUser}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// 用户卡片组件
const UserCard: React.FC<{ 
  user: User; 
  isExpanded: boolean; 
  toggleExpand: (userId: string) => void; 
}> = ({ user, isExpanded, toggleExpand }) => {
  const [selectedSession, setSelectedSession] = useState(0);
  const [selectedRound, setSelectedRound] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [scores, setScores] = useState<number[]>([]); // 人工评分
  const [aiScores, setAiScores] = useState<number[]>([]); // AI评分
  const [showChat, setShowChat] = useState(false);
  const [waveformType, setWaveformType] = useState<'amplitude' | 'vad'>('amplitude');
  const [audioData, setAudioData] = useState<Float32Array | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 当前环节
  const currentSession = user.sessions[selectedSession];
  const currentRound = currentSession?.rounds?.[selectedRound] || null;
  
  // 初始化评分
  useEffect(() => {
    if (currentSession) {
      // 确保 aiScores 是数组
      const safeAiScores = Array.isArray(currentSession.aiScores) 
        ? [...currentSession.aiScores] 
        : Array(metrics.length).fill(0);
      
      // 确保 humanScores 是数组
      const safeHumanScores = Array.isArray(currentSession.humanScores) 
        ? [...currentSession.humanScores] 
        : [...safeAiScores]; // 回退到 AI 评分
      
      setAiScores(safeAiScores);
      setScores(safeHumanScores);
    }
  }, [currentSession]);

  // 处理分数变化
  const handleScoreChange = (index: number, value: number) => {
    const newScores = [...scores];
    newScores[index] = value;
    setScores(newScores);
  };

  // 切换环节时展开卡片
  const handleSessionChange = (index: number) => {
    setSelectedSession(index);
    setSelectedRound(0);
    setIsPlaying(false);
    setVideoProgress(0);
    setShowChat(false);
    
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (videoRef.current) {
      videoRef.current.pause();
    }
    
    // 重置音频分析
    setAudioData(null);
    
    // 如果卡片未展开，则展开
    if (!isExpanded) {
      toggleExpand(user.id);
    }
  };

  // 切换播放状态
  const togglePlay = () => {
    if (audioRef.current && videoRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        videoRef.current.pause();
      } else {
        audioRef.current.play();
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // 更新视频进度
  const handleVideoTimeUpdate = () => {
    if (videoRef.current) {
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setVideoProgress(isNaN(progress) ? 0 : progress);
    }
  };

  // 分析音频数据
  const analyzeAudio = async (audioUrl: string) => {
    if (!audioUrl) return;
    
    setIsAnalyzing(true);
    setAudioData(null);
    
    try {
      // 获取音频数据
      const response = await fetch(audioUrl);
      const arrayBuffer = await response.arrayBuffer();
      
      // 使用 Web Audio API 分析
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      // 获取左声道数据
      const channelData = audioBuffer.getChannelData(0);
      setAudioData(channelData);
    } catch (error) {
      console.error('音频分析失败:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 当轮次变化时分析音频
  useEffect(() => {
    if (currentRound?.audio) {
      analyzeAudio(currentRound.audio);
    }
  }, [currentRound]);

  // 绘制音频波形
  useEffect(() => {
    if (!canvasRef.current || !audioData || audioData.length === 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.clearRect(0, 0, width, height);
    
    // 背景
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, width, height);
    
    // 网格线
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.beginPath();
    for (let i = 1; i < 4; i++) {
      ctx.moveTo(0, height * i / 4);
      ctx.lineTo(width, height * i / 4);
    }
    ctx.stroke();
    
    // 根据选择的类型绘制波形
    if (waveformType === 'amplitude') {
      drawAmplitudeWaveform(ctx, width, height);
    } else {
      drawVADWaveform(ctx, width, height);
    }
  }, [audioData, waveformType]);

  // 绘制振幅波形
  const drawAmplitudeWaveform = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (!audioData) return;
    
    const centerY = height / 2;
    const step = Math.ceil(audioData.length / width);
    const scale = height / 2;
    
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    
    for (let i = 0; i < width; i++) {
      const start = Math.floor(i * step);
      const end = Math.min(start + step, audioData.length);
      
      let sum = 0;
      let count = 0;
      
      for (let j = start; j < end; j++) {
        sum += Math.abs(audioData[j]);
        count++;
      }
      
      if (count > 0) {
        const amplitude = sum / count;
        const y = centerY - amplitude * scale;
        ctx.lineTo(i, y);
      }
    }
    
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    // 添加标题
    ctx.fillStyle = '#4b5563';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('音频振幅波形图', width / 2, 15);
  };

  // 绘制语速检测波形 (VAD - Voice Activity Detection)
  const drawVADWaveform = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
  if (!audioData) return;
  
  const step = Math.ceil(audioData.length / width);
  const threshold = 0.02; // 声音活动阈值
  const paddingTop = 40; // 顶部留出标题和图例空间
  const graphHeight = height - paddingTop; // 实际绘图高度
  
  // 清除绘图区域
  ctx.clearRect(0, paddingTop, width, graphHeight);
  
  // 绘制背景网格
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
  ctx.beginPath();
  for (let i = 1; i < 4; i++) {
    const yPos = paddingTop + (graphHeight * i / 4);
    ctx.moveTo(0, yPos);
    ctx.lineTo(width, yPos);
  }
  ctx.stroke();
  
  // 找出最大振幅用于缩放
  let maxAmplitude = 0;
  for (let i = 0; i < audioData.length; i++) {
    const absAmplitude = Math.abs(audioData[i]);
    if (absAmplitude > maxAmplitude) {
      maxAmplitude = absAmplitude;
    }
  }
  
  // 绘制声音活动柱状图
  for (let i = 0; i < width; i++) {
    const start = Math.floor(i * step);
    const end = Math.min(start + step, audioData.length);
    
    let segmentMaxAmplitude = 0;
    
    for (let j = start; j < end; j++) {
      const absAmplitude = Math.abs(audioData[j]);
      if (absAmplitude > segmentMaxAmplitude) {
        segmentMaxAmplitude = absAmplitude;
      }
    }
    
    const isActive = segmentMaxAmplitude > threshold;
    
    if (isActive) {
      // 根据最大振幅缩放柱状图高度
      const barHeight = Math.min(
        (segmentMaxAmplitude / maxAmplitude) * graphHeight * 0.9, 
        graphHeight * 0.9
      );
      
      ctx.fillStyle = '#10b981';
      // 从底部开始绘制
      ctx.fillRect(
        i, 
        height - barHeight, 
        1, 
        barHeight
      );
    } else {
      // 静音部分只画一个像素线
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(i, height - 1, 1, 1);
    }
  }
  
  // 添加标题（在顶部）
  ctx.fillStyle = '#4b5563';
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('语速检测波形图 (绿色表示有声音)', width / 2, 15);
  
  // 添加图例（在顶部）
  ctx.fillStyle = '#10b981';
  ctx.fillRect(width - 120, 20, 10, 10);
  ctx.fillStyle = '#4b5563';
  ctx.font = '10px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('有声音', width - 105, 28);
  
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(width - 120, 35, 10, 10);
  ctx.fillStyle = '#4b5563';
  ctx.fillText('静音', width - 105, 43);
};

  // 保存评分
  const saveScores = async () => {
    try {
      const sessionId = currentSession.id;
      const userId = user.id;
      
      // 构建要保存的数据
      const dataToSave = [];
      for (let i = 0; i < metrics.length; i++) {
        const metric = Object.keys(metricMap).find(key => metricMap[key] === metrics[i]);
        if (metric) {
          dataToSave.push({
            user_id: userId,
            session: sessionId,
            metric,
            score: scores[i]
          });
        }
      }
      
      // 发送保存请求
      const response = await fetch('/api/save_human_eval', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSave)
      });
      
      if (response.ok) {
        alert('评分保存成功！');
        // 更新当前人工评分
        const updatedSessions = [...user.sessions];
        updatedSessions[selectedSession] = {
          ...currentSession,
          humanScores: [...scores]
        };
        
        // 更新用户数据（在真实应用中应更新状态）
        console.log('评分已更新', updatedSessions);
      } else {
        alert('评分保存失败，请重试');
      }
    } catch (err) {
      console.error('保存评分失败:', err);
      alert('评分保存失败');
    }
  };

  // UserCard 组件的 return 部分
return (
  <div className="bg-gray-800 rounded-xl border border-cyan-400/20 overflow-hidden transition-all hover:border-cyan-400/40">
    {/* 始终显示的头部卡片 */}
    <div 
      className={`flex items-center p-4 cursor-pointer transition-all ${
        isExpanded ? 'bg-blue-900/30 border-b border-cyan-400/30' : 'hover:bg-gray-700/50'
      }`}
      onClick={() => toggleExpand(user.id)}
    >
      <div className="flex items-center w-2/5">
        <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center mr-4 border border-cyan-400/30">
          <UserIcon className="text-cyan-400 w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">{user.fullName}</h2>
          <p className="text-cyan-300 text-sm">{user.position}</p>
        </div>
      </div>
      
      <div className="w-1/5">
        <span className={`px-3 py-1 rounded-full text-sm ${
          user.status === '评估中' 
            ? 'bg-yellow-900/50 text-yellow-300 border border-yellow-600/30' 
            : 'bg-green-900/50 text-green-300 border border-green-600/30'
        }`}>
          {user.status}
        </span>
      </div>
      
      <div className="w-1/5">
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2 rounded-full" 
            style={{ width: `${(selectedSession + 1) / user.sessions.length * 100}%` }}
          ></div>
        </div>
        <p className="text-gray-400 text-xs mt-1">
          已完成 {selectedSession + 1}/{user.sessions.length} 个环节
        </p>
      </div>
      
      <div className="w-1/5 flex justify-end">
        <div className="flex space-x-2">
          {user.sessions.map((session, index) => (
            <button
              key={session.id}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${
                selectedSession === index
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/20'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                handleSessionChange(index);
              }}
            >
              {session.name}
            </button>
          ))}
        </div>
      </div>
    </div>
    
    {/* 展开内容 */}
    <AnimatePresence>
      {isExpanded && currentSession && currentRound && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="p-6 border-t border-cyan-400/20"
        >
          <div className="flex flex-col gap-6">
            {/* 第一行：视频和雷达图 */}
            <div className="flex flex-col lg:flex-row gap-6">
              {/* 视频区域 - 2/3宽度 */}
              <div className="w-full lg:w-2/3">
                <div className="bg-gray-900 rounded-xl border border-cyan-400/20 overflow-hidden aspect-video relative">
                  {currentRound.video ? (
                    <>
                      <video 
                        ref={videoRef}
                        src={currentRound.video}
                        className="w-full h-full object-cover"
                        onTimeUpdate={handleVideoTimeUpdate}
                        onEnded={() => setIsPlaying(false)}
                      />
                      
                      <audio 
                        ref={audioRef} 
                        src={currentRound.audio}
                        onEnded={() => setIsPlaying(false)}
                      />
                      
                      {/* 视频控制条 */}
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-2">
                        <div className="w-full bg-gray-700 rounded-full h-1.5 mb-2">
                          <div 
                            className="bg-gradient-to-r from-cyan-500 to-blue-600 h-1.5 rounded-full" 
                            style={{ width: `${videoProgress}%` }}
                          ></div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={togglePlay}
                              className="text-white hover:bg-gray-600/50 p-1 rounded-full transition-colors"
                            >
                              {isPlaying ? (
                                <PauseIcon className="w-5 h-5" />
                              ) : (
                                <PlayIcon className="w-5 h-5" />
                              )}
                            </button>
                            <span className="text-xs text-gray-300">
                              {videoProgress.toFixed(0)}%
                            </span>
                          </div>
                          
                          <button className="text-white hover:bg-gray-600/50 p-1 rounded-full transition-colors">
                            <FullscreenIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-800">
                      <div className="text-center text-white p-6">
                        <VideoCameraSlashIcon className="w-16 h-16 mx-auto mb-4 text-cyan-400" />
                        <h3 className="text-xl font-bold mb-2">视频文件缺失</h3>
                        <p className="text-gray-300">该环节没有可播放的视频文件</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* 雷达图/聊天记录区域 - 1/3宽度 */}
              <div className="w-full lg:w-1/3">
                <div className="bg-gray-800 rounded-xl border border-cyan-400/20 p-4 h-full flex flex-col">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium text-white">
                      {showChat ? '聊天记录' : '能力评估'}
                    </h3>
                    <div className="flex space-x-2">
                      <button
                        className={`px-3 py-1 rounded-lg text-sm transition-all ${
                          !showChat 
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white border border-cyan-400/30'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                        }`}
                        onClick={() => setShowChat(false)}
                      >
                        雷达图
                      </button>
                      <button
                        className={`px-3 py-1 rounded-lg text-sm transition-all ${
                          showChat 
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white border border-cyan-400/30'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                        }`}
                        onClick={() => setShowChat(true)}
                      >
                        聊天记录
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex-grow overflow-auto">
                    {showChat ? (
                      currentRound.questions.length > 0 ? (
                        <div className="space-y-4 max-h-96 overflow-y-auto p-2">
                          {currentRound.questions.map((question, index) => (
                            <div key={index} className="space-y-2">
                              <div className="bg-blue-900/30 p-3 rounded-lg border border-blue-700/30">
                                <div className="flex items-start">
                                  <span className="font-semibold text-blue-300 mr-2">Q:</span>
                                  <p className="text-gray-200">{question}</p>
                                </div>
                              </div>
                              <div className="bg-green-900/30 p-3 rounded-lg ml-6 border border-green-700/30">
                                <div className="flex items-start">
                                  <span className="font-semibold text-green-300 mr-2">A:</span>
                                  <p className="text-gray-200">{currentRound.answers[index] || '无回答内容'}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="h-64 flex flex-col items-center justify-center text-gray-400">
                          <DocumentTextIcon className="w-12 h-12 mb-4 text-cyan-400" />
                          <p>该环节没有聊天记录</p>
                        </div>
                      )
                    ) : (
                      <div className="h-80">
                        <Radar 
                          data={{
                            labels: metrics,
                            datasets: [
                              {
                                label: '人工评分',
                                data: scores,
                                backgroundColor: 'rgba(96, 165, 250, 0.1)',
                                borderColor: '#60a5fa',
                                pointBackgroundColor: '#60a5fa',
                                pointBorderColor: '#fff',
                                pointHoverBackgroundColor: '#fff',
                                pointHoverBorderColor: '#60a5fa'
                              },
                              {
                                label: 'AI评分',
                                data: aiScores,
                                backgroundColor: 'rgba(156, 163, 175, 0.1)',
                                borderColor: '#9ca3af',
                                pointBackgroundColor: '#9ca3af',
                                pointBorderColor: '#fff',
                                pointHoverBackgroundColor: '#fff',
                                pointHoverBorderColor: '#9ca3af'
                              }
                            ]
                          }}
                          options={{
                            ...radarOptions,
                            scales: {
                              r: {
                                ...radarOptions.scales.r,
                                angleLines: {
                                  display: true,
                                  color: 'rgba(255, 255, 255, 0.1)'
                                },
                                grid: {
                                  color: 'rgba(255, 255, 255, 0.1)'
                                },
                                pointLabels: {
                                  font: {
                                    size: 10,
                                    family: 'sans-serif'
                                  },
                                  color: '#d1d5db'
                                },
                                ticks: {
                                  ...radarOptions.scales.r.ticks,
                                  color: '#9ca3af'
                                }
                              }
                            },
                            plugins: {
                              ...radarOptions.plugins,
                              legend: {
                                ...radarOptions.plugins.legend,
                                labels: {
                                  ...radarOptions.plugins.legend.labels,
                                  color: '#d1d5db'
                                }
                              }
                            }
                          }}
                        />
                        <div className="mt-2 text-center text-sm text-gray-400">
                          {scores === aiScores ? (
                            <p>人工评分尚未录入，当前显示AI评分</p>
                          ) : (
                            <p>蓝色: 人工评分 | 灰色: AI评分</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* 第二行：轮次/波形和评分 */}
            <div className="flex flex-col lg:flex-row gap-6">
              {/* 左侧：轮次和波形 - 1/3宽度 */}
              <div className="w-full lg:w-1/3 flex flex-col gap-6">
                {/* 轮数选择器 - 下拉式 */}
                <div className="bg-gray-800 rounded-xl border border-cyan-400/20 p-4">
                  <h3 className="font-medium text-white mb-3">选择轮次</h3>
                  <div className="relative">
                    <select
                      value={selectedRound}
                      onChange={(e) => {
                        const newRound = parseInt(e.target.value);
                        setSelectedRound(newRound);
                        setIsPlaying(false);
                        setVideoProgress(0);
                        if (audioRef.current) {
                          audioRef.current.pause();
                        }
                        if (videoRef.current) {
                          videoRef.current.pause();
                        }
                      }}
                      className="w-full p-3 pr-10 border border-cyan-400/30 rounded-lg appearance-none bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
                    >
                      {currentSession.rounds.map((round, index) => (
                        <option key={round.id} value={index}>
                          轮次 {index + 1}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-cyan-400">
                      <ChevronDownIcon className="w-5 h-5" />
                    </div>
                  </div>
                </div>
                
                {/* 音频分析图 */}
                <div className="bg-gray-800 rounded-xl border border-cyan-400/20 p-4 flex-grow">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium text-white">音频分析</h3>
                    <div className="flex space-x-2">
                      <button
                        className={`text-xs px-2 py-1 rounded transition-all ${
                          waveformType === 'amplitude'
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white border border-cyan-400/30'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                        }`}
                        onClick={() => setWaveformType('amplitude')}
                      >
                        响度图
                      </button>
                      <button
                        className={`text-xs px-2 py-1 rounded transition-all ${
                          waveformType === 'vad'
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white border border-cyan-400/30'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                        }`}
                        onClick={() => setWaveformType('vad')}
                      >
                        语速图
                      </button>
                    </div>
                  </div>
                  
                  <div className="h-40 bg-gray-900 rounded-lg p-3 relative border border-cyan-400/10">
                    {isAnalyzing ? (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
                      </div>
                    ) : !audioData ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                        <DocumentTextIcon className="w-8 h-8 mb-2 text-cyan-400" />
                        <p className="text-sm">无音频数据</p>
                      </div>
                    ) : (
                      <canvas 
                        ref={canvasRef} 
                        className="w-full h-full bg-gray-800 rounded"
                        width={300}
                        height={128}
                      />
                    )}
                  </div>
                  
                  <div className="mt-2 text-xs text-gray-400">
                    {waveformType === 'amplitude' ? (
                      <p>显示音频振幅随时间的变化，振幅越高表示声音越大</p>
                    ) : (
                      <p>绿色区域表示检测到声音活动，可用于分析语速和停顿</p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* 右侧：评分系统 - 2/3宽度 */}
              <div className="w-full lg:w-2/3">
                <div className="bg-gray-800 rounded-xl border border-cyan-400/20 p-4 h-full">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium text-white">面试评分</h3>
                    <span className="text-sm text-cyan-300">环节: {currentSession.name}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {metrics.map((metric, index) => (
                      <ScoreInput
                        key={index}
                        label={metric}
                        value={scores[index]}
                        onChange={(value) => handleScoreChange(index, value)}
                      />
                    ))}
                  </div>
                  
                  <div className="mt-6 flex justify-between">
                    <button
                      onClick={() => toggleExpand(user.id)}
                      className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-all border border-gray-600"
                    >
                      收起
                    </button>
                    <button 
                      onClick={saveScores}
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg shadow-blue-500/20"
                    >
                      保存评分
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);
};

// 评分输入组件
// ScoreInput 组件的修改
const ScoreInput: React.FC<{
  label: string;
  value: number;
  onChange: (value: number) => void;
}> = ({ label, value, onChange }) => {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-gray-300">{label}</span>
        <span className="text-sm font-mono text-cyan-300">{value}</span>
      </div>
      <div className="flex items-center space-x-2">
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
        />
        <input
          type="number"
          min="0"
          max="100"
          step="5"
          value={value}
          onChange={(e) => {
            const newValue = parseFloat(e.target.value);
            if (!isNaN(newValue) && newValue >= 0 && newValue <= 100) {
              onChange(newValue);
            }
          }}
          className="w-16 border border-cyan-400/30 bg-gray-700 text-white rounded px-2 py-1 text-sm"
        />
      </div>
    </div>
  );
};

// 图标组件
const PlayIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
  </svg>
);

const PauseIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const FullscreenIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 0h-4m4 0l-5-5" />
  </svg>
);

const UserIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const SearchIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const PlusIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const ExclamationCircleIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const FolderOpenIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
  </svg>
);

const VideoCameraSlashIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M1 1l22 22" />
  </svg>
);

const DocumentTextIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

export default HumanEvalPage;