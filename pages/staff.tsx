// pages/index.tsx (or components/MainDashboard.tsx)
import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/Home.module.css'; // Assuming you have some basic CSS modules or global styles
import { useAuth } from "@clerk/nextjs"; // Import useAuth to get userId

// Define interfaces for evaluation data
interface EvaluationScores {
  language: number;
  profession: number;
  logic: number;
  expressiveness: number;
  total: number;
}

// Full evaluation data structure from the database
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
  // Add other columns if they exist and you need them
}

interface QueryResponse<T> {
  success: boolean;
  message: string;
  data: T | T[] | null;
}

const MainDashboard: React.FC = () => {
  const router = useRouter();
  const [evaluationData, setEvaluationData] = useState<FullEvaluationData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Mock userId for demonstration. In a real app, you'd get this from authentication context.
  const { userId, isLoaded } = useAuth();

  const fetchEvaluationData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch data for the specific user from the 'evaluations' table
      const response = await fetch(`/api/databases/query?table=evaluations&user_id=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result: QueryResponse<FullEvaluationData> = await response.json();
        if (result.success && result.data) {
          // Assuming data is a single object because we queried by ID
          if (!Array.isArray(result.data)) {
            setEvaluationData(result.data);
          } else {
            // This case should ideally not happen if querying by ID correctly returns a single object or null
            console.warn("Expected single object, but received array for evaluation data.");
            setEvaluationData(result.data[0] || null);
          }
        } else {
          setError(result.message || 'Failed to fetch evaluation data.');
          setEvaluationData(null); // Clear data on failure
        }
      } else {
        const errorText = await response.text();
        setError(`Network response was not ok: ${response.status} - ${errorText}`);
        setEvaluationData(null); // Clear data on network error
      }
    } catch (err) {
      console.error('Error fetching evaluation data:', err);
      setError('An unexpected error occurred while fetching data.');
      setEvaluationData(null); // Clear data on unexpected error
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchEvaluationData();
  }, [fetchEvaluationData]);

  const navigateToDemo = (stage: string) => {
    router.push({
      pathname: '/demo',
      query: { stage }, // Pass the stage identifier
    });
  };

  // Helper function to get stage-specific scores
  const getStageScores = (stagePrefix: 'introduction' | 'technology' | 'analysis' | 'final'): EvaluationScores | '未测试' => {
    if (!evaluationData) return '未测试';

    const scores: EvaluationScores = {
      language: (evaluationData as any)[`${stagePrefix}_language`],
      profession: (evaluationData as any)[`${stagePrefix}_profession`],
      logic: (evaluationData as any)[`${stagePrefix}_logic`],
      expressiveness: (evaluationData as any)[`${stagePrefix}_expressiveness`],
      total: (evaluationData as any)[`${stagePrefix}_total`],
    };

    // Check if any score is -1 or undefined/null
    const isTested = Object.values(scores).every(score => score !== undefined && score !== null && score !== -1);

    return isTested ? scores : '未测试';
  };

  const finalScores = getStageScores('final');
  const introductionScores = getStageScores('introduction');
  const technologyScores = getStageScores('technology');
  const analysisScores = getStageScores('analysis');

  if (loading) {
    return <div className={styles.container}><p>正在加载评估数据...</p></div>;
  }

  if (error) {
    return <div className={styles.container}><p>加载评估数据失败: {error}</p><button onClick={fetchEvaluationData}>重试</button></div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>面试评估总览</h1>

      {/* Final Score Display */}
      <div className={styles.finalScoreBox}>
        <h2>最终评估分数</h2>
        {typeof finalScores !== 'string' ? (
          <div>
            <p>语言表达: {finalScores.language}</p>
            <p>专业能力: {finalScores.profession}</p>
            <p>逻辑思维: {finalScores.logic}</p>
            <p>表现力: {finalScores.expressiveness}</p>
            <p className={styles.totalScore}>综合分数: {finalScores.total}</p>
          </div>
        ) : (
          <p>{finalScores}</p>
        )}
      </div>

      <hr className={styles.divider} />

      {/* Individual Stage Score Windows */}
      <div className={styles.stageGrid}>
        {/* Introduction Stage */}
        <div className={styles.stageBox}>
          <h3>自我介绍 (Introduction)</h3>
          {typeof introductionScores !== 'string' ? (
            <div>
              <p>语言表达: {introductionScores.language}</p>
              <p>专业能力: {introductionScores.profession}</p>
              <p>逻辑思维: {introductionScores.logic}</p>
              <p>表现力: {introductionScores.expressiveness}</p>
              <p>综合分数: {introductionScores.total}</p>
              <button onClick={() => navigateToDemo('introduction')}>前往测试 Demo</button>
            </div>
          ) : (
            <div>
              <p>{introductionScores}</p>
              <button onClick={() => navigateToDemo('introduction')}>前往测试 Demo</button>
            </div>
          )}
        </div>

        {/* Technology Stage */}
        <div className={styles.stageBox}>
          <h3>技术问答 (Technology)</h3>
          {typeof technologyScores !== 'string' ? (
            <div>
              <p>语言表达: {technologyScores.language}</p>
              <p>专业能力: {technologyScores.profession}</p>
              <p>逻辑思维: {technologyScores.logic}</p>
              <p>表现力: {technologyScores.expressiveness}</p>
              <p>综合分数: {technologyScores.total}</p>
              <button onClick={() => navigateToDemo('technology')}>前往测试 Demo</button>
            </div>
          ) : (
            <div>
              <p>{technologyScores}</p>
              <button onClick={() => navigateToDemo('technology')}>前往测试 Demo</button>
            </div>
          )}
        </div>

        {/* Analysis Stage */}
        <div className={styles.stageBox}>
          <h3>情景案例分析 (Analysis)</h3>
          {typeof analysisScores !== 'string' ? (
            <div>
              <p>语言表达: {analysisScores.language}</p>
              <p>专业能力: {analysisScores.profession}</p>
              <p>逻辑思维: {analysisScores.logic}</p>
              <p>表现力: {analysisScores.expressiveness}</p>
              <p>综合分数: {analysisScores.total}</p>
              <button onClick={() => navigateToDemo('analysis')}>前往测试 Demo</button>
            </div>
          ) : (
            <div>
              <p>{analysisScores}</p>
              <button onClick={() => navigateToDemo('analysis')}>前往测试 Demo</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MainDashboard;