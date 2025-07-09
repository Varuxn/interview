// import { Ratelimit } from "@upstash/ratelimit";
// import { Redis } from "@upstash/redis";
// import { NextFetchEvent, NextRequest, NextResponse } from "next/server";

// export default async function middleware(
//   request: NextRequest,
//   event: NextFetchEvent
// ): Promise<Response | undefined> {
//   const forwarded = request.headers.get("x-forwarded-for");
//   const ip = forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1";

//   // ratelimit for demo app: https://demo.useliftoff.com/
//   if (
//     process.env.NODE_ENV != "development" &&
//     process.env.UPSTASH_REDIS_REST_URL &&
//     process.env.UPSTASH_REDIS_REST_TOKEN
//   ) {
//     const ratelimit = new Ratelimit({
//       redis: Redis.fromEnv(),
//       // Rate limit to 6 attempts per 2 days
//       limiter: Ratelimit.cachedFixedWindow(12, `${24 * 60 * 60}s`),
//       ephemeralCache: new Map(),
//       analytics: true,
//     });

//     const { success, pending, limit, reset, remaining } = await ratelimit.limit(
//       `ratelimit_middleware_${ip}`
//     );
//     event.waitUntil(pending);

//     const res = success
//       ? NextResponse.next()
//       : NextResponse.redirect(new URL("/api/blocked", request.url));

//     res.headers.set("X-RateLimit-Limit", limit.toString());
//     res.headers.set("X-RateLimit-Remaining", remaining.toString());
//     res.headers.set("X-RateLimit-Reset", reset.toString());
//     return res;
//   }
// }

// export const config = {
//   matcher: ["/api/transcribe", "/api/generate"],
// };
import { clerkMiddleware } from '@clerk/nextjs/server'

export default clerkMiddleware()

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}