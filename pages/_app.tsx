import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ClerkProvider, SignInButton, UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import Head from "next/head";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import { useState } from "react";

function MyApp({ Component, pageProps }: AppProps) {
  const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "";
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems = [
    { name: "Home", path: "/staff", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
    { name: "Dashboard", path: "/boss", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    {
      name: "CV Upload",
      path: "/fileupload",
      icon: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
    },
    { name: "Settings", path: "/setting", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" },
  ];

  return (
    <>
      <Head>
        <title>伯乐-多模态AI面试官</title>
        <meta name="description" content="伯乐是一款融合多模态感知与交互的AI人才评测系统" />
        <meta name="theme-color" content="#FFF" />
      </Head>
      
      <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
        <div className="flex h-screen bg-gray-50">
          {/* Sidebar */}
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
              <ul className="space-y-2">
                {navItems.map((item, index) => (
                  <motion.li
                    key={item.path}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.1 }}
                  >
                    <Link href={item.path}>
                      <div className={`flex items-center p-3 rounded-lg transition-all ${router.pathname === item.path ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-100'}`}>
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                        </svg>
                        <span className="font-medium">{item.name}</span>
                        {router.pathname === item.path && (
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
            </nav>
            
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
              <SignedIn>
                <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 cursor-pointer">
                  <UserButton appearance={{
                    elements: {
                      userButtonAvatarBox: "w-8 h-8",
                    }
                  }} />
                  <div className="text-sm">
                    <p className="font-medium text-gray-800">User Profile</p>
                    <p className="text-gray-500">Account Settings</p>
                  </div>
                </div>
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
                    {navItems.find(item => router.pathname.startsWith(item.path))?.name || "Dashboard"}
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
      </ClerkProvider>
    </>
  );
}

export default MyApp;