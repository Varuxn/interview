"use client";

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { fetchLLMResponse } from "./llmApi";

export default function UploadPage() {
  const router = useRouter();
  const [isUploaded, setIsUploaded] = useState(false);
  const [fileName, setFileName] = useState("");
  const [documentContext, setDocumentContext] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [keywords, setKeywords] = useState<string[]>([]);

  // 初始化时检查是否有存储的关键词
  useEffect(() => {
    const storedKeywords = localStorage.getItem('resumeKeywords');
    if (storedKeywords) {
      setKeywords(JSON.parse(storedKeywords));
    }
  }, []);

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

  const handleSubmit = async () => {
    if (!documentContext) {
      toast.error("请先上传简历文件");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // 模拟API请求
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success("简历评估已提交");
      router.push("/setting");
    } catch (error) {
      console.error("提交错误:", error);
      toast.error("提交过程中出错");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  }, []);

  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">简历智能评估</h1>
            <p className="text-gray-600">上传您的简历，获取专业分析</p>
          </div>

          {/* 文件上传区域 */}
          <div 
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 ${
              isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400"
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
              onChange={handleFileChange}
              className="hidden"
              disabled={isLoading || isSubmitting || isExtracting}
            />
            <label
              htmlFor="file-upload"
              className={`cursor-pointer flex flex-col items-center justify-center space-y-4 ${
                isLoading || isSubmitting || isExtracting ? "opacity-50" : ""
              }`}
            >
              <div className="relative">
                {isLoading ? (
                  <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
                ) : (
                  <>
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-10 h-10 text-blue-600"
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
                    {isDragging && (
                      <div className="absolute inset-0 bg-blue-500 bg-opacity-10 rounded-full"></div>
                    )}
                  </>
                )}
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-700">
                  {fileName || (
                    <>
                      <span className="text-blue-600">点击上传</span>
                      <span> 或拖拽文件到此处</span>
                    </>
                  )}
                </p>
                <p className="text-xs text-gray-500">支持PDF格式，最大10MB</p>
              </div>
            </label>
          </div>

          {/* 文件状态显示 */}
          {fileName && (
            <div className="mt-6 bg-gray-50 rounded-lg p-4 flex items-center">
              <svg
                className="w-5 h-5 text-green-500 mr-2"
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
                <p className="text-sm font-medium text-gray-900 truncate">{fileName}</p>
                <p className="text-xs text-gray-500">
                  {isLoading 
                    ? "解析中..." 
                    : isExtracting 
                      ? "关键词提取中..." 
                      : "已准备就绪"}
                </p>
              </div>
              {(isLoading || isExtracting) && (
                <div className="ml-2 h-2 w-24 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full animate-pulse" 
                    style={{ width: isExtracting ? "80%" : "60%" }}
                  ></div>
                </div>
              )}
            </div>
          )}

          {/* 文本预览区域 */}
          {documentContext && (
            <div className="mt-8 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">简历内容预览</h2>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  前500字符
                </span>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="whitespace-pre-wrap text-sm text-gray-700 max-h-60 overflow-y-auto">
                  {documentContext.slice(0, 500)}
                  {documentContext.length > 500 && (
                    <span className="text-gray-400">...</span>
                  )}
                </div>
              </div>
              
              {/* 关键词预览 */}
              {keywords.length > 0 && (
                <div className="mt-4">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">提取的关键词</h2>
                  <div className="flex flex-wrap gap-2">
                    {keywords.map((keyword, index) => (
                      <span 
                        key={index} 
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 操作按钮 */}
          <div className="mt-8 flex flex-col sm:flex-row justify-end gap-3">
            {isUploaded && (
              <>
                <button
                  onClick={() => {
                    setFileName("");
                    setDocumentContext("");
                    setIsUploaded(false);
                    setKeywords([]);
                    localStorage.removeItem('resumeKeywords');
                  }}
                  disabled={isSubmitting || isExtracting}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  重新上传
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || isExtracting}
                  className={`px-6 py-2 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${
                    isSubmitting || isExtracting
                      ? "bg-blue-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {(isSubmitting || isExtracting) ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      {isExtracting ? "提取关键词中..." : "提交中..."}
                    </span>
                  ) : (
                    "开始智能评估"
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}