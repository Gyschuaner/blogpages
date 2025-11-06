// 导航栏当前页面高亮和轨迹效果
function highlightCurrentNavItem() {
    // 获取当前页面的文件名
    const currentPage = window.location.pathname.split('/').pop();
    
    // 获取所有导航项
    const navItems = document.querySelectorAll('.menu ul li a');
    
    // 遍历导航项，根据文件名匹配当前页面
    navItems.forEach(item => {
        // 获取链接的href属性值
        const href = item.getAttribute('href');
        
        // 简单的页面匹配逻辑
        if (href === currentPage || 
            (href === 'index.html' && currentPage === '') ||
            (currentPage.includes('blog-') && href === 'blog.html') ||
            (currentPage.includes('notes/') && href === 'blog.html') ||
            (href === 'home.html' && currentPage === '') ||
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
    
    if (menuToggle && menu) {
        menuToggle.addEventListener('click', () => {
            menu.classList.toggle('active');
        });
    }
}

// 打字机效果函数
function typewriterEffect(text1, text2 = null, text3 = null) {
    const typingElement = document.getElementById('typing-text');
    if (!typingElement) return;
    
    const highlightElement = typingElement.querySelector('.highlight');
    if (!highlightElement) return;
    
    let index = 0;
    let currentText = text1;
    let isFirstTextComplete = false;
    let isSecondTextComplete = false;
    
    function type() {
        if (index < currentText.length) {
            // 使用innerHTML而不是textContent，确保换行正确显示
            highlightElement.innerHTML += currentText.charAt(index);
            index++;
            setTimeout(type, 50); // 将打字间隔缩短到50毫秒
        } else if (!isFirstTextComplete && text2) {
            // 第一行完成后添加换行
            highlightElement.innerHTML += '<br>';
            isFirstTextComplete = true;
            currentText = text2;
            index = 0;
            setTimeout(type, 500); // 换行后暂停半秒再继续打字
        } else if (!isSecondTextComplete && text3) {
            // 第二行完成后添加换行
            highlightElement.innerHTML += '<br>';
            isSecondTextComplete = true;
            currentText = text3;
            index = 0;
            setTimeout(type, 500); // 换行后暂停半秒再继续打字
        }
    }
    
    // 开始打字效果
    type();
}

// 当页面加载完成后执行
window.addEventListener('DOMContentLoaded', function() {
    highlightCurrentNavItem();
    handleHeaderScroll();
    setupBackToTop();
    setupMobileMenu();
    
    // 监听滚动事件
    window.addEventListener('scroll', handleHeaderScroll);
    
    // 检查是否存在打字机元素，如果存在则应用相应页面的打字效果
    const typingElement = document.getElementById('typing-text');
    if (typingElement) {
        // 根据页面路径确定显示的文本
        const path = window.location.pathname;
        if (path.includes('about.html')) {
            typewriterEffect('了解我的故事', '探索我的兴趣爱好', '认识真实的我');
        } else if (path.includes('skills.html')) {
            typewriterEffect('我的专业技能', '不断学习进步', '追求技术卓越');
        } else if (path.includes('projects.html')) {
            typewriterEffect('我的项目作品', '创新与实践的结合', '用代码创造价值');
        } else if (path.includes('blog.html')) {
            typewriterEffect('技术分享与思考', '记录学习历程', '交流知识与经验');
        }
    }
});