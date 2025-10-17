// pages/bigdata-interview.tsx
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

const BigDataInterview = () => {
  const router = useRouter();
  const [currentStage, setCurrentStage] = useState(0);
  const [timeLeft, setTimeLeft] = useState(1800);
  const [code, setCode] = useState<string>('');
  const [activeTab, setActiveTab] = useState('code');
  const [dataFlowStatus, setDataFlowStatus] = useState('running');
  const [queryResults, setQueryResults] = useState<any[]>([]);
  const [executionPlan, setExecutionPlan] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 大数据特有的面试阶段
  const interviewStages = [
    {
      title: "分布式数据处理",
      type: "distributed_processing",
      description: "使用Spark处理10GB用户行为数据",
      content: `数据集：用户行为日志（1亿条记录）
分析要求：
• 用户购买行为分析
• 商品热度排行榜
• 行为转化率计算
• 时间序列流量分析`,
      timeLimit: 600,
      language: "scala",
      initialCode: `// Spark数据处理代码...`,
      dataSample: [
        { userId: 'U1001', timestamp: '2024-01-15 10:30:00', action: 'view', productId: 'P005', amount: null },
        { userId: 'U1001', timestamp: '2024-01-15 10:31:15', action: 'click', productId: 'P005', amount: null },
        { userId: 'U1002', timestamp: '2024-01-15 10:32:30', action: 'purchase', productId: 'P012', amount: 299.99 }
      ],
      dataFlow: [
        { id: 'kafka', name: 'Kafka', status: 'active', throughput: '85K/s' },
        { id: 'spark', name: 'Spark', status: 'processing', throughput: '78K/s' },
        { id: 'hdfs', name: 'HDFS', status: 'active', throughput: '92K/s' },
        { id: 'redis', name: 'Redis', status: 'active', throughput: '45K/s' }
      ]
    },
    {
      title: "实时数据流水线",
      type: "streaming_pipeline",
      description: "设计电商实时分析系统",
      content: `处理要求：
• 实时用户活跃度计算
• 异常访问模式检测
• 商品热度实时更新
• 数据延迟<30秒`,
      timeLimit: 480,
      language: "java",
      initialCode: `// Flink流处理代码...`,
      dataSample: [
        { eventId: 'E2001', type: 'page_view', userId: 'U1001', timestamp: '2024-01-15 10:30:00.123' },
        { eventId: 'E2002', type: 'product_click', userId: 'U1001', timestamp: '2024-01-15 10:30:01.456' },
        { eventId: 'E2003', type: 'add_to_cart', userId: 'U1001', timestamp: '2024-01-15 10:30:05.789' }
      ],
      dataFlow: [
        { id: 'source', name: '数据源', status: 'active', throughput: '150K/s' },
        { id: 'flink', name: 'Flink', status: 'processing', throughput: '145K/s' },
        { id: 'kafka', name: 'Kafka', status: 'active', throughput: '148K/s' },
        { id: 'es', name: 'Elasticsearch', status: 'active', throughput: '142K/s' }
      ]
    }
  ];

  // 模拟查询结果
  useEffect(() => {
    const mockResults = [
      { userId: 'U1001', totalSpent: 1250.50, purchaseCount: 8, lastActive: '2024-01-15' },
      { userId: 'U1002', totalSpent: 890.25, purchaseCount: 5, lastActive: '2024-01-15' },
      { userId: 'U1003', totalSpent: 2100.75, purchaseCount: 12, lastActive: '2024-01-14' },
      { userId: 'U1004', totalSpent: 450.00, purchaseCount: 3, lastActive: '2024-01-15' },
      { userId: 'U1005', totalSpent: 1780.30, purchaseCount: 9, lastActive: '2024-01-14' }
    ];
    setQueryResults(mockResults);

    // 模拟执行计划
    setExecutionPlan({
      stages: [
        { id: 1, name: 'Scan', duration: '2.3s', output: '1.2M rows' },
        { id: 2, name: 'Filter', duration: '1.1s', output: '890K rows' },
        { id: 3, name: 'Aggregate', duration: '3.4s', output: '125K rows' },
        { id: 4, name: 'Sort', duration: '1.8s', output: '125K rows' }
      ],
      resources: {
        executors: 8,
        memory: '12.5GB',
        cores: 32
      }
    });
  }, [currentStage]);

  // 数据流动画
  useEffect(() => {
    const interval = setInterval(() => {
      setDataFlowStatus(prev => prev === 'running' ? 'active' : 'running');
    }, 2000);
    return () => clearInterval(interval);
  }, []);

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

  useEffect(() => {
    if (interviewStages[currentStage]?.initialCode) {
      setCode(interviewStages[currentStage].initialCode);
    }
  }, [currentStage]);

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

  const currentStageData = interviewStages[currentStage];

  // 数据流水线组件
  const DataPipeline = ({ nodes }: { nodes: any[] }) => (
    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
      {nodes.map((node, index) => (
        <div key={node.id} className="flex items-center">
          <div className={`relative ${index > 0 ? 'ml-8' : ''}`}>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
              node.status === 'active' ? 'border-green-400 bg-green-400/20' :
              node.status === 'processing' ? 'border-blue-400 bg-blue-400/20 animate-pulse' :
              'border-gray-400 bg-gray-400/20'
            }`}>
              <span className="text-xs font-bold text-white">{node.name}</span>
            </div>
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-400">
              {node.throughput}
            </div>
          </div>
          {index < nodes.length - 1 && (
            <div className="mx-4 flex items-center">
              <div className={`w-8 h-1 ${
                dataFlowStatus === 'running' ? 'bg-blue-400' : 'bg-blue-400/50'
              } rounded-full`}></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  // 执行计划可视化组件
  const ExecutionPlanViz = ({ plan }: { plan: any }) => (
    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
      <h4 className="font-semibold text-blue-300 mb-3">执行计划</h4>
      <div className="space-y-3">
        {plan.stages?.map((stage: any) => (
          <div key={stage.id} className="flex items-center justify-between p-3 bg-white/5 rounded border border-white/10">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
              <span className="text-white font-mono">{stage.name}</span>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-300">{stage.duration}</div>
              <div className="text-xs text-gray-400">{stage.output}</div>
            </div>
          </div>
        ))}
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/10">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{plan.resources?.executors}</div>
            <div className="text-xs text-gray-400">Executors</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{plan.resources?.memory}</div>
            <div className="text-xs text-gray-400">Memory</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-cyan-400">{plan.resources?.cores}</div>
            <div className="text-xs text-gray-400">Cores</div>
          </div>
        </div>
      </div>
    </div>
  );

  // 数据表格预览组件
  const DataTablePreview = ({ data, title }: { data: any[], title: string }) => (
    <div className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
      <div className="bg-white/10 px-4 py-2 border-b border-white/10">
        <h4 className="font-semibold text-green-300">{title}</h4>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/20">
              {data[0] && Object.keys(data[0]).map(key => (
                <th key={key} className="text-left p-2 text-gray-400 font-semibold">
                  {key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index} className="border-b border-white/10 hover:bg-white/5">
                {Object.values(row).map((value: any, cellIndex) => (
                  <td key={cellIndex} className="p-2 text-gray-300 font-mono">
                    {value === null ? (
                      <span className="text-gray-500">-</span>
                    ) : typeof value === 'number' ? (
                      <span className="text-yellow-300">{value}</span>
                    ) : (
                      value
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // 查询结果可视化组件
  const QueryResultsViz = ({ results }: { results: any[] }) => (
    <div className="bg-white/5 rounded-lg border border-white/10 p-4">
      <h4 className="font-semibold text-purple-300 mb-3">查询结果分析</h4>
      <div className="space-y-4">
        {results.map((result, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded border border-white/10">
            <div className="flex-1">
              <div className="text-white font-mono text-sm">{result.userId}</div>
              <div className="text-gray-400 text-xs">最后活跃: {result.lastActive}</div>
            </div>
            <div className="text-right">
              <div className="text-yellow-300 font-bold">¥{result.totalSpent}</div>
              <div className="text-gray-400 text-xs">{result.purchaseCount}次购买</div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4 text-center">
        <div className="bg-blue-500/20 rounded p-2">
          <div className="text-blue-300 font-bold">
            ¥{results.reduce((sum, r) => sum + r.totalSpent, 0).toLocaleString()}
          </div>
          <div className="text-blue-200 text-xs">总销售额</div>
        </div>
        <div className="bg-green-500/20 rounded p-2">
          <div className="text-green-300 font-bold">{results.length}</div>
          <div className="text-green-200 text-xs">用户数量</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white p-6">
      {/* 头部信息栏 - 重新设计 */}
      <header className="mb-6">
        <div className="bg-white/5 rounded-2xl border border-white/10 p-6 backdrop-blur-sm">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-6">
              {/* 时间显示 */}
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  {formatTime(timeLeft)}
                </div>
                <div className="text-sm text-gray-400 mt-1">剩余时间</div>
              </div>
              
              <div className="h-12 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
              
              {/* 面试信息 */}
              <div>
                <div className="text-xl font-bold text-white">大数据工程师面试</div>
                <div className="text-sm text-gray-400 flex space-x-4 mt-1">
                  <span>编号: BD2024001</span>
                  <span>•</span>
                  <span>应聘: 王工程师</span>
                </div>
              </div>
            </div>
            
            {/* 状态指示器 */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-green-500/20 px-4 py-2 rounded-full border border-green-400/30">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm">集群在线</span>
              </div>
              
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="font-bold text-white">王</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 主要内容区域 - 创新布局 */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-[calc(100vh-180px)]">
        
        {/* 左侧：题目和数据流 */}
        <div className="xl:col-span-1 space-y-6">
          {/* 题目卡片 */}
          <div className="bg-white/5 rounded-2xl border border-white/10 p-6 backdrop-blur-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold text-purple-400">{currentStageData.title}</h2>
                <p className="text-gray-300 mt-1">{currentStageData.description}</p>
              </div>
              <div className="flex space-x-2">
                <span className="px-3 py-1 bg-purple-500/20 border border-purple-400/30 rounded-full text-purple-400 text-sm">
                  {formatTime(currentStageData.timeLimit)}
                </span>
              </div>
            </div>
            
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                {currentStageData.content}
              </div>
            </div>
          </div>

          {/* 数据流水线 */}
          <div className="bg-white/5 rounded-2xl border border-white/10 p-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-blue-400 mb-4 flex items-center">
              <span className="mr-2">🌊</span>
              实时数据流水线
            </h3>
            <DataPipeline nodes={currentStageData.dataFlow} />
          </div>

          {/* 数据样本预览 */}
          <div className="bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
            <DataTablePreview 
              data={currentStageData.dataSample} 
              title="数据样本预览" 
            />
          </div>
        </div>

        {/* 中央：代码编辑和执行结果 */}
        <div className="xl:col-span-2 grid grid-rows-2 gap-6">
          {/* 代码编辑区域 */}
          <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden backdrop-blur-sm">
            <div className="flex justify-between items-center p-4 border-b border-white/10 bg-white/5">
              <div className="flex space-x-1">
                {['code', 'plan', 'results'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeTab === tab
                        ? 'bg-gradient-to-r from-purple-500 to-blue-600 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {tab === 'code' && '代码编辑'}
                    {tab === 'plan' && '执行计划'}
                    {tab === 'results' && '查询结果'}
                  </button>
                ))}
              </div>
              
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-400 font-mono">
                  {currentStageData.language.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="p-4 h-64">
              {activeTab === 'code' && (
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full h-full bg-gray-800/50 border border-gray-600 rounded-lg p-4 text-white font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-400"
                  spellCheck={false}
                />
              )}
              
              {activeTab === 'plan' && (
                <ExecutionPlanViz plan={executionPlan} />
              )}
              
              {activeTab === 'results' && (
                <QueryResultsViz results={queryResults} />
              )}
            </div>
          </div>

          {/* 执行监控和操作区域 */}
          <div className="grid grid-cols-2 gap-6">
            {/* 集群监控 */}
            <div className="bg-white/5 rounded-2xl border border-white/10 p-6 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-green-400 mb-4 flex items-center">
                <span className="mr-2">📊</span>
                集群资源监控
              </h3>
              <div className="space-y-4">
                {[
                  { label: 'CPU使用率', value: 65, color: 'from-cyan-500 to-blue-500' },
                  { label: '内存使用', value: 78, color: 'from-purple-500 to-pink-500' },
                  { label: '网络IO', value: 42, color: 'from-green-500 to-teal-500' },
                  { label: '磁盘使用', value: 55, color: 'from-yellow-500 to-orange-500' }
                ].map((metric, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">{metric.label}</span>
                      <span className="text-white font-mono">{metric.value}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full bg-gradient-to-r ${metric.color} transition-all duration-500`}
                        style={{ width: `${metric.value}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 操作面板 */}
            <div className="bg-white/5 rounded-2xl border border-white/10 p-6 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-yellow-400 mb-4 flex items-center">
                <span className="mr-2">⚡</span>
                作业控制
              </h3>
              
              <div className="space-y-4">
                <button className="w-full bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white py-3 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2">
                  <span>🚀</span>
                  <span>提交Spark作业</span>
                </button>
                
                <button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2">
                  <span>🔍</span>
                  <span>查看执行计划</span>
                </button>

                <div className="flex space-x-3">
                  <button
                    onClick={handlePreviousStage}
                    disabled={currentStage === 0}
                    className="flex-1 bg-white/10 border border-white/20 hover:bg-white/20 text-white py-2 rounded-lg transition-all disabled:opacity-50"
                  >
                    上一题
                  </button>
                  
                  {currentStage === interviewStages.length - 1 ? (
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white py-2 rounded-lg font-semibold transition-all disabled:opacity-50 flex items-center justify-center"
                    >
                      {isSubmitting ? '提交中...' : '完成面试'}
                    </button>
                  ) : (
                    <button
                      onClick={handleNextStage}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white py-2 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2"
                    >
                      <span>⏭️</span>
                      <span>下一题</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 大数据特有的背景装饰 */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        {/* 数据节点网络 */}
        <div className="absolute inset-0 opacity-20">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-blue-400 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>
        
        {/* 流动的数据线 */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%">
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
            {Array.from({ length: 8 }).map((_, i) => (
              <path
                key={i}
                d={`M ${Math.random() * 100} ${Math.random() * 100} 
                    C ${Math.random() * 100} ${Math.random() * 100},
                      ${Math.random() * 100} ${Math.random() * 100},
                      ${Math.random() * 100} ${Math.random() * 100}`}
                stroke="url(#gradient)"
                strokeWidth="0.5"
                fill="none"
                strokeDasharray="4 4"
              >
                <animate
                  attributeName="stroke-dashoffset"
                  from="0"
                  to="20"
                  dur={`${3 + Math.random() * 4}s`}
                  repeatCount="indefinite"
                />
              </path>
            ))}
          </svg>
        </div>

        {/* 装饰性图标 */}
        <div className="absolute top-10 right-10 opacity-10 text-6xl">📈</div>
        <div className="absolute bottom-10 left-10 opacity-10 text-6xl">🔍</div>
        <div className="absolute top-1/3 left-1/4 opacity-10 text-4xl">⚡</div>
        <div className="absolute bottom-1/3 right-1/4 opacity-10 text-4xl">🌊</div>
      </div>
    </div>
  );
};

export default BigDataInterview;