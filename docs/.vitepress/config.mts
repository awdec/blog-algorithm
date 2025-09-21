import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config


export default defineConfig({
  lastUpdated: true,
  
  base: "/blog-algorithm/",
  
  head: [
    ['link', { rel: 'icon', href: '/docs/logo.ico' }]
  ],


  title: "LargeRice16pro's Blog",
  
  description: "A VitePress Site",



  themeConfig: {
    outlineTitle: '目录',
    outline: [2,6],
    logo: '/logo.png',
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '首页', link: '/' },
      { text: '数据结构', link: '/data structure/home' },
      { text: '字符串', link: '/string/home'},
      { 
        text: '数学', 
        items: [
          {text: '数论', link: '/math/number theory/home'},
          {text: '组合数学', link: '/math/combinatorial mathematics/home'},
          {text: '杂项', link: '/math/other/home'},
        ]
        
      },
      { text: '图论', link: '/graph/home'},
      { text: '多项式', link: '/poly/home'},
      { text: '计算几何', link: '/geometry/home'},
      { text: '动态规划', link: '/dp/home'},
      { text: '网络流', link: '/flow/home'},
      { text: '杂项', link: '/other/home'},
    ],

    sidebar: {
      '/data structure/': [
        {
          text: '数据结构',
          items: [
            { text: '平衡树', link: '/data structure/binary-search-tree' },
            { text: '线段树', link: '/data structure/segment-tree'},
            { text: '树状数组', link: '/data structure/bit'},
            { text: '树套树', link: '/data structure/tree-in-tree'},
            { text: '并查集', link: '/data structure/dsu'},
            { text: '堆', link: '/data structure/heap'},
            { text: '动态树', link :'/data structure/lct'},
            { text: 'Sqrt Tree', link: '/data structure/sqrt-tree'},
            { text: '莫队', link: '/data structure/mo'},
            { text: '树链剖分', link: '/data structure/tree-chain'},
            { text: '点分治', link: '/data structure/tree-divide'},
            { text: 'dsu on tree', link: '/data structure/dsu-on-tree'},
            { text: '01 Trie', link: '/data structure/01-trie'},
            { text: '线性基', link: '/data structure/xor-base'},
            { text: '分块', link: '/data structure/block-balance'},
            { text: 'cdq 分治', link: '/data structure/cdq'},
            { text: '整体二分', link: '/data structure/dfs'},
          ]
        }
      ],

      '/string/': [
        {
          text: '字符串',
          items: [
            { text: 'Border', link: '/string/border'},
            { text: 'Kmp', link: '/string/kmp'},
            { text: 'Hash', link: '/string/hash'},
            { text: 'Manacher', link: '/string/manacher'},
            { text: 'Trie', link: '/string/trie'},
            { text: 'ACAM', link: '/string/acam'},
            { text: 'PAM', link: '/string/pam'},
            { text: 'SAM', link: '/string/sam'},
            { text: 'SA', link: '/string/sa'}, 
          ]
        }
      ],

      '/math/number theory/': [
        {
          text: '数论',
          items: [
            { text: '质数', link: '/math/number theory/prime'},
            { text: '初等数论函数', link: '/math/number theory/function'},
            { text: 'Gcd', link: '/math/number theory/gcd'},
            { text: '模', link: '/math/number theory/mod1'},
            { text: '同余', link: '/math/number theory/mod'},
            { text: 'Dirichlet 前缀和', link: '/math/number theory/dirichlet'},
            { text: '筛法', link: '/math/number theory/sieve'},
          ]
        }
      ],

      '/math/combinatorial mathematics/': [
        {
          text: '组合数学',
          items: [
            { text: '组合数列', link: '/math/combinatorial mathematics/sequence'},
            { text: '反演', link: '/math/combinatorial mathematics/transfer'},
            
          ]
        }
      ],

      '/math/other':[
        {
          text: "杂项",
          items: [
            
          ]
        }
      ],

      '/other':[
        {
          text: "杂项",
          items: [
            {text: '树同构', link: '/other/tree-hash'},
            {text: '哈希', link: '/other/hashing'},
            {text: '优秀的编码习惯', link: '/other/constant'},
            {text: '范数', link: '/other/distance'},
          ]
        }
      ],

      '/graph/':[
        {
          text: '图论',
          items:[
            { text: '最短路', link: '/graph/shortest-path'},
            { text: '最小生成树', link: '/graph/mst'},
            { text: '二分图', link:'/graph/bipartite'},
            { text: 'Tarjan', link: '/graph/tarjan'},
            { text: '环计数问题', link: '/graph/circle'},
            { text: '欧拉路', link: '/graph/euler'},
          ]
        }
      ],

      '/poly':[
        {
          text: '多项式',
          items:[
            { text: '生成函数', link: '/poly/Generating-function'},
            { text: '基础-多项式全家桶', link: '/poly/poly1'},
            { text: '', link: ''},
          ]
        }
      ],

      '/geometry':[
        {
          text: '计算几何',
          items:[
            { text: '计算几何全家桶', link: '/geometry/model'},
            { text: '计算几何基础概念', link: '/geometry/base'},
            { text: '极角序', link: '/geometry/jijiao'},
            { text: '凸包', link: '/geometry/tubao'},
            { text: '闵可夫斯基和', link: '/geometry/minkowski'},
            { text: '半平面交', link: '/geometry/half'},
            { text: '旋转卡壳', link: '/geometry/rotate'},
            { text: '扫描线', link: '/geometry/scan'},
            { text: '圆', link: '/geometry/circle'},
            { text: '基础三维几何', link: '/geometry/3d'},
            { text: '杂项', link: '/geometry/other'},
          ]
        }
      ],

      '/dp':[
        {
          text: '动态规划',
          items:[
            { text: '线性 dp', link: '/'},
            { text: '背包 dp', link: '/'},
            { text: '区间 dp', link: '/'},
            { text: '状态机 dp', link: '/'},
            { text: '状压 dp', link: '/'},
            { text: 'SOS dp', link: '/'},
            { text: '矩阵 dp', link: '/'},
            { text: '数位 dp', link: '/'},
            { text: '树形 dp', link: '/'},
            { text: '数据结构优化 dp', link: '/'},
            { text: '斜率优化 dp', link: '/'},
            { text: '决策单调性 dp', link: '/'},
            { text: '插头 dp', link: '/'},
          ]
        }
        
      ],

      // '/sundry' :[
      //   {
      //     text: '杂项',
      //     items:[
      //       { text: '/hashing', link: '/'},
      //       { text: '/constant', link: '/'},
      //     ]
      //   }
      // ]

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
