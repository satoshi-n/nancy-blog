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
}
