"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { gradient } from "@/components/Gradient";
import { useEffect, useState } from "react"; // Import useState
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/nextjs'; // Import useUser
import Head from "next/head";

export default function Home() {
  useEffect(() => {
    gradient.initGradient("#gradient-canvas");
  }, []);

  const { user, isLoaded } = useUser(); // Get user data from Clerk

  // State to manage loading and messages for the initialization process
  const [initializationLoading, setInitializationLoading] = useState(false);
  const [initializationMessage, setInitializationMessage] = useState('');
  const [initializationError, setInitializationError] = useState('');

  const handleInitializeEvaluation = async () => {
    if (!isLoaded || !user) {
      // User data not loaded yet, or no user signed in
      setInitializationError("User data not available. Please try again after signing in.");
      return;
    }

    const userId = user.id; // Get the user's ID from Clerk

    setInitializationLoading(true);
    setInitializationMessage('');
    setInitializationError('');

    try {
      const response = await fetch('/api/initialize-user-evaluation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (response.ok) {
        setInitializationMessage(data.message);
        // Optionally, if initialization is always successful and
        // you want to navigate, you can do it here.
        // For now, the Link component handles navigation.
      } else {
        setInitializationError(data.message || 'Failed to initialize user evaluation.');
      }
    } catch (err) {
      console.error('Network or unexpected error during initialization:', err);
      setInitializationError('An unexpected error occurred during initialization. Please try again.');
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
        <div className="min-h-[100vh] sm:min-h-screen w-screen flex flex-col relative bg-[#F2F3F5] font-inter overflow-hidden">
          <svg
            style={{ filter: "contrast(125%) brightness(110%)" }}
            className="fixed z-[1] w-full h-full opacity-[35%]"
          >
            <filter id="noise">
              <feTurbulence
                type="fractalNoise"
                baseFrequency=".7"
                numOctaves="3"
                stitchTiles="stitch"
              ></feTurbulence>
              <feColorMatrix type="saturate" values="0"></feColorMatrix>
            </filter>
            <rect width="100%" height="100%" filter="url(#noise)"></rect>
          </svg>
          <main className="flex flex-col justify-center h-[90%] static md:fixed w-screen overflow-hidden grid-rows-[1fr_repeat(3,auto)_1fr] z-[100] pt-[30px] pb-[320px] px-4 md:px-20 md:py-0">
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.15,
                duration: 0.95,
                ease: [0.165, 0.84, 0.44, 1],
              }}
              className="text-2xl font-bold text-[#1E2B3A] block w-[100px] row-start-2 mb-8 md:mb-6"
            >
              伯乐
            </motion.h1>

            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.15,
                duration: 0.95,
                ease: [0.165, 0.84, 0.44, 1],
              }}
              className="relative md:ml-[-10px] md:mb-[37px] font-extrabold text-[14vw] md:text-[80px] font-inter text-[#1E2B3A] leading-[1.1] tracking-[-2px] z-[100]"
            >
              多模态感知交互 <br />
              AI <span className="text-[#407BBF]">人才评测系统</span>
              <span className="font-inter text-[#407BBF]">.</span>
            </motion.h1>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.15,
                duration: 0.95,
                ease: [0.165, 0.84, 0.44, 1],
              }}
              className="flex flex-row justify-center z-20 mx-0 mb-0 mt-8 md:mt-0 md:mb-[35px] max-w-2xl md:space-x-8"
            >
              <div className="w-1/2">
                <h2 className="flex items-center font-semibold text-[1em] text-[#1a2b3b]">
                  多模态的评估分析
                </h2>
                <p className="text-[14px] leading-[20px] text-[#1a2b3b] font-normal">
                  融合语音、视频、文本等多模态数据，为人工智能、大数据等领域的技术岗位提供深度面试分析
                </p>
              </div>
              <div className="w-1/2">
                <h2 className="flex items-center font-semibold text-[1em] text-[#1a2b3b]">
                  多维度的面试体验
                </h2>
                <p className="text-[14px] leading-[20px] text-[#1a2b3b] font-normal">
                  评估专业知识、逻辑思维等核心能力，模拟不同风格面试官并进行动态追问
                </p>
              </div>
            </motion.div>

            <div className="flex gap-[15px] mt-8 md:mt-0">
              <SignedOut>
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.55,
                    duration: 0.55,
                    ease: [0.075, 0.82, 0.965, 1],
                  }}
                >
                  <SignInButton>
                    <button
                      className="group rounded-full pl-[8px] min-w-[180px] pr-4 py-2 text-[13px] font-semibold transition-all flex items-center justify-center bg-[#1E2B3A] text-white hover:[linear-gradient(0deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.1)), #0D2247] no-underline flex gap-x-2 active:scale-95 scale-100 duration-75 cursor-pointer"
                      style={{
                        boxShadow:
                          "0px 1px 4px rgba(13, 34, 71, 0.17), inset 0px 0px 0px 1px #061530, inset 0px 0px 0px 2px rgba(255, 255, 255, 0.1)",
                      }}
                    >
                      <span className="w-5 h-5 rounded-full bg-[#407BBF] flex items-center justify-center">
                        <svg
                          className="w-[16px] h-[16px] text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M8 12h8M14 8l4 4-4 4"
                            stroke="#fff"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                      Sign in
                    </button>
                  </SignInButton>
                </motion.div>
              </SignedOut>
              <SignedIn>
                <UserButton />
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.65,
                    duration: 0.55,
                    ease: [0.075, 0.82, 0.965, 1],
                  }}
                >
                  {/* The Link component itself navigates. We need to add a click handler
                      to trigger the initialization BEFORE navigation. */}
                  <Link
                    href="/fileupload"
                    onClick={handleInitializeEvaluation} // Add the click handler here
                    className="group rounded-full px-4 py-2 text-[13px] font-semibold transition-all flex items-center justify-center bg-[#f5f7f9] text-[#1E2B3A] no-underline active:scale-95 scale-100 duration-75"
                    style={{
                      boxShadow: "0 1px 1px #0c192714, 0 1px 3px #0c192724",
                    }}
                  >
                    <span className="mr-2"> Go to Interview </span>
                    {/* Optionally, show loading spinner within the button */}
                    {initializationLoading ? (
                      <span className="animate-spin h-5 w-5 border-t-2 border-r-2 border-blue-500 rounded-full"></span>
                    ) : (
                      <svg
                        className="w-5 h-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M13.75 6.75L19.25 12L13.75 17.25"
                          stroke="#1E2B3A"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M19 12H4.75"
                          stroke="#1E2B3A"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </Link>
                </motion.div>
              </SignedIn>
            </div>
            {/* Display initialization messages/errors */}
            {initializationMessage && (
              <p className="mt-4 text-green-600 text-center">{initializationMessage}</p>
            )}
            {initializationError && (
              <p className="mt-4 text-red-600 text-center">{initializationError}</p>
            )}
            {initializationLoading && (
                <p className="mt-2 text-gray-500 text-center">Initializing user data...</p>
            )}
          </main>

          <div
            className="fixed top-0 right-0 w-[80%] md:w-1/2 h-screen bg-[#1F2B3A]/20"
            style={{
              clipPath:
                "polygon(100px 0,100% 0,calc(100% + 225px) 100%, 480px 100%)",
            }}
          ></div>

          <motion.canvas
            initial={{
              filter: "blur(20px)",
            }}
            animate={{
              filter: "blur(0px)",
            }}
            transition={{
              duration: 1,
              ease: [0.075, 0.82, 0.965, 1],
            }}
            style={{
              clipPath:
                "polygon(100px 0,100% 0,calc(100% + 225px) 100%, 480px 100%)",
            }}
            id="gradient-canvas"
            data-transition-in
            className="z-50 fixed top-0 right-[-2px] w-[80%] md:w-1/2 h-screen bg-[#c3e4ff]"
          ></motion.canvas>
        </div>
      </AnimatePresence>
    </>
  );
}