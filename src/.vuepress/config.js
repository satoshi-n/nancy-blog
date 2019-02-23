module.exports = {
  plugins: [
    '@vuepress/blog',
    [
      '@vuepress/google-analytics',
      { ga: 'UA-49035499-6' }
    ],
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
  ]
}
