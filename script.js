// DOM元素选择
const backToTopBtn = document.getElementById('back-to-top');
const nav = document.querySelector('nav');
const searchInput = document.querySelector('.search input');
const searchButton = document.querySelector('.search button');
const navLinks = document.querySelectorAll('.nav-links a');

// 页面加载完成后执行
window.addEventListener('DOMContentLoaded', function() {
    // 初始化回到顶部按钮
    initBackToTop();
    
    // 初始化导航栏滚动效果
    initNavbarScroll();
    
    // 初始化平滑滚动
    initSmoothScroll();
    
    // 初始化搜索功能
    initSearch();
    
    // 初始化文章卡片动画
    initPostAnimations();
    
    console.log('博客网站初始化完成！');
});

// 回到顶部按钮功能
function initBackToTop() {
    // 监听滚动事件
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.add('active');
        } else {
            backToTopBtn.classList.remove('active');
        }
    });
    
    // 点击回到顶部
    backToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// 导航栏滚动效果
function initNavbarScroll() {
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', function() {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // 滚动超过100px时，导航栏背景变化
        if (scrollTop > 100) {
            nav.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
            nav.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        } else {
            nav.style.backgroundColor = '#fff';
            nav.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        }
        
        // 隐藏/显示导航栏（向下滚动隐藏，向上滚动显示）
        if (scrollTop > lastScrollTop && scrollTop > 200) {
            // 向下滚动
            nav.style.transform = 'translateY(-100%)';
            nav.style.transition = 'transform 0.3s ease';
        } else {
            // 向上滚动
            nav.style.transform = 'translateY(0)';
            nav.style.transition = 'transform 0.3s ease';
        }
        
        lastScrollTop = scrollTop;
    });
}

// 平滑滚动功能
function initSmoothScroll() {
    // 为所有内部链接添加平滑滚动
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // 移动端点击导航后可以添加关闭菜单的逻辑
            }
        });
    });
}

// 搜索功能
function initSearch() {
    // 搜索输入框回车搜索
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    // 点击搜索按钮
    searchButton.addEventListener('click', performSearch);
    
    // 搜索函数
    function performSearch() {
        const searchTerm = searchInput.value.trim().toLowerCase();
        
        if (searchTerm) {
            console.log('搜索关键词:', searchTerm);
            
            // 这里可以添加实际的搜索逻辑
            // 简单的前端搜索实现
            const posts = document.querySelectorAll('.post, .featured-post');
            let found = false;
            
            posts.forEach(post => {
                const title = post.querySelector('.post-title a').textContent.toLowerCase();
                const excerpt = post.querySelector('.post-excerpt').textContent.toLowerCase();
                
                if (title.includes(searchTerm) || excerpt.includes(searchTerm)) {
                    post.style.display = 'block';
                    found = true;
                } else {
                    post.style.display = 'none';
                }
            });
            
            // 如果没有找到结果，可以显示提示
            if (!found) {
                alert('没有找到相关文章，请尝试其他关键词');
                // 恢复所有文章显示
                posts.forEach(post => {
                    post.style.display = 'block';
                });
            }
        } else {
            alert('请输入搜索关键词');
        }
    }
}

// 文章卡片动画
function initPostAnimations() {
    const posts = document.querySelectorAll('.post, .featured-post');
    
    // 初始隐藏所有文章
    posts.forEach(post => {
        post.style.opacity = '0';
        post.style.transform = 'translateY(20px)';
        post.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    });
    
    // 交叉观察器，当元素进入视口时显示
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // 给每个元素添加延迟，创造级联效果
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 100);
                
                // 一旦显示，就不再观察
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });
    
    // 开始观察所有文章
    posts.forEach(post => {
        observer.observe(post);
    });
    
    // 为文章卡片添加悬停效果
    posts.forEach(post => {
        post.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
            this.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
        });
        
        post.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 2px 15px rgba(0, 0, 0, 0.05)';
        });
    });
}

// 响应式导航菜单（简单实现）
function initResponsiveNav() {
    // 检测窗口大小变化
    window.addEventListener('resize', function() {
        handleResponsiveNav();
    });
    
    // 初始处理
    handleResponsiveNav();
    
    function handleResponsiveNav() {
        const navContainer = document.querySelector('.container');
        const navLinksContainer = document.querySelector('.nav-links');
        
        if (window.innerWidth < 768) {
            // 移动端处理
            if (!document.querySelector('.menu-toggle')) {
                const menuToggle = document.createElement('button');
                menuToggle.classList.add('menu-toggle');
                menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
                
                // 插入菜单按钮
                navContainer.insertBefore(menuToggle, navLinksContainer);
                
                // 默认隐藏导航菜单
                navLinksContainer.style.display = 'none';
                navLinksContainer.style.position = 'absolute';
                navLinksContainer.style.top = '100%';
                navLinksContainer.style.left = '0';
                navLinksContainer.style.width = '100%';
                navLinksContainer.style.backgroundColor = '#fff';
                navLinksContainer.style.boxShadow = '0 5px 10px rgba(0, 0, 0, 0.1)';
                navLinksContainer.style.flexDirection = 'column';
                navLinksContainer.style.alignItems = 'center';
                navLinksContainer.style.padding = '20px 0';
                navLinksContainer.style.gap = '15px';
                
                // 菜单切换点击事件
                menuToggle.addEventListener('click', function() {
                    if (navLinksContainer.style.display === 'none' || navLinksContainer.style.display === '') {
                        navLinksContainer.style.display = 'flex';
                        menuToggle.innerHTML = '<i class="fas fa-times"></i>';
                    } else {
                        navLinksContainer.style.display = 'none';
                        menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
                    }
                });
            }
        } else {
            // 桌面端处理
            const menuToggle = document.querySelector('.menu-toggle');
            if (menuToggle) {
                menuToggle.remove();
            }
            
            // 恢复默认样式
            navLinksContainer.style.display = 'flex';
            navLinksContainer.style.position = 'static';
            navLinksContainer.style.width = 'auto';
            navLinksContainer.style.backgroundColor = 'transparent';
            navLinksContainer.style.boxShadow = 'none';
            navLinksContainer.style.flexDirection = 'row';
            navLinksContainer.style.alignItems = 'center';
            navLinksContainer.style.padding = '0';
            navLinksContainer.style.gap = '0';
        }
    }
}

// 图片加载失败处理
function initImageErrorHandling() {
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('error', function() {
            // 替换为默认图片
            this.src = 'https://via.placeholder.com/' + this.width + 'x' + this.height + '?text=图片加载失败';
            this.alt = '图片加载失败';
        });
    });
}

// 添加页面加载动画
window.addEventListener('load', function() {
    // 这里可以添加页面加载完成后的动画
    console.log('所有资源加载完成');
    
    // 初始化响应式导航
    initResponsiveNav();
    
    // 初始化图片错误处理
    initImageErrorHandling();
});

// 为页面添加一些交互增强功能
function enhanceUserExperience() {
    // 复制文章内容时添加版权信息
    document.addEventListener('copy', function(e) {
        const selection = window.getSelection();
        const selectedText = selection.toString();
        
        if (selectedText.length > 100) {
            const copyright = '\n\n---\n本文内容来自：我的博客\n原文链接：' + window.location.href;
            e.clipboardData.setData('text/plain', selectedText + copyright);
            e.preventDefault();
        }
    });
    
    // 检测网络状态变化
    window.addEventListener('online', function() {
        console.log('网络已连接');
    });
    
    window.addEventListener('offline', function() {
        console.log('网络已断开');
        // 可以显示一个离线提示
    });
}

// 启动用户体验增强功能
enhanceUserExperience();