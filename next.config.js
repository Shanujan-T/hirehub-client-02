/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: "/employer/:path*", destination: "/:path*", permanent: true },
      { source: "/admin-community/:path*", destination: "/community-admin/:path*", permanent: true },
      { source: "/platform-admin/:path*", destination: "/admin/:path*", permanent: true },
    ];
  },
};

module.exports = nextConfig;
