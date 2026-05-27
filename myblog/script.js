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
        const finalStateChecks = Array.isArray(taskDraft.evaluation_outline?.final_state_checks)
            ? taskDraft.evaluation_outline.final_state_checks
            : [];
        const draftRequiredTools = [...new Set(stages.flatMap(stage => (
            Array.isArray(stage.required_tools) ? stage.required_tools : []
        )))];
        const formatCondition = condition => objectEntries(condition)
            .map(([key, value]) => `${key}=${value}`)
            .join(', ');
        const renderStateChecks = checks => {
            if (!checks.length) {
                return '<p class="demo-empty">task_draft 中暂无 final_state_checks</p>';
            }
            return `
                <ul class="seed-check-list">
                    ${checks.map(check => `
                        <li>
                            <span>${escapeHtml(check.table || '-')}</span>
                            <code>${escapeHtml(formatCondition(check.condition || {}))}</code>
                            <em>count=${escapeHtml(check.expected_count ?? '-')}</em>
                        </li>
                    `).join('')}
                </ul>
            `;
        };
        const seedGraphNodes = [
            { id: 'owner', label: seedFacts.owner_name || '张明', sub: seedFacts.owner_id || 'user002', x: 120, y: 115, type: 'actor' },
            { id: 'requester', label: seedFacts.requester_name || '郑鹏', sub: seedFacts.requester_id || 'user010', x: 120, y: 305, type: 'actor' },
            { id: 'request', label: seedFacts.request_id || 'req000001', sub: 'pending edit request', x: 365, y: 210, type: 'request' },
            { id: 'document', label: seedFacts.document_id || 'doc000021', sub: '接口规范v3.1草案', x: 590, y: 125, type: 'document' },
            { id: 'meeting', label: seedFacts.meeting_id || 'meeting_003', sub: seedFacts.meeting_date || '2026-03-17', x: 590, y: 305, type: 'meeting' },
            { id: 'organizer', label: '孙丽', sub: 'user009 / 市场总监', x: 835, y: 305, type: 'actor' },
            { id: 'target', label: '目标状态', sub: 'approve + verify', x: 835, y: 125, type: 'target' }
        ];
        const seedNodeMap = new Map(seedGraphNodes.map(node => [node.id, node]));
        const seedGraphEdges = [
            { from: 'requester', to: 'request', label: '申请 edit 权限' },
            { from: 'request', to: 'document', label: '关联文档' },
            { from: 'owner', to: 'document', label: '文档 owner' },
            { from: 'organizer', to: 'meeting', label: '组织会议' },
            { from: 'meeting', to: 'document', label: '会议上下文' },
            { from: 'owner', to: 'target', label: '执行审批' },
            { from: 'document', to: 'target', label: '权限状态更新' }
        ];
        const renderSeedEdge = edge => {
            const from = seedNodeMap.get(edge.from);
            const to = seedNodeMap.get(edge.to);
            if (!from || !to) {
                return '';
            }
            const midX = (from.x + to.x) / 2;
            const midY = (from.y + to.y) / 2;
            return `
                <g class="seed-edge-group">
                    <line class="seed-graph-edge" x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}" marker-end="url(#seed-arrow)"></line>
                    <text class="seed-edge-label" x="${midX}" y="${midY - 8}">${escapeHtml(edge.label)}</text>
                </g>
            `;
        };
        const renderSeedNode = node => `
            <g class="seed-node ${escapeHtml(node.type)}">
                <rect x="${node.x - 78}" y="${node.y - 38}" width="156" height="76"></rect>
                <text class="seed-node-label" x="${node.x}" y="${node.y - 5}">${escapeHtml(node.label)}</text>
                <text class="seed-node-sub" x="${node.x}" y="${node.y + 19}">${escapeHtml(node.sub)}</text>
            </g>
        `;

        setHtml('[data-demo-seed-graph]', `
            <div class="seed-generation-flow">
                <span>业务 motif</span>
                <i class="fas fa-arrow-right"></i>
                <span>Seed 数据子图</span>
                <i class="fas fa-arrow-right"></i>
                <span>约束工具集</span>
                <i class="fas fa-arrow-right"></i>
                <span>Task Draft</span>
                <i class="fas fa-arrow-right"></i>
                <span>可解性门控</span>
            </div>
            <div class="seed-graph-layout">
                <div class="seed-graph-board">
                    <div class="seed-graph-title">
                        <i class="fas fa-share-nodes"></i>
                        <span>L4_CROSS_DOMAIN / 文档权限审批 + 会议跟进</span>
                    </div>
                    <div class="seed-graph-wrap">
                        <svg class="seed-graph-svg" viewBox="0 0 960 430" role="img" aria-label="L4_1006 seed 数据子图">
                            <defs>
                                <marker id="seed-arrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto" markerUnits="userSpaceOnUse">
                                    <path d="M0,0 L10,5 L0,10 Z" class="seed-arrow"></path>
                                </marker>
                            </defs>
                            <g class="seed-graph-edges">
                                ${seedGraphEdges.map(renderSeedEdge).join('')}
                            </g>
                            <g class="seed-graph-nodes">
                                ${seedGraphNodes.map(renderSeedNode).join('')}
                            </g>
                        </svg>
                    </div>
                    <div class="seed-motif-card">
                        <strong>业务 motif：跨域权限审批协调</strong>
                        <p>这个 motif 从一个待处理的文档权限请求出发，把“谁申请、申请哪份文档、谁有审批权”和“近期会议/房间预订上下文”连成 seed 子图。生成任务时，草稿不会只问单点查询，而是要求 Agent 先读权限请求和用户关系，再结合会议记录做审批判断，最后验证 PermissionRequest、DocumentPermission 和 RoomBooking 三类状态是否一致。</p>
                    </div>
                    <div class="seed-graph-legend">
                        <span><i class="seed-legend actor"></i> Actor</span>
                        <span><i class="seed-legend request"></i> Request</span>
                        <span><i class="seed-legend document"></i> Document</span>
                        <span><i class="seed-legend meeting"></i> Meeting</span>
                        <span><i class="seed-legend target"></i> Target</span>
                    </div>
                </div>
                <div class="seed-state-panel">
                    <div>
                        <strong>目标状态检查</strong>
                        ${renderStateChecks(finalStateChecks)}
                    </div>
                    <div>
                        <strong>草稿 required_tools</strong>
                        ${renderTags(draftRequiredTools, 'warn')}
                    </div>
                </div>
            </div>
        `);

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
        const graphNodes = [
            { id: 1, name: centerTool, x: 410, y: 215, type: 'seed', shape: 'circle', top: true },
            { id: 2, name: observedPath[1] || 'get_document', x: 560, y: 170, type: 'gold', shape: 'square', top: true },
            { id: 3, name: observedPath[2] || 'query_users', x: 690, y: 250, type: 'gold', shape: 'square', top: true },
            { id: 4, name: 'approve_permission_request', x: 520, y: 325, type: 'gold', shape: 'square', top: true },
            { id: 5, name: 'list_document_permissions', x: 330, y: 330, type: 'gold', shape: 'square', top: true },
            { id: 6, name: 'check_room_availability', x: 785, y: 150, type: 'other', shape: 'circle', top: true },
            { id: 7, name: 'list_meetings', x: 845, y: 300, type: 'seed', shape: 'circle', top: true },
            { id: 8, name: 'get_meeting', x: 680, y: 375, type: 'other', shape: 'circle', top: true },
            { id: 9, name: 'query_documents', x: 215, y: 225, type: 'other', shape: 'circle', top: true },
            { id: 10, name: 'request_document_permission', x: 175, y: 385, type: 'other', shape: 'circle' },
            { id: 11, name: 'check_document_permission', x: 135, y: 135, type: 'other', shape: 'circle' },
            { id: 12, name: 'get_current_time', x: 535, y: 80, type: 'other', shape: 'circle' },
            { id: 13, name: 'list_bookings', x: 900, y: 220, type: 'other', shape: 'circle' },
            { id: 14, name: 'query_employees', x: 650, y: 105, type: 'seed', shape: 'circle', top: true },
            { id: 15, name: 'create_reminder', x: 790, y: 430, type: 'other', shape: 'circle' },
            { id: 16, name: 'get_project', x: 330, y: 90, type: 'other', shape: 'circle' },
            { id: 17, name: 'list_user_tasks', x: 90, y: 300, type: 'other', shape: 'circle' },
            { id: 18, name: 'update_task_status', x: 925, y: 90, type: 'other', shape: 'circle' }
        ];
        const graphEdges = [
            { from: 11, to: 9 }, { from: 9, to: 1 }, { from: 16, to: 1 },
            { from: 16, to: 12 }, { from: 12, to: 14 }, { from: 14, to: 2 },
            { from: 14, to: 3 }, { from: 1, to: 5 }, { from: 5, to: 4 },
            { from: 4, to: 3 }, { from: 3, to: 8 }, { from: 8, to: 7 },
            { from: 7, to: 13 }, { from: 13, to: 6 }, { from: 7, to: 15 },
            { from: 17, to: 10 }, { from: 10, to: 5 }, { from: 9, to: 2 },
            { from: 2, to: 12 }, { from: 5, to: 11 }, { from: 4, to: 6 },
            { from: 18, to: 13 },
            { from: 1, to: 2, kind: 'strong' },
            { from: 2, to: 3, kind: 'strong' },
            { from: 1, to: 5, kind: 'spread' },
            { from: 5, to: 4, kind: 'spread' }
        ];
        const nodesById = new Map(graphNodes.map(node => [node.id, node]));
        const renderGraphEdge = edge => {
            const from = nodesById.get(edge.from);
            const to = nodesById.get(edge.to);
            if (!from || !to) {
                return '';
            }
            const marker = edge.kind === 'strong' ? 'ppr-arrow-strong' : 'ppr-arrow-thin';
            return `
                <line
                    class="ppr-svg-edge ${edge.kind === 'strong' ? 'is-strong' : edge.kind === 'spread' ? 'is-spread' : ''}"
                    x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}"
                    marker-end="url(#${marker})"
                />
            `;
        };
        const renderGraphNode = node => {
            const shape = node.shape === 'square'
                ? `<rect class="ppr-svg-node ${node.type} ${node.top ? 'is-top' : ''}" x="${node.x - 25}" y="${node.y - 25}" width="50" height="50"></rect>`
                : `<circle class="ppr-svg-node ${node.type} ${node.top ? 'is-top' : ''}" cx="${node.x}" cy="${node.y}" r="25"></circle>`;
            return `
                <g class="ppr-svg-node-group">
                    ${shape}
                    <text class="ppr-svg-label" x="${node.x}" y="${node.y + 6}">${node.id}</text>
                </g>
            `;
        };

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
                        <span>PPR 工具图传播结果</span>
                    </div>
                    <div class="ppr-network-wrap">
                        <svg class="ppr-network-svg" viewBox="0 0 1000 520" role="img" aria-label="PPR 工具图传播示意">
                            <defs>
                                <marker id="ppr-arrow-thin" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto" markerUnits="userSpaceOnUse">
                                    <path d="M0,0 L10,5 L0,10 Z" class="ppr-arrow-thin"></path>
                                </marker>
                                <marker id="ppr-arrow-strong" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto" markerUnits="userSpaceOnUse">
                                    <path d="M0,0 L11,5.5 L0,11 Z" class="ppr-arrow-strong"></path>
                                </marker>
                            </defs>
                            <g class="ppr-svg-edges">
                                ${graphEdges.filter(edge => !edge.kind).map(renderGraphEdge).join('')}
                                ${graphEdges.filter(edge => edge.kind === 'spread').map(renderGraphEdge).join('')}
                                ${graphEdges.filter(edge => edge.kind === 'strong').map(renderGraphEdge).join('')}
                            </g>
                            <g class="ppr-svg-nodes">
                                ${graphNodes.map(renderGraphNode).join('')}
                            </g>
                        </svg>
                    </div>
                    <div class="ppr-legend">
                        <span><i class="legend-box seed"></i> Seed</span>
                        <span><i class="legend-box hit"></i> Gold / 候选链</span>
                        <span><i class="legend-box bridge"></i> Other</span>
                        <span><i class="legend-line strong"></i> PPR 命中路径</span>
                        <span><i class="legend-line thin"></i> 扩散候选边</span>
                    </div>
                    <div class="ppr-tool-map">
                        ${graphNodes.slice(0, 10).map(node => `
                            <span><b>${node.id}</b>${escapeHtml(node.name)}</span>
                        `).join('')}
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

    };

    const renderFailure = ({ failure }) => {
        const failedStages = Array.isArray(failure.failed_stages) ? failure.failed_stages : [];

        setHtml('[data-demo-failure-list]', failedStages.slice(0, 4).map(stage => {
            const calls = stage.agent_trace?.tool_calls_detail || [];
            const missing = stage.evidence?.read_missing_required_fields || [];
            const stateChecks = stage.evidence?.failed_state_checks || [];
            return `
                <article class="demo-stage-card">
                    <h4>Stage ${escapeHtml(stage.stage_id)} · 失败证据</h4>
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
