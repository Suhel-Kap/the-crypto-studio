/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
}

module.exports = {
  ...nextConfig,
  images: {
    loader: 'akamai',
    path: '',
  },
  trailingSlash: true,
  // assetPrefix: isProd ? "https://the-crypto-studio-20be90.spheron.app/" : "",
}
