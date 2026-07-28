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
      { source: "/admin-community/:path*", destination: "/community-admin/:path*", permanent: true },
      { source: "/platform-admin/:path*", destination: "/admin/:path*", permanent: true },
    ];
  },
};

export default nextConfig;
