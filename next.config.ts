import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async redirects() {
    return [
      {
        source: '/.well-known/farcaster.json',
        destination: 'https://api.farcaster.xyz/miniapps/hosted-manifest/019b9efc-9735-0080-af0b-3f04862178ca',
        permanent: false, // 307 Temporary Redirect
      },
    ];
  },
};

export default nextConfig;
