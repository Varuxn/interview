import React, { useState, useEffect, useCallback } from 'react';
import CircularProgressBarWithGradient from '../components/CircularProgressBarWithGradient'; // 导入圆形进度条组件

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
    introduction: '自我介绍环节',
    technology: '技术问答环节',
    analysis: '情景案例分析环节',
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

// 评分条组件 (用于非最终评估环节)
const ScoreBar: React.FC<{ label: string; score: number; maxScore: number }> = ({ label, score, maxScore }) => {
  const percentage = (score / maxScore) * 100;
  const barColor = score >= maxScore * 0.8 ? 'bg-green-500' : score >= maxScore * 0.5 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="mb-2">
      <div className="flex justify-between items-center mb-1 text-sm font-medium text-gray-700">
        <span>{label}</span>
        <span>{score} / {maxScore}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`${barColor} h-2.5 rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

// 辅助函数：根据分数获取渐变颜色
const getGradientForScore = (score: number): [string, string] => {
  if (score >= 80) {
    return ['#4CAF50', '#8BC34A']; // Green shades
  } else if (score >= 50) {
    return ['#FFC107', '#FFEB3B']; // Yellow shades
  } else {
    return ['#F44336', '#EF5350']; // Red shades
  }
};

// 评估详情卡片组件
const EvaluationDetails: React.FC<{ evaluation?: Evaluation }> = ({ evaluation }) => {
  if (!evaluation) {
    return <div className="p-4 text-center text-gray-500">暂无评估数据。</div>;
  }

  const allStages = getEvaluationMetrics(evaluation);
  const finalStage = allStages['最终评估'];
  // Separate total score from other final metrics
  const finalTotalScore = finalStage ? finalStage['总分'] : undefined;
  const otherFinalMetrics = finalStage ? Object.fromEntries(
    Object.entries(finalStage).filter(([key]) => key !== '总分')
  ) : {};

  const otherStages = {
    '自我介绍环节': allStages['自我介绍环节'],
    '技术问答环节': allStages['技术问答环节'],
    '情景案例分析环节': allStages['情景案例分析环节'],
  };

  return (
    <div className="p-4 bg-gray-50 rounded-b-lg border-t border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">评估详情</h3>

      {/* Main two-column layout for evaluation metrics */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Left column: Final Evaluation - now with Circular Progress Bars */}
        {finalStage && (
          <div className="md:w-1/2 flex flex-col">
            <div className="p-4 bg-white rounded-lg shadow-md flex-grow">
              <h4 className="text-md font-bold text-indigo-700 mb-3">最终评估</h4>

              {/* Total Score Circle - Full Width */}
              {finalTotalScore !== undefined && (
                <div className="flex flex-col items-center mb-6">
                  <div className="w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center"> {/* Larger size for total */}
                    <CircularProgressBarWithGradient
                      value={finalTotalScore}
                      gradientColors={getGradientForScore(finalTotalScore)}
                    />
                  </div>
                  <span className="mt-2 text-lg font-semibold text-gray-800">总分</span>
                  <span className="text-md text-gray-600">{finalTotalScore} / 100</span>
                </div>
              )}

              {/* Other Final Metrics - Two Columns */}
              {Object.keys(otherFinalMetrics).length > 0 && (
                <div className="grid grid-cols-2 gap-4 justify-items-center mb-6"> {/* Two columns for other metrics */}
                  {Object.entries(otherFinalMetrics).map(([metricLabel, score]) => (
                    <div key={metricLabel} className="flex flex-col items-center text-center">
                      <div className="w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center"> {/* Smaller size for individual metrics */}
                        <CircularProgressBarWithGradient
                          value={score as number}
                          gradientColors={getGradientForScore(score as number)}
                        />
                      </div>
                      <span className="mt-2 text-sm font-medium text-gray-700">{metricLabel}</span>
                      <span className="text-xs text-gray-500">{score as number} / 100</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Description section - moved here, full width within final evaluation card */}
              {evaluation.description && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg shadow-sm border border-gray-200">
                  <p className="text-sm text-gray-600"><strong>描述:</strong> {evaluation.description}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Right column: Other three stages - remains with ScoreBar */}
        <div className="md:w-1/2 flex flex-col gap-4">
          {Object.entries(otherStages).map(([stageName, metrics]) => {
            if (metrics) {
              return (
                <div key={stageName} className="p-4 bg-white rounded-lg shadow-md">
                  <h4 className="text-md font-bold text-indigo-700 mb-3">{stageName}</h4>
                  {Object.entries(metrics).map(([metricLabel, score]) => (
                    <ScoreBar key={metricLabel} label={metricLabel} score={score} maxScore={100} />
                  ))}
                </div>
              );
            }
            return null;
          })}
        </div>
      </div>

      {(!finalStage && Object.keys(otherStages).every(key => !otherStages[key as keyof typeof otherStages])) && (
        <p className="text-center text-gray-500 mt-4">没有找到详细的评估指标。</p>
      )}
    </div>
  );
};

// 用户卡片组件 (保持不变，因为它只是容器)
const UserCard: React.FC<{
  userData: UserData;
  isExpanded: boolean;
  onToggleExpand: (userId: string) => void;
}> = ({ userData, isExpanded, onToggleExpand }) => {
  const { user, setting, evaluation } = userData;

  return (
    <div
      className={`bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-500 ease-in-out ${
        isExpanded ? 'max-h-[2000px]' : 'max-h-40' // Increased max-h to accommodate more content
      } mb-6 cursor-pointer hover:shadow-xl transform hover:-translate-y-1`}
      onClick={() => onToggleExpand(user.id)}
    >
      <div className="p-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white flex justify-between items-center rounded-t-lg">
        <div>
          <h2 className="text-2xl font-bold mb-1">{user.name}</h2>
          <p className="text-sm opacity-90">
            面试官: {setting?.interviewer || 'N/A'} | 岗位: {setting?.position || 'N/A'}
          </p>
        </div>
        <div className="text-4xl">
          {isExpanded ? '▲' : '▼'}
        </div>
      </div>

      <div
        className={`transition-all duration-500 ease-in-out overflow-hidden ${
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
  }, []); // 仅在组件挂载时运行一次

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="text-xl font-semibold text-gray-700">加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="text-red-600 text-lg">错误: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-inter">
      <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-10">用户面试评估仪表盘</h1>
      <div className="max-w-4xl mx-auto">
        {usersData.length > 0 ? (
          usersData.map((data) => (
            <UserCard
              key={data.user.id}
              userData={data}
              isExpanded={expandedUserId === data.user.id}
              onToggleExpand={handleToggleExpand}
            />
          ))
        ) : (
          <div className="text-center text-gray-600 text-lg">没有找到用户数据。</div>
        )}
      </div>
    </div>
  );
};

export default HomePage;

// Tailwind CSS 配置 (通常在 tailwind.config.js 中，这里为演示目的假设已加载)
// <script src="https://cdn.tailwindcss.com"></script>
// <style>
//   @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
//   body {
//     font-family: 'Inter', sans-serif;
//   }
// </style>
