import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ClerkProvider } from "@clerk/clerk-react";


function MyApp({ Component, pageProps }: AppProps) {
  const PUBLISHABLE_KEY  = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY|| "";
  // console.log(PUBLISHABLE_KEY)
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      <main className="scroll-smooth antialiased [font-feature-settings:'ss01']">
        <Component {...pageProps} />
      </main>
    </ClerkProvider>
  );
}

export default MyApp;
