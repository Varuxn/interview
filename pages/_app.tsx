import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ClerkProvider, SignInButton, UserButton, SignedIn, SignedOut, useAuth, ClerkLoaded } from "@clerk/nextjs";
import Head from "next/head";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import { useState, useEffect, useRef } from "react";

// 定义用户类型
interface User {
  id: string;
  name: string;
  role: 'interviewer' | 'candidate';
}

// 粒子背景组件 - 优化为蓝色系配色
const ParticleBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const particles: Array<{
      x: number; y: number; size: number; speedX: number; speedY: number; opacity: number;
    }> = [];

    // 使用提供的蓝色系配色
    const particleColors = ['#407BBF', '#5D8FDC', '#7BA9FF', '#9BC2FF', '#BDDBFF'];

    // 创建粒子
    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 0.8,
        speedY: (Math.random() - 0.5) * 0.8,
        opacity: Math.random() * 0.6 + 0.2,
      });
    }

    const animate = () => {
      // 使用深蓝色背景
      ctx.fillStyle = 'rgba(17, 24, 39, 0.1)'; // gray-900
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle, index) => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;

        const colorIndex = index % particleColors.length;
        const color = particleColors[colorIndex];

        // 绘制粒子
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = particle.opacity;
        ctx.fill();

        // 绘制光晕效果
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size * 4
        );
        gradient.addColorStop(0, `${color}40`);
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(particle.x - particle.size * 4, particle.y - particle.size * 4, particle.size * 8, particle.size * 8);
      });

      ctx.globalAlpha = 1;
      requestAnimationFrame(animate);
    };

    animate();

    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: 'linear-gradient(135deg, #111827 0%, #1e3a8a 50%, #111827 100%)' }}
    />
  );
};

function MyApp({ Component, pageProps }: AppProps) {
  const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "";
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      <AppWithAuth Component={Component} pageProps={pageProps} />
    </ClerkProvider>
  );
}

const AppWithAuth = ({ Component, pageProps }: { Component: any; pageProps: any }) => {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { userId, isLoaded: authLoaded } = useAuth();

  const navItems = [
    { 
      name: "Interview Dashboard", 
      path: "/staff", 
      icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
      roles: ['interviewer'] 
    },
    { 
      name: "Evaluation Results", 
      path: "/boss", 
      icon: "M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25",
      roles: ['candidate'] 
    },
    { 
      name: "Interview Session", 
      path: "/humaneval", 
      icon: "M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z",
      roles: ['candidate'] 
    },
    { 
      name: "Settings", 
      path: "/home", 
      icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z",
      roles: ['interviewer'] 
    }
  ];

  const getPageTitle = (path: string) => {
    const mapping: Record<string, string> = {
      '/staff': 'Interview Dashboard',
      '/home': 'Settings',
      '/boss': 'Evaluation Results',
      '/humaneval': 'Interview Session'
    };
    
    for (const [basePath, title] of Object.entries(mapping)) {
      if (path.startsWith(basePath)) return title;
    }
    
    return "Dashboard";
  };

  const fetchUsers = async () => {
    try {
      if (typeof window === 'undefined') return;
      
      const response = await fetch('/api/databases/admin/users');
      
      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        const user = data.users.find((u: User) => u.id === userId);
        setCurrentUser(user || null);
        setLoading(false);
      } else {
        throw new Error(data.message || "API返回失败");
      }
    } catch (error) {
      console.error('获取用户失败:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoaded && userId) {
      fetchUsers();
    } else if (authLoaded) {
      setLoading(false);
    }
  }, [authLoaded, userId]);

  return (
    <>
      <Head>
        <title>伯乐-多模态AI面试官</title>
        <meta name="description" content="伯乐是一款融合多模态感知与交互的AI人才评测系统" />
        <meta name="theme-color" content="#111827" />
      </Head>
      
      {/* 粒子背景 */}
      <ParticleBackground />
      
      {/* 主容器 */}
      <div className="flex h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 relative z-10">
        <Sidebar 
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          navItems={navItems}
          currentPath={router.pathname}
          currentUser={currentUser}
          loading={loading}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar */}
          <header className="bg-gradient-to-r from-gray-900/90 via-blue-900/70 to-gray-900/90 backdrop-blur-md border-b border-blue-400/20 z-20 relative">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center">
                <button 
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="mr-4 p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300 md:hidden"
                >
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <motion.h1 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
                >
                  {getPageTitle(router.pathname)}
                </motion.h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300"
                  >
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <motion.span 
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute top-1 right-1 w-2 h-2 bg-purple-400 rounded-full shadow-lg shadow-purple-400/50"
                    />
                  </motion.button>
                </div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center space-x-2"
                >
                  <SignedIn>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <UserButton appearance={{
                        elements: {
                          userButtonAvatarBox: "w-8 h-8 border-2 border-blue-400/50",
                          userButtonPopoverCard: "bg-gray-900 border border-blue-400/20 shadow-2xl",
                        }
                      }} />
                    </motion.div>
                  </SignedIn>
                  <SignedOut>
                    <SignInButton>
                      <motion.button
                        whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(96, 165, 250, 0.5)" }}
                        whileTap={{ scale: 0.98 }}
                        className="group rounded-full pl-3 pr-4 py-2 text-sm font-semibold transition-all flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 no-underline flex gap-x-2 relative overflow-hidden"
                        style={{
                          boxShadow: "0 4px 15px rgba(59, 130, 246, 0.4)",
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                        <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24">
                            <path d="M8 12h8M14 8l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                        Sign in
                      </motion.button>
                    </SignInButton>
                  </SignedOut>
                </motion.div>
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto scroll-smooth antialiased bg-transparent p-6 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 via-transparent to-purple-400/5 pointer-events-none" />
            <Component {...pageProps} />
          </main>
        </div>
      </div>
    </>
  );
};

// 3D卡片交互组件
const Card3D = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateY = (x - centerX) / 25;
      const rotateX = (centerY - y) / 25;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    };

    const handleMouseLeave = () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div
      ref={cardRef}
      className={`transition-transform duration-300 ease-out ${className}`}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {children}
    </div>
  );
};

const Sidebar = ({ 
  sidebarOpen, 
  setSidebarOpen,
  navItems,
  currentPath,
  currentUser,
  loading
}: { 
  sidebarOpen: boolean; 
  setSidebarOpen: (value: boolean) => void;
  navItems: any[];
  currentPath: string;
  currentUser: User | null;
  loading: boolean;
}) => {
  const router = useRouter();

  const getFilteredNavItems = () => {
    if (!currentUser || !currentUser.role) return [];
    return navItems.filter(item => item.roles.includes(currentUser.role));
  };

  return (
    <motion.div 
      initial={{ x: -300 }}
      animate={{ x: sidebarOpen ? 0 : -250 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`fixed md:relative z-30 w-64 h-full bg-gradient-to-b from-gray-900/95 to-blue-900/95 backdrop-blur-xl border-r border-blue-400/20 shadow-2xl`}
    >
      {/* 侧边栏顶部光效 */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent" />
      
      <div className="flex items-center justify-between p-4 border-b border-blue-400/20">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center space-x-3"
        >
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-400/25">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
            <div className="absolute inset-0 bg-blue-400/20 rounded-xl blur-sm" />
          </div>
          <div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              伯乐AI
            </span>
            <div className="text-xs text-blue-400/60">多模态面试系统</div>
          </div>
        </motion.div>
        <motion.button 
          whileHover={{ scale: 1.1, backgroundColor: 'rgba(96, 165, 250, 0.1)' }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300"
        >
          <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={sidebarOpen ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
          </svg>
        </motion.button>
      </div>
      
      <nav className="p-4">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="relative">
              <div className="w-8 h-8 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
              <div className="absolute inset-0 bg-blue-400/10 rounded-full blur-sm" />
            </div>
          </div>
        ) : (
          <ul className="space-y-3">
            {getFilteredNavItems().map((item, index) => (
              <motion.li
                key={item.path}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.1 }}
              >
                <Card3D>
                  <Link href={item.path}>
                    <div className={`relative p-4 rounded-xl transition-all duration-300 group overflow-hidden ${
                      currentPath === item.path 
                        ? 'bg-gradient-to-r from-blue-400/20 to-purple-400/20 border border-blue-400/30 shadow-lg shadow-blue-400/10' 
                        : 'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-400/30'
                    }`}>
                      {/* 悬停光效 */}
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-blue-400/5 to-blue-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      <div className="flex items-center relative z-10">
                        <div className={`p-2 rounded-lg mr-3 transition-all duration-300 ${
                          currentPath === item.path 
                            ? 'bg-blue-400/20 text-blue-400' 
                            : 'bg-white/10 text-gray-300 group-hover:text-blue-400 group-hover:bg-blue-400/10'
                        }`}>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                          </svg>
                        </div>
                        <span className={`font-medium transition-colors duration-300 ${
                          currentPath === item.path 
                            ? 'text-blue-400' 
                            : 'text-gray-300 group-hover:text-white'
                        }`}>
                          {item.name}
                        </span>
                        {currentPath === item.path && (
                          <motion.div 
                            layoutId="activeNavItem"
                            className="absolute right-4 w-2 h-2 bg-blue-400 rounded-full shadow-lg shadow-blue-400/50"
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          />
                        )}
                      </div>
                    </div>
                  </Link>
                </Card3D>
              </motion.li>
            ))}
          </ul>
        )}
      </nav>
      
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-blue-400/20">
        <SignedIn>
          {loading ? (
            <div className="flex items-center justify-center p-3">
              <div className="w-6 h-6 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
            </div>
          ) : currentUser ? (
            <Card3D>
              <div className="flex items-center space-x-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-blue-400/30 transition-all duration-300 group">
                <UserButton appearance={{
                  elements: {
                    userButtonAvatarBox: "w-10 h-10 border-2 border-blue-400/50 group-hover:border-blue-400 transition-colors duration-300",
                  }
                }} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">
                    {currentUser.name || "User Profile"}
                  </p>
                  <p className="text-sm text-blue-400/70 truncate">
                    {currentUser.role 
                      ? `${currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}` 
                      : "Account Settings"}
                  </p>
                </div>
              </div>
            </Card3D>
          ) : (
            <div className="text-center text-red-400 p-3 bg-red-400/10 rounded-xl border border-red-400/20">
              无法加载用户信息
            </div>
          )}
        </SignedIn>
        <SignedOut>
          <SignInButton>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center p-3 rounded-xl bg-gradient-to-r from-blue-400/20 to-purple-400/20 border border-blue-400/30 hover:border-blue-300 transition-all duration-300 group"
            >
              <span className="text-blue-400 group-hover:text-white mr-2">Sign In</span>
              <svg className="w-4 h-4 text-blue-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
            </motion.button>
          </SignInButton>
        </SignedOut>
      </div>
    </motion.div>
  );
}

export default MyApp;