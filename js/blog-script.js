// 博客列表动态加载脚本
class BlogLoader {
    constructor() {
        this.blogs = [];
        console.log('BlogLoader initialized');
    }

    // 直接硬编码博客数据，避免HTTP请求和路径问题
    async loadBlogs() {
        try {
            console.log('Loading blog data from hardcoded source...');
            
            // 直接定义博客数据，与blog-config.json内容相同
            this.blogs = [
                {
                    "title": "注意力机制详解",
                    "path": "notes/attention-mechanism.html",
                    "date": "2025-10-27",
                    "category": "深度学习",
                    "author": "xgg",
                    "readTime": "15分钟",
                    "tags": ["注意力机制", "深度学习", "NLP"],
                    "excerpt": "注意力机制是现代深度学习模型（尤其是NLP领域的Transformer架构）中的核心组件。本文将详细介绍注意力机制的基本原理、实现方法和关键概念，包括词嵌入、位置编码、自注意力、掩码注意力和多头自注意力等重要内容。"
                },
                {
                    "title": "GPT-2模型详解与实现",
                    "path": "notes/GPT-2.html",
                    "date": "2025-10-20",
                    "category": "深度学习",
                    "author": "xgg",
                    "readTime": "12分钟",
                    "tags": ["GPT-2", "PyTorch", "Transformer"],
                    "excerpt": "本文详细介绍了GPT-2模型的架构原理与实现过程，包括单头注意力机制、多头注意力机制、前馈神经网络、Transformer Block等核心组件，并提供了完整的PyTorch实现代码。"
                },
                {
                    "title": "博客模板",
                    "path": "notes/blog-template.html",
                    "date": "2025-11-06",
                    "category": "模板",
                    "author": "故意盛的剩饭",
                    "readTime": "5分钟",
                    "tags": ["模板", "HTML", "CSS"],
                    "excerpt": "这是一个博客模板页面，包含了完整的页面结构、样式和功能组件，可作为今后写博客的标准模板使用。"
                }
            ];
            
            console.log('Loaded blogs:', this.blogs.length);
            return this.blogs;
        } catch (error) {
            console.error('Error loading blog data:', error);
            return [];
        }
    }

    // 根据当前页面位置获取正确的博客路径
    getBlogPath(blogPath) {
        // 检查当前页面是否已经在notes目录下
        const isInNotes = window.location.pathname.includes('/notes/') || window.location.href.includes('\\notes\\');
        
        // 如果在主博客页面（不在notes目录），路径需要包含notes
        // 如果已经在notes目录下，直接使用相对路径
        if (!isInNotes && blogPath.startsWith('notes/')) {
            return blogPath; // 在主博客页面，保留notes前缀
        } else if (isInNotes && blogPath.startsWith('notes/')) {
            return blogPath.substring(6); // 在notes目录下，移除notes前缀
        }
        return blogPath;
    }

    // 生成博客列表HTML
    generateBlogListHTML() {
        let html = '';
        this.blogs.forEach(blog => {
            const correctPath = this.getBlogPath(blog.path);
            html += `<li><a href="${correctPath}">${blog.title}</a></li>`;
        });
        return html;
    }

    // 生成博客页面的文章列表HTML
    generateBlogPostsHTML() {
        let html = '';
        this.blogs.forEach(blog => {
            const correctPath = this.getBlogPath(blog.path);
            html += `
            <article class="blog-post">
                <div class="blog-header">
                    <h3 class="blog-title"><a href="${correctPath}">${blog.title}</a></h3>
                    <div class="blog-meta">
                        <span class="blog-date"><i class="far fa-calendar-alt"></i> ${blog.date}</span>
                        <span class="blog-category"><i class="far fa-folder"></i> ${blog.category}</span>
                    </div>
                </div>
                <div class="blog-excerpt">
                    <p>${blog.excerpt}</p>
                </div>
                <a href="${correctPath}" class="blog-readmore">阅读全文</a>
            </article>
            `;
        });
        return html;
    }

    // 生成文章元数据HTML
    generateArticleMetaHTML(title) {
        const blog = this.blogs.find(b => b.title === title);
        if (!blog) return '';
        
        let html = `
        <span class="author"><i class="far fa-user"></i> ${blog.author}</span>
        <span class="date"><i class="far fa-calendar-alt"></i> ${blog.date}</span>
        <span class="read-time"><i class="far fa-clock"></i> 大约 ${blog.readTime}</span>
        <span class="tags">
        `;
        
        blog.tags.forEach(tag => {
            html += `<span class="tag">${tag}</span>`;
        });
        
        html += `</span>`;
        return html;
    }

    // 初始化 - 动态更新所有博客列表
    async init() {
        console.log('Initializing blog loader...');
        await this.loadBlogs();
        
        // 更新左侧导航栏的博客列表
        console.log('Attempting to update sidebar blog lists...');
        const blogLists = document.querySelectorAll('.blog-nav ul:first-of-type');
        console.log('Found sidebar blog lists:', blogLists.length);
        
        blogLists.forEach((list, index) => {
            console.log(`Updating sidebar list #${index + 1}`);
            const blogListHTML = this.generateBlogListHTML();
            console.log('Generated HTML for sidebar list:', blogListHTML);
            list.innerHTML = blogListHTML;
        });
        
        // 更新主博客页面的文章列表
        console.log('Attempting to update main blog list...');
        const blogListContainer = document.querySelector('.blog-list');
        console.log('Blog list container found:', !!blogListContainer);
        
        if (blogListContainer) {
            const blogPostsHTML = this.generateBlogPostsHTML();
            console.log('Generated HTML for main blog list:', blogPostsHTML);
            blogListContainer.innerHTML = blogPostsHTML;
            console.log('Main blog list updated successfully');
        }
        
        console.log('Blog loader initialization complete');
    }
}

// 当DOM加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBlogLoader);
} else {
    initBlogLoader();
}

function initBlogLoader() {
    const blogLoader = new BlogLoader();
    blogLoader.init();
}

// 暴露BlogLoader类供其他脚本使用
globalThis.BlogLoader = BlogLoader;