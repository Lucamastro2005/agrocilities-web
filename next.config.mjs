/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Ignora advertencias de código sin usar durante la subida
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignora errores estrictos de tipos durante la subida
    ignoreBuildErrors: true,
  },
};

export default nextConfig;