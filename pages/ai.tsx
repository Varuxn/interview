import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface InterviewQuestion {
  id: number;
  type: 'technical' | 'behavioral' | 'system-design' | 'coding';
  question: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number;
  scenario?: 'code-editor' | 'whiteboard' | 'architecture' | 'debugging' | 'discussion';
}

interface InterviewProgress {
  currentQuestion: number;
  totalQuestions: number;
  timeSpent: number;
  score?: number;
}

// 模拟代码编辑器组件
const CodeEditor: React.FC<{ 
  initialCode?: string;
  language?: string;
  onCodeChange: (code: string) => void;
}> = ({ initialCode = '', language = 'python', onCodeChange }) => {
  const [code, setCode] = useState(initialCode);
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value;
    setCode(newCode);
    onCodeChange(newCode);
    
    // 简单的光标位置计算
    const lines = newCode.split('\n');
    const currentLine = lines.length;
    const currentColumn = lines[lines.length - 1].length + 1;
    setCursorPosition({ line: currentLine, column: currentColumn });
  };

  return (
    <div className="bg-gray-900 rounded-lg border border-cyan-400/30 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
        <span className="text-sm text-gray-400">main.{language}</span>
        <div className="text-xs text-gray-500">
          Ln {cursorPosition.line}, Col {cursorPosition.column}
        </div>
      </div>
      <div className="relative">
        <textarea
          value={code}
          onChange={handleCodeChange}
          className="w-full h-64 font-mono text-sm bg-transparent text-white p-4 resize-none focus:outline-none leading-6"
          placeholder={`# 请在此处编写您的${language}代码...`}
          spellCheck="false"
        />
        <div className="absolute top-0 left-0 w-8 bg-gray-800/50 text-right text-gray-500 text-xs py-4 pointer-events-none">
          {code.split('\n').map((_, index) => (
            <div key={index} className="pr-2">{index + 1}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 系统架构白板组件
const ArchitectureWhiteboard: React.FC<{
  onDiagramChange: (description: string) => void;
}> = ({ onDiagramChange }) => {
  const [components, setComponents] = useState<string[]>([]);
  const [connections, setConnections] = useState<string[]>([]);
  const [newComponent, setNewComponent] = useState('');

  const addComponent = () => {
    if (newComponent.trim()) {
      setComponents(prev => [...prev, newComponent.trim()]);
      setNewComponent('');
    }
  };

  const addConnection = (from: string, to: string) => {
    setConnections(prev => [...prev, `${from} → ${to}`]);
  };

  useEffect(() => {
    const description = `组件: ${components.join(', ')} | 连接: ${connections.join(', ')}`;
    onDiagramChange(description);
  }, [components, connections, onDiagramChange]);

  return (
    <div className="bg-gray-900 rounded-lg border border-purple-400/30 p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-purple-400">系统架构设计白板</h3>
        <div className="flex space-x-2">
          <input
            type="text"
            value={newComponent}
            onChange={(e) => setNewComponent(e.target.value)}
            placeholder="添加组件..."
            className="px-3 py-1 bg-gray-800 border border-gray-600 rounded text-white text-sm"
          />
          <button
            onClick={addComponent}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
          >
            添加
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-2">系统组件</h4>
          <div className="space-y-2">
            {components.map((comp, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-800 rounded">
                <span className="text-white text-sm">{comp}</span>
                <div className="flex space-x-1">
                  <button className="text-xs text-cyan-400 hover:text-cyan-300">连接</button>
                  <button 
                    className="text-xs text-red-400 hover:text-red-300"
                    onClick={() => setComponents(prev => prev.filter((_, i) => i !== index))}
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-2">数据流向</h4>
          <div className="space-y-2">
            {connections.map((conn, index) => (
              <div key={index} className="p-2 bg-gray-800 rounded text-white text-sm">
                {conn}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-4 p-4 bg-gray-800 rounded border border-cyan-400/20">
        <h4 className="text-sm font-medium text-cyan-400 mb-2">架构说明</h4>
        <textarea
          onChange={(e) => onDiagramChange(e.target.value)}
          placeholder="请描述您的架构设计思路、组件职责和数据流向..."
          className="w-full h-20 bg-gray-700 border border-gray-600 rounded p-2 text-white text-sm resize-none"
        />
      </div>
    </div>
  );
};

// 调试场景组件
const DebuggingScene: React.FC<{
  problemDescription: string;
  onSolutionSubmit: (solution: string) => void;
}> = ({ problemDescription, onSolutionSubmit }) => {
  const [userInput, setUserInput] = useState('');
  const [logs, setLogs] = useState<string[]>([
    '>>> 开始调试会话...',
    '>>> 加载训练数据...',
    '>>> 发现梯度异常: NaN values detected',
    '>>> 损失函数不收敛',
  ]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `>>> ${message}`]);
  };

  const runDiagnosis = () => {
    addLog('运行诊断工具...');
    addLog('检查学习率: 0.1 (可能过高)');
    addLog('检查数据预处理: 发现未归一化');
    addLog('检查激活函数: 使用ReLU');
  };

  return (
    <div className="bg-gray-900 rounded-lg border border-yellow-400/30 p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-yellow-400">🧪 模型调试实验室</h3>
        <button
          onClick={runDiagnosis}
          className="px-3 py-1 bg-yellow-500 text-black rounded text-sm hover:bg-yellow-600"
        >
          运行诊断
        </button>
      </div>
      
      <div className="mb-4 p-3 bg-gray-800 rounded border border-red-400/30">
        <h4 className="text-red-400 font-medium mb-2">问题描述</h4>
        <p className="text-white text-sm">{problemDescription}</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-2">调试终端</h4>
          <div className="h-40 bg-black rounded p-3 font-mono text-sm text-green-400 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index}>{log}</div>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-2">解决方案</h4>
          <textarea
            value={userInput}
            onChange={(e) => {
              setUserInput(e.target.value);
              onSolutionSubmit(e.target.value);
            }}
            placeholder="描述您的调试步骤和解决方案..."
            className="w-full h-40 bg-gray-800 border border-gray-600 rounded p-3 text-white text-sm resize-none"
          />
        </div>
      </div>
    </div>
  );
};

// 粒子背景组件
const ParticleBackground: React.FC = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {[...Array(50)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-blue-400/20"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            scale: Math.random() * 0.5 + 0.5
          }}
          animate={{
            y: [null, -50, 50, 0],
            opacity: [0.3, 0.7, 0.3]
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Infinity,
            repeatType: "reverse" as const
          }}
          style={{
            width: Math.random() * 4 + 2,
            height: Math.random() * 4 + 2,
          }}
        />
      ))}
    </div>
  );
};

const AISpecialInterview: React.FC = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [interviewProgress, setInterviewProgress] = useState<InterviewProgress>({
    currentQuestion: 1,
    totalQuestions: 8,
    timeSpent: 0
  });
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [timer, setTimer] = useState(0);
  const [isClient, setIsClient] = useState(false);

  const timerRef = useRef<NodeJS.Timeout>();

  // 增强的AI岗位面试问题，包含实景模拟
  const interviewQuestions: InterviewQuestion[] = [
    {
      id: 1,
      type: 'coding',
      question: '请实现一个简单的Transformer自注意力机制的前向传播。要求支持多头注意力和位置编码。',
      difficulty: 'hard',
      estimatedTime: 480,
      scenario: 'code-editor'
    },
    {
      id: 2,
      type: 'system-design',
      question: '设计一个支持百万用户并发的推荐系统架构。考虑实时特征计算、模型服务和AB测试。',
      difficulty: 'hard',
      estimatedTime: 600,
      scenario: 'architecture'
    },
    {
      id: 3,
      type: 'technical',
      question: '在训练深度神经网络时遇到梯度消失问题，请分析可能的原因并提供三种解决方案。',
      difficulty: 'medium',
      estimatedTime: 300,
      scenario: 'debugging'
    },
    {
      id: 4,
      type: 'coding',
      question: '编写一个分布式数据加载器，支持多GPU训练时的数据并行和动态批处理。',
      difficulty: 'hard',
      estimatedTime: 420,
      scenario: 'code-editor'
    },
    {
      id: 5,
      type: 'system-design',
      question: '为在线广告点击率预测设计一个实时机器学习推理服务，要求延迟低于10ms。',
      difficulty: 'hard',
      estimatedTime: 540,
      scenario: 'whiteboard'
    },
    {
      id: 6,
      type: 'technical',
      question: '解释对比学习在自监督学习中的应用，并说明如何将其用于图像表示学习。',
      difficulty: 'medium',
      estimatedTime: 240,
      scenario: 'discussion'
    },
    {
      id: 7,
      type: 'behavioral',
      question: '描述你在处理生产环境中模型性能下降时的排查流程和决策过程。',
      difficulty: 'medium',
      estimatedTime: 180,
      scenario: 'discussion'
    },
    {
      id: 8,
      type: 'coding',
      question: '实现一个模型评估流水线，支持多种指标计算和可视化分析报告生成。',
      difficulty: 'medium',
      estimatedTime: 360,
      scenario: 'code-editor'
    }
  ];

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      timerRef.current = setInterval(() => {
        setTimer(prev => prev + 1);
        setInterviewProgress(prev => ({
          ...prev,
          timeSpent: prev.timeSpent + 1
        }));
      }, 1000);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [isClient]);

  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim()) return;

    setIsEvaluating(true);
    
    // 模拟AI评估过程
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const feedbacks = [
      "代码结构清晰，正确实现了多头注意力机制。建议添加更多的注释和异常处理。",
      "架构设计全面，考虑了可扩展性和性能要求。可以进一步讨论数据一致性方案。",
      "问题分析准确，解决方案实用。建议补充具体实现细节和实验效果。",
      "分布式处理逻辑正确，性能优化考虑周到。建议添加容错机制。",
      "系统设计满足延迟要求，架构合理。可以讨论更多关于特征工程的实时计算。",
      "理论解释准确，应用场景理解深入。建议补充实际项目经验。",
      "问题排查流程系统化，展现了良好的工程思维。可以增加更多量化指标。",
      "评估流水线功能完整，可视化方案实用。建议支持更多自定义指标。"
    ];
    
    setFeedback(feedbacks[currentQuestionIndex]);
    setIsEvaluating(false);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < interviewQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setInterviewProgress(prev => ({
        ...prev,
        currentQuestion: prev.currentQuestion + 1
      }));
      setUserAnswer('');
      setFeedback('');
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'hard': return 'text-red-400';
      default: return 'text-white';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'technical': return '🧠';
      case 'coding': return '💻';
      case 'system-design': return '🏗️';
      case 'behavioral': return '🗣️';
      default: return '❓';
    }
  };

  const getScenarioIcon = (scenario?: string) => {
    switch (scenario) {
      case 'code-editor': return '📝';
      case 'whiteboard': return '📊';
      case 'architecture': return '🏛️';
      case 'debugging': return '🐛';
      case 'discussion': return '💬';
      default: return '📄';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderScenarioComponent = () => {
    const currentQuestion = interviewQuestions[currentQuestionIndex];
    
    switch (currentQuestion.scenario) {
      case 'code-editor':
        return (
          <CodeEditor
            initialCode="# 请在此实现您的解决方案\nimport torch\nimport torch.nn as nn\n\nclass AttentionMechanism(nn.Module):\n    def __init__(self):\n        super().__init__()\n        # 您的代码从这里开始"
            language="python"
            onCodeChange={setUserAnswer}
          />
        );
      
      case 'architecture':
      case 'whiteboard':
        return (
          <ArchitectureWhiteboard onDiagramChange={setUserAnswer} />
        );
      
      case 'debugging':
        return (
          <DebuggingScene
            problemDescription="在训练ResNet-50模型时，训练损失持续下降但验证损失在第三轮后开始上升，准确率停滞不前。"
            onSolutionSubmit={setUserAnswer}
          />
        );
      
      default:
        return (
          <textarea
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="请输入您的详细回答..."
            className="w-full h-64 bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all resize-none"
          />
        );
    }
  };

  const currentQuestion = interviewQuestions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white p-6">
      <ParticleBackground />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* 头部信息 */}
        <header className="text-center mb-8">
          <motion.h1 
            className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            🤖 AI工程师实景面试模拟
          </motion.h1>
          <div className="flex justify-center items-center space-x-8 text-sm text-gray-300">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span>代码实现</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
              <span>系统设计</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
              <span>问题调试</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-cyan-400 rounded-full"></div>
              <span>架构规划</span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 左侧：进度和统计 */}
          <div className="lg:col-span-1 space-y-6">
            {/* 进度卡片 */}
            <motion.div 
              className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-lg font-semibold text-blue-400 mb-4">面试进度</h3>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>完成进度</span>
                  <span>{interviewProgress.currentQuestion}/{interviewProgress.totalQuestions}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(interviewProgress.currentQuestion / interviewProgress.totalQuestions) * 100}%` }}
                  ></div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center p-3 bg-white/5 rounded-lg">
                    <div className="text-2xl font-bold text-cyan-400">
                      {isClient ? formatTime(timer) : '0:00'}
                    </div>
                    <div className="text-gray-400">当前用时</div>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded-lg">
                    <div className="text-2xl font-bold text-purple-400">
                      {formatTime(currentQuestion.estimatedTime)}
                    </div>
                    <div className="text-gray-400">建议时间</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* 场景指示器 */}
            <motion.div 
              className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-lg font-semibold text-blue-400 mb-4">当前场景</h3>
              <div className="text-center p-4 bg-white/5 rounded-xl border border-cyan-400/20">
                <div className="text-4xl mb-2">{getScenarioIcon(currentQuestion.scenario)}</div>
                <div className="text-white font-medium">
                  {currentQuestion.scenario === 'code-editor' && '代码实验室'}
                  {currentQuestion.scenario === 'architecture' && '架构设计室'}
                  {currentQuestion.scenario === 'whiteboard' && '系统白板'}
                  {currentQuestion.scenario === 'debugging' && '调试中心'}
                  {currentQuestion.scenario === 'discussion' && '技术讨论'}
                </div>
                <div className="text-gray-400 text-sm mt-1">
                  {currentQuestion.scenario === 'code-editor' && '实时编码环境'}
                  {currentQuestion.scenario === 'architecture' && '系统架构规划'}
                  {currentQuestion.scenario === 'whiteboard' && '可视化设计'}
                  {currentQuestion.scenario === 'debugging' && '问题诊断解决'}
                  {currentQuestion.scenario === 'discussion' && '深度技术交流'}
                </div>
              </div>
            </motion.div>

            {/* 问题导航 */}
            <motion.div 
              className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="text-lg font-semibold text-blue-400 mb-4">问题导航</h3>
              <div className="grid grid-cols-2 gap-2">
                {interviewQuestions.map((q, index) => (
                  <button
                    key={q.id}
                    onClick={() => {
                      setCurrentQuestionIndex(index);
                      setInterviewProgress(prev => ({
                        ...prev,
                        currentQuestion: index + 1
                      }));
                      setUserAnswer('');
                      setFeedback('');
                    }}
                    className={`p-2 rounded-lg text-xs transition-all ${
                      index === currentQuestionIndex
                        ? 'bg-blue-500/20 border border-blue-400 text-blue-400'
                        : 'bg-white/5 border border-white/5 hover:border-cyan-400/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span>{getScenarioIcon(q.scenario)}</span>
                      <span className={`text-xs ${getDifficultyColor(q.difficulty)}`}>
                        {q.difficulty.charAt(0)}
                      </span>
                    </div>
                    <div className="text-xs opacity-75 truncate">Q{q.id}</div>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>

          {/* 右侧：问题和实景模拟区域 */}
          <div className="lg:col-span-3 space-y-6">
            {/* 问题卡片 */}
            <motion.div 
              className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-cyan-400/30"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getTypeIcon(currentQuestion.type)}</span>
                  <div>
                    <h2 className="text-xl font-semibold text-white">
                      {getScenarioIcon(currentQuestion.scenario)} 场景 {currentQuestion.id}: {currentQuestion.type === 'coding' ? '编程挑战' : 
                       currentQuestion.type === 'system-design' ? '系统设计' : 
                       currentQuestion.type === 'technical' ? '技术深度' : '行为面试'}
                    </h2>
                    <div className="flex items-center space-x-2 text-sm text-gray-300">
                      <span className={`px-2 py-1 rounded-full ${getDifficultyColor(currentQuestion.difficulty)} bg-opacity-20`}>
                        {currentQuestion.difficulty.toUpperCase()}
                      </span>
                      <span>•</span>
                      <span>建议时间: {formatTime(currentQuestion.estimatedTime)}</span>
                      <span>•</span>
                      <span className="text-cyan-400">{getScenarioIcon(currentQuestion.scenario)} 实景模拟</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-lg leading-relaxed text-gray-100 mb-6 bg-white/5 rounded-xl p-4 border border-white/10">
                {currentQuestion.question}
              </div>

              {/* 实景模拟区域 */}
              <div className="space-y-4">
                <div className="mb-4">
                  {renderScenarioComponent()}
                </div>

                {/* 操作按钮 */}
                <div className="flex justify-between">
                  <button
                    onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentQuestionIndex === 0}
                    className="px-6 py-3 border border-white/20 rounded-xl text-white disabled:opacity-50 hover:border-cyan-400 transition-all"
                  >
                    上一题
                  </button>

                  <div className="flex space-x-4">
                    <button
                      onClick={handleSubmitAnswer}
                      disabled={!userAnswer.trim() || isEvaluating}
                      className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white font-semibold disabled:opacity-50 hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105"
                    >
                      {isEvaluating ? (
                        <span className="flex items-center">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                          />
                          评估中...
                        </span>
                      ) : (
                        '提交答案'
                      )}
                    </button>

                    <button
                      onClick={handleNextQuestion}
                      disabled={currentQuestionIndex === interviewQuestions.length - 1}
                      className="px-6 py-3 border border-white/20 rounded-xl text-white disabled:opacity-50 hover:border-cyan-400 transition-all"
                    >
                      下一题
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* AI反馈区域 */}
            <AnimatePresence>
              {feedback && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-purple-400/30"
                >
                  <h3 className="text-lg font-semibold text-purple-400 mb-3 flex items-center">
                    <span className="text-xl mr-2">🤖</span>
                    AI面试官专业反馈
                  </h3>
                  <div className="text-gray-200 leading-relaxed bg-white/5 rounded-lg p-4">
                    {feedback}
                  </div>
                  
                  {/* 技能评估 */}
                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">技术深度</span>
                      <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                        <div className="bg-green-400 h-2 rounded-full" style={{ width: '85%' }}></div>
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-400">工程实践</span>
                      <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                        <div className="bg-blue-400 h-2 rounded-full" style={{ width: '78%' }}></div>
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-400">系统思维</span>
                      <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                        <div className="bg-purple-400 h-2 rounded-full" style={{ width: '82%' }}></div>
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-400">问题解决</span>
                      <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                        <div className="bg-cyan-400 h-2 rounded-full" style={{ width: '88%' }}></div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* 底部技术栈提示 */}
        <motion.footer 
          className="text-center mt-12 text-gray-400 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p>🚀 AI工程师实景面试系统 • 包含代码实验室、架构设计室、调试中心等专业模拟环境</p>
        </motion.footer>
      </div>
    </div>
  );
};

export default AISpecialInterview;