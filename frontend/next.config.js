/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  // Set the outputFileTracingRoot so Next can correctly infer the workspace root
  // when multiple lockfiles exist on the machine (suppresses the warning in the console).
  outputFileTracingRoot: path.resolve(__dirname, '..'),
};

module.exports = nextConfig;
