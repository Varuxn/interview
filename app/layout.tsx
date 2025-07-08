import "../styles/globals.css";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "伯乐-多模态AI面试官",
  openGraph: {
    title: "伯乐-多模态AI面试官",
    description:
      "伯乐是一款融合多模态感知与交互的AI人才评测系统",
    images: [
      {
        url: "https://demo.useliftoff.com/opengraph-image",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "伯乐-多模态AI面试官",
    description:
      "伯乐是一款融合多模态感知与交互的AI人才评测系统",
    images: ["https://demo.useliftoff.com/opengraph-image"],
    creator: "@tmeyer_me",
  },
  metadataBase: new URL("https://demo.useliftoff.com"),
  themeColor: "#FFF",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="scroll-smooth antialiased [font-feature-settings:'ss01']">
        {children}
      </body>
    </html>
  );
}
