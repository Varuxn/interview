import React, { useState, useEffect, useCallback } from 'react';

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
  if (score >= 80) return '#10B981'; // Green
  if (score >= 60) return '#FBBF24'; // Yellow
  return '#EF4444'; // Red
};

// 辅助函数：根据分数获取渐变颜色
const getGradientForScore = (score: number): [string, string] => {
  if (score >= 80) return ['#10B981', '#34D399']; // Green shades
  if (score >= 60) return ['#FBBF24', '#FCD34D']; // Yellow shades
  return ['#EF4444', '#F87171']; // Red shades
};

// 创新组件：能力雷达图
const SkillRadarChart: React.FC<{ metrics: { [key: string]: number } }> = ({ metrics }) => {
  const skills = Object.entries(metrics).filter(([key]) => key !== '总分');
  const maxScore = 100;
  
  return (
    <div className="relative w-full h-64 flex items-center justify-center">
      <div className="absolute inset-0 flex items-center justify-center">
        {/* 雷达网格 */}
        {[0.25, 0.5, 0.75, 1].map((scale, idx) => (
          <div 
            key={idx}
            className="absolute border border-gray-200 rounded-full"
            style={{ 
              width: `${scale * 100}%`, 
              height: `${scale * 100}%`,
              opacity: 0.5 - (idx * 0.1)
            }}
          />
        ))}
        
        {/* 雷达轴线 */}
        {skills.map((_, i) => {
          const angle = (i * 2 * Math.PI) / skills.length - Math.PI / 2;
          return (
            <div
              key={`line-${i}`}
              className="absolute w-0.5 h-full bg-gray-200 transform origin-bottom"
              style={{ 
                transform: `rotate(${angle}rad)`,
                left: '50%',
                top: '50%',
                marginLeft: '-0.25px',
                marginTop: '-50%'
              }}
            />
          );
        })}
        
        {/* 雷达数据点 */}
        <div className="absolute w-full h-full">
          {skills.map(([skill, score], i) => {
            const angle = (i * 2 * Math.PI) / skills.length - Math.PI / 2;
            const radius = (score / maxScore) * 50;
            const x = 50 + radius * Math.cos(angle);
            const y = 50 + radius * Math.sin(angle);
            
            return (
              <div
                key={skill}
                className="absolute w-3 h-3 rounded-full transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  backgroundColor: getColorForScore(score)
                }}
              >
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-700 whitespace-nowrap">
                  {skill}
                </div>
              </div>
            );
          })}
          
          {/* 雷达多边形 */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
            <polygon
              points={skills.map((_, i) => {
                const angle = (i * 2 * Math.PI) / skills.length - Math.PI / 2;
                const radius = (skills[i][1] / maxScore) * 50;
                const x = 50 + radius * Math.cos(angle);
                const y = 50 + radius * Math.sin(angle);
                return `${x},${y}`;
              }).join(' ')}
              fill="rgba(79, 70, 229, 0.2)"
              stroke="#4F46E5"
              strokeWidth="0.5"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

// 创新组件：能力卡片
const SkillCard: React.FC<{ label: string; score: number; maxScore: number }> = ({ label, score, maxScore }) => {
  const percentage = (score / maxScore) * 100;
  const [color1, color2] = getGradientForScore(score);
  
  return (
    <div className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md">
      <div className="text-sm font-medium text-gray-700 mb-2">{label}</div>
      <div className="relative w-24 h-24 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full" style={{ 
          background: `conic-gradient(${color1} 0%, ${color2} ${percentage}%, #F3F4F6 ${percentage}%, #F3F4F6 100%)` 
        }}></div>
        <div className="absolute inset-2 rounded-full bg-white flex items-center justify-center">
          <span className="text-xl font-bold" style={{ color: color1 }}>{score}</span>
        </div>
      </div>
      <div className="mt-2 text-xs text-gray-500">/ {maxScore}</div>
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

      {/* 最终评估和能力雷达图 */}
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
          <h4 className="text-lg font-bold text-indigo-600 mb-5 pb-2 border-b border-indigo-100">能力维度分布</h4>
          <SkillRadarChart metrics={otherFinalMetrics} />
        </div>
      </div>

      {/* 各环节评估 */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6">
        <h4 className="text-lg font-bold text-indigo-600 mb-5 pb-2 border-b border-indigo-100">环节表现分析</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {Object.entries(otherStages).map(([stageName, metrics]) => {
            if (metrics) {
              return (
                <div 
                  key={stageName} 
                  className="p-4 bg-gray-50 rounded-xl border border-gray-200 transition-all duration-300 hover:shadow-md"
                >
                  <div className="flex items-center mb-4">
                    <div className="w-3 h-7 bg-indigo-500 rounded-full mr-3"></div>
                    <h4 className="text-md font-bold text-gray-800">{stageName}</h4>
                    <span className="ml-auto text-lg font-bold" style={{ color: getColorForScore(metrics['总分'] || 0) }}>
                      {metrics['总分'] || 0}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    {Object.entries(metrics).filter(([key]) => key !== '总分').map(([metricLabel, score]) => (
                      <div key={metricLabel} className="flex items-center">
                        <span className="text-sm text-gray-600 w-24 truncate">{metricLabel}</span>
                        <div className="flex-1 ml-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full"
                            style={{ 
                              width: `${score}%`,
                              background: `linear-gradient(90deg, ${getGradientForScore(score).join(', ')})`
                            }}
                          ></div>
                        </div>
                        <span className="ml-2 text-sm font-medium w-8" style={{ color: getColorForScore(score) }}>
                          {score}
                        </span>
                      </div>
                    ))}
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
  const [color1] = finalScore ? getGradientForScore(finalScore) : ['#4F46E5', '#4F46E5'];

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
            {finalScore !== undefined && (
              <div 
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 border-white"
                style={{ backgroundColor: color1 }}
              >
                {finalScore}
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

        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 模拟数据
        const mockUsersData: UserData[] = [
          {
            user: { id: '1', name: '张三' },
            setting: { id: '1', interviewer: '李经理', position: '前端工程师' },
            evaluation: {
              user_id: '1',
              description: '候选人技术基础扎实，沟通能力良好，但在复杂场景分析上需要加强。',
              introduction_language: 85,
              introduction_profession: 78,
              introduction_logic: 75,
              introduction_expressiveness: 82,
              introduction_total: 80,
              technology_language: 88,
              technology_profession: 92,
              technology_logic: 85,
              technology_expressiveness: 80,
              technology_total: 86,
              analysis_language: 75,
              analysis_profession: 70,
              analysis_logic: 65,
              analysis_expressiveness: 72,
              analysis_total: 70,
              final_language: 83,
              final_profession: 80,
              final_logic: 75,
              final_expressiveness: 78,
              final_total: 79
            }
          },
          {
            user: { id: '2', name: '李四' },
            setting: { id: '2', interviewer: '王总监', position: '产品经理' },
            evaluation: {
              user_id: '2',
              description: '候选人产品思维优秀，用户需求理解深刻，技术理解稍显不足。',
              introduction_language: 90,
              introduction_profession: 85,
              introduction_logic: 88,
              introduction_expressiveness: 92,
              introduction_total: 89,
              technology_language: 78,
              technology_profession: 75,
              technology_logic: 80,
              technology_expressiveness: 85,
              technology_total: 80,
              analysis_language: 92,
              analysis_profession: 88,
              analysis_logic: 90,
              analysis_expressiveness: 85,
              analysis_total: 89,
              final_language: 87,
              final_profession: 83,
              final_logic: 86,
              final_expressiveness: 87,
              final_total: 86
            }
          },
          {
            user: { id: '3', name: '王五' },
            setting: { id: '3', interviewer: '赵主管', position: '后端开发' },
            evaluation: {
              user_id: '3',
              description: '候选人算法能力突出，系统设计经验丰富，沟通表达需要提升。',
              introduction_language: 70,
              introduction_profession: 85,
              introduction_logic: 88,
              introduction_expressiveness: 68,
              introduction_total: 78,
              technology_language: 75,
              technology_profession: 92,
              technology_logic: 90,
              technology_expressiveness: 72,
              technology_total: 82,
              analysis_language: 78,
              analysis_profession: 90,
              analysis_logic: 88,
              analysis_expressiveness: 75,
              analysis_total: 83,
              final_language: 74,
              final_profession: 89,
              final_logic: 89,
              final_expressiveness: 72,
              final_total: 81
            }
          }
        ];

        setUsersData(mockUsersData);
      } catch (err) {
        console.error('数据获取失败:', err);
        setError('数据加载失败，请稍后重试');
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