// pages/civil-service-interview.tsx
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

const CivilServiceInterview = () => {
  const router = useRouter();
  const [currentStage, setCurrentStage] = useState(0);
  const [timeLeft, setTimeLeft] = useState(1800); // 30分钟倒计时
  const [answers, setAnswers] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 公务员考试特有的面试阶段
  const interviewStages = [
    {
      title: "政策理解与分析",
      type: "policy_analysis",
      description: "请阅读以下政策文件，分析其背景、目标及可能影响",
      content: `《关于推进城市数字化转型的指导意见》
        
一、总体要求
以习近平新时代中国特色社会主义思想为指导，全面贯彻党的二十大精神，坚持以人民为中心的发展思想，以数字化转型整体驱动生产方式、生活方式和治理方式变革。

二、主要目标
到2025年，城市数字化转型取得显著成效，数字经济核心产业增加值占GDP比重达到XX%，政务服务"一网通办"率达到XX%，城市治理"一网统管"基本实现。

三、重点任务
1. 建设新型数字基础设施
2. 推进经济数字化转型
3. 推进生活数字化转型
4. 推进治理数字化转型`,
      timeLimit: 600, // 10分钟
      wordLimit: 800
    },
    {
      title: "公共服务情景模拟",
      type: "public_service",
      description: "作为窗口服务人员，遇到以下情况该如何处理",
      content: `情景描述：
一位老年市民前来办理退休金认证，但由于不会使用智能手机无法完成线上认证，情绪较为激动。他表示之前已经跑了三次，每次都因为材料不全或操作问题未能办成。

该市民情况：
- 年龄：78岁，独居
- 子女在外地工作
- 行动不便，需要拄拐杖
- 表示如果这次再办不成就要投诉`,
      timeLimit: 480, // 8分钟
      wordLimit: 500
    },
    {
      title: "应急处理决策",
      type: "emergency_handling",
      description: "请针对以下突发事件提出处理方案",
      content: `突发事件：
某区老旧小区因连续暴雨发生内涝，积水深度达50厘米，涉及居民200余户。

当前状况：
- 部分一层住户家中进水
- 有行动不便的老人和残疾人需要转移
- 小区电力设施存在安全隐患
- 居民情绪激动，要求立即解决问题

可用资源：
- 街道工作人员15人
- 社区志愿者30人
- 抽水泵2台
- 临时安置点（社区中心）`,
      timeLimit: 420, // 7分钟
      wordLimit: 600
    },
    {
      title: "公文写作",
      type: "official_document",
      description: "请根据以下材料起草一份通知",
      content: `背景材料：
为贯彻落实市委、市政府关于安全生产的工作部署，你单位拟组织开展一次全系统安全生产大检查。

检查内容：
1. 消防安全隐患排查
2. 电气线路安全检测
3. 应急预案完善情况
4. 安全责任制落实情况

要求：
请以单位名义起草一份关于开展安全生产大检查的通知，发至各下属单位和部门。`,
      timeLimit: 540, // 9分钟
      wordLimit: 400
    }
  ];

  // 倒计时效果
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleAnswerChange = (value: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentStage]: value
    }));
  };

  const handleNextStage = () => {
    if (currentStage < interviewStages.length - 1) {
      setCurrentStage(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePreviousStage = () => {
    if (currentStage > 0) {
      setCurrentStage(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // 模拟提交过程
    setTimeout(() => {
      setIsSubmitting(false);
      router.push('/interview-complete');
    }, 2000);
  };

  const handleAutoSubmit = () => {
    if (!isSubmitting) {
      handleSubmit();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentProgress = () => {
    return ((currentStage + 1) / interviewStages.length) * 100;
  };

  const getWordCount = (text: string) => {
    return text.replace(/\s/g, '').length;
  };

  const currentStageData = interviewStages[currentStage];
  const currentAnswer = answers[currentStage] || '';
  const wordCount = getWordCount(currentAnswer);
  const isOverLimit = wordCount > currentStageData.wordLimit;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white p-6">
      {/* 头部信息栏 */}
      <header className="flex justify-between items-center mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{formatTime(timeLeft)}</div>
            <div className="text-xs text-gray-400">剩余时间</div>
          </div>
          <div className="h-8 w-px bg-white/20"></div>
          <div>
            <div className="font-semibold text-white">公务员行政能力面试</div>
            <div className="text-sm text-gray-400">编号: CS2024001</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-white font-medium">张明</div>
            <div className="text-sm text-gray-400">报考岗位: 行政管理</div>
          </div>
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="font-bold">张</span>
          </div>
        </div>
      </header>

      {/* 进度指示器 */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>面试进度</span>
          <span>{currentStage + 1} / {interviewStages.length}</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${getCurrentProgress()}%` }}
          ></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
        {/* 左侧题目区域 */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-blue-400">{currentStageData.title}</h2>
            <div className="flex space-x-2">
              <span className="px-3 py-1 bg-blue-500/20 border border-blue-400/30 rounded-lg text-blue-400 text-sm">
                {formatTime(currentStageData.timeLimit)}
              </span>
              <span className="px-3 py-1 bg-purple-500/20 border border-purple-400/30 rounded-lg text-purple-400 text-sm">
                {currentStageData.wordLimit}字
              </span>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium text-white mb-3">{currentStageData.description}</h3>
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <div className="whitespace-pre-wrap text-gray-300 leading-relaxed">
                {currentStageData.content}
              </div>
            </div>
          </div>

          {/* 公务员考试特有的提示信息 */}
          <div className="bg-cyan-500/10 border border-cyan-400/30 rounded-lg p-4">
            <h4 className="font-semibold text-cyan-300 mb-2 flex items-center">
              <span className="mr-2">💡</span>
              答题提示
            </h4>
            <ul className="text-sm text-cyan-200 space-y-1">
              {currentStageData.type === 'policy_analysis' && (
                <>
                  <li>• 准确把握政策背景和指导思想</li>
                  <li>• 分析政策实施的可行性和可能遇到的困难</li>
                  <li>• 提出完善政策的建议</li>
                </>
              )}
              {currentStageData.type === 'public_service' && (
                <>
                  <li>• 体现服务意识和同理心</li>
                  <li>• 提出具体可行的解决方案</li>
                  <li>• 考虑特殊群体的需求</li>
                </>
              )}
              {currentStageData.type === 'emergency_handling' && (
                <>
                  <li>• 确保人民群众生命安全</li>
                  <li>• 合理调配现有资源</li>
                  <li>• 建立有效的沟通协调机制</li>
                </>
              )}
              {currentStageData.type === 'official_document' && (
                <>
                  <li>• 符合公文格式规范</li>
                  <li>• 语言准确、简洁、庄重</li>
                  <li>• 要素齐全、层次分明</li>
                </>
              )}
            </ul>
          </div>
        </div>

        {/* 右侧答题区域 */}
        <div className="flex flex-col bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          {/* 答题区域头部 */}
          <div className="flex justify-between items-center p-4 border-b border-white/10 bg-white/5">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-blue-400 ml-2">答题编辑区</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className={`text-sm ${isOverLimit ? 'text-red-400' : 'text-gray-400'}`}>
                字数: {wordCount}/{currentStageData.wordLimit}
              </span>
            </div>
          </div>

          {/* 文本编辑器 */}
          <div className="flex-1 p-4">
            <textarea
              value={currentAnswer}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder="请在此处输入您的回答..."
              className="w-full h-full bg-gray-800/50 border border-white/10 rounded-lg p-4 text-white resize-none focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
              style={{ minHeight: '400px' }}
            />
          </div>

          {/* 底部操作栏 */}
          <div className="p-4 border-t border-white/10 bg-white/5">
            <div className="flex justify-between items-center">
              <div className="flex space-x-3">
                <button
                  onClick={handlePreviousStage}
                  disabled={currentStage === 0}
                  className="px-6 py-2 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-white"
                >
                  上一题
                </button>
                
                {currentStage === interviewStages.length - 1 ? (
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-gradient-to-r from-green-500 to-cyan-600 rounded-lg hover:from-green-600 hover:to-cyan-700 transition-all duration-300 font-medium flex items-center space-x-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>提交中...</span>
                      </>
                    ) : (
                      <>
                        <span>✓</span>
                        <span>完成面试</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleNextStage}
                    className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 font-medium flex items-center space-x-2"
                  >
                    <span>→</span>
                    <span>下一题</span>
                  </button>
                )}
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <div className="flex items-center space-x-1">
                  <span>当前阶段:</span>
                  <span className="text-blue-400">{currentStage + 1}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>保存状态:</span>
                  <span className="text-green-400">已保存</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 公务员考试特有的装饰元素 */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute top-10 right-10 opacity-10">
          <div className="text-6xl">🏛️</div>
        </div>
        <div className="absolute bottom-10 left-10 opacity-10">
          <div className="text-6xl">📋</div>
        </div>
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400/30 rounded-full animate-pulse"></div>
        <div className="absolute top-3/4 left-3/4 w-1 h-1 bg-cyan-400/50 rounded-full animate-pulse"></div>
      </div>
    </div>
  );
};

export default CivilServiceInterview;