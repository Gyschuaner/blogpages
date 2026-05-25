// .vuepress/theme.ts
import { hopeTheme } from "vuepress-theme-hope";

export default hopeTheme({
  // 主题配置

  // 1. 开启博客功能
  blog: {
    name: "你的博客名字",
    avatar: "/path/to/your/avatar.png", // 你的头像路径
    description: "你的一句话描述",
    intro: "/about-me.html", // “关于我”的页面链接
    medias: {
      // 在此处放置你的社交媒体链接
      GitHub: "https_github.com/your-username",
      Email: "mailto:your@email.com",
    },
  },

  markdown: {
    // 启用 figure
    figure: true,
    // 启用图片懒加载
    imgLazyload: true,
    // 启用图片标记
    imgMark: true,
    // 启用图片大小
    imgSize: true,
    // 启用 Obsidian 风格的图片大小
    obsidianImgSize: true,
    math:{
      type: "katex",

    },
        // 关键词 "shiki" / "prismjs"
    // 或者拥有 type 字段的对象
    highlighter: {
      type: "shiki", // or "prismjs"

      // shiki 或 prismjs 选项
      // ...
    },
  },
  

  
  // 5. 其他配置
  // 比如导航栏、侧边栏等...
  navbar: [
    { text: "首页", link: "/" },
    { text: "文章", link: "/blog/" },
  ],
  

  // 你的图标 FontClass (如果你使用 iconfont)
  // iconAssets: "iconfont",

  // 你的 logo
  // logo: "/logo.svg",
});