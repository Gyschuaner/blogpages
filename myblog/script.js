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

    const renderPprSearch = ({ pathMining }) => {
        const mining = pathMining.path_mining || {};
        const stageBank = mining.stage_path_bank || {};
        const comparisons = Array.isArray(pathMining.current_run_path_comparison)
            ? pathMining.current_run_path_comparison
            : [];
        const firstComparison = comparisons[0] || {};
        const firstStagePaths = Array.isArray(stageBank['1']) ? stageBank['1'] : [];
        const firstBankPath = firstStagePaths[0]?.path || [];
        const observedPath = firstComparison.observed_tool_path || firstBankPath;
        const centerTool = observedPath[0] || 'list_permission_requests';
        const pprTools = [
            centerTool,
            ...observedPath.slice(1),
            'approve_permission_request',
            'list_document_permissions',
            'check_room_availability'
        ].filter((tool, index, list) => tool && list.indexOf(tool) === index).slice(0, 7);

        setHtml('[data-demo-ppr-diagram]', `
            <div class="ppr-diagram">
                <div class="ppr-flow">
                    <article class="ppr-step-card">
                        <span class="ppr-step-icon"><i class="fas fa-comment-dots"></i></span>
                        <h3>用户请求 + Seed</h3>
                        <p>从任务 seed 和当前 stage 中抽出实体、目标状态、候选业务域。</p>
                    </article>
                    <span class="ppr-flow-arrow">→</span>
                    <article class="ppr-step-card">
                        <span class="ppr-step-icon"><i class="fas fa-magnifying-glass"></i></span>
                        <h3>语义召回</h3>
                        <p>先找最像当前意图的种子工具，不把 107 个工具一次性丢给 Agent。</p>
                    </article>
                    <span class="ppr-flow-arrow">→</span>
                    <article class="ppr-step-card ppr-step-card-strong">
                        <span class="ppr-step-icon"><i class="fas fa-share-nodes"></i></span>
                        <h3>PPR 传播</h3>
                        <p>在历史工具调用图上扩散，把前置、后续、跨域桥接工具一起带出来。</p>
                    </article>
                    <span class="ppr-flow-arrow">→</span>
                    <article class="ppr-step-card">
                        <span class="ppr-step-icon"><i class="fas fa-list-check"></i></span>
                        <h3>约束重排</h3>
                        <p>结合 required tools、forbidden tools、业务域和历史路径，形成候选工具链。</p>
                    </article>
                </div>

                <div class="ppr-graph-board">
                    <div class="ppr-graph-title">
                        <i class="fas fa-project-diagram"></i>
                        <span>工具图上的传播示意</span>
                    </div>
                    <div class="ppr-graph">
                        ${pprTools.map((tool, index) => `
                            <span class="ppr-node ${index === 0 ? 'is-seed' : ''} ${observedPath.includes(tool) ? 'is-hit' : ''}">
                                ${escapeHtml(tool)}
                            </span>
                        `).join('')}
                    </div>
                    <div class="ppr-legend">
                        <span><i class="legend-box seed"></i> 语义召回种子</span>
                        <span><i class="legend-box hit"></i> PPR 后进入候选链</span>
                        <span><i class="legend-box bridge"></i> 跨域桥接候选</span>
                    </div>
                </div>
            </div>
        `);

        setHtml('[data-demo-ppr-sample]', `
            <article class="demo-stage-card">
                <h4>Stage ${escapeHtml(firstComparison.stage_id || 1)} · L4_1006 权限请求读取</h4>
                <span class="demo-mini-label">observed path</span>
                ${renderPath(observedPath)}
                <span class="demo-mini-label">shortest baseline</span>
                ${renderPath(firstComparison.shortest_solvable_path || observedPath)}
                <span class="demo-mini-label">efficiency</span>
                ${renderTags([
                    `score: ${formatMetric(firstComparison.path_efficiency_score ?? 1)}`,
                    `actual: ${firstComparison.actual_tool_count ?? observedPath.length}`,
                    `optimal: ${firstComparison.optimal_tool_count ?? observedPath.length}`
                ], 'warn')}
            </article>
        `);

        setHtml('[data-demo-ppr-notes]', `
            ${renderKeyValues({
                历史窗口: mining.history_window,
                路径库: `${objectEntries(stageBank).length} stages`,
                最短基线: `${objectEntries(mining.shortest_baseline || {}).length} stages`,
                当前对比: `${comparisons.length} stages`
            })}
            <span class="demo-mini-label">为什么不用纯语义搜索</span>
            ${renderTags([
                '语义相似只能找到当前意图附近的工具',
                'PPR 会把历史上常一起出现的前置和后续工具带出来',
                '再用任务规则过滤删除、撤销等危险或无关工具'
            ])}
        `);
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
            renderTask(data);
            renderAgentReplay(data);
            renderPprSearch(data);
            renderFailure(data);

            if (status) {
                status.textContent = '演示数据已加载：L4_1006 成功回放 + PPR 工具搜索 + L4_1124 失败分析。';
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
