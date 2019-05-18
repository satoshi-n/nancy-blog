module.exports = {
  plugins: [
    '@vuepress/blog',
    '@vuepress/last-updated',
    [
      '@vuepress/google-analytics',
      { ga: 'UA-49035499-6' }
    ],
    [
      'sitemap',
      { hostname: 'https://nansystem.com' },
    ]
  ],
  locales: {
    '/': {
      lang: 'ja',
      title: 'nansystem',
      description: 'js,vue,cssについての学びをアウトプットするブログです',
    }
  },
  head: [
    ['link', { rel: 'icon', type: 'image/png', href: '/favicon.png' }],
    ['link', { rel: 'apple-touch-icon', href: '/apple-touch-icon.png', sizes: "180x180" }],
  ],
  themeConfig: {
    logo: '/logo.svg',
  },
  markdown: {
    linkify: true,
    plugins: [
      'markdown-it-footnote'
    ]
  },
}
