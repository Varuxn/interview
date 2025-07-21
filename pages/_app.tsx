import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ClerkProvider, SignInButton, UserButton, SignedIn, SignedOut, useAuth, ClerkLoaded } from "@clerk/nextjs";
import Head from "next/head";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";

// 定义用户类型
interface User {
  id: string;
  name: string;
  role: 'interviewer' | 'candidate';
}

function MyApp({ Component, pageProps }: AppProps) {
  const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "";
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      <AppWithAuth Component={Component} pageProps={pageProps} />
    </ClerkProvider>
  );
}

// 新组件：包含所有需要 Clerk 上下文的逻辑
const AppWithAuth = ({ Component, pageProps }: { Component: any; pageProps: any }) => {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { userId, isLoaded: authLoaded } = useAuth(); // 现在可以安全使用

  // 所有可能的导航项
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

  // 顶部栏标题映射
  const getPageTitle = (path: string) => {
    const mapping: Record<string, string> = {
      '/staff': 'Interview Dashboard',
      '/home': 'Settings',
      '/boss': 'Evaluation Results',
      '/humaneval': 'Interview Session'
    };
    
    // 查找匹配的路由
    for (const [basePath, title] of Object.entries(mapping)) {
      if (path.startsWith(basePath)) return title;
    }
    
    return "Dashboard";
  };

  // 获取用户数据
  const fetchUsers = async () => {
    try {
      if (typeof window === 'undefined') return;
      
      const response = await fetch('/api/databases/admin/users');
      
      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        // 找到当前用户
        const user = data.users.find((u: User) => u.id === userId);
        setCurrentUser(user || null);
        setLoading(false);
      } else {
        throw new Error(data.message || "API返回失败");
      }
    } catch (error) {
      console.error('获取用户失败:', error);
      setLoading(false);
      // alert(`获取用户信息失败: ${error.message}`);
    }
  };

  useEffect(() => {
    if (authLoaded && userId) {
      fetchUsers();
    } else if (authLoaded) {
      // 用户未登录
      setLoading(false);
    }
  }, [authLoaded, userId]);

  return (
    <>
      <Head>
        <title>伯乐-多模态AI面试官</title>
        <meta name="description" content="伯乐是一款融合多模态感知与交互的AI人才评测系统" />
        <meta name="theme-color" content="#FFF" />
      </Head>
      
      <div className="flex h-screen bg-gray-50">
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
          <header className="bg-white shadow-sm z-20">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center">
                <button 
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="mr-4 p-1 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-700 md:hidden"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <h1 className="text-xl font-semibold text-gray-800">
                  {getPageTitle(router.pathname)}
                </h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                  </button>
                </div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center space-x-2"
                >
                  <SignedIn>
                    <UserButton appearance={{
                      elements: {
                        userButtonAvatarBox: "w-8 h-8",
                        userButtonPopoverCard: "shadow-lg rounded-lg",
                      }
                    }} />
                  </SignedIn>
                  <SignedOut>
                    <SignInButton>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="group rounded-full pl-[8px] pr-4 py-2 text-[13px] font-semibold transition-all flex items-center justify-center bg-[#1E2B3A] text-white hover:[linear-gradient(0deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1)), #0D2247] no-underline flex gap-x-2"
                        style={{
                          boxShadow: "0px 1px 4px rgba(13, 34, 71, 0.17), inset 0px 0px 0px 1px #061530, inset 0px 0px 0px 2px rgba(255, 255, 255, 0.1)",
                        }}
                      >
                        <span className="w-5 h-5 rounded-full bg-[#407BBF] flex items-center justify-center">
                          <svg className="w-[16px] h-[16px] text-white" fill="none" viewBox="0 0 24 24">
                            <path d="M8 12h8M14 8l4 4-4 4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
          <main className="flex-1 overflow-y-auto scroll-smooth antialiased [font-feature-settings:'ss01'] bg-gray-50 p-6">
            <Component {...pageProps} />
          </main>
        </div>
      </div>
    </>
  );
};

// 侧边栏组件
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

  // 根据用户角色过滤导航项
  const getFilteredNavItems = () => {
    if (!currentUser || !currentUser.role) return [];
    return navItems.filter(item => item.roles.includes(currentUser.role));
  };

  return (
    <motion.div 
      initial={{ x: -300 }}
      animate={{ x: sidebarOpen ? 0 : -250 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`fixed md:relative z-30 w-64 h-full bg-white shadow-lg border-r border-gray-200`}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center space-x-2"
        >
          <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
          <span className="text-xl font-semibold text-gray-800">伯乐AI</span>
        </motion.div>
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-700"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={sidebarOpen ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
          </svg>
        </button>
      </div>
      
      <nav className="p-4">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <ul className="space-y-2">
            {getFilteredNavItems().map((item, index) => (
              <motion.li
                key={item.path}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.1 }}
              >
                <Link href={item.path}>
                  <div className={`flex items-center p-3 rounded-lg transition-all ${currentPath === item.path ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-100'}`}>
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                    </svg>
                    <span className="font-medium">{item.name}</span>
                    {currentPath === item.path && (
                      <motion.span 
                        layoutId="activeNavItem"
                        className="absolute right-4 w-2 h-2 bg-indigo-600 rounded-full"
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </div>
                </Link>
              </motion.li>
            ))}
          </ul>
        )}
      </nav>
      
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
        <SignedIn>
          {loading ? (
            <div className="flex items-center justify-center p-2">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : currentUser ? (
            <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 cursor-pointer">
              <UserButton appearance={{
                elements: {
                  userButtonAvatarBox: "w-8 h-8",
                }
              }} />
              <div className="text-sm">
                <p className="font-medium text-gray-800">
                  {currentUser.name || "User Profile"}
                </p>
                <p className="text-gray-500">
                  {currentUser.role 
                    ? `${currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}` 
                    : "Account Settings"}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center text-red-500 p-2">
              无法加载用户信息
            </div>
          )}
        </SignedIn>
        <SignedOut>
          <SignInButton>
            <button className="w-full flex items-center justify-center p-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors">
              <span className="mr-2">Sign In</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
            </button>
          </SignInButton>
        </SignedOut>
      </div>
    </motion.div>
  );
}

export default MyApp;