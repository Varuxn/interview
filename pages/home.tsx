// src/app/resume-upload/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { fetchLLMResponse } from "./api/llmApi";
import { useAuth } from "@clerk/nextjs";
import { AllUserData } from "../components/types";

// 岗位数据
const positions = [
  {
    id: 1,
    name: "人工智能",
    description: "机器学习工程师、算法研究员、NLP工程师...",
  },
  {
    id: 2,
    name: "大数据",
    description: "大数据开发工程师、数据仓库工程师、数据分析师...",
  },
  {
    id: 3,
    name: "物联网",
    description: "嵌入式开发工程师、物联网系统架构师、传感器算法工程师...",
  },
  {
    id: 4,
    name: "智能系统",
    description: "自动驾驶系统工程师、机器人控制工程师、智能硬件产品经理...",
  }
];

// 面试官数据
const interviewers = [
  {
    id: "Alex",
    name: "Alex",
    description: "高级算法工程师 | 理性冷静 | 深挖技术细节",
    level: "L4",
    avatar: "/placeholders/Alex.png"
  },
  {
    id: "Bob",
    name: "Bob",
    description: "CTO | 强势直接 | 模拟极端场景",
    level: "L8",
    avatar: "/placeholders/Bob.png"
  },
  {
    id: "Coty",
    name: "Coty",
    description: "产品总监 | 亲和力强 | 关注用户需求",
    level: "L6",
    avatar: "/placeholders/Coty.png"
  }
];

// 技能选项
const skills = [
  "机器学习", "数据分析", "Python", "Java", "TensorFlow", 
  "SQL", "深度学习", "自然语言处理", "计算机视觉", "云计算",
  "Docker", "Kubernetes", "React", "Node.js", "项目管理"
];

export default function ResumeUploadPage() {
  // 文件上传相关状态
  const [isUploaded, setIsUploaded] = useState(false);
  const [fileName, setFileName] = useState("");
  const [documentContext, setDocumentContext] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { userId, isLoaded } = useAuth();
  const user_id = userId || "default_user";
  
  // 关键词状态
  const [keywords, setKeywords] = useState<string[]>([]);
  
  // 表单数据
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    expertise: "",
    position: positions[0],
    interviewer: interviewers[0],
    selectedSkills: [] as string[]
  });
  
  // 面试官图片上传
  const [avatarUploads, setAvatarUploads] = useState<{[key: string]: string}>({});
  const fileInputRefs = useRef<{[key: string]: HTMLInputElement | null}>({});
  
  // 初始化时从localStorage加载数据
 useEffect(() => {
    const userDataKey = "userdata";
    const allUserDataJSON = localStorage.getItem(userDataKey);
    const allUserData: AllUserData = allUserDataJSON ? JSON.parse(allUserDataJSON) : {};
    
    const currentUserData = allUserData[user_id];
    
    if (currentUserData) {
      setFormData(currentUserData.resumeSetupData);
      setKeywords(currentUserData.resumeKeywords || []);
      setDocumentContext(currentUserData.resumeContent || "");
      setAvatarUploads(currentUserData.interviewerAvatars || {});
      
      if (currentUserData.resumeContent) {
        setIsUploaded(true);
      } else {
        setIsUploaded(false);
      }
    }
  }, [user_id]);
// 关键词提取函数
  const extractKeywords = async (text: string) => {
  setIsExtracting(true);
  try {
    const systemPrompt = `你是一个专业的简历分析专家，请严格按以下要求提取关键词：
1. 必须提取10-15个能概括候选人核心能力的关键词
2. 每个关键词限定为2-4个汉字
3. 用中文逗号分隔关键词，不要编号
4. 必须包含技术技能、软技能和工作经历方面的关键词
5. 示例："机器学习, 数据分析, 团队管理"`;

    const userPrompt = `请从以下简历文本中提取关键词：${text.slice(0, 3000)}`;
    
    const { data, error } = await fetchLLMResponse(systemPrompt, userPrompt);
    
    if (error) throw new Error(error);
    if (!data?.llm_response?.choices?.[0]?.message?.content) {
      throw new Error('未获取到有效的关键词数据');
    }
    
    const rawKeywords = data.llm_response.choices[0].message.content;
    console.log('原始关键词响应:', rawKeywords);

    let processedKeywords = rawKeywords
      .split(/[,，]/)
      .map((k: string) => k.trim().replace(/[^\u4e00-\u9fa5]/g, ''))
      .filter((k: string) => k.length >= 2 && k.length <= 5);

    // 如果关键词不足，补充常见关键词
    if (processedKeywords.length < 10) {
      console.warn(`关键词不足，已补充至10个`);
      const defaultKeywords = ['团队协作', '问题解决', '学习能力', '沟通表达', '责任心'];
      processedKeywords = [...new Set([...processedKeywords, ...defaultKeywords])].slice(0, 10);
    }

    setKeywords(processedKeywords);
    localStorage.setItem('resumeKeywords', JSON.stringify(processedKeywords));
    toast.success(`成功提取${processedKeywords.length}个关键词`);
  } catch (err) {
    console.error('关键词提取失败:', err);
    toast.error("关键词提取失败，但简历已上传");
  } finally {
    setIsExtracting(false);
  }
};

  const handleFileUpload = async (file: File) => {
    if (file.type !== "application/pdf") {
      toast.error("请上传PDF格式文件");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("文件大小不能超过10MB");
      return;
    }

    setIsLoading(true);
    setFileName(file.name);
    // 清除之前的关键词
    setKeywords([]);
    localStorage.removeItem('resumeKeywords');

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/parse-pdf", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setDocumentContext(data.text);
        setIsUploaded(true);
        toast.success("简历解析成功");
        
        // 关键修改：解析完PDF后自动开始提取关键词
        await extractKeywords(data.text);
      } else {
        toast.error(data.error || "文件解析失败");
      }
    } catch (error) {
      console.error("上传错误:", error);
      toast.error("上传过程中出错");
    } finally {
      setIsLoading(false);
    }
  };

  // 处理面试官头像上传
  const handleAvatarUpload = (interviewerId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast.error("请上传图片文件");
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const imageUrl = reader.result as string;
      setAvatarUploads(prev => {
        const newAvatars = {...prev, [interviewerId]: imageUrl};
        localStorage.setItem('interviewerAvatars', JSON.stringify(newAvatars));
        return newAvatars;
      });
    };
    reader.readAsDataURL(file);
  };

  // 触发文件选择
  const triggerFileInput = (interviewerId: string) => {
    if (fileInputRefs.current[interviewerId]) {
      fileInputRefs.current[interviewerId]?.click();
    }
  };

  // 拖拽事件处理
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // 表单字段更新
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 技能选择切换
  const toggleSkill = (skill: string) => {
    setFormData(prev => {
      if (prev.selectedSkills.includes(skill)) {
        return {
          ...prev,
          selectedSkills: prev.selectedSkills.filter(s => s !== skill)
        };
      } else {
        return {
          ...prev,
          selectedSkills: [...prev.selectedSkills, skill]
        };
      }
    });
  };

  const saveSettingsToDB = async () => {
    try {
      const response = await fetch('/api/databases/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: user_id,
          interviewer: formData.interviewer.id,
          position: formData.position.id
        })
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to save settings to database');
      }
      
      return true;
    } catch (error) {
      console.error('数据库保存失败:', error);
      toast.error("设置保存到数据库失败");
      return false;
    }
  };
  // 保存数据
  const handleSave = async () => {
    setIsSaving(true);
    
    const userDataKey = "userdata";
    const allUserDataJSON = localStorage.getItem(userDataKey);
    const allUserData: AllUserData = allUserDataJSON ? JSON.parse(allUserDataJSON) : {};
    
    // 更新当前用户数据
    allUserData[user_id] = {
      resumeSetupData: formData,
      resumeKeywords: keywords,
      resumeContent: documentContext,
      interviewerAvatars: avatarUploads
    };
    
    // 保存回localStorage
    localStorage.setItem(userDataKey, JSON.stringify(allUserData));
    
    // 尝试保存到数据库
    const dbSaveSuccess = await saveSettingsToDB();
    
    setIsSaving(false);
    
    if (dbSaveSuccess) {
      toast.success("所有设置已保存到数据库！");
    } else {
      toast.warning("设置已保存到本地，但数据库保存失败");
    }
    
    window.location.reload();
  };

  // 取消操作
  const handleCancel = () => {
    toast.info("操作已取消");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-0">
      <div className="w-full min-h-screen bg-transparent">
        <div className="bg-transparent h-full flex flex-col">
          {/* 三列布局 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 overflow-hidden p-4">
            {/* 左侧列：简历上传和个人信息 */}
            <div className="flex flex-col space-y-4 h-full">
              {/* 简历上传区域 */}
              <div className="bg-white/5 rounded-xl p-4 flex flex-col h-[45%] border border-white/10 backdrop-blur-sm">
                <h2 className="text-lg font-semibold text-blue-400 mb-3 flex items-center">
                  <svg className="w-5 h-5 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                  </svg>
                  简历上传
                </h2>
                
                <div 
                  className={`border-2 border-dashed rounded-lg p-4 transition-all duration-200 flex-1 flex flex-col justify-center ${
                    isDragging ? "border-cyan-400 bg-cyan-400/10" : "border-cyan-400/30 hover:border-cyan-400 bg-white/5"
                  }`}
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    id="file-upload"
                    accept=".pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file);
                    }}
                    className="hidden"
                    disabled={isLoading}
                  />
                  <label
                    htmlFor="file-upload"
                    className={`cursor-pointer flex flex-col items-center justify-center space-y-4 ${
                      isLoading ? "opacity-50" : ""
                    }`}
                  >
                    <div className="relative">
                      {isLoading ? (
                        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-400 mx-auto"></div>
                      ) : (
                        <>
                          <div className="w-16 h-16 bg-cyan-400/10 rounded-full flex items-center justify-center mx-auto border border-cyan-400/30">
                            <svg
                              className="w-8 h-8 text-cyan-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                              />
                            </svg>
                          </div>
                        </>
                      )}
                    </div>
                    
                    <div className="space-y-1 text-center">
                      <p className="text-sm font-medium text-gray-300">
                        {fileName || (
                          <>
                            <span className="text-cyan-400 font-semibold">点击上传</span>
                            <span className="text-gray-400"> 或拖拽PDF文件到此处</span>
                          </>
                        )}
                      </p>
                      <p className="text-xs text-gray-500">最大10MB</p>
                    </div>
                  </label>
                </div>

                {/* 文件状态显示 */}
                {fileName && (
                  <div className="mt-3 bg-white/5 rounded-lg p-2 flex items-center border border-cyan-400/30">
                    <svg
                      className="w-4 h-4 text-green-500 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-300 truncate">{fileName}</p>
                      <p className="text-xs text-gray-500">
                        {isLoading ? "解析中..." : "已准备就绪"}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* 个人信息区域 */}
              <div className="bg-white/5 rounded-xl p-4 flex flex-col h-[55%] border border-white/10 backdrop-blur-sm">
                <h2 className="text-lg font-semibold text-blue-400 mb-3 flex items-center">
                  <svg className="w-5 h-5 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                  个人信息
                </h2>
                
                <div className="space-y-3 flex-1">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      姓名
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-cyan-400 focus:border-cyan-400 text-gray-300 placeholder-gray-500"
                      placeholder="请输入您的姓名"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      邮箱
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-cyan-400 focus:border-cyan-400 text-gray-300 placeholder-gray-500"
                      placeholder="example@email.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      电话
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-cyan-400 focus:border-cyan-400 text-gray-300 placeholder-gray-500"
                      placeholder="138-xxxx-xxxx"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      擅长领域
                    </label>
                    <input
                      type="text"
                      name="expertise"
                      value={formData.expertise}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-cyan-400 focus:border-cyan-400 text-gray-300 placeholder-gray-500"
                      placeholder="例如：机器学习、前端开发等"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 中间列：岗位选择和面试官选择 */}
            <div className="flex flex-col space-y-4 h-full">
              {/* 岗位选择区域 */}
              <div className="bg-white/5 rounded-xl p-4 flex flex-col h-[45%] border border-white/10 backdrop-blur-sm">
                <h2 className="text-lg font-semibold text-blue-400 mb-3 flex items-center">
                  <svg className="w-5 h-5 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                  应聘岗位
                </h2>
                
                <div className="space-y-2 overflow-y-auto flex-1 pr-2">
                  {positions.map(position => (
                    <div 
                      key={position.id}
                      onClick={() => setFormData(prev => ({ ...prev, position }))}
                      className={`border rounded-lg p-3 cursor-pointer transition-all ${
                        formData.position.id === position.id
                          ? "border-cyan-400 bg-cyan-400/10 shadow-inner"
                          : "border-white/10 hover:border-cyan-400 bg-white/5"
                      }`}
                    >
                      <h3 className="font-medium text-gray-300">{position.name}</h3>
                      <p className="text-sm text-gray-400 mt-1">{position.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 面试官选择区域 */}
              <div className="bg-white/5 rounded-xl p-4 flex flex-col h-[55%] border border-white/10 backdrop-blur-sm">
                <h2 className="text-lg font-semibold text-blue-400 mb-3 flex items-center">
                  <svg className="w-5 h-5 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                  选择面试官
                </h2>
                
                <div className="space-y-2 overflow-y-auto flex-1 pr-2">
                  {interviewers.map(interviewer => {
                    const avatarUrl = avatarUploads[interviewer.id] || interviewer.avatar;
                    
                    return (
                      <div 
                        key={interviewer.id}
                        onClick={() => setFormData(prev => ({ ...prev, interviewer }))}
                        className={`border rounded-lg p-3 cursor-pointer transition-all ${
                          formData.interviewer.id === interviewer.id
                            ? "border-cyan-400 bg-cyan-400/10 shadow-inner"
                            : "border-white/10 hover:border-cyan-400"
                        }`}
                      >
                        <div className="flex items-center">
                          <div 
                            className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-700 cursor-pointer border border-cyan-400/30"
                            onClick={(e) => {
                              e.stopPropagation();
                              triggerFileInput(interviewer.id);
                            }}
                          >
                            {avatarUrl ? (
                              <img 
                                src={avatarUrl} 
                                alt={interviewer.name} 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-800">
                                <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                                </svg>
                              </div>
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              ref={el => { fileInputRefs.current[interviewer.id] = el; }}
                              onChange={(e) => handleAvatarUpload(interviewer.id, e)}
                              className="hidden"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all flex items-center justify-center">
                              <svg className="w-4 h-4 text-white opacity-0 hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                              </svg>
                            </div>
                          </div>
                          <div className="ml-3">
                            <div className="flex items-center">
                              <h4 className="font-medium text-gray-300">{interviewer.name}</h4>
                              <span className="ml-2 text-xs bg-cyan-400/20 text-cyan-400 px-2 py-0.5 rounded-full">
                                {interviewer.level}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">{interviewer.description}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* 右侧列：简历预览和关键词 */}
            <div className="flex flex-col space-y-4 h-full">
              {/* 简历预览区域 - 包含关键词 */}
              <div className="bg-white/5 rounded-xl p-4 flex flex-col h-[70%] border border-white/10 backdrop-blur-sm">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-lg font-semibold text-blue-400 flex items-center">
                    <svg className="w-5 h-5 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    简历预览
                  </h2>
                  
                  {keywords.length > 0 && (
                    <div className="text-sm text-cyan-400">
                      {keywords.length}个关键词已提取
                    </div>
                  )}
                </div>
                
                <div className="bg-white/5 rounded-lg border border-cyan-400/30 h-full overflow-hidden flex flex-col">
                  {/* 固定高度的预览区域 */}
                  <div className="overflow-y-auto flex-1 p-3" style={{ maxHeight: '300px' }}>
                    {isUploaded ? (
                    <div className="whitespace-pre-wrap text-sm text-gray-300">
                        {documentContext}
                    </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center text-gray-500">
                        <svg className="w-10 h-10 text-cyan-400/50 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                        <p className="mt-2 text-sm text-gray-400">上传简历后预览内容将显示在这里</p>
                      </div>
                    )}
                  </div>
                  
                  {/* 关键词预览 */}
                  {keywords.length > 0 && (
                    <div className="border-t border-white/10 p-3">
                      <h3 className="text-sm font-semibold text-blue-400 mb-2">简历关键词</h3>
                      <div className="flex flex-wrap gap-1">
                        {keywords.map((keyword, index) => (
                          <span 
                            key={index} 
                            className="px-2 py-1 bg-cyan-400/20 text-cyan-400 rounded-full text-xs"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 技能标签区域 */}
              <div className="bg-white/5 rounded-xl p-4 flex flex-col h-[30%] border border-white/10 backdrop-blur-sm">
                <h2 className="text-lg font-semibold text-blue-400 mb-3 flex items-center">
                  <svg className="w-5 h-5 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                  </svg>
                  技能标签
                </h2>
                
                <div className="flex flex-wrap gap-2 overflow-y-auto pr-2">
                  {skills.map((skill, index) => (
                    <button
                      key={index}
                      onClick={() => toggleSkill(skill)}
                      className={`px-3 py-1 rounded-full text-xs transition-all ${
                        formData.selectedSkills.includes(skill)
                          ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md"
                          : "bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10"
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* 底部操作按钮 */}
          <div className="flex justify-end space-x-4 p-4 border-t border-white/10">
            <button
              onClick={handleCancel}
              className="px-5 py-2 border border-white/10 rounded-md text-gray-300 hover:bg-white/5 focus:outline-none transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`px-5 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-md hover:from-blue-600 hover:to-purple-700 shadow transition-all flex items-center justify-center ${
                  isSaving ? "opacity-70 cursor-not-allowed" : ""
              }`}
              >
              {isSaving ? (
                  <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  保存中...
                  </>
              ) : (
                  "保存设置"
              )}
              </button>
          </div>
        </div>
      </div>
    </div>
  );
}