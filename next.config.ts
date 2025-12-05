import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  outputFileTracingRoot: process.cwd(),
};

export default nextConfig;
