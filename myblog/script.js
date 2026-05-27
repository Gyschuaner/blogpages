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
            (currentPage.includes('project-') && href === 'projects.html') ||
            (currentPage.startsWith('blog-') && href === 'blog.html') ||
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

// 项目页分类箱子
function setupProjectFilters() {
    const filterButtons = document.querySelectorAll('.project-filter-button');
    const projectCards = document.querySelectorAll('.project-card[data-project-category]');
    const boardStatus = document.querySelector('.project-board-status');

    if (!filterButtons.length || !projectCards.length) {
        return;
    }

    const closedChest = 'images/project-chest-closed.png';
    const openChest = 'images/project-chest-open.png';

    function applyFilter(filter, label) {
        let visibleCount = 0;

        projectCards.forEach(card => {
            const shouldShow = filter === 'all' || card.dataset.projectCategory === filter;
            card.classList.toggle('is-hidden', !shouldShow);
            if (shouldShow) {
                visibleCount += 1;
            }
        });

        filterButtons.forEach(button => {
            const isActive = button.dataset.projectFilter === filter;
            button.classList.toggle('active', isActive);

            const chestImage = button.querySelector('.project-chest-img');
            if (chestImage) {
                chestImage.src = isActive ? openChest : closedChest;
            }
        });

        if (boardStatus) {
            boardStatus.textContent = `${label} · ${visibleCount} 件`;
        }
    }

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            applyFilter(button.dataset.projectFilter || 'all', button.dataset.filterLabel || '全部项目');
        });
    });

    const activeButton = document.querySelector('.project-filter-button.active') || filterButtons[0];
    applyFilter(activeButton.dataset.projectFilter || 'all', activeButton.dataset.filterLabel || '全部项目');
}

// EntBench 项目演示页
function setupEntbenchDemo() {
    const root = document.querySelector('[data-entbench-demo]');

    if (!root) {
        return;
    }

    const status = root.querySelector('[data-demo-status]');
    const dataFiles = {
        corpus: 'data/entbench/corpus-inspection.json',
        metadata: 'data/entbench/generated-metadata.json',
        tools: 'data/entbench/tool-metadata.json',
        draft: 'data/entbench/l4-1006-draft.json',
        agentLog: 'data/entbench/l4-1006-agent-log.json',
        pathMining: 'data/entbench/l4-1006-path-mining.json',
        failure: 'data/entbench/l4-1124-failure-labels.json',
        solvability: 'data/entbench/l4-1006-solvability.json'
    };

    const escapeHtml = value => String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

    const setHtml = (selector, html) => {
        const node = root.querySelector(selector);
        if (node) {
            node.innerHTML = html;
        }
    };

    const objectEntries = value => value && typeof value === 'object' && !Array.isArray(value)
        ? Object.entries(value)
        : [];

    const formatNumber = value => {
        const number = Number(value);
        if (!Number.isFinite(number)) {
            return escapeHtml(value ?? '-');
        }
        return number.toLocaleString('zh-CN');
    };

    const formatMetric = value => {
        const number = Number(value);
        if (!Number.isFinite(number)) {
            return escapeHtml(value ?? '-');
        }
        if (number >= 0 && number <= 1) {
            return `${Math.round(number * 100)}%`;
        }
        return formatNumber(number);
    };

    const shortText = (value, maxLength = 180) => {
        const text = String(value ?? '');
        return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
    };

    const sumCounts = counts => objectEntries(counts)
        .filter(([key, value]) => key !== 'metadata' && typeof value === 'number')
        .reduce((total, [, value]) => total + value, 0);

    const countTables = counts => objectEntries(counts)
        .filter(([, value]) => typeof value === 'number').length;

    const renderStats = stats => stats.map(stat => `
        <div class="demo-stat-card">
            <i class="${escapeHtml(stat.icon || 'fas fa-cube')}"></i>
            <span class="demo-stat-value">${escapeHtml(stat.value)}</span>
            <span class="demo-stat-label">${escapeHtml(stat.label)}</span>
            ${stat.note ? `<span class="demo-stat-note">${escapeHtml(stat.note)}</span>` : ''}
        </div>
    `).join('');

    const renderTags = (items, type = '') => {
        const list = Array.isArray(items) ? items : [];
        if (!list.length) {
            return '<p class="demo-empty">暂无可展示条目</p>';
        }
        return `<div class="demo-tag-list">${list.map(item => `
            <span class="demo-chip ${type}">${escapeHtml(item)}</span>
        `).join('')}</div>`;
    };

    const renderKeyValues = (items, limit = 12) => {
        const entries = Array.isArray(items) ? items : objectEntries(items);
        if (!entries.length) {
            return '<p class="demo-empty">暂无结构化字段</p>';
        }
        return `<div class="demo-kv">${entries.slice(0, limit).map(([key, value]) => {
            const displayValue = Array.isArray(value)
                ? value.join(', ')
                : value && typeof value === 'object'
                    ? JSON.stringify(value)
                    : value;
            return `
                <div class="demo-kv-row">
                    <span class="demo-kv-key">${escapeHtml(key)}</span>
                    <span class="demo-kv-value">${escapeHtml(displayValue ?? '-')}</span>
                </div>
            `;
        }).join('')}</div>`;
    };

    const renderTable = (headers, rows) => {
        if (!rows.length) {
            return '<p class="demo-empty">暂无表格数据</p>';
        }
        return `
            <div class="demo-table-wrap">
                <table class="demo-table">
                    <thead>
                        <tr>${headers.map(header => `<th>${escapeHtml(header)}</th>`).join('')}</tr>
                    </thead>
                    <tbody>
                        ${rows.map(row => `
                            <tr>${row.map(cell => `<td>${escapeHtml(cell ?? '-')}</td>`).join('')}</tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    };

    const renderMeters = data => {
        const entries = objectEntries(data);
        if (!entries.length) {
            return '<p class="demo-empty">暂无密度数据</p>';
        }
        const maxValue = Math.max(...entries.map(([, value]) => Number(value) || 0), 1);
        return `<div class="demo-meter-list">${entries.map(([label, value]) => {
            const width = Math.max(4, Math.round(((Number(value) || 0) / maxValue) * 100));
            return `
                <div class="demo-meter-row">
                    <span>${escapeHtml(label)}</span>
                    <span class="demo-meter-track"><span class="demo-meter-fill" style="width: ${width}%"></span></span>
                    <span>${formatNumber(value)}</span>
                </div>
            `;
        }).join('')}</div>`;
    };

    const renderPath = path => {
        const tools = Array.isArray(path) ? path : [];
        if (!tools.length) {
            return '<span class="demo-chip warn">无路径</span>';
        }
        return `<div class="demo-path-line">${tools.map((tool, index) => `
            ${index > 0 ? '<span class="demo-path-arrow">→</span>' : ''}
            <span class="demo-chip">${escapeHtml(tool)}</span>
        `).join('')}</div>`;
    };

    const renderCode = value => {
        const text = typeof value === 'string' ? value : JSON.stringify(value ?? {}, null, 2);
        return `<pre class="demo-code-snippet">${escapeHtml(shortText(text, 1400))}</pre>`;
    };

    const renderOverview = ({ corpus, metadata, tools }) => {
        const counts = metadata.counts || corpus.counts || {};
        const domainEntries = objectEntries(tools.domains);
        const toolCount = Object.keys(tools.full_tool_info || {}).length;

        setHtml('[data-demo-overview-stats]', renderStats([
            { icon: 'fas fa-table', value: formatNumber(countTables(counts)), label: '企业数据表', note: metadata.preset ? `preset: ${metadata.preset}` : '完整企业沙盒结构' },
            { icon: 'fas fa-database', value: formatNumber(sumCounts(counts)), label: '模拟记录', note: metadata.anchor_date ? `锚定日期 ${metadata.anchor_date}` : '跨域业务记录' },
            { icon: 'fas fa-layer-group', value: formatNumber(domainEntries.length), label: '工具域', note: domainEntries.map(([key]) => key).join(' / ') },
            { icon: 'fas fa-toolbox', value: formatNumber(toolCount), label: '企业工具', note: '用于 Agent 读写企业沙盒' }
        ]));

        setHtml('[data-demo-density]', renderMeters(corpus.domain_density || {}));
        setHtml('[data-demo-validation]', renderKeyValues({
            语料通过: corpus.validation_summary?.passed,
            错误数: corpus.validation_summary?.error_count,
            警告数: corpus.validation_summary?.warning_count,
            生成时间: metadata.generated_at,
            随机种子: metadata.seed,
            源数据库: metadata.source_database
        }));
    };

    const renderSandbox = ({ metadata, tools }) => {
        const countRows = objectEntries(metadata.counts || {})
            .filter(([key]) => key !== 'metadata')
            .sort((a, b) => Number(b[1]) - Number(a[1]))
            .map(([table, count]) => [table, formatNumber(count)]);
        const domainRows = objectEntries(tools.domains || {}).map(([domain, info]) => {
            const toolList = Array.isArray(info.tools) ? info.tools : [];
            const preview = toolList.slice(0, 4).map(tool => Array.isArray(tool) ? tool[0] : tool).join(', ');
            return [info.display || domain, domain, formatNumber(toolList.length), preview];
        });

        setHtml('[data-demo-table-counts]', renderTable(['数据表', '记录数'], countRows));
        setHtml('[data-demo-domains]', renderTable(['工具域', 'domain', '数量', '代表工具'], domainRows));
    };

    const renderTask = ({ draft, solvability }) => {
        const taskDraft = draft.task_draft || {};
        const taskMeta = taskDraft.task_meta || {};
        const stages = Array.isArray(taskDraft.stages) ? taskDraft.stages : [];
        const seedFacts = solvability.seed_facts || {};

        setHtml('[data-demo-task-meta]', `
            ${renderKeyValues({
                seed_id: draft.seed_id,
                task_name: taskMeta.task_name,
                difficulty: taskMeta.difficulty,
                valid: draft.valid,
                description: taskMeta.description
            })}
            <span class="demo-mini-label">tags</span>
            ${renderTags(taskMeta.tags || [])}
        `);

        setHtml('[data-demo-solvability]', `
            <div class="demo-stat-grid demo-stat-grid-compact">
                ${renderStats([
                { icon: 'fas fa-door-open', value: solvability.gate_pass ? 'PASS' : 'FAIL', label: 'gold chain 门控' },
                { icon: 'fas fa-wrench', value: formatNumber(solvability.applied_patches ?? 0), label: 'applied patches' },
                { icon: 'fas fa-comments', value: formatNumber((solvability.agent_traces || []).length), label: '验证阶段' },
                { icon: 'fas fa-star', value: formatMetric(solvability.evaluation_result?.score), label: '验证得分' }
                ])}
            </div>
            <span class="demo-mini-label">seed facts</span>
            ${renderKeyValues([
                ['request_id', seedFacts.request_id],
                ['document_id', seedFacts.document_id],
                ['requester_name', seedFacts.requester_name],
                ['owner_name', seedFacts.owner_name],
                ['meeting_id', seedFacts.meeting_id],
                ['meeting_date', seedFacts.meeting_date]
            ])}
        `);

        setHtml('[data-demo-stage-list]', stages.map(stage => `
            <article class="demo-stage-card">
                <h4>Stage ${escapeHtml(stage.stage_id)} · ${escapeHtml(stage.stage_goal || stage.description || '任务阶段')}</h4>
                <p>${escapeHtml(shortText(stage.user_says, 260))}</p>
                <span class="demo-mini-label">required_tools</span>
                ${renderTags(stage.required_tools || [])}
                <span class="demo-mini-label">fill_blanks / state_checks</span>
                ${renderTags([
                    `fill_blanks: ${(stage.fill_blanks || []).length}`,
                    `state_checks: ${(stage.state_checks || []).length}`,
                    `state_change: ${stage.state_change || 'none'}`
                ], 'warn')}
            </article>
        `).join(''));
    };

    const renderAgentReplay = ({ agentLog }) => {
        const summary = agentLog.summary_stats || {};
        const evaluation = agentLog.evaluation_result || {};
        const traces = Array.isArray(agentLog.agent_traces) ? agentLog.agent_traces : [];
        const stageResults = Array.isArray(evaluation.stage_results) ? evaluation.stage_results : [];

        setHtml('[data-demo-exec-summary]', renderStats([
            { icon: 'fas fa-hashtag', value: agentLog.task_id || '-', label: '任务 ID', note: agentLog.task_name },
            { icon: 'fas fa-signal', value: `L${agentLog.difficulty ?? '-'}`, label: '难度' },
            { icon: 'fas fa-stopwatch', value: `${Math.round(Number(summary.total_time_seconds) || 0)}s`, label: '总耗时' },
            { icon: 'fas fa-gauge-high', value: formatMetric(evaluation.score), label: '评测分数', note: evaluation.overall_success ? 'overall success' : 'needs review' }
        ]));

        setHtml('[data-demo-trace-list]', traces.map(trace => {
            const toolCalls = Array.isArray(trace.tool_calls_detail) ? trace.tool_calls_detail : [];
            return `
                <article class="demo-stage-card">
                    <h4>Stage ${escapeHtml(trace.stage_id)} · ${escapeHtml(trace.stage_description)}</h4>
                    <p>${escapeHtml(shortText(trace.user_query, 220))}</p>
                    <span class="demo-mini-label">selected_domain / selected_tools</span>
                    ${renderTags([trace.selected_domain || 'unknown', ...(trace.selected_tools || [])])}
                    <span class="demo-mini-label">tool_calls_detail</span>
                    ${renderTable(['tool', 'success', 'result'], toolCalls.slice(0, 4).map(call => [
                        call.tool_name,
                        call.success === false ? 'false' : 'true',
                        shortText(call.result || call.error || '-', 140)
                    ]))}
                    <span class="demo-mini-label">stage2 thought</span>
                    ${renderCode(trace.stage2_thought || trace.stage1_thought || '')}
                </article>
            `;
        }).join(''));

        setHtml('[data-demo-eval]', `
            ${renderKeyValues(evaluation.overall_metrics || {})}
            <span class="demo-mini-label">stage_results</span>
            ${renderTable(['stage', 'type', 'process', 'outcome', 'fill_blank'], stageResults.map(result => [
                result.stage_id,
                result.stage_type,
                result.process_pass,
                result.outcome_pass,
                result.fill_blank_score
            ]))}
        `);
    };

    const renderPathMining = ({ pathMining }) => {
        const mining = pathMining.path_mining || {};
        const stageBank = mining.stage_path_bank || {};
        const comparisons = Array.isArray(pathMining.current_run_path_comparison)
            ? pathMining.current_run_path_comparison
            : [];

        setHtml('[data-demo-path-bank]', objectEntries(stageBank).map(([stageId, paths]) => {
            const firstPath = Array.isArray(paths) ? paths[0] : null;
            return `
                <article class="demo-stage-card">
                    <h4>Stage ${escapeHtml(stageId)} · ${formatNumber(firstPath?.length || 0)} tools</h4>
                    ${renderPath(firstPath?.path || [])}
                    <span class="demo-mini-label">source</span>
                    ${renderTags(firstPath?.sources || ['__current_run__'], 'warn')}
                </article>
            `;
        }).join(''));

        setHtml('[data-demo-path-compare]', comparisons.map(item => `
            <article class="demo-stage-card">
                <h4>Stage ${escapeHtml(item.stage_id)} · efficiency ${formatMetric(item.path_efficiency_score)}</h4>
                <span class="demo-mini-label">observed</span>
                ${renderPath(item.observed_tool_path || [])}
                <span class="demo-mini-label">shortest baseline</span>
                ${renderPath(item.shortest_solvable_path || [])}
                <span class="demo-mini-label">count</span>
                ${renderTags([`actual: ${item.actual_tool_count}`, `optimal: ${item.optimal_tool_count}`], 'warn')}
            </article>
        `).join(''));
    };

    const renderFailure = ({ failure }) => {
        const failedStages = Array.isArray(failure.failed_stages) ? failure.failed_stages : [];
        const labelCounts = failure.summary?.label_counts || {};

        setHtml('[data-demo-failure-summary]', `
            <div class="demo-stat-grid demo-stat-grid-compact">
                ${renderStats([
                { icon: 'fas fa-triangle-exclamation', value: formatNumber(failure.summary?.failed_stage_count || failedStages.length), label: '失败阶段' },
                { icon: 'fas fa-tags', value: formatNumber(Object.keys(labelCounts).length), label: '错误标签' },
                { icon: 'fas fa-check-double', value: formatNumber(failure.summary?.labeled_in_scope_count ?? 0), label: '已归因' },
                { icon: 'fas fa-circle-question', value: formatNumber(failure.summary?.unlabeled_count ?? 0), label: '未归因' }
                ])}
            </div>
            <span class="demo-mini-label">label_counts</span>
            ${renderMeters(labelCounts)}
        `);

        setHtml('[data-demo-failure-list]', failedStages.slice(0, 4).map(stage => {
            const calls = stage.agent_trace?.tool_calls_detail || [];
            const missing = stage.evidence?.read_missing_required_fields || [];
            const stateChecks = stage.evidence?.failed_state_checks || [];
            return `
                <article class="demo-stage-card">
                    <h4>Stage ${escapeHtml(stage.stage_id)} · ${escapeHtml(stage.label || stage.error_label || 'UNKNOWN')}</h4>
                    <p>${escapeHtml(stage.rule_reason || '暂无规则说明')}</p>
                    <span class="demo-mini-label">observed_tool_path</span>
                    ${renderPath(stage.observed_tool_path || [])}
                    <span class="demo-mini-label">expected vs actual</span>
                    ${renderTable(['key', 'expected', 'actual'], [
                        ...missing.map(item => [item.key, item.expected, item.actual]),
                        ...stateChecks.map(item => [item.key || item.field || 'state_check', item.expected, item.actual])
                    ])}
                    <span class="demo-mini-label">tool_calls_detail</span>
                    ${renderTable(['tool', 'success', 'result'], calls.map(call => [
                        call.tool_name,
                        call.success === false ? 'false' : 'true',
                        shortText(call.result || call.error || '-', 120)
                    ]))}
                </article>
            `;
        }).join(''));
    };

    Promise.all(Object.entries(dataFiles).map(([key, url]) =>
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`${url} ${response.status}`);
                }
                return response.json();
            })
            .then(data => [key, data])
    ))
        .then(entries => {
            const data = Object.fromEntries(entries);
            renderOverview(data);
            renderSandbox(data);
            renderTask(data);
            renderAgentReplay(data);
            renderPathMining(data);
            renderFailure(data);

            if (status) {
                status.textContent = '演示数据已加载：L4_1006 成功回放 + L4_1124 失败分析。';
                status.classList.add('is-ready');
            }
        })
        .catch(error => {
            if (status) {
                status.textContent = `演示数据读取失败：${error.message}`;
                status.classList.add('is-error');
            }
        });
}

// 页面加载完成后执行
window.addEventListener('DOMContentLoaded', () => {
    highlightCurrentNavItem();
    handleHeaderScroll();
    setupBackToTop();
    setupMobileMenu();
    setupHeroTyping();
    setupProgressBars();
    setupProjectFilters();
    setupEntbenchDemo();
    
    // 监听滚动事件
    window.addEventListener('scroll', handleHeaderScroll);
});
