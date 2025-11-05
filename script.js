// DOM加载完成后执行
 document.addEventListener('DOMContentLoaded', function() {
    // 导航菜单切换
    const menuToggle = document.querySelector('.menu-toggle');
    const menu = document.querySelector('.menu');
    
    if (menuToggle && menu) {
        menuToggle.addEventListener('click', function() {
            menu.classList.toggle('active');
            // 切换图标
            const icon = menuToggle.querySelector('i');
            if (icon.classList.contains('fa-bars')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }
    
    // 菜单项点击事件 - 关闭菜单和滚动到对应部分
    const menuItems = document.querySelectorAll('.menu ul li a');
    
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            // 关闭菜单
            if (menu && menu.classList.contains('active')) {
                menu.classList.remove('active');
                const icon = menuToggle.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
            
            // 平滑滚动到锚点
            const targetId = this.getAttribute('href');
            if (targetId.startsWith('#') && targetId.length > 1) {
                e.preventDefault();
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
    
    // 导航栏滚动效果
    const navbar = document.getElementById('navbar');
    
    window.addEventListener('scroll', function() {
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }
        
        // 控制返回顶部按钮显示
        const backToTopBtn = document.getElementById('back-to-top');
        if (backToTopBtn) {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        }
        
        // 触发技能条动画
        animateSkills();
    });
    
    // 返回顶部按钮功能
    const backToTopBtn = document.getElementById('back-to-top');
    
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // 表单验证
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // 表单字段
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const message = document.getElementById('message').value.trim();
            
            // 简单验证
            let isValid = true;
            
            if (name === '') {
                alert('请输入您的姓名');
                isValid = false;
            } else if (email === '') {
                alert('请输入您的邮箱');
                isValid = false;
            } else if (!isValidEmail(email)) {
                alert('请输入有效的邮箱地址');
                isValid = false;
            } else if (message === '') {
                alert('请输入您的留言');
                isValid = false;
            }
            
            // 提交表单
            if (isValid) {
                // 这里可以添加AJAX表单提交代码
                alert('感谢您的留言！我们会尽快回复您。');
                contactForm.reset();
            }
        });
    }
    
    // 邮箱格式验证
    function isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    // 技能条动画
    function animateSkills() {
        const skillProgresses = document.querySelectorAll('.skill-progress');
        
        skillProgresses.forEach(progress => {
            const rect = progress.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom >= 0;
            
            if (isVisible && !progress.classList.contains('animated')) {
                progress.classList.add('animated');
                const width = progress.style.width;
                progress.style.width = '0';
                
                // 触发重排
                void progress.offsetWidth;
                
                // 设置动画
                progress.style.width = width;
            }
        });
    }
    
    // 项目卡片悬停效果增强
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // 页面加载时的淡入效果
    const fadeInElements = document.querySelectorAll('.section-title, .about-content, .skills-category, .project-card, .contact-container');
    
    fadeInElements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, 100 + index * 100);
    });
    
    // 初始化时触发一次技能条动画检查
    animateSkills();
    
    // 添加键盘事件监听
    document.addEventListener('keydown', function(e) {
        // ESC键关闭菜单
        if (e.key === 'Escape' && menu && menu.classList.contains('active')) {
            menu.classList.remove('active');
            const icon = menuToggle.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        }
    });
});