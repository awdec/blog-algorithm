import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: "/blog-algorithm/",
  head: [['link', { rel: 'icon', href: '/docs/logo.ico' }]],
  title: "LargeRice16pro's Blog",
  description: "A VitePress Site",
  themeConfig: {
    logo: '/logo.png',
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '首页', link: '/' },
      { text: '数据结构', link: '/data structure/data structure' },
      { text: '字符串', link: '/'},
      { text: '数论', link: '/'},
      { text: '多项式', link: '/'},
      { text: '计算几何', link: '/'},
      { text: '图论', link: '/'},
      { text: '动态规划', link: '/'},
      { text: '网络流', link: '/'}
    ],

    sidebar: {
      '/data structure/': [
        {
          text: '数据结构',
          items: [
            { text: '平衡树', link: '/markdown-examples' },
            { text: '序列平衡树', link: '/api-examples' },
            { text: '可持久化平衡树', link: '/'},
            { text: '线段树', link: '/'},
            { text: '树状数组', link: '/'},
            { text: '猫树', link: '/'},
            { text: 'Sqrt Tree', link: '/'},
            { text: '树套树', link: '/'},
            { text: '并查集', link: '/'},
            { text: '堆', link: '/'},
            { text: '动态树', link :'/'},
          ]
        }
      ],
    },

    // socialLinks: [
    //   { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    // ],

    lastUpdated:{
      text: "最后更新",
      formatOptions: {
        dateStyle: "short",
        timeStyle: "short",
      },
    },

  },
  
  markdown: {
    math: true
  },
})
