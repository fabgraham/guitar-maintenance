/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.NEXT_PUBLIC_LOCAL_PREVIEW === '1' ? '.next-preview' : '.next',
}

module.exports = nextConfig
