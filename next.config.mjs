import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "http", hostname: "localhost", port: "5000", pathname: "/uploads/**" },
      { protocol: "http", hostname: "127.0.0.1", port: "5000", pathname: "/uploads/**" },
    ],
  },
  devIndicators: {
    position: "bottom-right",
  },
  async redirects() {
    return [
      { source: "/client/:path*", destination: "/:path*", permanent: true },
      { source: "/admin-community/:path*", destination: "/community-admin/:path*", permanent: true },
      { source: "/member/dashboard", destination: "/employer/dashboard", permanent: false },
      { source: "/profile", destination: "/member/profile", permanent: false },
    ];
  },
};

export default nextConfig;
