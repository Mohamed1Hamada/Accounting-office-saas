import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Useful for hosted dev previews such as Arena/E2B/Vercel preview URLs.
  allowedDevOrigins: ["*.e2b.app", "*.vercel.app"],
};

export default nextConfig;
