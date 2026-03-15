const isProd = process.env.NODE_ENV === 'production';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Enable static HTML export
  basePath: isProd ? '/fucking-blog' : '', // Use subpath for deployment
  assetPrefix: isProd ? '/fucking-blog/' : '',
  trailingSlash: true, // Required for GitHub Pages to handle static routes
};

module.exports = nextConfig;