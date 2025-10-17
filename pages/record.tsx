import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ChatMessage {
  id: number;
  sender: 'interviewer' | 'candidate' | 'system';
  content: string;
  timestamp?: string;
  annotation?: string;
  isFollowUp?: boolean;
}

const InterviewChatRecord: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'technical' | 'behavioral' | 'followup'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // 模拟聊天记录数据
  const chatMessages: ChatMessage[] = [
  {
    id: 1,
    sender: 'interviewer',
    content: '张伟你好，很高兴今天能和你交流！看到你的简历中Python经验很丰富，我们团队目前很多AI项目都深度依赖Python生态。能和我们详细分享一下你遇到过的比较有挑战性的编程问题吗？我们很想知道你是如何分析问题并找到解决方案的。',
    annotation: '岗位要求-基础能力1"至少熟悉一门语言"；简历-技术能力"熟练使用Python"',
    timestamp: '10:00'
  },
  {
    id: 2,
    sender: 'candidate',
    content: '非常感谢您的提问！在我参与的数学建模竞赛中，我主要负责处理一个包含数十个特征维度的高维数据集。这个项目最大的挑战在于数据质量问题和计算效率优化。我系统性地使用Pandas进行数据清洗和特征工程，并通过NumPy向量化操作显著提升了计算性能，最终为后续的机器学习建模打下了坚实基础。',
    annotation: '简历-项目二"使用Python, Pandas"',
    timestamp: '10:02'
  },
  {
    id: 3,
    sender: 'interviewer',
    content: '听起来这个项目确实很有挑战性！数据质量问题是AI项目中经常遇到的难点。能再具体分享一下你在数据清洗过程中遇到的具体技术挑战吗？比如，你们是如何处理缺失值和异常值的，这些处理方式背后的技术考量是什么？',
    annotation: '追问意图：考察对技术细节的掌握深度和实际问题解决能力',
    isFollowUp: true,
    timestamp: '10:03'
  },
  {
    id: 4,
    sender: 'candidate',
    content: '确实，数据质量是整个项目的关键。我们面临的主要挑战是大约30%的缺失值和不同特征间的尺度差异问题。在技术实现上，我对连续型特征采用了KNN算法进行智能填充，这样能保持数据分布特性；对离散型特征则使用众数填充并结合了平滑处理。所有特征都进行了标准化处理，这个预处理流程为后续的PCA降维和模型训练提供了高质量的数据输入。',
    annotation: '简历-项目二"负责核心算法设计与实现"',
    timestamp: '10:05'
  },
  {
    id: 5,
    sender: 'interviewer',
    content: '非常专业的处理方式！看到你在CNN项目中将模型准确率从85%提升到92%，这个提升幅度确实很显著。除了简历中提到的数据增强和学习率衰减策略，能否详细介绍一下你还尝试了哪些优化方法？我们特别感兴趣的是这些方法背后的技术选型思考。',
    annotation: '简历-项目一"测试集准确率从85%提升至92%"',
    timestamp: '10:08'
  },
  {
    id: 6,
    sender: 'candidate',
    content: '感谢您的关注！在这个项目中，我确实进行了多方面的优化探索。除了基础的数据增强和学习率调度，我重点对比了不同优化器的表现，包括SGD、Adam以及它们的变种。同时引入了标签平滑技术来缓解过拟合问题，还尝试了不同的权重初始化策略。这些优化不是孤立进行的，而是通过系统的消融实验来验证每个改进点的实际效果，确保最终的性能提升是稳定可靠的。',
    annotation: '简历-项目一"深入分析了模型训练过程"',
    timestamp: '10:10'
  },
  {
    id: 7,
    sender: 'interviewer',
    content: '很系统的优化思路！基于你丰富的实验经验，我们想深入了解一个技术细节：在不同的业务场景下，你是如何选择优化器的？具体来说，根据你的实践观察，在什么情况下传统的SGD会比自适应优化器如Adam表现更好？',
    annotation: '追问意图：考察对优化器原理的理解，而非仅停留在使用层面',
    isFollowUp: true,
    timestamp: '10:11'
  },
  {
    id: 8,
    sender: 'candidate',
    content: '这是一个很好的技术问题。通过多个项目的实践，我发现优化器的选择确实需要结合具体场景。当训练数据质量较高、噪声较小时，SGD配合恰当的动量参数和学习率衰减策略，往往能获得更好的泛化性能。特别是在模型需要收敛到尖锐最小值的情况下，SGD的表现通常更稳定。而Adam等自适应优化器虽然收敛速度快，但其自适应学习率机制有时会在最优解附近产生震荡，影响最终性能。这个认识也促使我在项目中建立了系统的优化器评估流程。',
    annotation: '简历-核心优势"利用物理中的"优化"思想对比了SGD和Adam"',
    timestamp: '10:13'
  },
  {
    id: 9,
    sender: 'interviewer',
    content: '非常深入的见解！你的简历中强调具备很强的"数理逻辑思维"，这确实是AI研发工程师很重要的素质。我们想请你结合一个具体的技术实践案例，详细说明这个思维优势是如何帮助你解决实际工程问题的？特别是在算法选择和优化决策方面。',
    annotation: '岗位亮点"跨域技术实践：数学、物理等理科思维优势"；简历-核心优势"严密的数理逻辑思维"',
    timestamp: '10:15'
  },
  {
    id: 10,
    sender: 'candidate',
    content: '在我的项目经历中，数理逻辑思维确实发挥了关键作用。一个典型的例子是在优化聚类算法时，我发现传统欧氏距离在处理高维相关性数据时存在局限性。通过严格的数学分析，我认识到需要引入能够考虑特征协方差结构的距离度量。于是系统性地对比了马氏距离、余弦距离等多种度量方式，最终选择马氏距离并进行了适应性改进，这个基于数学理解的优化使得聚类结果的准确性和可解释性都得到了显著提升。',
    annotation: '简历-项目二"应用聚类分析(K-Means)对样本进行科学分级"',
    timestamp: '10:17'
  },
  {
    id: 11,
    sender: 'interviewer',
    content: '这个技术改进思路很值得借鉴！基于这个案例，我们想进一步了解：在推进这样的技术优化时，你是如何建立完整的评估体系来验证改进效果的？特别是如何平衡客观量化指标和实际业务价值之间的关系？',
    annotation: '追问意图：考察评估和验证模型的能力，以及科学思维的严谨性',
    isFollowUp: true,
    timestamp: '10:18'
  },
  {
    id: 12,
    sender: 'candidate',
    content: '我建立了一个多层次的评估体系来确保改进的有效性。在技术层面，我采用轮廓系数、Calinski-Harabasz指数等客观指标进行量化评估；在业务层面，我设计了交叉验证实验来验证聚类结果的实际意义。更重要的是，我注重这些指标之间的一致性分析，确保技术改进不仅提升量化指标，同时也能带来实际的业务价值。这种系统化的评估方法帮助我在多个项目中做出了更可靠的技术决策。',
    annotation: '简历-核心优势"善于将复杂问题抽象为数学模型并寻求数值解"',
    timestamp: '10:20'
  }
];

  // 自动滚动到底部
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, []);

  // 过滤消息
  const filteredMessages = chatMessages.filter(message => {
    const matchesSearch = searchTerm === '' || 
      message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.annotation?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeCategory === 'all') return matchesSearch;
    if (activeCategory === 'followup') return matchesSearch && message.isFollowUp;
    if (activeCategory === 'technical') return matchesSearch && message.annotation?.includes('技术');
    if (activeCategory === 'behavioral') return matchesSearch && message.annotation?.includes('思维');
    
    return matchesSearch;
  });

  const getSenderColor = (sender: string, isFollowUp?: boolean) => {
    if (isFollowUp) return 'border-cyan-400 bg-cyan-500/10';
    if (sender === 'interviewer') return 'border-blue-400 bg-blue-500/10';
    if (sender === 'candidate') return 'border-purple-400 bg-purple-500/10';
    return 'border-gray-400 bg-gray-500/10';
  };

  const getSenderIcon = (sender: string) => {
    if (sender === 'interviewer') return '🤵';
    if (sender === 'candidate') return '👨‍💻';
    return '💬';
  };

  const getSenderName = (sender: string, isFollowUp?: boolean) => {
    if (isFollowUp) return '面试官追问';
    if (sender === 'interviewer') return '面试官';
    if (sender === 'candidate') return '张伟';
    return '系统';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white p-6">
      {/* 动态粒子背景 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(40)].map((_, i) => (
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
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
            💬 AI面试聊天记录
          </h1>
          <p className="text-gray-300 text-lg">
            候选人：张伟 • 岗位：AI工程师 • 面试时长：45分钟
          </p>
        </motion.header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 侧边栏 - 筛选和统计 */}
          <div className="lg:col-span-1 space-y-6">
            {/* 搜索框 */}
            <motion.div 
              className="bg-white/5 backdrop-blur-lg rounded-2xl p-4 border border-white/10"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h3 className="text-lg font-semibold text-blue-400 mb-3">搜索聊天记录</h3>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="搜索关键词..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                />
                <div className="absolute right-3 top-2 text-gray-400">
                  🔍
                </div>
              </div>
            </motion.div>

            {/* 分类筛选 */}
            <motion.div 
              className="bg-white/5 backdrop-blur-lg rounded-2xl p-4 border border-white/10"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="text-lg font-semibold text-blue-400 mb-3">对话分类</h3>
              <div className="space-y-2">
                {[
                  { key: 'all', label: '全部对话', count: chatMessages.length, icon: '💬' },
                  { key: 'technical', label: '技术问题', count: chatMessages.filter(m => m.annotation?.includes('技术')).length, icon: '🔧' },
                  { key: 'behavioral', label: '思维考察', count: chatMessages.filter(m => m.annotation?.includes('思维')).length, icon: '🧠' },
                  { key: 'followup', label: '深度追问', count: chatMessages.filter(m => m.isFollowUp).length, icon: '🎯' }
                ].map((category) => (
                  <button
                    key={category.key}
                    onClick={() => setActiveCategory(category.key as any)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                      activeCategory === category.key
                        ? 'bg-blue-500/20 border border-blue-400 text-blue-400'
                        : 'bg-white/5 border border-white/5 text-gray-300 hover:border-cyan-400/50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{category.icon}</span>
                      <span>{category.label}</span>
                    </div>
                    <span className="bg-white/10 px-2 py-1 rounded text-xs">
                      {category.count}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* 面试统计 */}
            <motion.div 
              className="bg-white/5 backdrop-blur-lg rounded-2xl p-4 border border-white/10"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-lg font-semibold text-blue-400 mb-3">面试统计</h3>
              <div className="space-y-3">
                {[
                  { label: '总对话轮次', value: chatMessages.length, color: 'text-cyan-400' },
                  { label: '技术问题数', value: chatMessages.filter(m => m.annotation?.includes('技术')).length, color: 'text-blue-400' },
                  { label: '深度追问数', value: chatMessages.filter(m => m.isFollowUp).length, color: 'text-purple-400' },
                  { label: '平均响应时间', value: '2.3分钟', color: 'text-green-400' }
                ].map((stat, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-gray-300 text-sm">{stat.label}</span>
                    <span className={`font-semibold ${stat.color}`}>{stat.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* 主内容区 - 聊天记录 */}
          <div className="lg:col-span-3">
            <motion.div 
              className="bg-white/5 backdrop-blur-lg rounded-2xl border border-cyan-400/30 h-[600px] flex flex-col"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* 聊天头部 */}
              <div className="p-4 border-b border-cyan-400/30 bg-cyan-900/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">💬</div>
                    <div>
                      <h3 className="text-lg font-semibold text-cyan-300">AI技术面试对话记录</h3>
                      <p className="text-cyan-200/80 text-sm">实时记录 • 智能标注 • 深度分析</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-cyan-300 text-sm">进行中</div>
                    <div className="text-cyan-200/60 text-xs">已进行 25 分钟</div>
                  </div>
                </div>
              </div>

              {/* 聊天记录容器 */}
              <div 
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-4"
              >
                {filteredMessages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-xl p-4 border-2 ${getSenderColor(message.sender, message.isFollowUp)} backdrop-blur-sm`}
                  >
                    {/* 消息头部 */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getSenderIcon(message.sender)}</span>
                        <span className="font-semibold text-white">
                          {getSenderName(message.sender, message.isFollowUp)}
                        </span>
                        {message.isFollowUp && (
                          <span className="bg-cyan-500/20 text-cyan-300 text-xs px-2 py-1 rounded-full">
                            深度追问
                          </span>
                        )}
                      </div>
                      {message.timestamp && (
                        <span className="text-gray-400 text-sm">{message.timestamp}</span>
                      )}
                    </div>

                    {/* 消息内容 */}
                    <div className="text-white leading-relaxed mb-2">
                      {message.content}
                    </div>

                    {/* 标注信息 */}
                    {message.annotation && (
                      <div className="mt-2 p-2 bg-white/5 rounded-lg border-l-4 border-cyan-400">
                        <div className="flex items-start space-x-2">
                          <span className="text-cyan-400 text-sm">📌</span>
                          <span className="text-cyan-200/80 text-sm flex-1">
                            {message.annotation}
                          </span>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}

                {/* 面试结束标识 */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-center py-8"
                >
                  <div className="inline-flex items-center space-x-2 bg-white/5 rounded-full px-4 py-2 border border-cyan-400/30">
                    <span className="text-cyan-400">🎯</span>
                    <span className="text-cyan-300 text-sm">面试正在进行中...</span>
                  </div>
                </motion.div>
              </div>

              {/* 底部操作栏 */}
              <div className="p-4 border-t border-cyan-400/30 bg-cyan-900/20">
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-white text-sm hover:border-cyan-400 transition-all">
                      导出记录
                    </button>
                    <button className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-white text-sm hover:border-cyan-400 transition-all">
                      添加笔记
                    </button>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-cyan-200/80">
                    <span>AI分析中...</span>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* 底部统计信息 */}
        <motion.div 
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
            <div className="text-2xl font-bold text-cyan-400 mb-2">87%</div>
            <div className="text-gray-400">技术匹配度</div>
            <div className="text-cyan-300 text-sm mt-1">基于对话内容分析</div>
          </div>
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
            <div className="text-2xl font-bold text-blue-400 mb-2">4.2/5</div>
            <div className="text-gray-400">问题解决深度</div>
            <div className="text-blue-300 text-sm mt-1">追问环节表现优秀</div>
          </div>
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
            <div className="text-2xl font-bold text-purple-400 mb-2">92%</div>
            <div className="text-gray-400">沟通表达能力</div>
            <div className="text-purple-300 text-sm mt-1">逻辑清晰，表达准确</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default InterviewChatRecord;