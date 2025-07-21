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
// middleware.ts
// import { authMiddleware } from '@clerk/nextjs/server';

// export default authMiddleware({
//   // 公开路由：不需要身份验证的路径
//   publicRoutes: [
//     '/',
//     '/api(.*)', // 允许所有API路由
//     // 或者更具体的路径
//     // '/api/databases/admin/users'
//   ],
  
//   // 可选：调试日志
//   debug: process.env.NODE_ENV !== 'production',
// });

// export const config = {
//   matcher: [
//     // 排除静态文件和API路由
//     '/((?!.*\\..*|_next).*)', 
//     '/', 
//     '/(api|trpc)(.*)'
//   ],
// };