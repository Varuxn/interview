import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ==================== AI 面试组件 ====================
const AIInterviewComponent: React.FC = () => {
  const [currentStage, setCurrentStage] = useState<'theory' | 'coding' | 'design'>('theory');
  const [code, setCode] = useState('');
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const aiQuestions = {
    theory: [
      "解释Transformer架构中的多头注意力机制",
      "对比监督学习与自监督学习",
      "描述梯度消失问题及解决方案"
    ],
    coding: "实现自注意力机制前向传播",
    design: "设计多模态AI系统架构"
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-blue-900/80 to-purple-900/80 rounded-2xl border-2 border-cyan-400/50 backdrop-blur-lg overflow-hidden">
      {/* 头部 */}
      <div className="p-3 border-b border-cyan-400/30 bg-blue-900/40">
        <div className="flex items-center space-x-2">
          <div className="text-xl">🤖</div>
          <div>
            <h3 className="text-base font-bold text-cyan-300">AI工程师面试</h3>
            <p className="text-xs text-cyan-200/80">深度学习 • 神经网络</p>
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="p-4 h-[calc(100%-65px)]">
        <div className="flex space-x-1 mb-3 bg-white/5 rounded-lg p-1">
          {[
            { key: 'theory', label: '理论', icon: '🧠' },
            { key: 'coding', label: '编程', icon: '💻' },
            { key: 'design', label: '设计', icon: '🏗️' }
          ].map((stage) => (
            <button
              key={stage.key}
              onClick={() => setCurrentStage(stage.key as any)}
              className={`flex-1 py-1 rounded text-xs transition-all ${
                currentStage === stage.key
                  ? 'bg-cyan-500/30 text-cyan-300'
                  : 'text-gray-300 hover:bg-white/5'
              }`}
            >
              <div className="flex flex-col items-center">
                <span className="text-sm">{stage.icon}</span>
                <span>{stage.label}</span>
              </div>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {currentStage === 'theory' && (
            <motion.div
              key="theory"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-2 h-32 overflow-y-auto"
            >
              {aiQuestions.theory.map((question, index) => (
                <div key={index} className="bg-white/5 rounded p-2 border border-cyan-400/20">
                  <p className="text-white text-sm mb-1">{question}</p>
                  <textarea
                    value={answers[`theory-${index}`] || ''}
                    onChange={(e) => setAnswers(prev => ({
                      ...prev,
                      [`theory-${index}`]: e.target.value
                    }))}
                    className="w-full h-8 bg-white/5 border border-cyan-400/30 rounded p-1 text-white text-xs resize-none"
                    placeholder="简要回答..."
                  />
                </div>
              ))}
            </motion.div>
          )}

          {currentStage === 'coding' && (
            <motion.div
              key="coding"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="h-32"
            >
              <div className="bg-gray-900 rounded border border-cyan-400/30 overflow-hidden h-full">
                <div className="px-2 py-1 bg-gray-800 border-b border-gray-700">
                  <span className="text-xs text-gray-400">attention.py</span>
                </div>
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full h-24 font-mono text-xs bg-gray-900 text-white p-2 resize-none focus:outline-none"
                  placeholder={`# ${aiQuestions.coding}\nimport torch\nimport torch.nn as nn`}
                />
              </div>
            </motion.div>
          )}

          {currentStage === 'design' && (
            <motion.div
              key="design"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="h-32"
            >
              <p className="text-white text-sm mb-2">{aiQuestions.design}</p>
              <textarea
                className="w-full h-20 bg-gray-900 border border-cyan-400/30 rounded p-2 text-white text-xs resize-none"
                placeholder="描述架构设计..."
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-end mt-2">
          <button className="px-3 py-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded text-white text-xs font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all">
            提交答案
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== 大数据面试组件 ====================
const BigDataInterviewComponent: React.FC = () => {
  const [currentTask, setCurrentTask] = useState<'sql' | 'spark' | 'architecture'>('sql');
  const [sqlQuery, setSqlQuery] = useState('');

  const bigDataTasks = {
    sql: {
      question: "查询最近7天活跃用户购买金额Top10",
      hint: "表: users(id), orders(user_id, amount)"
    },
    spark: {
      question: "Spark实现用户行为分析"
    },
    architecture: {
      question: "设计实时数据分析平台"
    }
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-emerald-900/80 to-teal-900/80 rounded-2xl border-2 border-emerald-400/50 backdrop-blur-lg overflow-hidden">
      <div className="p-3 border-b border-emerald-400/30 bg-emerald-900/40">
        <div className="flex items-center space-x-2">
          <div className="text-xl">📊</div>
          <div>
            <h3 className="text-base font-bold text-emerald-300">大数据专家面试</h3>
            <p className="text-xs text-emerald-200/80">分布式计算 • 数据管道</p>
          </div>
        </div>
      </div>

      <div className="p-4 h-[calc(100%-65px)]">
        <div className="flex space-x-1 mb-3">
          {[
            { key: 'sql', label: 'SQL', icon: '💾' },
            { key: 'spark', label: 'Spark', icon: '⚡' },
            { key: 'architecture', label: '架构', icon: '🏗️' }
          ].map((task) => (
            <button
              key={task.key}
              onClick={() => setCurrentTask(task.key as any)}
              className={`flex-1 py-1 rounded text-xs transition-all ${
                currentTask === task.key
                  ? 'bg-emerald-500/30 border border-emerald-400 text-emerald-300'
                  : 'bg-white/5 border border-white/5 text-gray-300 hover:border-emerald-400/50'
              }`}
            >
              <div className="flex flex-col items-center">
                <span className="text-sm">{task.icon}</span>
                <span>{task.label}</span>
              </div>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentTask}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-32"
          >
            <div className="bg-white/5 rounded p-2 border border-emerald-400/20 h-full">
              <h4 className="text-emerald-300 font-semibold text-sm mb-1">
                {bigDataTasks[currentTask].question}
              </h4>
              
              {currentTask === 'sql' && (
                <>
                  <p className="text-emerald-200/70 text-xs mb-1">{bigDataTasks.sql.hint}</p>
                  <textarea
                    value={sqlQuery}
                    onChange={(e) => setSqlQuery(e.target.value)}
                    className="w-full h-16 font-mono text-xs bg-gray-900 border border-emerald-400/30 rounded p-1 text-white resize-none"
                    placeholder="SELECT ..."
                  />
                </>
              )}

              {currentTask === 'spark' && (
                <textarea
                  className="w-full h-20 font-mono text-xs bg-gray-900 border border-emerald-400/30 rounded p-1 text-white resize-none"
                  placeholder="val data = spark.read..."
                />
              )}

              {currentTask === 'architecture' && (
                <textarea
                  className="w-full h-20 bg-gray-900 border border-emerald-400/30 rounded p-1 text-white text-xs resize-none"
                  placeholder="描述架构组件和数据流向..."
                />
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-end mt-2">
          <button className="px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-600 rounded text-white text-xs font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all">
            提交答案
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== 物联网面试组件 ====================
const IoTInterviewComponent: React.FC = () => {
  const [currentChallenge, setCurrentChallenge] = useState<'protocol' | 'embedded' | 'edge'>('protocol');
  const [deviceCode, setDeviceCode] = useState('');

  const iotChallenges = {
    protocol: {
      title: "通信协议设计",
      question: "设计低功耗设备通信协议"
    },
    embedded: {
      title: "嵌入式开发", 
      question: "编写传感器数据采集代码"
    },
    edge: {
      title: "边缘计算",
      question: "设计边缘AI推理流水线"
    }
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-amber-900/80 to-orange-900/80 rounded-2xl border-2 border-amber-400/50 backdrop-blur-lg overflow-hidden">
      <div className="p-3 border-b border-amber-400/30 bg-amber-900/40">
        <div className="flex items-center space-x-2">
          <div className="text-xl">🌐</div>
          <div>
            <h3 className="text-base font-bold text-amber-300">物联网专家面试</h3>
            <p className="text-xs text-amber-200/80">边缘计算 • 设备管理</p>
          </div>
        </div>
      </div>

      <div className="p-4 h-[calc(100%-65px)]">
        <div className="flex space-x-1 mb-3">
          {[
            { key: 'protocol', label: '协议', icon: '📡' },
            { key: 'embedded', label: '嵌入式', icon: '🔧' },
            { key: 'edge', label: '边缘', icon: '⚡' }
          ].map((challenge) => (
            <button
              key={challenge.key}
              onClick={() => setCurrentChallenge(challenge.key as any)}
              className={`flex-1 py-1 rounded text-xs transition-all ${
                currentChallenge === challenge.key
                  ? 'bg-amber-500/30 border border-amber-400 text-amber-300'
                  : 'bg-white/5 border border-white/5 text-gray-300 hover:border-amber-400/50'
              }`}
            >
              <div className="flex flex-col items-center">
                <span className="text-sm">{challenge.icon}</span>
                <span>{challenge.label}</span>
              </div>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentChallenge}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="h-32"
          >
            <div className="bg-white/5 rounded p-2 border border-amber-400/20 h-full">
              <h4 className="text-amber-300 font-semibold text-sm mb-1">
                {iotChallenges[currentChallenge].title}
              </h4>
              <p className="text-white text-xs mb-2">
                {iotChallenges[currentChallenge].question}
              </p>

              {currentChallenge === 'embedded' && (
                <textarea
                  value={deviceCode}
                  onChange={(e) => setDeviceCode(e.target.value)}
                  className="w-full h-16 font-mono text-xs bg-gray-900 border border-amber-400/30 rounded p-1 text-white resize-none"
                  placeholder="// C/C++ 嵌入式代码"
                />
              )}

              {currentChallenge !== 'embedded' && (
                <textarea
                  className="w-full h-16 bg-gray-900 border border-amber-400/30 rounded p-1 text-white text-xs resize-none"
                  placeholder="描述您的设计方案..."
                />
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between items-center mt-2">
          <div className="text-xs text-amber-300/70">
            设备状态: 在线
          </div>
          <button className="px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-600 rounded text-white text-xs font-semibold hover:from-amber-600 hover:to-orange-700 transition-all">
            验证方案
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== 智能系统面试组件 ====================
const IntelligentSystemInterviewComponent: React.FC = () => {
  const [currentPhase, setCurrentPhase] = useState<'analysis' | 'design' | 'integration'>('analysis');
  const [systemDesign, setSystemDesign] = useState('');

  const systemPhases = {
    analysis: {
      title: "需求分析",
      question: "分析智能客服系统核心需求"
    },
    design: {
      title: "系统设计", 
      question: "设计智能决策引擎架构"
    },
    integration: {
      title: "系统集成",
      question: "规划AI组件集成方案"
    }
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-purple-900/80 to-pink-900/80 rounded-2xl border-2 border-violet-400/50 backdrop-blur-lg overflow-hidden">
      <div className="p-3 border-b border-violet-400/30 bg-purple-900/40">
        <div className="flex items-center space-x-2">
          <div className="text-xl">⚡</div>
          <div>
            <h3 className="text-base font-bold text-violet-300">智能系统架构师</h3>
            <p className="text-xs text-violet-200/80">系统集成 • 智能决策</p>
          </div>
        </div>
      </div>

      <div className="p-4 h-[calc(100%-65px)]">
        <div className="flex space-x-1 mb-3 bg-white/5 rounded p-1">
          {[
            { key: 'analysis', label: '分析', icon: '🔍' },
            { key: 'design', label: '设计', icon: '🏗️' },
            { key: 'integration', label: '集成', icon: '🔗' }
          ].map((phase) => (
            <button
              key={phase.key}
              onClick={() => setCurrentPhase(phase.key as any)}
              className={`flex-1 py-1 rounded text-xs transition-all ${
                currentPhase === phase.key
                  ? 'bg-violet-500/30 text-violet-300'
                  : 'text-gray-300 hover:bg-white/5'
              }`}
            >
              <div className="flex flex-col items-center">
                <span className="text-sm">{phase.icon}</span>
                <span>{phase.label}</span>
              </div>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentPhase}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-32"
          >
            <div className="bg-white/5 rounded p-2 border border-violet-400/20 h-full">
              <h4 className="text-violet-300 font-semibold text-sm mb-1">
                {systemPhases[currentPhase].title}
              </h4>
              <p className="text-white text-xs mb-2">
                {systemPhases[currentPhase].question}
              </p>

              {currentPhase === 'analysis' && (
                <div className="space-y-1">
                  {[
                    { label: "响应时间", value: "<100ms" },
                    { label: "并发用户", value: "10,000+" }
                  ].map((req, index) => (
                    <div key={index} className="flex justify-between items-center px-1">
                      <span className="text-white text-xs">{req.label}</span>
                      <span className="text-violet-300 text-xs">{req.value}</span>
                    </div>
                  ))}
                </div>
              )}

              {currentPhase !== 'analysis' && (
                <textarea
                  value={systemDesign}
                  onChange={(e) => setSystemDesign(e.target.value)}
                  className="w-full h-16 bg-gray-900 border border-violet-400/30 rounded p-1 text-white text-xs resize-none"
                  placeholder="描述设计方案..."
                />
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between items-center mt-2">
          <div className="text-xs text-violet-300/70">
            复杂度: 高
          </div>
          <button className="px-3 py-1 bg-gradient-to-r from-violet-500 to-purple-600 rounded text-white text-xs font-semibold hover:from-violet-600 hover:to-purple-700 transition-all">
            提交设计
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== 主页面组件 ====================
const SpecializedInterviewDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white p-4">
      {/* 动态背景 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-blue-400/10"
            initial={{
              x: Math.random() * 100 + '%',
              y: Math.random() * 100 + '%',
              scale: Math.random() * 0.5 + 0.5
            }}
            animate={{
              y: [null, -20, 20, 0],
              opacity: [0.2, 0.5, 0.2]
            }}
            transition={{
              duration: Math.random() * 4 + 3,
              repeat: Infinity,
              repeatType: "reverse"
            }}
            style={{
              width: Math.random() * 4 + 2,
              height: Math.random() * 4 + 2,
            }}
          />
        ))}
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* 页面标题 */}
        <motion.header 
          className="text-center mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
            🎯 专业技术面试系统
          </h1>
          <p className="text-gray-300 text-sm">
            针对不同技术方向的定制化面试评估
          </p>
        </motion.header>

        {/* 四个4:7比例的面试组件网格 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 每个组件都是4:7比例 (高度:宽度) */}
          <div className="aspect-[7/4]"> {/* 宽度:高度 = 7:4 */}
            <AIInterviewComponent />
          </div>
          <div className="aspect-[7/4]">
            <BigDataInterviewComponent />
          </div>
          <div className="aspect-[7/4]">
            <IoTInterviewComponent />
          </div>
          <div className="aspect-[7/4]">
            <IntelligentSystemInterviewComponent />
          </div>
        </div>

        {/* 统计信息 */}
        <motion.div 
          className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {[
            { value: "45-70min", label: "面试时长", color: "text-cyan-400" },
            { value: "3-4个", label: "挑战环节", color: "text-emerald-400" },
            { value: "360°", label: "全面评估", color: "text-amber-400" },
            { value: "实时", label: "AI反馈", color: "text-violet-400" }
          ].map((stat, index) => (
            <div key={index} className="bg-white/5 backdrop-blur-lg rounded-lg p-3 border border-white/10">
              <div className={`text-lg font-bold ${stat.color} mb-1`}>{stat.value}</div>
              <div className="text-gray-400 text-xs">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default SpecializedInterviewDashboard;