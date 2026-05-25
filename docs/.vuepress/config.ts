import { defineUserConfig } from "vuepress";
import { viteBundler } from '@vuepress/bundler-vite'
import MarkdownItKatex from 'markdown-it-katex'

import theme from "./theme.ts";


export default defineUserConfig({
  // 此处放置配置
  bundler: viteBundler(),
  theme,
    extendsMarkdown: (md) => {
    md.use(MarkdownItKatex);
  },
  
});