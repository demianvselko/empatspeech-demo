import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  experimental: {
    externalDir: true, // permite importar código desde ../../packages/*
  },
};

export default nextConfig;
