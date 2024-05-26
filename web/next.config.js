const { getHighlighter, BUNDLED_LANGUAGES } = require('shiki');
const fs = require('fs');

const grammar = fs.readFileSync('./public/syntax/dungeon-world-it.tmLanguage.json', 'utf-8');

const rehypePrettyCodeOptions = {
  getHighlighter: options => {
    return getHighlighter({
      ...options,
      langs: [
        ...BUNDLED_LANGUAGES,
        {
          id: 'dungeonworld-it',
          scopeName: 'source.dungeonworld.it',
          grammar: JSON.parse(grammar),
          aliases: ['dw-it'],
        }
      ],
      
    });
  },
};

const withNextra = require('nextra')({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.tsx',
  mdxOptions: {
    rehypePrettyCodeOptions,
  }
})

module.exports = withNextra({
  webpack: (config) => {
    config.resolve.fallback = { fs: false };

    return config;
  },
})
