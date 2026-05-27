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
            let rawBlogs = [
        {
            "title": "DQN 深度强化学习网络",
            "path": "notes/dqn-deep-q-network.html",
            "date": "2026-05-26",
            "category": "强化学习",
            "author": "xgg",
            "readTime": "12分钟",
            "tags": ["DQN", "强化学习", "Deep Q-Network", "RL"],
            "excerpt": "用直观类比解释 DQN 如何把 Q-learning 和神经网络结合起来，并梳理目标网络、经验回放与 off-policy 的核心思想。"
        },
        {
            "title": "RAG 查询优化",
            "path": "notes/RAG 查询优化.html",
            "date": "2025-12-02",
            "category": "AI",
            "author": "xgg",
            "readTime": "30分钟",
            "tags": ["RAG", "查询优化", "大语言模型", "检索增强生成"],
            "excerpt": "系统梳理 RAG 查询优化中的 Multi-Query、RAG-Fusion、查询分解、Step Back Prompting 和 HyDE，并配合代码与图解理解每种方法的作用。"
        },
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
        },
        {
                "title": "简单智能体实现",
                "path": "notes/简单智能体实现.html",
                "date": "2025-11-04",
                "category": "Python",
                "author": "Xgg",
                "readTime": "10分钟",
                "tags": ["智能体", "Python", "大模型"],
                "excerpt": "详细介绍如何使用 Python 和大模型实现一个简单的智能体系统"
            }
    ];
            
            // 过滤掉博客模板页面
            const filteredBlogs = rawBlogs.filter(blog => blog.title !== "博客模板");
            
            // 按时间降序排序（最新的在前）
            this.blogs = filteredBlogs.sort((a, b) => {
                return new Date(b.date) - new Date(a.date);
            });
            
            console.log('Loaded and sorted blogs:', this.blogs.length);
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
            html += `<li><a href="${correctPath}">${this.escapeHTML(blog.title)}</a></li>`;
        });
        return html;
    }

    escapeHTML(text) {
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    getCategoryCounts() {
        const counts = new Map();
        this.blogs.forEach(blog => {
            counts.set(blog.category, (counts.get(blog.category) || 0) + 1);
        });
        return Array.from(counts.entries())
            .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'zh-CN'));
    }

    getVisibleBlogs() {
        const query = (this.searchQuery || '').trim().toLowerCase();
        return this.blogs.filter(blog => {
            const categoryMatch = !this.activeCategory || this.activeCategory === 'all' || blog.category === this.activeCategory;
            if (!categoryMatch) return false;
            if (!query) return true;

            return blog.title.toLowerCase().includes(query) ||
                blog.excerpt.toLowerCase().includes(query) ||
                blog.category.toLowerCase().includes(query) ||
                blog.tags.some(tag => tag.toLowerCase().includes(query));
        });
    }

    generateCategoryFoldersHTML() {
        const activeCategory = this.activeCategory || 'all';
        const allActive = activeCategory === 'all' ? ' active' : '';
        const closedChest = 'images/project-chest-closed.png';
        const openChest = 'images/project-chest-open.png';
        let html = `
            <button class="blog-folder-item${allActive}" type="button" data-category="all">
                <span class="folder-icon">
                    <img src="${allActive ? openChest : closedChest}" alt="" class="folder-chest-img" aria-hidden="true">
                </span>
                <span class="folder-name">全部文章</span>
                <span class="folder-count">${this.blogs.length}</span>
            </button>
        `;

        this.getCategoryCounts().forEach(([category, count]) => {
            const active = activeCategory === category ? ' active' : '';
            html += `
            <button class="blog-folder-item${active}" type="button" data-category="${this.escapeHTML(category)}">
                <span class="folder-icon">
                    <img src="${active ? openChest : closedChest}" alt="" class="folder-chest-img" aria-hidden="true">
                </span>
                <span class="folder-name">${this.escapeHTML(category)}</span>
                <span class="folder-count">${count}</span>
            </button>
            `;
        });

        return html;
    }

    // 生成博客页面的文章列表HTML
    generateBlogPostsHTML(blogs = this.blogs) {
        let html = '';
        blogs.forEach(blog => {
            const correctPath = this.getBlogPath(blog.path);
            const tags = blog.tags.map(tag => `<span class="blog-tag">${this.escapeHTML(tag)}</span>`).join('');
            html += `
            <article class="blog-post">
                <div class="blog-header">
                    <h3 class="blog-title"><a href="${correctPath}">${this.escapeHTML(blog.title)}</a></h3>
                    <div class="blog-meta">
                        <span class="blog-date"><i class="far fa-calendar-alt"></i> ${this.escapeHTML(blog.date)}</span>
                        <span class="blog-category"><i class="far fa-folder"></i> ${this.escapeHTML(blog.category)}</span>
                    </div>
                </div>
                <div class="blog-excerpt">
                    <p>${this.escapeHTML(blog.excerpt)}</p>
                </div>
                <div class="blog-tags">
                    ${tags}
                </div>
                <a href="${correctPath}" class="blog-readmore">阅读全文</a>
            </article>
            `;
        });
        return html;
    }

    renderBlogIndex() {
        const folderList = document.querySelector('.blog-folder-list');
        const blogListContainer = document.querySelector('.blog-list');
        const status = document.querySelector('.blog-list-status');

        if (folderList) {
            folderList.innerHTML = this.generateCategoryFoldersHTML();
        }

        if (!blogListContainer) return;

        const visibleBlogs = this.getVisibleBlogs();
        const query = (this.searchQuery || '').trim();
        const categoryLabel = !this.activeCategory || this.activeCategory === 'all' ? '全部文章' : this.activeCategory;

        if (status) {
            const queryText = query ? ` · 搜索“${query}”` : '';
            status.textContent = `${categoryLabel} · ${visibleBlogs.length} 篇${queryText}`;
        }

        if (!visibleBlogs.length) {
            const emptyText = query ? `没有找到包含“${query}”的博客文章` : '这个文件夹里暂时还没有文章';
            blogListContainer.innerHTML = `<div class="search-results-message">${this.escapeHTML(emptyText)}</div>`;
            return;
        }

        blogListContainer.innerHTML = this.generateBlogPostsHTML(visibleBlogs);
    }

    setActiveCategory(category) {
        this.activeCategory = category || 'all';
        this.renderBlogIndex();
    }

    setSearchQuery(query) {
        this.searchQuery = query || '';
        this.renderBlogIndex();
    }

    initBlogFolderPanel() {
        const folderList = document.querySelector('.blog-folder-list');
        if (!folderList || folderList.dataset.bound === 'true') return;

        folderList.dataset.bound = 'true';
        folderList.addEventListener('click', (event) => {
            const button = event.target.closest('.blog-folder-item');
            if (!button) return;
            this.setActiveCategory(button.dataset.category || 'all');
        });
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
        window.blogLoaderInstance = this;
        
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
            this.activeCategory = this.activeCategory || 'all';
            this.searchQuery = this.searchQuery || '';
            this.initBlogFolderPanel();
            this.renderBlogIndex();
            console.log('Main blog list updated successfully');
        }
        
        console.log('Blog loader initialization complete');
        document.dispatchEvent(new CustomEvent('blogLoaderReady'));
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
