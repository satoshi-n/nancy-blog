module.exports = {
  title: 'nansystem',
  head: [
    ['meta', { name: 'viewport', content: 'width=device-width, initial-scale=1' }],
    ['link', { rel: 'icon', type: 'image/png', href: '/favicon.png' }],
    ['link', { rel: 'apple-touch-icon', href: '/apple-touch-icon.png', sizes: "180x180" }],
  ],
  locales: {
    '/': {
      lang: 'ja',
      title: 'nansystem',
      description: 'なんしーが書く技術ブログです。JavaScript、CSS、Vue.js、Python、Google Cloudについて書いています。',
    }
  },
  markdown: {
    extendMarkdown: md => {
      md.set({ linkify: true })
    }
  },
  permalink: '/:slug',
  plugins: [
    [
      '@vuepress/google-analytics',
      { ga: 'UA-49035499-6' }
    ],
    [
      'sitemap',
      { hostname: 'https://nansystem.com' },
    ],
    [
      'feed',
      { canonical_base: 'https://nansystem.com' },
    ],
  ],
  theme: '@vuepress/theme-blog',
  themeConfig: {
    logo: '/logo.svg',
    /**
     * Ref: https://vuepress-theme-blog.ulivz.com/#modifyblogpluginoptions
     * deprecated https://github.com/vuepress/vuepress-theme-blog/pull/48
     */
    modifyBlogPluginOptions(blogPlugnOptions) {
      const postDirectoryClassifierIndex = blogPlugnOptions.directories.findIndex(d => d.id === 'post')
      blogPlugnOptions.directories.splice(postDirectoryClassifierIndex, 1)
      const postDirectoryClassifier = {
        id: 'post',
        dirname: '_posts',
        path: '/',
        itemLayout: 'Post',
        itemPermalink: '/:slug',
        pagination: {
          // どうやらmaxが10っぽい
          perPagePosts: 100,
        },
      }
      blogPlugnOptions.directories.push(postDirectoryClassifier)

      const categoryFrontmatterClassifier = {
        id: "category",
        keys: ['category', 'categories'],
        path: '/category/',
        frontmatter: { title: 'Categories' },
        pagination: {
          perPagePosts: 100
        }
      };
      blogPlugnOptions.frontmatters.push(categoryFrontmatterClassifier);

      return blogPlugnOptions
    },
    /**
     * Ref: https://vuepress-theme-blog.ulivz.com/#nav
     */
    nav: [
      {
        text: 'JavaScript',
        link: '/category/JavaScript/'
      },
      {
        text: 'CSS',
        link: '/category/css/'
      },
      {
        text: 'GoogleCloud',
        link: '/category/Google Cloud/'
      },
      {
        text: 'TAG',
        link: '/tag/',
      },
    ],
    /**
     * Ref: https://vuepress-theme-blog.ulivz.com/#footer
     */
    footer: {
      contact: [
        {
          type: 'github',
          link: 'https://github.com/nansystem/',
        },
        {
          type: 'twitter',
          link: 'https://twitter.com/nan_system',
        },
      ],
    }
    //   copyright: [
    //     {
    //       text: 'Privacy Policy',
    //       link: 'https://policies.google.com/privacy?hl=en-US',
    //     },
    //     {
    //       text: 'MIT Licensed | Copyright © 2018-present Vue.js',
    //       link: '',
    //     },
    //   ],
    // },
  },
}
