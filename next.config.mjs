import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  devIndicators: {
    position: "bottom-right",
  },
  async redirects() {
    return [
      { source: "/employer/:path*", destination: "/:path*", permanent: true },
      { source: "/client/:path*", destination: "/:path*", permanent: true },
      { source: "/admin-community/:path*", destination: "/community-admin/:path*", permanent: true },
      { source: "/member/dashboard", destination: "/dashboard", permanent: false },
      { source: "/profile", destination: "/member/profile", permanent: false },
    ];
  },
};

export default nextConfig;
