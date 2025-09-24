"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState, useRef, ComponentProps } from "react";
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/nextjs';
import Head from "next/head";

// --- 类型定义 ---
interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  color: string;
  opacity: number;
}

interface TechBoxProps extends ComponentProps<typeof motion.div> {
  image: string;
  index: number;
  aspectRatio?: string;
}

interface TechDecorationBoxProps {
  delay?: number;
  size?: "small" | "medium" | "large";
  color?: "blue" | "purple" | "teal" | "indigo";
  style?: React.CSSProperties;
}

// --- 背景粒子组件 ---
const ParticleBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let animationFrameId: number;
    
    const resizeCanvas = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    const particles: Particle[] = [];
    const particleCount = 60;
    const colors = ['#407BBF', '#5D8FDC', '#7BA9FF', '#9BC2FF', '#BDDBFF'];
    
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: Math.random() * 0.4 + 0.2
      });
    }
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((particle: Particle) => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color + Math.floor(particle.opacity * 255).toString(16).padStart(2, '0');
        ctx.fill();
      });
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);
  
  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full opacity-20"
    />
  );
};

// --- 修复后的科技感装饰方块组件 ---
const TechDecorationBox = ({ delay = 0, size = "medium", color = "blue", style = {} }: TechDecorationBoxProps) => {
  const colorClasses: Record<string, string> = {
    blue: "from-cyan-500/20 to-blue-600/20 border-cyan-400/30",
    purple: "from-purple-500/20 to-indigo-600/20 border-purple-400/30",
    teal: "from-teal-500/20 to-cyan-600/20 border-teal-400/30",
    indigo: "from-indigo-500/20 to-blue-600/20 border-indigo-400/30"
  };
  
  const sizeClasses: Record<string, string> = {
    small: "w-12 h-12",
    medium: "w-16 h-16",
    large: "w-20 h-20"
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0, rotate: 0 }}
      animate={{ opacity: 1, scale: 1, rotate: 45 }}
      transition={{ delay, duration: 1.2, ease: "easeOut" }}
      className={`absolute ${sizeClasses[size]} bg-gradient-to-br ${colorClasses[color]} border rounded-lg backdrop-blur-sm shadow-lg`}
      style={style}
    />
  );
};

// --- 优化的科技感方框组件 ---
const TechBox = ({ image, index, aspectRatio = "aspect-auto", ...rest }: TechBoxProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageDimensions({ width: img.width, height: img.height });
      setImageLoaded(true);
    };
    img.src = image;
  }, [image]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateY = ((x - centerX) / centerX) * 8;
    const rotateX = ((centerY - y) / centerY) * 8;
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
  };

  const handleMouseLeave = () => {
    if (cardRef.current) {
      cardRef.current.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
    }
  };

  const getOptimalAspectRatio = () => {
    if (!imageLoaded) return "aspect-[4/3]";
    const ratio = imageDimensions.width / imageDimensions.height;
    if (ratio > 1.5) return "aspect-[16/9]";
    if (ratio > 1.2) return "aspect-[4/3]";
    if (ratio < 0.8) return "aspect-[3/4]";
    return "aspect-square";
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, scale: 0.8, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ 
        delay: index * 0.15 + 0.3, 
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      {...rest}
      className={`relative p-2 bg-gradient-to-br from-slate-800/20 via-blue-900/10 to-purple-900/20 backdrop-blur-md border border-cyan-400/20 rounded-2xl shadow-2xl transition-all duration-500 ease-out cursor-pointer overflow-hidden group hover:border-cyan-400/50 hover:shadow-cyan-500/30 ${rest.className}`}
    >
      {/* 动态光效 */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/8 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1200" />
      
      <div className={`w-full h-full rounded-xl overflow-hidden ${getOptimalAspectRatio()}`}>
        {imageLoaded ? (
          <img
            src={image}
            alt={`页面预览 ${index + 1}`}
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full" />
          </div>
        )}
      </div>
      
      {/* 科技感边角装饰 */}
      <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-cyan-400/60 rounded-tl-xl transition-all duration-300 group-hover:border-cyan-300 group-hover:w-4 group-hover:h-4" />
      <div className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-cyan-400/60 rounded-tr-xl transition-all duration-300 group-hover:border-cyan-300 group-hover:w-4 group-hover:h-4" />
      <div className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-cyan-400/60 rounded-bl-xl transition-all duration-300 group-hover:border-cyan-300 group-hover:w-4 group-hover:h-4" />
      <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-cyan-400/60 rounded-br-xl transition-all duration-300 group-hover:border-cyan-300 group-hover:w-4 group-hover:h-4" />
      
      {/* 悬浮光晕效果 */}
      <div className="absolute inset-0 rounded-2xl bg-cyan-500/0 group-hover:bg-cyan-500/10 transition-all duration-700" />
      
      {/* 序号指示器 */}
      <div className="absolute top-2 right-2 w-6 h-6 bg-gradient-to-br from-cyan-500/80 to-blue-600/80 rounded-full flex items-center justify-center text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {index + 1}
      </div>
    </motion.div>
  );
};

// --- 全新设计的右侧页面展示组件 ---
const PagesShowcase = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // 页面数据配置
  const pagesData = [
    { 
      id: 1, 
      src: '/img/demo.png', 
      title: '面试主界面',
      description: '功能展示预览',
      position: 'primary'
    },
    { 
      id: 2, 
      src: '/img/boss.png', 
      title: '面试官视图',
      description: '面试流程管控',
      position: 'secondary'
    },
    { 
      id: 3, 
      src: '/img/admin.png', 
      title: '管理员面板',
      description: '系统管理与配置',
      position: 'secondary'
    },
    { 
      id: 4, 
      src: '/img/humaneval.png', 
      title: '人工评估',
      description: '专业评估系统',
      position: 'tertiary'
    },
    { 
      id: 5, 
      src: '/img/setting.png', 
      title: '系统设置',
      description: '个性化配置',
      position: 'tertiary'
    },
    { 
      id: 6, 
      src: '/img/staff.png', 
      title: '评测结果',
      description: '查看面试结果',
      position: 'tertiary'
    }
  ];

  const getGridClass = (position: string, index: number) => {
    switch (position) {
      case 'primary':
        return 'col-span-2 row-span-2';
      case 'secondary':
        return 'col-span-1 row-span-1';
      case 'tertiary':
        return 'col-span-1 row-span-1';
      default:
        return 'col-span-1 row-span-1';
    }
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center p-3 lg:p-4 overflow-hidden">
      <ParticleBackground />
      
      {/* 科技感装饰元素 - 调整位置以适应较小空间 */}
      <TechDecorationBox 
        delay={0.2} 
        size="small" 
        color="blue" 
        style={{ top: '12%', left: '8%' }} 
      />
      <TechDecorationBox 
        delay={0.5} 
        size="small" 
        color="purple" 
        style={{ top: '8%', right: '12%' }} 
      />
      <TechDecorationBox 
        delay={0.8} 
        size="small" 
        color="teal" 
        style={{ bottom: '20%', left: '5%' }} 
      />
      <TechDecorationBox 
        delay={1.1} 
        size="medium" 
        color="indigo" 
        style={{ bottom: '12%', right: '8%', opacity: 0.4 }} 
      />
      
      {/* 紧凑型网格布局 - 确保完全可见 */}
      <div className="w-full h-full max-w-4xl max-h-[580px] z-10 px-2">
        <div className="grid grid-cols-3 grid-rows-3 gap-2 lg:gap-3 h-full auto-rows-fr">
          {pagesData.map((page, index) => (
            <div
              key={page.id}
              className={`${getGridClass(page.position, index)} relative group`}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <TechBox
                image={page.src}
                index={index}
                className="w-full h-full min-h-[80px] lg:min-h-[100px]"
              />
              
              {/* 悬浮信息卡片 - 调整位置避免被侧边栏遮挡 */}
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ 
                  opacity: activeIndex === index ? 1 : 0,
                  y: activeIndex === index ? 0 : 10,
                  scale: activeIndex === index ? 1 : 0.9
                }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="absolute -bottom-14 left-1/2 transform -translate-x-1/2 bg-slate-900/95 backdrop-blur-md border border-cyan-400/30 rounded-lg px-2 py-1.5 min-w-max z-20 shadow-xl max-w-[200px]"
              >
                <h4 className="text-cyan-300 font-medium text-xs mb-0.5">{page.title}</h4>
                <p className="text-slate-300 text-[10px] leading-tight">{page.description}</p>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-slate-900/95" />
              </motion.div>
            </div>
          ))}
        </div>
      </div>
      
      {/* 背景氛围元素 - 调整大小和位置 */}
      <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-gradient-to-t from-cyan-500/6 to-transparent rounded-full blur-3xl" />
      <div className="absolute -top-20 -left-20 w-52 h-52 bg-gradient-to-br from-blue-500/6 to-transparent rounded-full blur-3xl" />
      
      {/* 底部标识 - 更紧凑的设计 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex items-center gap-1.5 text-cyan-300/50 text-xs font-light"
      >
        <div className="w-1.5 h-1.5 bg-cyan-400/60 rounded-full animate-pulse" />
        智能面试系统展示
        <div className="w-1.5 h-1.5 bg-purple-400/60 rounded-full animate-pulse" />
      </motion.div>
    </div>
  );
};

export default function Home() {
    const { user, isLoaded } = useUser();
    const [initializationLoading, setInitializationLoading] = useState(false);
    const [initializationMessage, setInitializationMessage] = useState('');
    const [initializationError, setInitializationError] = useState('');

    const handleInitializeEvaluation = async () => {
        if (!isLoaded || !user) {
            setInitializationError("用户数据不可用，请登录后重试。");
            return;
        }
        const userId = user.id;
        setInitializationLoading(true);
        setInitializationMessage('');
        setInitializationError('');
        try {
            const response = await fetch('/api/initialize-user-evaluation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', },
                body: JSON.stringify({ userId }),
            });
            const data = await response.json();
            if (response.ok) {
                setInitializationMessage(data.message);
            } else {
                setInitializationError(data.message || '初始化用户评估失败。');
            }
        } catch (err) {
            console.error('初始化过程中的网络或意外错误:', err);
            setInitializationError('初始化过程中发生意外错误，请重试。');
        } finally {
            setInitializationLoading(false);
        }
    };

    return (
        <>
            <Head>
                <title>伯乐-多模态AI面试官</title>
                <meta name="description" content="伯乐是一款融合多模态感知与交互的AI人才评测系统" />
            </Head>

            <AnimatePresence>
                <div className="min-h-[100vh] sm:min-h-screen w-full flex relative bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 font-inter overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-gray-900 to-gray-900" />
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />

                    <main className="flex flex-col lg:flex-row w-full h-full z-10 max-w-[100vw] overflow-hidden">
                        {/* 左侧内容区域 - 调整为固定宽度以适应侧边栏 */}
                        <div className="w-full lg:w-[45%] xl:w-[50%] flex flex-col justify-center px-4 md:px-8 lg:px-12 py-8 md:py-0 flex-shrink-0">
                            <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.95, ease: [0.165, 0.84, 0.44, 1] }} className="text-2xl font-bold text-blue-400 mb-8" >
                                伯乐
                            </motion.h1>

                            <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.95, ease: [0.165, 0.84, 0.44, 1] }} className="text-4xl md:text-6xl font-bold text-white leading-tight mb-6" >
                                多模态感知交互 <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                                    AI人才评测系统
                                </span>
                            </motion.h1>

                            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.95, ease: [0.165, 0.84, 0.44, 1] }} className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mb-8" >
                                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                                    <h2 className="font-semibold text-blue-300 mb-2">多模态的评估分析</h2>
                                    <p className="text-gray-300 text-sm leading-relaxed">
                                        融合语音、视频、文本等多模态数据，为人工智能、大数据等领域的技术岗位提供深度面试分析
                                    </p>
                                </div>
                                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                                    <h2 className="font-semibold text-purple-300 mb-2">多维度的面试体验</h2>
                                    <p className="text-gray-300 text-sm leading-relaxed">
                                        评估专业知识、逻辑思维等核心能力，模拟不同风格面试官并进行动态追问
                                    </p>
                                </div>
                            </motion.div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <SignedOut>
                                    <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55, duration: 0.55, ease: [0.075, 0.82, 0.965, 1] }} >
                                        <SignInButton>
                                            <button className="group px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg font-semibold text-white transition-all duration-300 hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25">
                                                <span className="flex items-center gap-2">
                                                    登录系统
                                                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24">
                                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.75 6.75L19.25 12L13.75 17.25M19 12H4.75"/>
                                                    </svg>
                                                </span>
                                            </button>
                                        </SignInButton>
                                    </motion.div>
                                </SignedOut>

                                <SignedIn>
                                    <div className="flex flex-col sm:flex-row items-center gap-4">
                                        <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-lg p-2 border border-white/10">
                                            <UserButton />
                                            <span className="text-white/80 text-sm hidden sm:block">欢迎回来</span>
                                        </div>
                                        <motion.div 
                                            initial={{ opacity: 0, y: 40 }} 
                                            animate={{ opacity: 1, y: 0 }} 
                                            transition={{ delay: 0.65, duration: 0.55, ease: [0.075, 0.82, 0.965, 1] }}
                                            className="flex-shrink-0"
                                        >
                                            <Link 
                                                href="/home" 
                                                onClick={handleInitializeEvaluation} 
                                                className="group inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500/90 to-purple-600/90 backdrop-blur-md border border-blue-400/30 rounded-lg font-semibold text-white transition-all duration-300 hover:from-blue-600 hover:to-purple-700 hover:border-blue-400/50 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25 whitespace-nowrap"
                                            >
                                                {initializationLoading ? (
                                                    <span className="flex items-center gap-2">
                                                        <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                                                        初始化中...
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-2">
                                                        开始面试
                                                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none">
                                                            <path d="M13.75 6.75L19.25 12L13.75 17.25M19 12H4.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                        </svg>
                                                    </span>
                                                )}
                                            </Link>
                                        </motion.div>
                                    </div>
                                </SignedIn>
                            </div>

                            {initializationMessage && (
                                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-green-400 text-sm">
                                    {initializationMessage}
                                </motion.p>
                            )}
                            {initializationError && (
                                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-red-400 text-sm">
                                    {initializationError}
                                </motion.p>
                            )}
                        </div>

                        {/* 右侧展示区域 - 优化布局以适应侧边栏 */}
                        <div className="w-full lg:w-[55%] xl:w-[50%] relative min-h-[500px] lg:min-h-screen flex-shrink-0 lg:pr-8">
                            <PagesShowcase />
                        </div>
                    </main>
                </div>
            </AnimatePresence>
        </>
    );
}