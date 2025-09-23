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

// --- 背景粒子组件 (无改动) ---
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
    const particleCount = 80;
    const colors = ['#407BBF', '#5D8FDC', '#7BA9FF', '#9BC2FF', '#BDDBFF'];
    
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: Math.random() * 0.6 + 0.2
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
      className="absolute inset-0 w-full h-full opacity-30"
    />
  );
};

// --- 科技感装饰方块组件 ---
const TechDecorationBox = ({ delay = 0, size = "medium", color = "blue" }) => {
  const colorClasses = {
    blue: "from-cyan-500/20 to-blue-600/20 border-cyan-400/30",
    purple: "from-purple-500/20 to-indigo-600/20 border-purple-400/30",
    teal: "from-teal-500/20 to-cyan-600/20 border-teal-400/30",
    indigo: "from-indigo-500/20 to-blue-600/20 border-indigo-400/30"
  };
  
  const sizeClasses = {
    small: "w-16 h-16",
    medium: "w-24 h-24",
    large: "w-32 h-32"
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.8, ease: "easeOut" }}
      className={`absolute ${sizeClasses[size]} bg-gradient-to-br ${colorClasses[color]} border rounded-xl backdrop-blur-sm shadow-lg`}
    />
  );
};

// --- 科技感方框组件 ---
const TechBox = ({ image, index, aspectRatio = "aspect-[4/3]", ...rest }: TechBoxProps) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateY = ((x - centerX) / centerX) * 5;
    const rotateX = ((centerY - y) / centerY) * 5;
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  };

  const handleMouseLeave = () => {
    if (cardRef.current) {
      cardRef.current.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
    }
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ 
        delay: index * 0.1 + 0.5, 
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      {...rest}
      className={`relative p-3 bg-gradient-to-br from-cyan-900/15 to-blue-900/10 backdrop-blur-md border border-cyan-400/30 rounded-xl shadow-2xl transition-all duration-300 ease-out cursor-pointer overflow-hidden group hover:border-cyan-400/60 hover:shadow-cyan-500/20 ${rest.className}`}
    >
      {/* 科技感光效 */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
      
      <div className={`w-full h-full rounded-lg overflow-hidden ${aspectRatio}`}>
        <img
          src={image}
          alt={`页面预览 ${index + 1}`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      
      {/* 科技感角标装饰 */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400/70 rounded-tl-lg transition-colors duration-300 group-hover:border-cyan-300" />
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400/70 rounded-tr-lg transition-colors duration-300 group-hover:border-cyan-300" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-400/70 rounded-bl-lg transition-colors duration-300 group-hover:border-cyan-300" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400/70 rounded-br-lg transition-colors duration-300 group-hover:border-cyan-300" />
      
      {/* 悬浮光晕效果 */}
      <div className="absolute inset-0 rounded-xl bg-cyan-500/0 group-hover:bg-cyan-500/5 transition-all duration-500" />
    </motion.div>
  );
};

// --- 右侧页面展示组件 ---
const PagesShowcase = () => {
  // 优化布局数据，确保在有限空间内合理展示
  const pagesData = [
    { 
      id: 1, 
      src: '/pages/1.png', 
      className: 'col-span-2 row-span-2',
      aspectRatio: 'aspect-[4/3]'
    },
    { 
      id: 2, 
      src: '/pages/2.png', 
      className: 'col-span-1 row-span-1',
      aspectRatio: 'aspect-[4/3]'
    },
    { 
      id: 3, 
      src: '/pages/3.png', 
      className: 'col-span-1 row-span-1',
      aspectRatio: 'aspect-[4/3]'
    },
    { 
      id: 4, 
      src: '/pages/4.png', 
      className: 'col-span-1 row-span-1',
      aspectRatio: 'aspect-[4/3]'
    },
    { 
      id: 5, 
      src: '/pages/5.png', 
      className: 'col-span-2 row-span-1',
      aspectRatio: 'aspect-[4/3]'
    }
  ];

  return (
    <div className="relative w-full h-full flex items-center justify-center p-4 lg:p-6 overflow-hidden">
      <ParticleBackground />
      
      {/* 添加科技感装饰方块 */}
      <TechDecorationBox delay={0.2} size="small" color="blue" style={{ top: '10%', left: '5%' }} />
      <TechDecorationBox delay={0.4} size="medium" color="purple" style={{ top: '15%', right: '8%' }} />
      <TechDecorationBox delay={0.6} size="small" color="teal" style={{ bottom: '20%', left: '7%' }} />
      <TechDecorationBox delay={0.8} size="large" color="indigo" style={{ bottom: '10%', right: '5%', opacity: 0.3 }} />
      
      {/* 优化的网格布局，适应侧边栏空间 */}
      <div className="w-full h-full max-w-4xl max-h-[580px] grid grid-cols-3 grid-rows-3 gap-3 lg:gap-4 auto-rows-fr z-10">
        {pagesData.map((page, index) => (
          <TechBox
            key={page.id}
            image={page.src}
            index={index}
            aspectRatio={page.aspectRatio}
            className={`${page.className} min-h-[100px]`}
          />
        ))}
      </div>
      
      {/* 背景装饰元素 */}
      <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-cyan-500/5 rounded-full blur-3xl" />
      <div className="absolute -top-20 -left-20 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl" />
      
      {/* 浮动元素增强科技感 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-cyan-300/60 text-sm font-light"
      >
        ✨ 交互式页面预览 - 支持多维度展示
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
                <div className="min-h-[100vh] sm:min-h-screen w-screen flex relative bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 font-inter overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-gray-900 to-gray-900" />
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />

                    <main className="flex flex-col md:flex-row w-full h-full z-10">
                        {/* 左侧内容区域 */}
                        <div className="flex-1 flex flex-col justify-center px-4 md:px-12 py-8 md:py-0">
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
                                    {/* 修复按钮布局 - 确保在一行内正确显示 */}
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

                        {/* 右侧展示区域 - 优化布局适应侧边栏 */}
                        <div className="flex-1 relative min-h-[500px] md:min-h-screen lg:pr-4">
                            <PagesShowcase />
                        </div>
                    </main>
                </div>
            </AnimatePresence>
        </>
    );
}