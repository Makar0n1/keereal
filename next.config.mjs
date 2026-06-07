/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // Locally uploaded files are served from /uploads via a route handler / static volume.
    // Allow self-hosted and configurable remote hosts.
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    // server actions body size for image uploads handled via route handler instead
  },
};

export default nextConfig;
