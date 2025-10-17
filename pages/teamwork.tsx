import React, { useState, useRef, useEffect } from 'react';
import { Send, Users, MessageSquare, Clock, User, Bot, Crown } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai' | 'team-member';
  senderName: string;
  timestamp: Date;
  role?: string;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  isOnline: boolean;
  isSpeaking: boolean;
}

const TeamInterviewPage: React.FC = () => {
  const [isClient, setIsClient] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 只在客户端初始化状态
  useEffect(() => {
    setIsClient(true);
    
    // 初始化消息
    setMessages([
      {
        id: '1',
        content: '欢迎参加团队协作模拟面试！我是面试官Alex，今天我们将讨论一个产品设计挑战。',
        sender: 'ai',
        senderName: 'Alex (面试官)',
        timestamp: new Date(),
        role: '面试官'
      },
      {
        id: '2',
        content: '大家好，我是Sarah，负责产品设计方面的问题。',
        sender: 'team-member',
        senderName: 'Sarah',
        timestamp: new Date(Date.now() - 300000),
        role: '产品设计师'
      },
      {
        id: '3',
        content: '我是Mike，关注技术实现方面。很高兴认识大家！',
        sender: 'team-member',
        senderName: 'Mike',
        timestamp: new Date(Date.now() - 240000),
        role: '技术主管'
      }
    ]);
    
    // 初始化团队成员
    setTeamMembers([
      { id: '1', name: 'Alex', role: '面试官', isOnline: true, isSpeaking: true },
      { id: '2', name: 'Sarah', role: '产品设计师', isOnline: true, isSpeaking: false },
      { id: '3', name: 'Mike', role: '技术主管', isOnline: true, isSpeaking: false },
      { id: '4', name: '您', role: '候选人', isOnline: true, isSpeaking: false },
      { id: '5', name: 'Emma', role: '项目经理', isOnline: false, isSpeaking: false }
    ]);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isClient) {
      scrollToBottom();
    }
  }, [messages, isClient]);

  const handleSendMessage = () => {
    if (inputMessage.trim() === '' || !isClient) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      senderName: '您',
      timestamp: new Date(),
      role: '候选人'
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');

    // 模拟团队回复
    setTimeout(() => {
      const teamReplies = [
        { name: 'Sarah', role: '产品设计师', content: '很好的观点！从用户体验角度来说，这个方案确实有潜力。' },
        { name: 'Mike', role: '技术主管', content: '技术上实现这个功能需要考虑到架构扩展性，你有什么想法吗？' },
        { name: 'Alex', role: '面试官', content: '能详细说明一下这个方案如何解决我们之前讨论的用户痛点吗？' }
      ];

      const randomReply = teamReplies[Math.floor(Math.random() * teamReplies.length)];
      const replyMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: randomReply.content,
        sender: 'team-member',
        senderName: randomReply.name,
        timestamp: new Date(),
        role: randomReply.role
      };

      setMessages(prev => [...prev, replyMessage]);
      
      // 更新发言状态
      setTeamMembers(prev => 
        prev.map(member => 
          member.name === randomReply.name 
            ? { ...member, isSpeaking: true }
            : { ...member, isSpeaking: false }
        )
      );
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 服务端渲染时返回简单的加载状态
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-blue-400">加载团队面试界面...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white p-6">
      {/* 静态粒子背景 - 避免随机生成导致的 hydration 错误 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* 使用固定的粒子位置和颜色，避免随机性 */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-pulse"
            style={{
              width: `${(i % 5) + 2}px`,
              height: `${(i % 5) + 2}px`,
              top: `${(i * 15) % 100}%`,
              left: `${(i * 20) % 100}%`,
              backgroundColor: ['#407BBF', '#5D8FDC', '#7BA9FF'][i % 3],
              opacity: 0.3 + (i * 0.02),
              animationDelay: `${(i * 0.5)}s`,
              animationDuration: `${5 + (i % 5)}s`
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* 头部 */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-500/20 rounded-2xl border border-cyan-400/30">
                <Users className="w-8 h-8 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  团队协作模拟面试
                </h1>
                <p className="text-gray-300 flex items-center space-x-2 mt-1">
                  <Clock className="w-4 h-4" />
                  <span>产品设计挑战讨论 • 进行中</span>
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="bg-white/5 rounded-xl px-4 py-2 border border-white/10">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400 font-medium">实时讨论中</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 左侧团队面板 */}
          <div className="lg:col-span-1 space-y-6">
            {/* 团队状态卡片 */}
            <div className="bg-white/5 rounded-2xl border border-white/10 p-6 backdrop-blur-sm">
              <div className="flex items-center space-x-2 mb-4">
                <Users className="w-5 h-5 text-blue-400" />
                <h2 className="text-lg font-semibold text-blue-400">团队成员</h2>
              </div>
              
              <div className="space-y-3">
                {teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className={`p-3 rounded-xl border transition-all duration-300 ${
                      member.isSpeaking
                        ? 'border-cyan-400 bg-cyan-400/10'
                        : 'border-white/10 bg-white/5'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          member.role === '面试官' 
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                            : member.role === '候选人'
                            ? 'bg-gradient-to-r from-blue-500 to-cyan-400'
                            : 'bg-gradient-to-r from-gray-600 to-gray-400'
                        }`}>
                          {member.role === '面试官' && <Crown className="w-4 h-4 text-white" />}
                          {member.role === '候选人' && <User className="w-4 h-4 text-white" />}
                          {!['面试官', '候选人'].includes(member.role) && <Bot className="w-4 h-4 text-white" />}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-900 ${
                          member.isOnline ? 'bg-green-400' : 'bg-gray-500'
                        }`} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-white truncate">
                            {member.name}
                            {member.isSpeaking && (
                              <span className="ml-2 w-2 h-2 bg-cyan-400 rounded-full animate-pulse inline-block" />
                            )}
                          </span>
                        </div>
                        <p className="text-sm text-gray-300 truncate">{member.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 讨论主题 */}
            <div className="bg-white/5 rounded-2xl border border-white/10 p-6 backdrop-blur-sm">
              <div className="flex items-center space-x-2 mb-4">
                <MessageSquare className="w-5 h-5 text-purple-400" />
                <h2 className="text-lg font-semibold text-purple-400">讨论主题</h2>
              </div>
              
              <div className="space-y-3">
                <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-400/30">
                  <h3 className="font-semibold text-purple-300">产品设计挑战</h3>
                  <p className="text-sm text-gray-300 mt-1">
                    设计一个帮助远程团队协作的AI工具，需要考虑用户体验和技术可行性。
                  </p>
                </div>
                
                <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-400/30">
                  <h3 className="font-semibold text-blue-300">评估标准</h3>
                  <ul className="text-sm text-gray-300 mt-1 space-y-1">
                    <li>• 创新思维</li>
                    <li>• 团队协作</li>
                    <li>• 问题解决能力</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* 主聊天区域 */}
          <div className="lg:col-span-3 flex flex-col">
            <div className="flex-1 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm overflow-hidden flex flex-col">
              {/* 消息列表 */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-2xl rounded-2xl p-4 border backdrop-blur-sm ${
                        message.sender === 'user'
                          ? 'bg-gradient-to-r from-blue-500/20 to-purple-600/20 border-blue-400/30'
                          : message.sender === 'ai'
                          ? 'bg-white/5 border-cyan-400/30'
                          : 'bg-white/5 border-purple-400/30'
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            message.sender === 'user'
                              ? 'bg-gradient-to-r from-blue-500 to-cyan-400'
                              : message.sender === 'ai'
                              ? 'bg-gradient-to-r from-cyan-500 to-blue-500'
                              : 'bg-gradient-to-r from-purple-500 to-pink-500'
                          }`}
                        >
                          {message.sender === 'user' ? '您' : message.senderName.charAt(0)}
                        </div>
                        <span className="font-semibold text-white">
                          {message.senderName}
                        </span>
                        <span className="text-xs text-gray-400">
                          {message.timestamp.toLocaleTimeString('zh-CN', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        {message.role && (
                          <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-gray-300">
                            {message.role}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-100 leading-relaxed">{message.content}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* 输入区域 */}
              <div className="border-t border-white/10 p-6 bg-white/5">
                <div className="flex space-x-4">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="输入您的想法参与团队讨论..."
                    className="flex-1 bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent backdrop-blur-sm"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-semibold text-white transition-all duration-200 flex items-center space-x-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>发送</span>
                  </button>
                </div>
                <div className="flex items-center justify-between mt-3 text-sm text-gray-400">
                  <div className="flex items-center space-x-4">
                    <span>按 Enter 发送</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span>实时连接</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 底部状态栏 */}
        <footer className="mt-6 flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center space-x-6">
            <span>团队成员: {teamMembers.filter(m => m.isOnline).length}/{teamMembers.length}</span>
            <span>消息: {messages.length}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
            <span>模拟AI面试官系统运行中</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default TeamInterviewPage;