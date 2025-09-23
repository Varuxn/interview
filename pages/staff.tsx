import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from "@clerk/nextjs";
import { FiAward, FiBarChart2, FiChevronRight, FiAlertTriangle } from 'react-icons/fi';
import CircularProgressBarWithGradient from '../components/CircularProgressBarWithGradient';
import Card from '../components/Card';
import RadarChart from '../components/RadarChart';
import styles from '../styles/Dashboard.module.css';
import { FullEvaluationData } from '../components/types'; // 假设你有一个 types.ts 文件来定义这些接口

// --- Interfaces ---
interface EvaluationScores {
  expertise: number,       // 专业知识水平 (Expertise)  
  proficiency: number,     // 技能匹配度 (Proficiency)  
  articulation: number,   // 语言表达能力 (Articulation)  
  reasoning: number,        // 逻辑思维能力 (Reasoning)  
  innovation: number,        // 创新能力 (Innovation)  
  resilience: number,       // 应变抗压能力 (Resilience)  
  total: number;
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
  high: ['#60a5fa', '#c084fc'], // 蓝色到紫色
  mid: ['#f59e0b', '#fde68a'],   // 保持或改为蓝紫渐变
  low: ['#ef4444', '#fca5a5'],   // 保持或改为深紫色
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
    expertise: '#8b5cf6',      // 改为紫色系 #c084fc
    proficiency: '#3b82f6',    // 改为蓝色系 #60a5fa  
    articulation: '#14b8a6',   // 改为青色系 #22d3ee
    reasoning: '#f97316',      // 保持橙色或改为紫色 #d8b4fe
    innovation: '#10b981',     // 改为青色系 #22d3ee
    resilience: '#ef4444'      // 改为紫色系 #c084fc
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
              label="专业" 
              value={scores.expertise} 
              color={scoreColors.expertise} 
              showValue={true}
              compact={compact}
            />
            <ProgressBar 
              label="技能" 
              value={scores.proficiency} 
              color={scoreColors.proficiency} 
              showValue={true}
              compact={compact}
            />
            <ProgressBar 
              label="表达" 
              value={scores.articulation} 
              color={scoreColors.articulation} 
              showValue={true}
              compact={compact}
            />
            <ProgressBar 
              label="逻辑" 
              value={scores.reasoning} 
              color={scoreColors.reasoning} 
              showValue={true}
              compact={compact}
            />
            <ProgressBar 
              label="创新" 
              value={scores.innovation} 
              color={scoreColors.innovation} 
              showValue={true}
              compact={compact}
            />
            <ProgressBar 
              label="抗压" 
              value={scores.resilience} 
              color={scoreColors.resilience} 
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
    console.log('Fetching evaluation data for user:', userId);
    setLoading(true);
    setError(null);
    try {
  const response = await fetch(`/api/databases/query?table=evaluations&user_id=${userId}`);
  if (!response.ok) throw new Error(`Network response was not ok: ${response.statusText}`);
  
  const result: QueryResponse<FullEvaluationData> = await response.json();
  console.log('Evaluation data fetched:', result);
  
  if (result.success && result.data) {
    // 查找与当前userId匹配的评价数据
    const userEvaluation = Array.isArray(result.data)
      ? result.data.find(item => item.user_id === userId) || null
      : result.data;
    
    setEvaluationData(userEvaluation);
    
    // 如果找不到匹配项，设置错误信息
    if (!userEvaluation) {
      setError(`No evaluation data found for user: ${userId}`);
    }
  } else {
    setError(result.message || 'Failed to fetch evaluation data.');
    }
  }
 catch (err) {
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
      expertise: (evaluationData as any)[`${stagePrefix}_expertise`] ?? 0,
      proficiency: (evaluationData as any)[`${stagePrefix}_proficiency`] ?? 0,
      articulation: (evaluationData as any)[`${stagePrefix}_articulation`] ?? 0,
      reasoning: (evaluationData as any)[`${stagePrefix}_reasoning`] ?? 0,
      innovation: (evaluationData as any)[`${stagePrefix}_innovation`] ?? 0,
      resilience: (evaluationData as any)[`${stagePrefix}_resilience`] ?? 0,
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
        subject: '总分',
        A: finalScores !== '未测试' ? finalScores.total : 0,
        fullMark: 100 
      },
      { 
        subject: '专业知识',  // Expertise
        A: finalScores !== '未测试' ? finalScores.expertise : 0,
        fullMark: 100 
      },
      { 
        subject: '技能匹配',  // Proficiency
        A: finalScores !== '未测试' ? finalScores.proficiency : 0,
        fullMark: 100 
      },
      { 
        subject: '语言表达',  // Articulation
        A: finalScores !== '未测试' ? finalScores.articulation : 0,
        fullMark: 100 
      },
      { 
        subject: '逻辑思维',  // Reasoning
        A: finalScores !== '未测试' ? finalScores.reasoning : 0,
        fullMark: 100 
      },
      { 
        subject: '创新能力',  // Innovation
        A: finalScores !== '未测试' ? finalScores.innovation : 0,
        fullMark: 100 
      },
      { 
        subject: '应变抗压',  // Resilience
        A: finalScores !== '未测试' ? finalScores.resilience : 0,
        fullMark: 100 
      },
    ];

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
                <div 
                  className={styles.finalScoreContent}
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%',
                    width: '100%'
                  }}
                >
                  <div 
                    className={styles.finalScoreVisualization}
                    style={{
                      position: 'relative',
                      display: 'inline-flex',  // 保持内容宽度由内部元素决定
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}
                  >
                    <CircularProgressBarWithGradient
                      value={finalScores.total}
                      gradientColors={getGradientForScore(finalScores.total)}
                      hideText={true}
                    />
                    <div 
                      className={styles.finalScoreText}
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        textAlign: 'center'
                      }}
                    >
                      <span 
                        className={styles.totalScore}
                        style={{
                          fontSize: '3rem',
                          fontWeight: 'bold',
                          lineHeight: 1,
                          display: 'block'
                        }}
                      >
                        {finalScores.total}
                      </span>
                      <span 
                        className={styles.totalLabel}
                        style={{
                          fontSize: '1rem',
                          display: 'block'
                        }}
                      >
                        总分
                      </span>
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
                    <ProgressBar label="专业知识" value={finalScores.expertise} color="#c084fc" showValue={true} compact={true} />
                    <ProgressBar label="技能匹配" value={finalScores.proficiency} color="#60a5fa" showValue={true} compact={true} />
                    <ProgressBar label="语言表达" value={finalScores.articulation} color="#22d3ee" showValue={true} compact={true} />
                    <ProgressBar label="逻辑思维" value={finalScores.reasoning} color="#d8b4fe" showValue={true} compact={true} />
                    <ProgressBar label="创新能力" value={finalScores.innovation} color="#22d3ee" showValue={true} compact={true} />
                    <ProgressBar label="应变抗压" value={finalScores.resilience} color="#c084fc" showValue={true} compact={true} />
                  </div>
                )}
              </div>
            </Card>
          </section>

          {/* 雷达图部分 */}
          <section className={styles.radarSection}>
            <Card className={styles.radarCard}>
              <div className={styles.radarHeader}>
                <h2 style={{ textAlign: 'center' }}>能力维度雷达图</h2>
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