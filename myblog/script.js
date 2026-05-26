// 导航栏当前页面高亮和轨迹效果
function highlightCurrentNavItem() {
    // 获取当前页面的文件名
    const currentPage = window.location.pathname.split('/').pop();
    const isHomePage = currentPage === '' || currentPage === 'index.html' || currentPage === 'home.html';
    
    // 获取所有导航项
    const navItems = document.querySelectorAll('.menu ul li a');
    
    // 遍历导航项，根据文件名匹配当前页面
    navItems.forEach(item => {
        // 获取链接的href属性值
        const href = item.getAttribute('href');
        
        // 简单的页面匹配逻辑
        if (href === currentPage ||
            (href === 'home.html' && isHomePage) ||
            (currentPage.includes('blog-') && href === 'blog.html') ||
            (currentPage.includes('notes/') && href === 'blog.html') ||
            (currentPage.includes('birthday_') && href === 'timeline.html')) {
            // 添加current类到父元素li
            item.parentElement.classList.add('current');
        }
    });
}

// 导航栏滚动效果
function handleHeaderScroll() {
    const header = document.querySelector('header');
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
}

// 返回顶部按钮
function setupBackToTop() {
    const backToTopButton = document.querySelector('.back-to-top');
    if (backToTopButton) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopButton.classList.add('visible');
            } else {
                backToTopButton.classList.remove('visible');
            }
        });
        
        backToTopButton.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}

// 移动端菜单切换
function setupMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const menu = document.querySelector('.menu');
    const menuLinks = document.querySelectorAll('.menu a');
    
    if (menuToggle && menu) {
        menuToggle.addEventListener('click', () => {
            menu.classList.toggle('active');
        });

        menuLinks.forEach(link => {
            link.addEventListener('click', () => {
                menu.classList.remove('active');
            });
        });
    }
}

// 首页打字机效果
function setupHeroTyping() {
    const typingElement = document.getElementById('typing-text');
    const highlightElement = typingElement ? typingElement.querySelector('.highlight') : null;

    if (!highlightElement) {
        return;
    }

    const lines = [
        '很高兴见到你，我是 Xgg',
        '这里是我的方块博客基地',
        '记录 AI、代码与奇思妙想'
    ];
    const typeDelay = 48;
    const lineDelay = 420;
    let lineIndex = 0;
    let charIndex = 0;

    highlightElement.textContent = '';

    function type() {
        const currentLine = lines[lineIndex];

        if (charIndex < currentLine.length) {
            highlightElement.append(currentLine.charAt(charIndex));
            charIndex += 1;
            window.setTimeout(type, typeDelay);
            return;
        }

        lineIndex += 1;
        charIndex = 0;

        if (lineIndex < lines.length) {
            highlightElement.append(document.createElement('br'));
            window.setTimeout(type, lineDelay);
        }
    }

    type();
}

// 首页进度条动画
function setupProgressBars() {
    const buildProgressBar = document.getElementById('build-progress-bar');
    const optimizeProgressBar = document.getElementById('optimize-progress-bar');

    window.setTimeout(() => {
        if (buildProgressBar) {
            buildProgressBar.style.width = '30%';
        }

        if (optimizeProgressBar) {
            optimizeProgressBar.style.width = '8%';
        }
    }, 500);
}

// 页面加载完成后执行
window.addEventListener('DOMContentLoaded', () => {
    highlightCurrentNavItem();
    handleHeaderScroll();
    setupBackToTop();
    setupMobileMenu();
    setupHeroTyping();
    setupProgressBars();
    
    // 监听滚动事件
    window.addEventListener('scroll', handleHeaderScroll);
});
