import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchLLMResponse } from './llmApi';
import { FullEvaluationData } from '../components/types';

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

// 组合后的用户数据接口
interface UserData {
  user: User;
  setting?: Setting;
  evaluation?: FullEvaluationData;
  resumeSetupData?: {
    fullName?: string; // 添加 fullName
    email?: string;
    phone?: string;
    selectedSkills?: string[];
    position?: {
      name?: string;
    };
    interviewer?: {
      name?: string;
    };
  };
}
// 评估指标的类型定义
type MetricKey = 'expertise' | 'proficiency' | 'articulation' | 'reasoning' | 'innovation' | 'resilience' | 'total';
type StageKey = 'introduction' | 'technology' | 'analysis' | 'final';

// 辅助函数：将评估数据按阶段和指标分组
const getEvaluationMetrics = (evaluation: FullEvaluationData) => {
  const stages: { [key: string]: { [key: string]: number } } = {};
  const metricNames: { [key: string]: string } = {
    expertise: '专业知识',
    proficiency: '技能匹配度',
    articulation: '语言表达能力',
    reasoning: '逻辑思维能力',
    innovation: '创新能力',
    resilience: '应变抗压能力',
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
    (['expertise', 'proficiency', 'articulation', 'reasoning', 'innovation', 'resilience'] as MetricKey[]).forEach(metric => {
      const key = `${stage}_${metric}` as keyof FullEvaluationData;
      if (evaluation[key] !== undefined) {
        stageMetrics[metricNames[metric]] = evaluation[key] as number;
      }
    });

    // Add the total score for the stage if it exists
    const totalKey = `${stage}_total` as keyof FullEvaluationData;
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

// 关键词云组件
const KeywordCloud: React.FC<{
  userId?: string;
}> = ({ userId }) => {
  const [keywords, setKeywords] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchKeywords = () => {
      try {
        setLoading(true);
        
        // 1. 尝试从localStorage获取用户数据
        const userDataKey = "userdata";
        const allUserDataJSON = localStorage.getItem(userDataKey);
        
        if (!allUserDataJSON) {
          throw new Error('未找到用户数据');
        }
        
        const allUserData = JSON.parse(allUserDataJSON);
        
        // 2. 获取特定用户的关键词
        if (userId && allUserData[userId]) {
          const userKeywords = allUserData[userId].resumeKeywords || [];
          const count = Math.min(userKeywords.length, 9);
          setKeywords(userKeywords.slice(0, count));
        } else {
          throw new Error('未找到该用户的关键词数据');
        }
      } catch (err) {
        console.error('关键词获取失败:', err);
        setError(err instanceof Error ? err.message : '未知错误');
      } finally {
        setLoading(false);
      }
    };

    fetchKeywords();
  }, [userId]);
  
  const positionedKeywords = useMemo(() => {
    const numKeywords = keywords.length;
    if (numKeywords === 0) return [];
    
    const radius = 160;
    const angleStep = (2 * Math.PI) / numKeywords;
    
    return keywords.map((keyword, index) => {
      const angle = index * angleStep;
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);
      
      return {
        keyword,
        style: {
          '--x': `${x}px`,
          '--y': `${y}px`,
          '--delay': `${index * 0.15}s`,
          '--float-delay': `${Math.random() * 4}s`,
          '--float-duration': `${3 + Math.random() * 3}s`,
        } as React.CSSProperties,
      };
    });
  }, [keywords]);

  return (
    <div className="keyword-container">
      {/* 中央圆形UI元素 */}
      <div className="center-circle">
        <div className="circle-inner">
          <svg className="cloud-icon" viewBox="0 0 24 24">
            <path d="M6.5 20C3.46 20 1 17.54 1 14.5C1 11.72 3.06 9.5 5.75 9.5C6.38 9.5 6.98 9.62 7.53 9.84C8.68 6.96 11.5 5 14.75 5C18.48 5 21.5 8.02 21.5 11.75C21.5 12.74 21.3 13.69 20.94 14.56C22.27 15.31 23 16.76 23 18.5C23 20.98 20.98 23 18.5 23H6.5Z" />
          </svg>
          <div className="circle-text">关键能力</div>
        </div>
      </div>
      
      {/* 关键词云 */}
      {!error && keywords.length > 0 && positionedKeywords.map(({ keyword, style }, index) => (
        <div 
          key={index} 
          className="keyword-item"
          style={{
            ...style,
            opacity: loading ? 0 : 1,
            animation: loading 
              ? 'none' 
              : `appear 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards var(--delay),
                 float-opacity var(--float-duration, 4s) ease-in-out infinite var(--float-delay)`
          }}
        >
          <span className="keyword-text">
            {keyword}
          </span>
        </div>
      ))}
      
      {/* 错误信息 */}
      {error && <div className="message-display error-message">{error}</div>}
      {!error && keywords.length === 0 && !loading && (
        <div className="message-display">未能提取到关键词或无分析内容。</div>
      )}

      <style jsx>{`
        .keyword-container {
          position: relative;
          width: 100%;
          min-height: 450px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background: radial-gradient(
            circle at center,
            rgba(255, 255, 255, 0.8) 0%,
            rgba(245, 248, 255, 0.9) 100%
          );
          border-radius: 20px;
          box-shadow: 
            0 15px 35px rgba(94, 114, 235, 0.15),
            inset 0 0 20px rgba(255, 255, 255, 0.6);
        }
        
        /* 中央圆形UI设计 */
        .center-circle {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 180px;
          height: 180px;
          border-radius: 50%;
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.95) 0%,
            rgba(240, 249, 255, 0.95) 100%
          );
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 
            0 10px 30px rgba(94, 114, 235, 0.2),
            inset 0 0 20px rgba(255, 255, 255, 0.8),
            inset 0 0 10px rgba(155, 93, 229, 0.1);
          z-index: 2;
          backdrop-filter: blur(8px);
          border: 1px solid rgba(219, 234, 254, 0.7);
        }
        
        .circle-inner {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }
        
        .cloud-icon {
          width: 60px;
          height: 60px;
          fill: #5E72EB;
          filter: drop-shadow(0 2px 5px rgba(94, 114, 235, 0.3));
        }
        
        .circle-text {
          color: #5E72EB;
          font-size: 1.3rem;
          font-weight: 600;
          letter-spacing: 1px;
          text-shadow: 0 1px 2px rgba(94, 114, 235, 0.2);
        }
        
        /* 关键词样式 */
        .keyword-item {
          position: absolute; 
          top: 50%; 
          left: 50%;
          transform: translate(-50%, -50%) translate(var(--x, 0), var(--y, 0));
          will-change: transform, opacity;
          z-index: 3;
          transition: transform 0.3s ease;
        }

        @keyframes appear {
          from {
            opacity: 0;
            transform: translate(-50%, -50%) translate(0, 0) scale(0.5);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) translate(var(--x, 0), var(--y, 0)) scale(1);
          }
        }
        
        @keyframes float-opacity {
          0%, 100% {
            opacity: 1;
            transform: translate(-50%, -50%) translate(var(--x, 0), var(--y, 0)) scale(1);
          }
          50% {
            opacity: 0.85;
            transform: translate(-50%, -50%) translate(calc(var(--x, 0) + 2px), calc(var(--y, 0) + 2px)) scale(1.02);
          }
        }
        
        .keyword-text {
          color: #1e3a8a;
          font-size: 1.1rem;
          font-weight: 500;
          padding: 10px 18px;
          background: linear-gradient(145deg, rgba(240, 249, 255, 0.95), rgba(224, 242, 254, 0.95));
          backdrop-filter: blur(4px);
          border: 1px solid #dbeafe;
          border-radius: 50px;
          box-shadow: 
            0 4px 12px rgba(59, 130, 246, 0.15),
            0 2px 4px rgba(255, 255, 255, 0.5) inset;
          cursor: default;
          transition: all 0.3s ease;
          display: block;
          min-width: 80px;
          text-align: center;
        }

        .keyword-text:hover {
          transform: scale(1.12);
          background: linear-gradient(145deg, rgba(224, 242, 254, 0.98), rgba(186, 230, 253, 0.98));
          box-shadow: 
            0 6px 20px rgba(59, 130, 246, 0.25),
            0 2px 4px rgba(255, 255, 255, 0.5) inset;
          z-index: 10;
        }

        .message-display {
          text-align: center;
          padding: 20px;
          color: #374151;
          font-size: 1.1rem;
          max-width: 80%;
          margin: 0 auto;
          z-index: 10;
          position: relative;
        }

        .error-message { 
          color: #ef4444; 
          font-weight: 500; 
        }
      `}</style>
    </div>
  );
};


// 评估详情卡片组件
const EvaluationDetails: React.FC<{ 
  evaluation?: FullEvaluationData;
  userId?: string;
}> = ({ evaluation, userId }) => {
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h4 className="text-base font-semibold text-indigo-600 mb-3 pb-1 border-b border-indigo-100">综合能力评估</h4>
          
          {finalStage && (
            <div className="flex flex-col items-center justify-center flex-grow"> 
              {/* Final score section with original progress bar height */}
              <div className="mt-2 mb-4">
                {finalTotalScore !== undefined && (
                  <div className="flex flex-col items-center">
                    <div className="text-center">
                      <span className="text-lg font-bold text-gray-800">最终得分</span>
                      <div 
                        className="text-3xl font-bold mt-1"
                        style={{ color: getColorForScore(finalTotalScore) }}
                      >
                        {finalTotalScore}<span className="text-gray-500 text-lg">/100</span>
                      </div>
                    </div>
                    
                    {/* Progress bar with original h-4 height */}
                    <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden mt-2">
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
              </div>
              
              {/* Compact skill cards grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {skillScores.map(({ skill, score }) => (
                  <SkillCard 
                    key={skill} 
                    label={skill} 
                    score={score} 
                    maxScore={100}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h4 className="text-base font-semibold text-indigo-600 mb-3 pb-1 border-b border-indigo-100">简历内容分析</h4>
          <KeywordCloud userId={userId} />
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
  const { user, setting, evaluation, resumeSetupData } = userData;
  const finalScore = evaluation?.final_total;
  const isUntested = finalScore === undefined || finalScore === -1;
  const [color1] = !isUntested && finalScore ? getGradientForScore(finalScore) : ['#9CA3AF', '#9CA3AF'];
  const fullName = resumeSetupData?.fullName || user.name;

  // 获取关键信息用于标签展示
  const positionName = resumeSetupData?.position?.name || setting?.position || '未知岗位';
  const interviewerName = resumeSetupData?.interviewer?.name || setting?.interviewer || '未知面试官';
  const email = resumeSetupData?.email || '未提供';
  const phone = resumeSetupData?.phone || '未提供';
  const skills = resumeSetupData?.selectedSkills?.slice(0, 3) || []; // 最多展示3个技能4
  

  return (
    <div
      className={`bg-white rounded-2xl overflow-hidden transition-all duration-500 ease-in-out ${
        isExpanded ? 'max-h-[2500px] shadow-xl' : 'max-h-40 shadow-md'
      } mb-6 cursor-pointer hover:shadow-lg`}
      onClick={() => onToggleExpand(user.id)}
    >
      <div className="p-5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white flex justify-between items-start">
        <div className="flex items-start">
          <div className="relative">
            <div className="bg-white/20 rounded-full w-12 h-12 flex items-center justify-center mr-4">
              <span className="text-xl font-bold">{fullName.charAt(0)}</span>
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
            {/* 这里展示用户名字而不是ID */}
            <h2 className="text-xl font-bold mb-1">{fullName}</h2>
            
            {/* 折叠状态下展示的标签信息 */}
            <div className="flex flex-wrap gap-2 mt-2 max-w-lg">
              {/* 用户ID标签 - 新添加 */}
              <div className="bg-white/20 rounded-full px-3 py-1 text-xs flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                </svg>
                ID: {user.id.substring(0,6)}...
              </div>
              
              <div className="bg-white/20 rounded-full px-3 py-1 text-xs flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {positionName}
              </div>
              
              <div className="bg-white/20 rounded-full px-3 py-1 text-xs flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {interviewerName}
              </div>
              
              <div className="bg-white/20 rounded-full px-3 py-1 text-xs flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {email}
              </div>
              
              <div className="bg-white/20 rounded-full px-3 py-1 text-xs flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {phone}
              </div>
              
              {skills.map((skill, index) => (
                <div key={index} className="bg-white/20 rounded-full px-3 py-1 text-xs flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  {skill}
                </div>
              ))}
            </div>
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
        {isExpanded && <EvaluationDetails evaluation={evaluation} userId={user.id} />}
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
          const evaluation: FullEvaluationData | undefined = evaluationResult.success ? evaluationResult.data : undefined;

          const position = setting?.position === '1' ? '人工智能' : setting?.position === '2' ? '大数据' : setting?.position === '3' ? '物联网' : setting?.position === '4' ? '智能系统' : setting?.position;
          if(setting !== undefined ) setting.position = position || '未知岗位';

          // 3. 从localStorage获取用户简历设置数据
          let resumeSetupData = null;
          try {
            const userDataKey = "userdata";
            const allUserDataJSON = localStorage.getItem(userDataKey);
            if (allUserDataJSON) {
              const allUserData = JSON.parse(allUserDataJSON);
              resumeSetupData = allUserData[user.id]?.resumeSetupData;
            }
          } catch (err) {
            console.error('从localStorage获取用户数据失败:', err);
          }

          return { user, setting, evaluation, resumeSetupData };
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
  const filteredUsers = usersData.filter(userData => {
    // 获取关键信息用于搜索
    const fullName = userData.resumeSetupData?.fullName || '';
    const positionName = userData.resumeSetupData?.position?.name || userData.setting?.position || '';
    const interviewerName = userData.resumeSetupData?.interviewer?.name || userData.setting?.interviewer || '';
    const userName = userData.user.name || '';
    
    // 将所有搜索字段转换为小写
    const searchLower = searchTerm.toLowerCase();
    
    return (
      positionName.toLowerCase().includes(searchLower) ||
      interviewerName.toLowerCase().includes(searchLower) ||
      userName.toLowerCase().includes(searchLower) ||
      fullName.toLowerCase().includes(searchLower)
    );
  });

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