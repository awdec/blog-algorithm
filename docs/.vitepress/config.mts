import { defineConfig } from 'vitepress'
import { bookNav, bookSidebar } from './book-navigation.mts'

// https://vitepress.dev/reference/site-config


export default defineConfig({
  lastUpdated: true,
  base: '/',

  head: [
    ['link', { rel: 'icon', href: '/logo2.ico' }]
  ],


  title: "awdec's Blog",

  description: "awdec 算法-理论",



  themeConfig: {
    outlineTitle: '目录',
    outline: [2,6],
    logo: '/awdec.png',
    // https://vitepress.dev/reference/default-theme-config
    nav: bookNav,

    sidebar: bookSidebar,

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
