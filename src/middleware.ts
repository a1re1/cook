import { authkitMiddleware } from "@workos-inc/authkit-nextjs";

export default authkitMiddleware({
  debug: process.env.NODE_ENV === "development",
  middlewareAuth: {
    enabled: true,
    unauthenticatedPaths: ["/", "/recipes", "/recipes/:path*", "/search"],
  },
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/recipes/new/:path*",
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
