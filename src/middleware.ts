import { withAuth } from "next-auth/middleware";

export default withAuth({ pages: { signIn: "/login" } });

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/generator/:path*",
    "/qa/:path*",
    "/history/:path*",
    "/admin/:path*",
  ],
};
