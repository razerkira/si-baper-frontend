import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      // Membelokkan semua request API ke VPS Hostinger
      {
        source: '/api/:path*',
        destination: 'http://187.77.113.89:8080/api/:path*', 
      },
      // Membelokkan request gambar QR Code ke VPS Hostinger
      {
        source: '/uploads/:path*',
        destination: 'http://187.77.113.89:8080/uploads/:path*', 
      },
    ];
  },
};

export default nextConfig;
