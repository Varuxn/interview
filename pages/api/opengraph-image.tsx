// pages/api/og-image.ts
import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: NextRequest) {
  try {
    // 加载字体
    const fontData = await fetch(
      new URL('/fonts/Inter-SemiBold.ttf', req.nextUrl.origin)
    ).then((res) => res.arrayBuffer());

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'white',
            backgroundImage:
              'linear-gradient(to bottom right, #E0E7FF 25%, #ffffff 50%, #bde1ff 75%)',
          }}
        >
          <img
            src={`${process.env.NEXT_PUBLIC_SITE_URL}/apple-touch-icon.png`}
            alt="Logo"
            style={{
              width: '80px',
              height: '80px',
              marginBottom: '16px',
              opacity: '0.95',
            }}
          />
          <h1
            style={{
              fontSize: '100px',
              background:
                'linear-gradient(to bottom right, #1E2B3A 21.66%, #78716c 86.47%)',
              backgroundClip: 'text',
              color: 'transparent',
              lineHeight: '5rem',
              letterSpacing: '-0.02em',
            }}
          >
            AI Mock Interviews
          </h1>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: 'Inter',
            data: fontData,
            style: 'normal',
            weight: 600,
          },
        ],
      }
    );
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}