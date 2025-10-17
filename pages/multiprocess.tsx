// pages/evaluation.tsx
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

// 图表组件 - 实际使用时需要安装相应依赖
const LineChart = ({ data, color, height = 200 }: any) => (
  <div className="relative" style={{ height }}>
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
    <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-current to-transparent opacity-30"></div>
    {/* 简化图表实现 */}
    <svg viewBox={`0 0 ${data.length * 20} ${height}`} className="w-full h-full">
      <path
        d={data.map((point: number, index: number) => 
          `${index === 0 ? 'M' : 'L'} ${index * 20} ${height - point * (height / 100)}`
        ).join(' ')}
        stroke={color}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </div>
);

const RadarChart = ({ data, labels, maxValue = 100 }: any) => (
  <div className="relative w-64 h-64 mx-auto">
    <div className="absolute inset-0 border border-cyan-400/30 rounded-full"></div>
    <div className="absolute inset-8 border border-cyan-400/20 rounded-full"></div>
    <div className="absolute inset-16 border border-cyan-400/10 rounded-full"></div>
    
    {/* 数据点 */}
    {data.map((value: number, index: number) => {
      const angle = (index * 2 * Math.PI) / data.length;
      const radius = (value / maxValue) * 80;
      const x = 50 + radius * Math.cos(angle);
      const y = 50 + radius * Math.sin(angle);
      
      return (
        <div key={index}>
          <div
            className="absolute w-2 h-2 bg-blue-400 rounded-full transform -translate-x-1 -translate-y-1"
            style={{ left: `${x}%`, top: `${y}%` }}
          />
          <div
            className="absolute text-xs text-cyan-300"
            style={{
              left: `${50 + 95 * Math.cos(angle)}%`,
              top: `${50 + 95 * Math.sin(angle)}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            {labels[index]}
          </div>
        </div>
      );
    })}
  </div>
);

const HeatMap = ({ data, rows, columns }: any) => (
  <div className="grid gap-1" style={{ 
    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
    gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`
  }}>
    {data.map((value: number, index: number) => (
      <div
        key={index}
        className="aspect-square rounded-sm transition-all duration-300"
        style={{
          backgroundColor: `rgba(96, 165, 250, ${value / 100})`,
          border: '1px solid rgba(96, 165, 250, 0.3)'
        }}
        title={`强度: ${value}%`}
      />
    ))}
  </div>
);

const EvaluationDashboard = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  // 示例数据 - 模拟一个在15分钟时出现作弊行为的面试者
  const [interviewData, setInterviewData] = useState({
    basicInfo: {
      name: "张明",
      position: "高级软件工程师",
      experience: "5年",
      interviewId: "INT-2024-001",
      duration: "30分钟",
      date: "2024-01-15"
    },
    
    // 核心表现数据
    performance: {
      overallScore: [85, 88, 90, 87, 92, 91, 89, 45, 40, 38, 35, 32, 30, 28, 25, 22, 20, 18, 15, 12, 10, 8, 5, 3, 2, 1, 0, 0, 0, 0],
      cheatingDetected: true,
      cheatingTime: 15, // 第15分钟检测到作弊
      
      // 能力维度
      capabilities: {
        technicalDepth: [80, 82, 85, 88, 90, 92, 91, 40, 35, 30, 25, 20, 15, 10, 5],
        logicalRigor: [75, 78, 82, 85, 88, 90, 89, 35, 30, 25, 20, 15, 10, 5, 2],
        communication: [70, 72, 75, 78, 80, 82, 81, 30, 25, 20, 15, 10, 8, 5, 3],
        problemSolving: [85, 87, 89, 91, 93, 94, 92, 38, 32, 28, 22, 18, 12, 8, 4],
        adaptability: [65, 68, 72, 75, 78, 80, 79, 28, 24, 20, 16, 12, 8, 4, 2]
      }
    },

    // 语音分析数据
    voiceAnalysis: {
      toneStability: [75, 78, 80, 82, 85, 87, 86, 30, 25, 20, 15, 10, 5, 2, 1],
      speechFluency: [80, 82, 85, 88, 90, 92, 91, 35, 28, 22, 18, 12, 8, 4, 2],
      pausePattern: [20, 18, 15, 12, 10, 8, 9, 60, 65, 70, 75, 80, 85, 90, 95],
      fillerWords: [15, 12, 10, 8, 5, 3, 4, 40, 50, 60, 70, 80, 85, 90, 95]
    },

    // 视觉行为数据
    visualBehavior: {
      eyeContact: [70, 72, 75, 78, 80, 82, 81, 20, 15, 10, 5, 2, 1, 0, 0],
      gazeStability: [65, 68, 72, 75, 78, 80, 79, 15, 10, 5, 2, 1, 0, 0, 0],
      facialExpression: [60, 63, 67, 70, 73, 75, 74, 25, 20, 15, 10, 5, 2, 1, 0],
      headMovement: [30, 28, 25, 22, 20, 18, 19, 80, 85, 90, 95, 98, 99, 100, 100]
    },

    // 情绪状态数据
    emotionalState: {
      confidence: [70, 72, 75, 78, 80, 82, 81, 15, 10, 5, 2, 1, 0, 0, 0],
      stressLevel: [25, 23, 20, 18, 15, 12, 13, 80, 85, 90, 95, 98, 99, 100, 100],
      engagement: [75, 78, 82, 85, 88, 90, 89, 20, 15, 10, 5, 2, 1, 0],
      authenticity: [80, 82, 85, 88, 90, 92, 91, 10, 5, 2, 1, 0, 0, 0]
    },

    // 认知过程数据
    cognitiveProcess: {
      responseTime: [3.2, 3.0, 2.8, 2.5, 2.2, 2.0, 2.1, 8.5, 9.0, 9.5, 10.0, 10.5, 11.0, 11.5, 12.0],
      answerComplexity: [75, 78, 82, 85, 88, 90, 89, 30, 25, 20, 15, 10, 5, 2, 1],
      logicalCoherence: [70, 73, 77, 80, 83, 85, 84, 25, 20, 15, 10, 5, 2, 1],
      cognitiveLoad: [35, 33, 30, 28, 25, 22, 23, 85, 90, 95, 98, 99, 100, 100, 100]
    },

    // 异常事件
    anomalies: [
      { time: 15, type: 'cheating', severity: 'high', description: '检测到视线频繁偏移屏幕，疑似查阅外部资料' },
      { time: 16, type: 'behavior', severity: 'medium', description: '语音模式突变，与之前模式不一致' },
      { time: 17, type: 'cognitive', severity: 'high', description: '回答复杂度急剧下降，与前期表现不符' },
      { time: 18, type: 'emotional', severity: 'medium', description: '压力水平异常升高，伴随回避行为' }
    ]
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-400 mx-auto"></div>
          <p className="mt-4 text-blue-400 text-lg">加载评估数据中...</p>
        </div>
      </div>
    );
  }

  const renderOverview = () => (
    <div className="space-y-6">
      {/* 总体表现卡片 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-2 bg-white/5 border border-white/10 rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-blue-400">核心表现趋势</h3>
            <div className={`px-3 py-1 rounded-full text-sm ${
              interviewData.performance.cheatingDetected 
                ? 'bg-red-500/20 text-red-400 border border-red-400/30' 
                : 'bg-green-500/20 text-green-400 border border-green-400/30'
            }`}>
              {interviewData.performance.cheatingDetected ? '异常行为检测' : '表现正常'}
            </div>
          </div>
          <LineChart 
            data={interviewData.performance.overallScore} 
            color="#60a5fa" 
            height={200}
          />
          <div className="mt-4 grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-400">
                {Math.max(...interviewData.performance.overallScore)}
              </div>
              <div className="text-xs text-gray-400">最高分</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400">
                {Math.min(...interviewData.performance.overallScore)}
              </div>
              <div className="text-xs text-gray-400">最低分</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-cyan-400">
                {interviewData.performance.cheatingTime}
              </div>
              <div className="text-xs text-gray-400">异常时间点</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-400">
                {Math.round((interviewData.performance.overallScore[0] - interviewData.performance.overallScore[interviewData.performance.overallScore.length - 1]) / interviewData.performance.overallScore[0] * 100)}%
              </div>
              <div className="text-xs text-gray-400">下降幅度</div>
            </div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-400 mb-4">能力维度评估</h3>
          <RadarChart
            data={Object.values(interviewData.performance.capabilities).map(arr => arr[0])}
            labels={Object.keys(interviewData.performance.capabilities).map(key => 
              key === 'technicalDepth' ? '技术深度' :
              key === 'logicalRigor' ? '逻辑严谨' :
              key === 'communication' ? '沟通能力' :
              key === 'problemSolving' ? '问题解决' : '适应能力'
            )}
          />
        </div>
      </div>

      {/* 多模态数据概览 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <h4 className="text-sm font-medium text-purple-300 mb-2">语音分析</h4>
          <div className="text-2xl font-bold text-purple-400">
            {Math.round(interviewData.voiceAnalysis.speechFluency[0])}
          </div>
          <div className="text-xs text-gray-400 mt-1">流畅度评分</div>
          <LineChart data={interviewData.voiceAnalysis.speechFluency} color="#c084fc" height={60} />
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <h4 className="text-sm font-medium text-cyan-300 mb-2">视觉行为</h4>
          <div className="text-2xl font-bold text-cyan-400">
            {Math.round(interviewData.visualBehavior.eyeContact[0])}
          </div>
          <div className="text-xs text-gray-400 mt-1">眼神接触率</div>
          <LineChart data={interviewData.visualBehavior.eyeContact} color="#22d3ee" height={60} />
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <h4 className="text-sm font-medium text-green-300 mb-2">情绪状态</h4>
          <div className="text-2xl font-bold text-green-400">
            {Math.round(interviewData.emotionalState.confidence[0])}
          </div>
          <div className="text-xs text-gray-400 mt-1">自信心指数</div>
          <LineChart data={interviewData.emotionalState.confidence} color="#4ade80" height={60} />
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <h4 className="text-sm font-medium text-yellow-300 mb-2">认知过程</h4>
          <div className="text-2xl font-bold text-yellow-400">
            {interviewData.cognitiveProcess.responseTime[0].toFixed(1)}s
          </div>
          <div className="text-xs text-gray-400 mt-1">平均响应时间</div>
          <LineChart 
            data={interviewData.cognitiveProcess.responseTime.map((t: number) => 100 - t * 8)} 
            color="#fbbf24" 
            height={60} 
          />
        </div>
      </div>

      {/* 异常事件时间线 */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-400 mb-4">异常事件时间线</h3>
        <div className="space-y-3">
          {interviewData.anomalies.map((event, index) => (
            <div key={index} className="flex items-start space-x-4 p-3 bg-white/5 rounded-lg border border-white/10">
              <div className={`w-3 h-3 rounded-full mt-1 ${
                event.severity === 'high' ? 'bg-red-500' : 'bg-yellow-500'
              }`}></div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <span className="text-white font-medium">{event.description}</span>
                  <span className="text-gray-400 text-sm">第 {event.time} 分钟</span>
                </div>
                <div className="text-sm text-gray-400 mt-1">
                  类型: {event.type === 'cheating' ? '作弊行为' : 
                         event.type === 'behavior' ? '行为异常' :
                         event.type === 'cognitive' ? '认知异常' : '情绪异常'}
                  • 严重程度: {event.severity === 'high' ? '高' : '中'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderDetailedAnalysis = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 语音深度分析 */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-purple-300 mb-4">语音深度分析</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-300">语调稳定性</span>
                <span className="text-purple-400">{interviewData.voiceAnalysis.toneStability[0]}%</span>
              </div>
              <LineChart data={interviewData.voiceAnalysis.toneStability} color="#c084fc" height={40} />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-300">停顿模式异常</span>
                <span className="text-red-400">{interviewData.voiceAnalysis.pausePattern[interviewData.voiceAnalysis.pausePattern.length - 1]}%</span>
              </div>
              <LineChart data={interviewData.voiceAnalysis.pausePattern} color="#f87171" height={40} />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-300">填充词频率</span>
                <span className="text-yellow-400">{interviewData.voiceAnalysis.fillerWords[interviewData.voiceAnalysis.fillerWords.length - 1]}%</span>
              </div>
              <LineChart data={interviewData.voiceAnalysis.fillerWords} color="#fbbf24" height={40} />
            </div>
          </div>
        </div>

        {/* 视觉行为分析 */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-cyan-300 mb-4">视觉行为分析</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-300">注视稳定性</span>
                <span className="text-cyan-400">{interviewData.visualBehavior.gazeStability[0]}%</span>
              </div>
              <LineChart data={interviewData.visualBehavior.gazeStability} color="#22d3ee" height={40} />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-300">头部移动频率</span>
                <span className="text-red-400">{interviewData.visualBehavior.headMovement[interviewData.visualBehavior.headMovement.length - 1]}%</span>
              </div>
              <LineChart data={interviewData.visualBehavior.headMovement} color="#f87171" height={40} />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-300">面部表情自然度</span>
                <span className="text-green-400">{interviewData.visualBehavior.facialExpression[0]}%</span>
              </div>
              <LineChart data={interviewData.visualBehavior.facialExpression} color="#4ade80" height={40} />
            </div>
          </div>
        </div>
      </div>

      {/* 情绪与认知分析 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-green-300 mb-4">情绪状态演变</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-300">压力水平</span>
                <span className="text-red-400">{interviewData.emotionalState.stressLevel[interviewData.emotionalState.stressLevel.length - 1]}%</span>
              </div>
              <LineChart data={interviewData.emotionalState.stressLevel} color="#f87171" height={40} />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-300">投入度</span>
                <span className="text-blue-400">{interviewData.emotionalState.engagement[0]}%</span>
              </div>
              <LineChart data={interviewData.emotionalState.engagement} color="#60a5fa" height={40} />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-300">真实性指数</span>
                <span className="text-purple-400">{interviewData.emotionalState.authenticity[0]}%</span>
              </div>
              <LineChart data={interviewData.emotionalState.authenticity} color="#c084fc" height={40} />
            </div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-yellow-300 mb-4">认知过程分析</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-300">回答复杂度</span>
                <span className="text-yellow-400">{interviewData.cognitiveProcess.answerComplexity[0]}%</span>
              </div>
              <LineChart data={interviewData.cognitiveProcess.answerComplexity} color="#fbbf24" height={40} />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-300">逻辑连贯性</span>
                <span className="text-green-400">{interviewData.cognitiveProcess.logicalCoherence[0]}%</span>
              </div>
              <LineChart data={interviewData.cognitiveProcess.logicalCoherence} color="#4ade80" height={40} />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-300">认知负荷</span>
                <span className="text-red-400">{interviewData.cognitiveProcess.cognitiveLoad[interviewData.cognitiveProcess.cognitiveLoad.length - 1]}%</span>
              </div>
              <LineChart data={interviewData.cognitiveProcess.cognitiveLoad} color="#f87171" height={40} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white p-6">
      {/* 头部导航 */}
      <header className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-all duration-300 text-blue-400"
          >
            ← 返回
          </button>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              多模态面试评估系统
            </h1>
            <p className="text-gray-400 text-sm">深度分析面试者表现与行为模式</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-white/10 border border-cyan-400/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
          >
            <option value="all">全程分析</option>
            <option value="before">异常前表现</option>
            <option value="after">异常后表现</option>
          </select>
        </div>
      </header>

      {/* 面试者基本信息 */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-white">{interviewData.basicInfo.name}</h2>
            <div className="flex flex-wrap gap-4 text-sm text-gray-300">
              <div>
                <span className="text-blue-400">应聘职位:</span> {interviewData.basicInfo.position}
              </div>
              <div>
                <span className="text-purple-400">工作经验:</span> {interviewData.basicInfo.experience}
              </div>
              <div>
                <span className="text-cyan-400">面试时长:</span> {interviewData.basicInfo.duration}
              </div>
              <div>
                <span className="text-green-400">面试ID:</span> {interviewData.basicInfo.interviewId}
              </div>
            </div>
          </div>
          
          <div className={`px-4 py-2 rounded-lg ${
            interviewData.performance.cheatingDetected 
              ? 'bg-red-500/20 text-red-400 border border-red-400/30' 
              : 'bg-green-500/20 text-green-400 border border-green-400/30'
          }`}>
            {interviewData.performance.cheatingDetected ? '检测到异常行为' : '表现正常'}
          </div>
        </div>
      </div>

      {/* 标签页导航 */}
      <div className="flex space-x-1 bg-white/5 rounded-lg p-1 mb-6 border border-white/10">
        {[
          { id: 'overview', name: '概览仪表盘' },
          { id: 'detailed', name: '详细分析' },
          { id: 'comparison', name: '对比分析' },
          { id: 'report', name: '评估报告' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-md transition-all duration-300 ${
              activeTab === tab.id 
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* 主要内容区域 */}
      <main>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'detailed' && renderDetailedAnalysis()}
        {activeTab === 'comparison' && (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-4">📊</div>
            <p>对比分析功能开发中...</p>
          </div>
        )}
        {activeTab === 'report' && (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-4">📋</div>
            <p>详细评估报告生成中...</p>
          </div>
        )}
      </main>

      {/* 装饰性元素 */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400/30 rounded-full animate-pulse"></div>
        <div className="absolute top-3/4 left-3/4 w-1 h-1 bg-cyan-400/50 rounded-full animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-purple-400/20 rounded-full animate-pulse"></div>
      </div>
    </div>
  );
};

export default EvaluationDashboard;