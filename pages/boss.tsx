import React, { useState, useEffect, useCallback } from 'react';
import {fetchLLMResponse} from './llmApi';

// 定义数据接口
interface User {
  id: string;
  name: string;
}

interface Setting {
  id: string;
  interviewer: string;
  position: string;
}

interface Evaluation {
  user_id: string;
  description: string;
  introduction_language: number;
  introduction_profession: number;
  introduction_logic: number;
  introduction_expressiveness: number;
  introduction_total: number;
  technology_language: number;
  technology_profession: number;
  technology_logic: number;
  technology_expressiveness: number;
  technology_total: number;
  analysis_language: number;
  analysis_profession: number;
  analysis_logic: number;
  analysis_expressiveness: number;
  analysis_total: number;
  final_language: number;
  final_profession: number;
  final_logic: number;
  final_expressiveness: number;
  final_total: number;
}

// 组合后的用户数据接口
interface UserData {
  user: User;
  setting?: Setting;
  evaluation?: Evaluation;
}

// 评估指标的类型定义
type MetricKey = 'language' | 'profession' | 'logic' | 'expressiveness' | 'total';
type StageKey = 'introduction' | 'technology' | 'analysis' | 'final';

// 辅助函数：将评估数据按阶段和指标分组
const getEvaluationMetrics = (evaluation: Evaluation) => {
  const stages: { [key: string]: { [key: string]: number } } = {};
  const metricNames: { [key: string]: string } = {
    language: '语言表达',
    profession: '专业知识',
    logic: '逻辑思维',
    expressiveness: '表达能力',
    total: '总分',
  };

  // 定义所有阶段及其对应的显示名称
  const stageKeys: StageKey[] = ['introduction', 'technology', 'analysis', 'final'];
  const stageDisplayNames: { [key in StageKey]: string } = {
    introduction: '自我介绍',
    technology: '技术问答',
    analysis: '案例分析',
    final: '最终评估',
  };

  stageKeys.forEach(stage => {
    const stageMetrics: { [key: string]: number } = {};
    // 遍历每个阶段的指标
    (['language', 'profession', 'logic', 'expressiveness'] as MetricKey[]).forEach(metric => {
      const key = `${stage}_${metric}` as keyof Evaluation;
      if (evaluation[key] !== undefined) {
        stageMetrics[metricNames[metric]] = evaluation[key] as number;
      }
    });

    // Add the total score for the stage if it exists
    const totalKey = `${stage}_total` as keyof Evaluation;
    if (evaluation[totalKey] !== undefined) {
      stageMetrics[metricNames['total']] = evaluation[totalKey] as number;
    }

    // 如果阶段有任何指标，则添加到 stages 对象中
    if (Object.keys(stageMetrics).length > 0) {
      stages[stageDisplayNames[stage]] = stageMetrics;
    }
  });
  return stages;
};

// 辅助函数：根据分数获取颜色
const getColorForScore = (score: number): string => {
  if (score === -1) return '#9CA3AF'; // 未测试状态 - 灰色
  if (score >= 80) return '#10B981'; // Green
  if (score >= 60) return '#FBBF24'; // Yellow
  return '#EF4444'; // Red
};

// 辅助函数：根据分数获取渐变颜色
const getGradientForScore = (score: number): [string, string] => {
  if (score === -1) return ['#9CA3AF', '#D1D5DB']; // 未测试状态 - 灰色
  if (score >= 80) return ['#10B981', '#34D399']; // Green shades
  if (score >= 60) return ['#FBBF24', '#FCD34D']; // Yellow shades
  return ['#EF4444', '#F87171']; // Red shades
};

// 创新组件：能力卡片
const SkillCard: React.FC<{ label: string; score: number; maxScore: number }> = ({ label, score, maxScore }) => {
  const isUntested = score === -1;
  const percentage = isUntested ? 0 : (score / maxScore) * 100;
  const [color1, color2] = getGradientForScore(score);
  
  return (
    <div className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md">
      <div className="text-sm font-medium text-gray-700 mb-2">{label}</div>
      <div className="relative w-24 h-24 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full" style={{ 
          background: isUntested 
            ? '#F3F4F6' 
            : `conic-gradient(${color1} 0%, ${color2} ${percentage}%, #F3F4F6 ${percentage}%, #F3F4F6 100%)` 
        }}></div>
        <div className="absolute inset-2 rounded-full bg-white flex items-center justify-center">
          <span className="text-xl font-bold" style={{ color: isUntested ? '#6B7280' : color1 }}>
            {isUntested ? 'N/A' : score}
          </span>
        </div>
      </div>
      <div className="mt-2 text-xs text-gray-500">
        {isUntested ? '未测试' : `/ ${maxScore}`}
      </div>
    </div>
  );
};

const KeywordCloud: React.FC<{ 
  keywords?: string[]; // 添加可选的关键词参数
  description?: string; // 改为可选参数
}> = ({ keywords: propKeywords, description }) => {
  const [keywords, setKeywords] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // 初始为true确保加载动画显示
  const [error, setError] = useState<string | null>(null);
  const [minLoadingComplete, setMinLoadingComplete] = useState(false);

  useEffect(() => {
    // 设置最小加载时间，确保加载动画可见
    const minLoadingTimer = setTimeout(() => {
      setMinLoadingComplete(true);
    }, 800);
    
    // 如果有传入的关键词，直接使用
    if (propKeywords && propKeywords.length > 0) {
      setKeywords(propKeywords);
      setLoading(false);
      return () => clearTimeout(minLoadingTimer);
    }
    
    // 如果没有传入关键词，尝试从localStorage获取
    const storedKeywords = localStorage.getItem('resumeKeywords');
    if (storedKeywords) {
      setKeywords(JSON.parse(storedKeywords));
      setLoading(false);
      return () => clearTimeout(minLoadingTimer);
    }
    
    // 如果既没有传入关键词也没有存储的关键词，且有描述内容，则提取关键词
    if (!description) {
      setLoading(false);
      return () => clearTimeout(minLoadingTimer);
    }
    
    setError(null);
    
    const extractKeywords = async () => {
      try {
        // 构建提示词
        const systemPrompt = `你是一个专业的简历分析专家，请严格按以下要求提取关键词：
1. 必须提取10-15个能概括候选人核心能力的关键词
2. 每个关键词限定为2-4个汉字
3. 用中文逗号分隔关键词，不要编号
4. 必须包含技术技能、软技能和工作经历方面的关键词
5. 示例："机器学习, 数据分析, 团队管理"`;
        const userPrompt = `请从以下面试评估报告中提取关键词：${description}`;
        
        // 调用LLM API
        const { data, error: apiError } = await fetchLLMResponse(
          systemPrompt,
          userPrompt,
          'gpt-3.5-turbo',
          0.5
        );
        
        if (apiError) throw new Error(apiError);
        if (!data?.llm_response?.choices?.[0]?.message?.content) {
          throw new Error('未获取到有效的关键词数据');
        }
        
        // 处理返回的关键词
        const rawKeywords = data.llm_response.choices[0].message.content;
        const processedKeywords = rawKeywords
          .split(',')
          .map(k => k.trim().replace(/[^\w\u4e00-\u9fa5]/g, ''))
          .filter(k => k.length > 0 && k.length <= 4);
        
        setKeywords(processedKeywords.slice(0, 8));
      } catch (err) {
        console.error('关键词提取失败:', err);
        setError('关键词提取失败，请重试');
        setKeywords([]);
      } finally {
        setLoading(false);
      }
    };

    extractKeywords();
    
    return () => clearTimeout(minLoadingTimer);
  }, [propKeywords, description]);

  // 生成随机颜色 (更柔和的浅色调)
  const getRandomColor = () => {
    const colors = [
      '#5E72EB', // 柔和的蓝色
      '#FF9190', // 柔和的粉色
      '#4ECDC4', // 青绿色
      '#FFBE0B', // 黄色
      '#9B5DE5', // 紫色
      '#00BBF9', // 天蓝色
      '#00F5D4', // 蓝绿色
      '#F15BB5'  // 玫红色
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // 生成随机字体大小
  const getRandomSize = () => {
    return `${0.9 + Math.random() * 1.3}rem`; // 0.9rem - 2.2rem
  };

  // 生成随机浮动动画 (更平滑)
  const getRandomAnimation = () => {
    const duration = 20 + Math.random() * 20; // 20-40秒
    const delay = Math.random() * 5; // 0-5秒延迟
    return {
      animation: `float ${duration}s infinite ease-in-out`,
      animationDelay: `${delay}s`
    };
  };

  // 科技感加载动画组件
  const TechLoader = () => (
    <div className="relative w-full h-64 flex items-center justify-center">
      <div className="tech-loader">
        <div className="ring"></div>
        <div className="ring"></div>
        <div className="ring"></div>
        <div className="ring"></div>
        <div className="center-dot"></div>
      </div>
      <style jsx>{`
        .tech-loader {
          position: relative;
          width: 80px;
          height: 80px;
        }
        
        .ring {
          position: absolute;
          width: 100%;
          height: 100%;
          border: 2px solid transparent;
          border-radius: 50%;
          animation: rotate 3s linear infinite;
        }
        
        .ring:nth-child(1) {
          border-top-color: #5E72EB;
          animation-duration: 2s;
        }
        
        .ring:nth-child(2) {
          border-right-color: #FF9190;
          animation-duration: 3s;
          animation-direction: reverse;
        }
        
        .ring:nth-child(3) {
          border-bottom-color: #4ECDC4;
          animation-duration: 4s;
        }
        
        .ring:nth-child(4) {
          border-left-color: #FFBE0B;
          animation-duration: 5s;
          animation-direction: reverse;
        }
        
        .center-dot {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 12px;
          height: 12px;
          background: #9B5DE5;
          border-radius: 50%;
          transform: translate(-50%, -50%);
          box-shadow: 0 0 10px rgba(155, 93, 229, 0.8),
                      0 0 20px rgba(155, 93, 229, 0.6);
          animation: pulse 1.5s infinite alternate;
        }
        
        @keyframes rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 0.7; }
          100% { transform: translate(-50%, -50%) scale(1.3); opacity: 1; }
        }
      `}</style>
    </div>
  );

  // 当加载中或最小加载时间未完成时显示加载动画
  if (loading || !minLoadingComplete) {
    return <TechLoader />;
  }

  if (!keywords || keywords.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center text-gray-400">
        未提取到关键词
      </div>
    );
  }

  return (
    <div className="relative w-full h-64 overflow-hidden">
      <style jsx>{`
        @keyframes float {
          0% { 
            transform: translate3d(0, 0, 0) rotate(0deg);
            text-shadow: 0 0 5px rgba(255,255,255,0.2);
          }
          25% { 
            transform: translate3d(5px, 8px, 5px) rotate(3deg);
            text-shadow: 0 0 10px rgba(255,255,255,0.4);
          }
          50% { 
            transform: translate3d(8px, 5px, 0) rotate(0deg);
            text-shadow: 0 0 5px rgba(255,255,255,0.2);
          }
          75% { 
            transform: translate3d(5px, -5px, -5px) rotate(-3deg);
            text-shadow: 0 0 10px rgba(255,255,255,0.4);
          }
          100% { 
            transform: translate3d(0, 0, 0) rotate(0deg);
            text-shadow: 0 0 5px rgba(255,255,255,0.2);
          }
        }
        
        .keyword-item {
          position: absolute;
          transition: opacity 0.3s ease;
          z-index: 1;
          cursor: default;
          user-select: none;
          transform-style: preserve-3d;
          backface-visibility: hidden;
        }
        
        .keyword-item:hover {
          opacity: 1 !important;
          transform: scale(1.15) !important;
          z-index: 10;
          transition: transform 0.2s ease;
        }
      `}</style>
      
      {keywords.map((keyword, index) => {
        // 随机位置 (确保在容器内)
        const top = 10 + Math.random() * 80; // 10%-90%
        const left = 5 + Math.random() * 90; // 5%-95%
        const opacity = 0.7 + Math.random() * 0.3; // 70%-100%透明度
        
        return (
          <div
            key={index}
            className="keyword-item"
            style={{
              top: `${top}%`,
              left: `${left}%`,
              color: getRandomColor(),
              fontSize: getRandomSize(),
              fontWeight: 600,
              opacity: opacity,
              ...getRandomAnimation()
            }}
          >
            {keyword}
          </div>
        );
      })}
      
      {/* 背景网格效果 */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(200, 200, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(200, 200, 255, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }}
      />
    </div>
  );
};



// 评估详情卡片组件
const EvaluationDetails: React.FC<{ evaluation?: Evaluation }> = ({ evaluation }) => {
  if (!evaluation) {
    return (
      <div className="p-6 text-center bg-gray-50 rounded-2xl border border-gray-100">
        <div className="text-gray-400 flex flex-col items-center py-8">
          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mb-4" />
          <p className="text-gray-500">暂无评估数据</p>
        </div>
      </div>
    );
  }

  const allStages = getEvaluationMetrics(evaluation);
  const finalStage = allStages['最终评估'];
  const finalTotalScore = finalStage ? finalStage['总分'] : undefined;
  const otherFinalMetrics = finalStage ? Object.fromEntries(
    Object.entries(finalStage).filter(([key]) => key !== '总分')
  ) : {};

  const otherStages = {
    '自我介绍': allStages['自我介绍'],
    '技术问答': allStages['技术问答'],
    '案例分析': allStages['案例分析'],
  };

  // 准备图表数据
  const chartData = [
    { name: '自我介绍', score: allStages['自我介绍']?.['总分'] || 0 },
    { name: '技术问答', score: allStages['技术问答']?.['总分'] || 0 },
    { name: '案例分析', score: allStages['案例分析']?.['总分'] || 0 },
    { name: '最终评估', score: finalTotalScore || 0 },
  ];

  // 提取能力分数
  const skillScores = Object.entries(otherFinalMetrics).map(([skill, score]) => ({
    skill,
    score
  }));

  return (
    <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200">
      <h3 className="text-xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-200">评估详情</h3>

      {/* 最终评估和能力维度分布 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <h4 className="text-lg font-bold text-indigo-600 mb-5 pb-2 border-b border-indigo-100">综合能力评估</h4>
          
          {finalStage && (
            <div className="flex flex-col items-center">
              {finalTotalScore !== undefined && (
                <div className="mb-8">
                  <div className="text-center mb-4">
                    <span className="text-lg font-bold text-gray-800">最终得分</span>
                    <div className="text-4xl font-bold mt-2" style={{ color: getColorForScore(finalTotalScore) }}>
                      {finalTotalScore}<span className="text-gray-500 text-xl">/100</span>
                    </div>
                  </div>
                  
                  <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{ 
                        width: `${finalTotalScore}%`,
                        background: `linear-gradient(90deg, ${getGradientForScore(finalTotalScore).join(', ')})`
                      }}
                    ></div>
                  </div>
                </div>
              )}
              
              {/* 能力卡片网格 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                {skillScores.map(({ skill, score }) => (
                  <SkillCard key={skill} label={skill} score={score} maxScore={100} />
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <h4 className="text-lg font-bold text-indigo-600 mb-5 pb-2 border-b border-indigo-100">简历内容分析</h4>
          <KeywordCloud  />
        </div>
      </div>

      {/* 各环节评估 */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6">
        <h4 className="text-lg font-bold text-indigo-600 mb-5 pb-2 border-b border-indigo-100">环节表现分析</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {Object.entries(otherStages).map(([stageName, metrics]) => {
            if (metrics) {
              const stageScore = metrics['总分'] || -1;
              const isStageUntested = stageScore === -1;
              
              return (
                <div 
                  key={stageName} 
                  className="p-4 bg-gray-50 rounded-xl border border-gray-200 transition-all duration-300 hover:shadow-md"
                >
                  <div className="flex items-center mb-4">
                    <div className="w-3 h-7 bg-indigo-500 rounded-full mr-3"></div>
                    <h4 className="text-md font-bold text-gray-800">{stageName}</h4>
                    <span className="ml-auto text-lg font-bold" style={{ color: getColorForScore(stageScore) }}>
                      {isStageUntested ? '未测试' : stageScore}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    {Object.entries(metrics).filter(([key]) => key !== '总分').map(([metricLabel, score]) => {
                      const isUntested = score === -1;
                      return (
                        <div key={metricLabel} className="flex items-center">
                          <span className="text-sm text-gray-600 w-24 truncate">{metricLabel}</span>
                          <div className="flex-1 ml-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                            {isUntested ? (
                              <div className="h-full bg-gray-300 rounded-full flex items-center justify-center">
                                <div className="text-[8px] text-gray-500">未测试</div>
                              </div>
                            ) : (
                              <div 
                                className="h-full rounded-full"
                                style={{ 
                                  width: `${score}%`,
                                  background: `linear-gradient(90deg, ${getGradientForScore(score).join(', ')})`
                                }}
                              ></div>
                            )}
                          </div>
                          <span className="ml-2 text-sm font-medium w-8" style={{ color: getColorForScore(score) }}>
                            {isUntested ? 'N/A' : score}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            }
            return null;
          })}
        </div>
      </div>

      {/* 面试官评语 */}
      {evaluation.description && (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <h4 className="text-lg font-bold text-indigo-600 mb-4">面试官评语</h4>
          <div className="relative bg-indigo-50 p-4 rounded-lg border border-indigo-100">
            <div className="absolute -top-2 left-6 w-4 h-4 bg-indigo-50 transform rotate-45 border-t border-l border-indigo-100"></div>
            <p className="text-gray-700 italic">&quot;{evaluation.description}&quot;</p>
          </div>
        </div>
      )}
    </div>
  );
};

// 用户卡片组件
const UserCard: React.FC<{
  userData: UserData;
  isExpanded: boolean;
  onToggleExpand: (userId: string) => void;
}> = ({ userData, isExpanded, onToggleExpand }) => {
  const { user, setting, evaluation } = userData;
  const finalScore = evaluation?.final_total;
  const isUntested = finalScore === undefined || finalScore === -1;
  const [color1] = !isUntested && finalScore ? getGradientForScore(finalScore) : ['#9CA3AF', '#9CA3AF'];

  return (
    <div
      className={`bg-white rounded-2xl overflow-hidden transition-all duration-500 ease-in-out ${
        isExpanded ? 'max-h-[2500px] shadow-xl' : 'max-h-28 shadow-md'
      } mb-6 cursor-pointer hover:shadow-lg`}
      onClick={() => onToggleExpand(user.id)}
    >
      <div className="p-5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white flex justify-between items-center">
        <div className="flex items-center">
          <div className="relative">
            <div className="bg-white/20 rounded-full w-12 h-12 flex items-center justify-center mr-4">
              <span className="text-xl font-bold">{user.name.charAt(0)}</span>
            </div>
            {!isUntested && finalScore !== undefined && (
              <div 
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 border-white"
                style={{ backgroundColor: color1 }}
              >
                {finalScore}
              </div>
            )}
            {isUntested && (
              <div 
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 border-white bg-gray-400"
              >
                ?
              </div>
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold mb-1">{user.name}</h2>
            <p className="text-sm opacity-90">
              面试官: {setting?.interviewer || 'N/A'} | 岗位: {setting?.position || 'N/A'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center">
          <div className="text-3xl transition-transform duration-500">
            {isExpanded ? (
              <div className="bg-white/20 rounded-full w-10 h-10 flex items-center justify-center">
                <span>▲</span>
              </div>
            ) : (
              <div className="bg-white/20 rounded-full w-10 h-10 flex items-center justify-center">
                <span>▼</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        className={`transition-all duration-700 ease-in-out overflow-hidden ${
          isExpanded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
        }`}
      >
        {isExpanded && <EvaluationDetails evaluation={evaluation} />}
      </div>
    </div>
  );
};

// 主页面组件
const HomePage: React.FC = () => {
  const [usersData, setUsersData] = useState<UserData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // 切换卡片展开/折叠状态
  const handleToggleExpand = useCallback((userId: string) => {
    setExpandedUserId(prevId => (prevId === userId ? null : userId));
  }, []);

  // 异步获取数据
  
   useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. 获取所有用户
        const usersResponse = await fetch('/api/databases/query?table=users');
        const usersResult = await usersResponse.json();
        if (!usersResult.success || !Array.isArray(usersResult.data)) {
          throw new Error(usersResult.message || 'Failed to fetch users');
        }
        const users: User[] = usersResult.data;

        // 2. 为每个用户获取设置和评估，并组合数据
        const combinedDataPromises = users.map(async (user) => {
          const settingPromise = fetch(`/api/databases/query?table=settings&id=${user.id}`).then(res => res.json());
          const evaluationPromise = fetch(`/api/databases/query?table=evaluations&id=${user.id}`).then(res => res.json());

          const [settingResult, evaluationResult] = await Promise.all([settingPromise, evaluationPromise]);

          const setting: Setting | undefined = settingResult.success ? settingResult.data : undefined;
          const evaluation: Evaluation | undefined = evaluationResult.success ? evaluationResult.data : undefined;

          const position = setting?.position === '1' ? '人工智能' : setting?.position === '2' ? '大数据' : setting?.position === '3' ? '物联网' : setting?.position === '4' ? '智能系统' : setting?.position;
          if(setting !== undefined ) setting.position = position || '未知岗位';
          return { user, setting, evaluation };
        });

        const combinedData = await Promise.all(combinedDataPromises);
        setUsersData(combinedData);
      } catch (err) {
        console.error('数据获取失败:', err);
        setError(err instanceof Error ? err.message : '未知错误');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // 过滤用户数据
  const filteredUsers = usersData.filter(userData => 
    userData.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (userData.setting?.position.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (userData.setting?.interviewer.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-indigo-500 rounded-full animate-ping"></div>
            </div>
          </div>
          <div className="text-xl font-semibold text-gray-700">加载评估数据中...</div>
          <p className="text-gray-500 mt-2">正在获取候选人评估信息</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-md text-center max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">数据加载失败</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            className="bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-6 rounded-lg transition-colors"
            onClick={() => window.location.reload()}
          >
            重新加载
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-10 mt-2">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              面试评估仪表盘
            </span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            可视化展示候选人面试表现，多维评估助力高效决策
          </p>
        </header>
        
        <div className="bg-white rounded-2xl shadow-sm p-5 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800">候选人评估报告</h2>
              <div className="text-sm text-gray-500 mt-1">
                共 <span className="font-semibold text-indigo-600">{filteredUsers.length}</span> 位候选人
              </div>
            </div>
            
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="搜索候选人、岗位或面试官..."
                className="w-full px-4 py-2 pr-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg 
                className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
        
        {filteredUsers.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {filteredUsers.map((data) => (
              <UserCard
                key={data.user.id}
                userData={data}
                isExpanded={expandedUserId === data.user.id}
                onToggleExpand={handleToggleExpand}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="mx-auto bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full w-24 h-24 flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">未找到匹配的候选人</h3>
            <p className="text-gray-600 max-w-md mx-auto">&quot;没有找到与 &quot;{searchTerm}&quot; 匹配的候选人，请尝试其他搜索词&quot;</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;