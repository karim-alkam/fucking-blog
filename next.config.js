const nextConfig = {
  output: 'export', // Enable static HTML export
  basePath: '/fucking-blog', // Replace with your GitHub repo name if deploying under a subpath
  assetPrefix: '',
  trailingSlash: true, // Required for GitHub Pages to handle static routes
};

module.exports = nextConfig;