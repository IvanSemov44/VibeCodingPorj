import path from 'path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Set the outputFileTracingRoot so Next can correctly infer the workspace root
  // when multiple lockfiles exist on the machine (suppresses the warning in the console).
  outputFileTracingRoot: path.resolve(__dirname, '..'),
};

export default nextConfig;
