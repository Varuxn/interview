import { AnimatePresence, motion } from "framer-motion";
import { RadioGroup } from "@headlessui/react";
import Link from "next/link";
import { useRef, useState, useEffect, useCallback } from "react";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import { FlagIcon } from '../components/FlagIcon';
import { useAuth } from "@clerk/nextjs";
import useStepRedirect from './api/jump_fuc';

const questions = [ //岗位
  {
    id: 1,
    name: "人工智能",
    description: "机器学习工程师、算法研究员、NLP工程师...",
    difficulty: "hard",
  },
  {
    id: 2,
    name: "大数据",
    description: "大数据开发工程师、数据仓库工程师、数据分析师...",
    difficulty: "medium",
  },
  {
    id: 3,
    name: "物联网",
    description: "嵌入式开发工程师、物联网系统架构师、传感器算法工程师...",
    difficulty: "medium",
  },
  {
    id: 4,
    name: "智能系统",
    description: "自动驾驶系统工程师、机器人控制工程师、智能硬件产品经理...",
    difficulty: "hard",
  }
];

const interviewers = [ //面试官
  {
    id: "Alex",
    name: "Alex",
    description: "高级算法工程师 | 性格：理性冷静｜面试风格：深挖技术细节，重视代码严谨性",
    country : "CN",
    level: "L4",
  },
  {
    id: "Bob",
    name: "Bob",
    description: "CTO｜性格：强势直接｜面试风格：高压追问，模拟极端场景",
    country : "EN",
    level: "L8",
  },
  {
    id: "Coty",
    name: "Coty",
    description: "产品总监｜性格：亲和力强但逻辑缜密｜面试风格：关注用户需求和商业化落地",
    country : "CN",
    level: "L6",
  }
];

//初始化FFmpeg
const ffmpeg = createFFmpeg({
  // corePath: `http://localhost:3000/ffmpeg/dist/ffmpeg-core.js`,
  // I've included a default import above (and files in the public directory), but you can also use a CDN like this:
  corePath: "https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js",
  log: true,
});

//辅助函数：合并多个CSS类名，并且过滤掉空值
function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}
export default function DemoPage() {
  const [selected, setSelected] = useState(questions[0]); //问题类型
  const [selectedInterviewer, setSelectedInterviewer] = useState( //面试官类型
    interviewers[0]
  );
  const [step, setStep] = useState(1);//面试步骤
  const { userId } = useAuth();

  useStepRedirect(step, 3, '/staff');

  const handlePosition = async () => {
      if (!selected) {
        alert('请先选择一个岗位');
        return;
      }
    
      try {
        const response = await fetch('/api/databases/settings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: userId,          // 用户ID
            position: selected.id, // 岗位名称
            interviewer: null    // 明确传递null保持原值
          }),
        });
    
        // 关键修复步骤：
        // 1. 先检查HTTP状态码
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`请求失败: ${response.status} - ${errorText}`);
        }
    
        // 2. 检查Content-Type
        const contentType = response.headers.get('content-type');
        if (!contentType?.includes('application/json')) {
          throw new Error(`响应不是JSON格式: ${contentType}`);
        }
    
        // 3. 解析JSON
        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.message || '保存失败');
        }
    
        // 保存成功后才跳转
        setStep(2);
      } catch (error: unknown) {
        // 1. 安全获取错误信息
        const errorMessage = error instanceof Error 
          ? error.message 
          : '发生未知错误';
      
        // 2. 简化版日志记录
        console.error('保存失败:', {
          error: errorMessage,
          userId,
          position: selected?.name,
          time: new Date().toLocaleString()
        });
      
        // 3. 用户友好提示
        alert(`保存失败: ${errorMessage.includes('Network') 
          ? '网络连接失败，请检查网络' 
          : '系统繁忙，请稍后重试'}`);
      }
    };

    const handleInterviewer = async () => {
      if (!selectedInterviewer) {
        alert('请先选择一个面试官');
        return;
      }
    
      try {
        const response = await fetch('/api/databases/settings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: userId,          // 用户ID
            position: selected.id, // 岗位名称
            interviewer: selectedInterviewer.id    // 明确传递null保持原值
          }),
        });
    
        // 关键修复步骤：
        // 1. 先检查HTTP状态码
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`请求失败: ${response.status} - ${errorText}`);
        }
    
        // 2. 检查Content-Type
        const contentType = response.headers.get('content-type');
        if (!contentType?.includes('application/json')) {
          throw new Error(`响应不是JSON格式: ${contentType}`);
        }
    
        // 3. 解析JSON
        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.message || '保存失败');
        }
    
        // 保存成功后才跳转
        setStep(3);
      } catch (error: unknown) {
        // 1. 安全获取错误信息
        const errorMessage = error instanceof Error 
          ? error.message 
          : '发生未知错误';
      
        // 2. 简化版日志记录
        console.error('保存失败:', {
          error: errorMessage,
          userId,
          position: selected?.name,
          interviewer: selectedInterviewer?.name,
          time: new Date().toLocaleString()
        });
      
        // 3. 用户友好提示
        alert(`保存失败: ${errorMessage.includes('Network') 
          ? '网络连接失败，请检查网络' 
          : '系统繁忙，请稍后重试'}`);
      }
    };
  
  return (
    <AnimatePresence>
      { (
        <div className="flex flex-col md:flex-row w-full md:overflow-hidden justify-center items-center min-h-screen">
          <div className="w-full min-h-[60vh] md:w-1/2 md:h-screen flex flex-col px-4 pt-2 pb-8 md:px-0 md:py-2 bg-[#FCFCFC] justify-center">
            <div className="h-full w-full items-center justify-center flex flex-col">
              {step === 1 ? (
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -40 }}
                  key="step-1"
                  transition={{
                    duration: 0.95,
                    ease: [0.165, 0.84, 0.44, 1],
                  }}
                  className="max-w-lg mx-auto px-4 lg:px-0"
                >
                  <h2 className="text-4xl font-bold text-[#1E2B3A]">
                    请选择你想要应聘的岗位
                  </h2>
                  <p className="text-[14px] leading-[20px] text-[#1a2b3b] font-normal my-4">
                    我们提供多个岗位供你选择，请选择你想要应聘的岗位，我们将围绕这个岗位对你展开面试。
                  </p>
                  <div>
                    <RadioGroup value={selected} onChange={setSelected}>
                      <RadioGroup.Label className="sr-only">
                        Server size
                      </RadioGroup.Label>
                      <div className="space-y-4">
                        {questions.map((question) => (
                          <RadioGroup.Option
                            key={question.name}
                            value={question}
                            className={({ checked, active }) =>
                              classNames(
                                checked
                                  ? "border-transparent"
                                  : "border-gray-300",
                                active
                                  ? "border-blue-500 ring-2 ring-blue-200"
                                  : "",
                                "relative cursor-pointer rounded-lg border bg-white px-6 py-4 shadow-sm focus:outline-none flex justify-between"
                              )
                            }
                          >
                            {({ active, checked }) => (
                              <>
                                <span className="flex items-center">
                                  <span className="flex flex-col text-sm">
                                    <RadioGroup.Label
                                      as="span"
                                      className="font-medium text-gray-900"
                                    >
                                      {question.name}
                                    </RadioGroup.Label>
                                    <RadioGroup.Description
                                      as="span"
                                      className="text-gray-500"
                                    >
                                      <span className="block">
                                        {question.description}
                                      </span>
                                    </RadioGroup.Description>
                                  </span>
                                </span>
                                <RadioGroup.Description
                                  as="span"
                                  className="flex text-sm ml-4 mt-0 flex-col text-right items-center justify-center"
                                >
                                  <span className=" text-gray-500">
                                    {question.difficulty === "Easy" ? (
                                      <svg
                                        className="h-full w-[16px]"
                                        viewBox="0 0 22 25"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                      >
                                        <rect
                                          y="13.1309"
                                          width="6"
                                          height="11"
                                          rx="1"
                                          fill="#4E7BBA"
                                        />
                                        <rect
                                          x="8"
                                          y="8.13086"
                                          width="6"
                                          height="16"
                                          rx="1"
                                          fill="#E1E1E1"
                                        />
                                        <rect
                                          x="16"
                                          y="0.130859"
                                          width="6"
                                          height="24"
                                          rx="1"
                                          fill="#E1E1E1"
                                        />
                                      </svg>
                                    ) : (
                                      <svg
                                        className="h-full w-[16px]"
                                        viewBox="0 0 22 25"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                      >
                                        <rect
                                          y="13.1309"
                                          width="6"
                                          height="11"
                                          rx="1"
                                          fill="#4E7BBA"
                                        />
                                        <rect
                                          x="8"
                                          y="8.13086"
                                          width="6"
                                          height="16"
                                          rx="1"
                                          fill="#4E7BBA"
                                        />
                                        <rect
                                          x="16"
                                          y="0.130859"
                                          width="6"
                                          height="24"
                                          rx="1"
                                          fill="#E1E1E1"
                                        />
                                      </svg>
                                    )}
                                  </span>
                                  <span className="font-medium text-gray-900">
                                    {question.difficulty}
                                  </span>
                                </RadioGroup.Description>
                                <span
                                  className={classNames(
                                    active ? "border" : "border-2",
                                    checked
                                      ? "border-blue-500"
                                      : "border-transparent",
                                    "pointer-events-none absolute -inset-px rounded-lg"
                                  )}
                                  aria-hidden="true"
                                />
                              </>
                            )}
                          </RadioGroup.Option>
                        ))}
                      </div>
                    </RadioGroup>
                  </div>
                  <div className="flex gap-[15px] justify-end mt-8">
                    <div>
                      <Link
                        href="/"
                        className="group rounded-full px-4 py-2 text-[13px] font-semibold transition-all flex items-center justify-center bg-[#f5f7f9] text-[#1E2B3A] no-underline active:scale-95 scale-100 duration-75"
                        style={{
                          boxShadow: "0 1px 1px #0c192714, 0 1px 3px #0c192724",
                        }}
                      >
                        Back to home
                      </Link>
                    </div>
                    <div>
                      <button
                        onClick={() => {
                          handlePosition();
                        }}
                        className="group rounded-full px-4 py-2 text-[13px] font-semibold transition-all flex items-center justify-center bg-[#1E2B3A] text-white hover:[linear-gradient(0deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1)), #0D2247] no-underline flex gap-x-2  active:scale-95 scale-100 duration-75"
                        style={{
                          boxShadow:
                            "0px 1px 4px rgba(13, 34, 71, 0.17), inset 0px 0px 0px 1px #061530, inset 0px 0px 0px 2px rgba(255, 255, 255, 0.1)",
                        }}
                      >
                        <span> Continue </span>
                        <svg
                          className="w-5 h-5"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M13.75 6.75L19.25 12L13.75 17.25"
                            stroke="#FFF"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M19 12H4.75"
                            stroke="#FFF"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : step === 2 ? (
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -40 }}
                  key="step-2"
                  transition={{
                    duration: 0.95,
                    ease: [0.165, 0.84, 0.44, 1],
                  }}
                  className="max-w-lg mx-auto px-4 lg:px-0"
                >
                  <h2 className="text-4xl font-bold text-[#1E2B3A]">
                    选择你的面试官
                  </h2>
                  <p className="text-[14px] leading-[20px] text-[#1a2b3b] font-normal my-4">
                    选择让你感到舒适的面试官，以便于我们更好的交流面试。
                  </p>
                  <div>
                    <RadioGroup
                      value={selectedInterviewer}
                      onChange={setSelectedInterviewer}
                    >
                      <RadioGroup.Label className="sr-only">
                        Server size
                      </RadioGroup.Label>
                      <div className="space-y-4">
                        {interviewers.map((interviewer) => (
                          <RadioGroup.Option
                            key={interviewer.name}
                            value={interviewer}
                            className={({ checked, active }) =>
                              classNames(
                                checked
                                  ? "border-transparent"
                                  : "border-gray-300",
                                active
                                  ? "border-blue-500 ring-2 ring-blue-200"
                                  : "",
                                "relative cursor-pointer rounded-lg border bg-white px-6 py-4 shadow-sm focus:outline-none flex justify-between"
                              )
                            }
                          >
                            {({ active, checked }) => (
                              <>
                                <span className="flex items-center">
                                  <span className="flex flex-col text-sm">
                                    <RadioGroup.Label
                                      as="span"
                                      className="font-medium text-gray-900"
                                    >
                                      {interviewer.name}
                                    </RadioGroup.Label>
                                    <RadioGroup.Description
                                      as="span"
                                      className="text-gray-500"
                                    >
                                      <span className="block">
                                        {interviewer.description}
                                      </span>
                                    </RadioGroup.Description>
                                  </span>
                                </span>
                                <RadioGroup.Description
                                  as="span"
                                  className="flex text-sm ml-4 mt-0 flex-col text-right items-center justify-center"
                                >
                                  <span className=" text-gray-500">
                                  <FlagIcon country={interviewer.country} />
                                  </span>
                                  <span className="font-medium text-gray-900">
                                  {interviewer.country}
                                  </span>
                                </RadioGroup.Description>
                                <span
                                  className={classNames(
                                    active ? "border" : "border-2",
                                    checked
                                      ? "border-blue-500"
                                      : "border-transparent",
                                    "pointer-events-none absolute -inset-px rounded-lg"
                                  )}
                                  aria-hidden="true"
                                />
                              </>
                            )}
                          </RadioGroup.Option>
                        ))}
                      </div>
                    </RadioGroup>
                  </div>
                  <div className="flex gap-[15px] justify-end mt-8">
                    <div>
                      <button
                        onClick={() => setStep(1)}
                        className="group rounded-full px-4 py-2 text-[13px] font-semibold transition-all flex items-center justify-center bg-[#f5f7f9] text-[#1E2B3A] no-underline active:scale-95 scale-100 duration-75"
                        style={{
                          boxShadow: "0 1px 1px #0c192714, 0 1px 3px #0c192724",
                        }}
                      >
                        Previous step
                      </button>
                    </div>
                    <div>
                      <button
                        onClick={() => {
                          handleInterviewer();
                        }}
                        className="group rounded-full px-4 py-2 text-[13px] font-semibold transition-all flex items-center justify-center bg-[#1E2B3A] text-white hover:[linear-gradient(0deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1)), #0D2247] no-underline flex gap-x-2  active:scale-95 scale-100 duration-75"
                        style={{
                          boxShadow:
                            "0px 1px 4px rgba(13, 34, 71, 0.17), inset 0px 0px 0px 1px #061530, inset 0px 0px 0px 2px rgba(255, 255, 255, 0.1)",
                        }}
                      >
                        <span> Continue </span>
                        <svg
                          className="w-5 h-5"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M13.75 6.75L19.25 12L13.75 17.25"
                            stroke="#FFF"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M19 12H4.75"
                            stroke="#FFF"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <p>Step 3</p>
              )}
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}