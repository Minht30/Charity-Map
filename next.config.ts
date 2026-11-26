import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cho phép mở bản dev từ điện thoại cùng mạng Wi-Fi (npm run dev:phone).
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "172.16.*.*"],
};

export default nextConfig;
