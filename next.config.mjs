import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

// Dev falls back to the local backend; production must be configured explicitly
// so no hosted backend URL is ever baked into the build.
if (process.env.NODE_ENV === "production" && !API_BASE_URL) {
  throw new Error(
    "NEXT_PUBLIC_API_BASE_URL is required in production. " +
      "Set it (e.g. in the Vercel project environment settings) to your deployed backend URL.",
  );
}

const DEFAULT_API_BACKEND = "http://localhost:5001";
const API_BACKEND = (API_BASE_URL || DEFAULT_API_BACKEND).replace(/\/$/, "");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  images: {
    // Some remote hosts (e.g. free image CDNs) can block Next.js image optimizer requests,
    // causing noisy 500s on `/_next/image`. Serving images unoptimized is more reliable.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.upwork.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "i.ibb.co",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${API_BACKEND}/api/:path*`,
      },
    ];
  },
  turbopack: {
    resolveAlias: {
      tailwindcss: path.resolve(__dirname, "node_modules/tailwindcss"),
    },
  },
};

export default nextConfig;
