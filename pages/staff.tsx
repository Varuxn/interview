import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from "@clerk/nextjs";
import { FiAward, FiBarChart2, FiChevronRight, FiAlertTriangle } from 'react-icons/fi';
import CircularProgressBarWithGradient from '../components/CircularProgressBarWithGradient';
import Card from '../components/Card';
import RadarChart from '../components/RadarChart';
import styles from '../styles/Dashboard.module.css';

// --- Interfaces ---
interface EvaluationScores {
  language: number;
  profession: number;
  logic: number;
  expressiveness: number;
  total: number;
}

interface FullEvaluationData {
  user_id: string;
  description?: string;
  introduction_language?: number;
  introduction_profession?: number;
  introduction_logic?: number;
  introduction_expressiveness?: number;
  introduction_total?: number;
  technology_language?: number;
  technology_profession?: number;
  technology_logic?: number;
  technology_expressiveness?: number;
  technology_total?: number;
  analysis_language?: number;
  analysis_profession?: number;
  analysis_logic?: number;
  analysis_expressiveness?: number;
  analysis_total?: number;
  final_language?: number;
  final_profession?: number;
  final_logic?: number;
  final_expressiveness?: number;
  final_total?: number;
}

interface QueryResponse<T> {
  success: boolean;
  message: string;
  data: T | T[] | null;
}

// 更新 StageCardProps 接口，添加 compact 属性
interface StageCardProps {
  title: string;
  stageKey: 'introduction' | 'technology' | 'analysis';
  scores: EvaluationScores | '未测试';
  onNavigate: (stage: string) => void;
  compact?: boolean;
}

// --- 更新渐变颜色方案 ---
const totalScoreGradientColors = {
  high: ['#22c55e', '#86efac'],
  mid: ['#f59e0b', '#fde68a'],
  low: ['#ef4444', '#fca5a5'],
};

// --- 辅助函数 ---
const getGradientForScore = (score: number): string[] => {
  if (score >= 80) return totalScoreGradientColors.high;
  if (score >= 60) return totalScoreGradientColors.mid;
  return totalScoreGradientColors.low;
};

// 进度条组件 - 修复返回类型
const ProgressBar: React.FC<{ 
  label: string; 
  value: number; 
  color: string;
  showValue?: boolean;
  compact?: boolean;
}> = ({ label, value, color, showValue = true, compact = false }) => {
  return (
    <div className={`${styles.progressBarContainer} ${compact ? styles.compactProgressBar : ''}`}>
      <div className={styles.progressBarHeader}>
        <span className={styles.progressBarLabel}>{label}</span>
        {showValue && <span className={styles.progressBarValue}>{value}</span>}
      </div>
      <div className={styles.progressBarBackground}>
        <div 
          className={styles.progressBarFill}
          style={{ 
            width: `${value}%`,
            background: color
          }}
        ></div>
      </div>
    </div>
  );
};

// --- 阶段卡片组件 (紧凑版) - 修复返回类型 ---
const StageCard: React.FC<StageCardProps> = ({ title, stageKey, scores, onNavigate, compact = false }) => {
  const isTested = typeof scores !== 'string';
  const scoreColors = {
    language: '#3b82f6',
    profession: '#8b5cf6',
    logic: '#f97316',
    expressiveness: '#14b8a6'
  };

  return (
    <Card className={`${styles.stageCard} ${isTested ? styles.testedCard : styles.untestedCard} ${compact ? styles.compactStageCard : ''}`}>
      <div className={styles.stageCardHeader}>
        <h3 className={styles.stageTitle}>{title}</h3>
        {isTested && (
          <div className={styles.stageTotalScoreBadge} style={{ 
            background: `linear-gradient(135deg, ${getGradientForScore(scores.total)[0]}, ${getGradientForScore(scores.total)[1]})`
          }}>
            {scores.total}
          </div>
        )}
      </div>
      
      <div className={styles.stageCardBody}>
        {isTested ? (
          <div className={styles.stageSkills}>
            <ProgressBar 
              label="语言" 
              value={scores.language} 
              color={scoreColors.language} 
              showValue={true}
              compact={compact}
            />
            <ProgressBar 
              label="专业" 
              value={scores.profession} 
              color={scoreColors.profession} 
              showValue={true}
              compact={compact}
            />
            <ProgressBar 
              label="逻辑" 
              value={scores.logic} 
              color={scoreColors.logic} 
              showValue={true}
              compact={compact}
            />
            <ProgressBar 
              label="表现" 
              value={scores.expressiveness} 
              color={scoreColors.expressiveness} 
              showValue={true}
              compact={compact}
            />
          </div>
        ) : (
          <div className={styles.notTestedContainer}>
            <div className={styles.emptyStateIcon}>📊</div>
            <p className={styles.notTestedText}>尚未测试</p>
          </div>
        )}
      </div>
      
      <button 
        className={`${styles.demoButton} ${isTested ? styles.retestButton : styles.startButton} ${compact ? styles.compactButton : ''}`}
        onClick={() => onNavigate(stageKey)}
      >
        {isTested ? '重测' : '开始'}
        <FiChevronRight className={styles.buttonIcon} />
      </button>
    </Card>
  );
};

// --- 主仪表盘组件 ---
const MainDashboard: React.FC = () => {
  const router = useRouter();
  const { userId, isLoaded } = useAuth();
  const [evaluationData, setEvaluationData] = useState<FullEvaluationData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // --- 数据获取逻辑 ---
  const fetchEvaluationData = useCallback(async () => {
    if (!isLoaded || !userId) {
        return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/databases/query?table=evaluations&user_id=${userId}`);
      if (!response.ok) throw new Error(`Network response was not ok: ${response.statusText}`);
      const result: QueryResponse<FullEvaluationData> = await response.json();
      if (result.success && result.data) {
        setEvaluationData(Array.isArray(result.data) ? result.data[0] || null : result.data);
      } else {
        setError(result.message || 'Failed to fetch evaluation data.');
        setEvaluationData(null);
      }
    } catch (err) {
      console.error('Error fetching evaluation data:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }, [userId, isLoaded]);

  useEffect(() => {
    fetchEvaluationData();
  }, [fetchEvaluationData]);

  // --- 导航逻辑 ---
  const navigateToDemo = (stage: string) => {
    router.push({ pathname: '/demo', query: { stage } });
  };

  // --- 分数计算逻辑 ---
  const getStageScores = (stagePrefix: 'introduction' | 'technology' | 'analysis' | 'final'): EvaluationScores | '未测试' => {
    if (!evaluationData) return '未测试';
    
    const scores: EvaluationScores = {
      language: (evaluationData as any)[`${stagePrefix}_language`] ?? 0,
      profession: (evaluationData as any)[`${stagePrefix}_profession`] ?? 0,
      logic: (evaluationData as any)[`${stagePrefix}_logic`] ?? 0,
      expressiveness: (evaluationData as any)[`${stagePrefix}_expressiveness`] ?? 0,
      total: (evaluationData as any)[`${stagePrefix}_total`] ?? 0,
    };
    
    const isTested = Object.values(scores).every(score => 
      score !== undefined && score !== null && score !== -1 && score > 0
    );
    
    return isTested ? scores : '未测试';
  };

  // --- 加载状态UI ---
  if (loading) {
    return (
      <div className={styles.stateContainer}>
        <div className={styles.loaderContainer}>
          <div className={styles.loaderSpinner}></div>
          <p>正在加载您的评估报告...</p>
        </div>
      </div>
    );
  }

  // --- 错误状态UI ---
  if (error) {
    return (
      <div className={styles.stateContainer}>
        <div className={styles.errorContainer}>
          <FiAlertTriangle className={styles.errorIcon} />
          <p className={styles.errorTitle}>加载评估数据失败</p>
          <p className={styles.errorMessage}>{error}</p>
          <button onClick={fetchEvaluationData} className={styles.retryButton}>
            重试
          </button>
        </div>
      </div>
    );
  }

  // 获取各阶段分数
  const finalScores = getStageScores('final');
  const introductionScores = getStageScores('introduction');
  const technologyScores = getStageScores('technology');
  const analysisScores = getStageScores('analysis');

  // 雷达图数据 (放在分数获取之后)
  const radarData = [
    { 
      subject: '自我介绍', 
      A: introductionScores !== '未测试' ? introductionScores.total : 0,
      fullMark: 100 
    },
    { 
      subject: '技术问答', 
      A: technologyScores !== '未测试' ? technologyScores.total : 0,
      fullMark: 100 
    },
    { 
      subject: '情景分析', 
      A: analysisScores !== '未测试' ? analysisScores.total : 0,
      fullMark: 100 
    },
    { 
      subject: '语言表达', 
      A: finalScores !== '未测试' ? finalScores.language : 0,
      fullMark: 100 
    },
    { 
      subject: '专业能力', 
      A: finalScores !== '未测试' ? finalScores.profession : 0,
      fullMark: 100 
    },
    { 
      subject: '逻辑思维', 
      A: finalScores !== '未测试' ? finalScores.logic : 0,
      fullMark: 100 
    },
    { 
      subject: '表现力', 
      A: finalScores !== '未测试' ? finalScores.expressiveness : 0,
      fullMark: 100 
    },
  ];

  // 最终评估部分的技能颜色
  const skillColors = {
    language: '#3B82F6',
    profession: '#8B5CF6',
    logic: '#F97316',
    expressiveness: '#14B8A6'
  };

  return (
    <div className={styles.dashboardContainer}>
      <header className={styles.header}>
        <h1 className={styles.title}>面试评估总览</h1>
        <p className={styles.subtitle}>全面分析您在面试各环节中的能力表现</p>
        <div className={styles.headerDivider}></div>
      </header>

      <main className={styles.mainGrid}>
        {/* --- 第一行: 最终评分和阶段卡片 --- */}
        <div className={styles.row1}>
          {/* 最终评估卡片 */}
          <section className={styles.finalScoreSection}>
            <Card className={styles.finalScoreCard}>
              <div className={styles.finalScoreHeader}>
                <div className={styles.headerIcon}>
                  <FiAward />
                </div>
                <h2>最终综合评估</h2>
              </div>
              
              {typeof finalScores !== 'string' ? (
                <div className={styles.finalScoreContent}>
                  <div className={styles.finalScoreVisualization}>
                    <CircularProgressBarWithGradient
                      value={finalScores.total}
                      gradientColors={getGradientForScore(finalScores.total)}
                    />
                    <div className={styles.finalScoreText}>
                      <span className={styles.totalScore}>{finalScores.total}</span>
                      <span className={styles.totalLabel}>总分</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className={styles.finalNotTested}>
                  <div className={styles.emptyStateIllustration}>📋</div>
                  <p className={styles.notTestedMessage}>最终评估尚未生成</p>
                </div>
              )}
            </Card>
          </section>

          {/* 阶段卡片区域 */}
          <section className={styles.stageCardsSection}>
            <div className={styles.stageGridHeader}>
              <div className={styles.headerIcon}>
                <FiBarChart2 />
              </div>
              <h2>各阶段表现</h2>
            </div>
            
            <div className={styles.stageCardsRow}>
              <StageCard 
                title="自我介绍" 
                stageKey="introduction" 
                scores={introductionScores} 
                onNavigate={navigateToDemo} 
                compact={true}
              />
              <StageCard 
                title="技术问答" 
                stageKey="technology" 
                scores={technologyScores} 
                onNavigate={navigateToDemo} 
                compact={true}
              />
              <StageCard 
                title="情景分析" 
                stageKey="analysis" 
                scores={analysisScores} 
                onNavigate={navigateToDemo} 
                compact={true}
              />
            </div>
          </section>
        </div>

        {/* --- 第二行: 描述和雷达图 --- */}
        <div className={styles.row2}>
          {/* 描述部分 */}
          <section className={styles.descriptionSection}>
            <Card className={styles.descriptionCard}>
              <div className={styles.descriptionHeader}>
                <h2>综合评价分析</h2>
              </div>
              <div className={styles.descriptionContent}>
                <p className={styles.summaryText}>
                  {evaluationData?.description || "表现良好，在多个维度展现了扎实的基础和潜力。语言表达清晰流畅，专业能力扎实，逻辑思维严谨，表现力突出，整体表现优秀。"}
                </p>
                {typeof finalScores !== 'string' && (
                  <div className={styles.finalSkillsCompact}>
                    <ProgressBar 
                      label="语言表达" 
                      value={finalScores.language} 
                      color="#3B82F6" 
                      showValue={true}
                      compact={true}
                    />
                    <ProgressBar 
                      label="专业能力" 
                      value={finalScores.profession} 
                      color="#8B5CF6" 
                      showValue={true}
                      compact={true}
                    />
                    <ProgressBar 
                      label="逻辑思维" 
                      value={finalScores.logic} 
                      color="#F97316" 
                      showValue={true}
                      compact={true}
                    />
                    <ProgressBar 
                      label="表现力" 
                      value={finalScores.expressiveness} 
                      color="#14B8A6" 
                      showValue={true}
                      compact={true}
                    />
                  </div>
                )}
              </div>
            </Card>
          </section>

          {/* 雷达图部分 */}
          <section className={styles.radarSection}>
            <Card className={styles.radarCard}>
              <div className={styles.radarHeader}>
                <h2>能力维度雷达图</h2>
              </div>
              <div className={styles.radarContainer}>
                <RadarChart data={radarData} />
              </div>
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
};

export default MainDashboard;