import { authkitMiddleware } from "@workos-inc/authkit-nextjs";

export default authkitMiddleware({
  debug: process.env.NODE_ENV === "development",
  redirectUri: process.env.WORKOS_REDIRECT_URI || "http://localhost:3000/callback",
  middlewareAuth: {
    enabled: true,
    unauthenticatedPaths: ["/", "/recipes", "/recipes/:path*", "/search", "/sign-in", "/sign-up"],
  },
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/recipes/new/:path*",
    "/((?!api|_next/static|_next/image|favicon.ico|callback).*)",
  ],
};
