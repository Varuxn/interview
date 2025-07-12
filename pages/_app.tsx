import "@/styles/globals.css"; // Correctly imports your global CSS (including Tailwind)
import type { AppProps } from "next/app";
import { ClerkProvider } from "@clerk/nextjs";
import Head from "next/head";

function MyApp({ Component, pageProps }: AppProps) {
  const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "";

  return (
    <>
      <Head>
        <title>伯乐-多模态AI面试官</title>
        <meta name="description" content="伯乐是一款融合多模态感知与交互的AI人才评测系统" />
        <meta name="theme-color" content="#FFF" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://demo.useliftoff.com/" />
        <meta property="og:title" content="伯乐-多模态AI面试官" />
        <meta property="og:description" content="伯乐是一款融合多模态感知与交互的AI人才评测系统" />
        <meta property="og:image" content="https://demo.useliftoff.com/opengraph-image" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://demo.useliftoff.com/" />
        <meta property="twitter:title" content="伯乐-多模态AI面试官" />
        <meta property="twitter:description" content="伯乐是一款融合多模态感知与交互的AI人才评测系统" />
        <meta property="twitter:image" content="https://demo.useliftoff.com/opengraph-image" />
        <meta name="twitter:creator" content="@tmeyer_me" />
      </Head>
      
      <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
        <main className="scroll-smooth antialiased [font-feature-settings:'ss01']">
          <Component {...pageProps} />
        </main>
      </ClerkProvider>
    </>
  );
}

export default MyApp;