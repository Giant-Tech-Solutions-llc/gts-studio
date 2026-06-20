/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    // Ensure the bundled skill markdown ships with the serverless function.
    outputFileTracingIncludes: {
      '/api/run': ['./skill/**/*'],
    },
  },
};

export default nextConfig;
