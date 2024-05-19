const withNextra = require('nextra')({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.tsx',
})

module.exports = withNextra({
  webpack: (config) => {
    config.resolve.fallback = { fs: false };

    return config;
  },
})
