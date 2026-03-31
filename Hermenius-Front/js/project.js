document.addEventListener('DOMContentLoaded', function () {
    HermeniusThemes.init();
    HermeniusI18n.init();

    checkProjectAuth();

    initThemePanel();
    initExportButtons();
    initFooterButtons();
    initLangToggle();

    const analysisData = HermeniusAPI.loadAnalysisResult();

    if (!analysisData) {
        console.log('Hermenius: Нет данных от API, загружаю демо-режим');
        const demoData = generateDemoData();
        renderPage(demoData);
        showDemoBanner();
    } else {
        renderPage(analysisData);
    }

    setTimeout(() => initDashboardDragResize(), 300);

    document.addEventListener('themeChanged', updateAllPlotlyThemes);

    console.log('Hermenius: Project module loaded');
});

window._currentAnalysisData = null;
window._currentFocusedPlotId = null;
window._isResizing = false;
window._plotRawData = {};

function generateDemoData() {
    return {
        file_info: { file_name: 'demo_iris.csv', total_rows: 30, total_columns: 5, columns: ['sepal_length','sepal_width','petal_length','petal_width','species'] },
        processing_time_sec: 0.42,
        key_metrics: [
            { label: 'Строк', value: '30', color: 'primary' },
            { label: 'Колонок', value: '5', color: 'info' },
            { label: 'Числовых', value: '4', color: 'success' },
            { label: 'Категорийных', value: '1', color: 'warning' }
        ],
        ai_insights: [
            'Набор данных Iris содержит 3 вида ириса: setosa, versicolor, virginica.',
            'Petal length — лучший предиктор для классификации (минимальное перекрытие между классами).',
            'Sepal width имеет наибольший разброс внутри классов — менее информативен.',
            'Виды setosa хорошо отделимы по всем признакам, versicolor и virginica частично перекрываются.',
            'Максимальная корреляция (0.96) наблюдается между petal_length и petal_width.'
        ],
        plots: [
            { type: 'scatter', title: 'Petal Length vs Petal Width', reason: 'Наиболее информативная пара признаков', data: { datasets: [{ label: 'petal_length / petal_width', data: [{x:1.4,y:0.2},{x:1.4,y:0.2},{x:1.3,y:0.2},{x:1.5,y:0.2},{x:1.4,y:0.2},{x:1.7,y:0.4},{x:1.4,y:0.3},{x:1.5,y:0.2},{x:1.4,y:0.2},{x:1.5,y:0.1},{x:4.7,y:1.4},{x:4.5,y:1.5},{x:4.9,y:1.5},{x:4.0,y:1.3},{x:4.6,y:1.5},{x:4.5,y:1.3},{x:3.3,y:1.0},{x:4.6,y:1.3},{x:3.9,y:1.4},{x:6.0,y:2.5},{x:5.1,y:1.9},{x:5.9,y:2.1},{x:5.6,y:1.8},{x:5.8,y:2.2},{x:6.6,y:2.1},{x:4.5,y:1.7},{x:6.3,y:1.8},{x:5.8,y:1.8},{x:6.1,y:2.5}] }] } },
            { type: 'bar', title: 'Распределение Sepal Length', reason: 'Форма распределения и моды', data: { labels: ['4.3','4.6','4.9','5.1','5.4','5.7','6.0','6.3','6.6','6.9','7.2','7.6'], datasets: [{ label: 'sepal_length', data: [1,3,5,6,4,4,3,2,1,0,1,0] }] } },
            { type: 'pie', title: 'Распределение видов Iris', reason: 'Баланс классов', data: { labels: ['setosa','versicolor','virginica'], values: [10,10,10] } },
            { type: 'heatmap', title: 'Корреляционная матрица', reason: 'Линейные зависимости между признаками', data: { labels: ['sepal_length','sepal_width','petal_length','petal_width'], matrix: [[1.0,-0.42,0.87,0.82],[-0.42,1.0,-0.37,-0.34],[0.87,-0.37,1.0,0.96],[0.82,-0.34,0.96,1.0]] } },
            { type: 'boxplot', title: 'Petal Length по видам', reason: 'Сравнение разброса между классами', data: { labels: ['setosa','versicolor','virginica'], datasets: [{ min:1.0,q1:1.4,median:1.5,q3:1.6,max:1.9 },{ min:3.0,q1:4.0,median:4.35,q3:4.6,max:5.1 },{ min:4.5,q1:5.1,median:5.55,q3:6.1,max:6.9 }] } },
            { type: 'violin', title: 'Плотность Sepal Width по видам', reason: 'Распределение внутри каждого класса', data: { labels: ['setosa','versicolor','virginica'], datasets: [[3.5,3.0,3.2,3.1,3.6,3.9,3.4,3.4,2.9,3.1],[3.2,3.2,3.1,2.3,2.8,2.8,3.3,2.4,2.9,2.7],[3.3,2.7,3.0,2.9,3.0,3.0,2.5,2.9,2.5,3.6]] } }
        ]
    };
}

function showDemoBanner() {
    const banner = document.createElement('div');
    banner.id = 'demoBanner';
    banner.style.cssText = 'position:fixed;top:70px;left:50%;transform:translateX(-50%);z-index:200;padding:0.6rem 1.5rem;border-radius:9999px;background:rgba(245,158,11,0.95);color:#1a1a1a;font-size:0.85rem;font-weight:600;backdrop-filter:blur(8px);box-shadow:0 4px 20px rgba(0,0,0,0.2);display:flex;align-items:center;gap:0.5rem;';
    banner.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg> Демо-режим: данные загружены локально';
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    closeBtn.style.cssText = 'background:none;border:none;color:#1a1a1a;font-size:1.2rem;cursor:pointer;padding:0 0.25rem;margin-left:0.5rem;';
    closeBtn.onclick = () => banner.remove();
    banner.appendChild(closeBtn);
    document.body.appendChild(banner);
    setTimeout(() => { if (banner.parentNode) banner.remove(); }, 8000);
}

function renderPage(data) {
    window._currentAnalysisData = data;
    const params = new URLSearchParams(window.location.search);
    const datasetName = params.get('dataset') || data.file_info.file_name || 'Анализ данных';
    document.getElementById('projectTitle').textContent = datasetName;
    document.title = 'Hermenius — ' + datasetName;
    renderMetrics(data.key_metrics);
    renderPlots(data.plots);
    renderInsights(data.ai_insights);
    renderFileInfo(data);
    const hint = document.getElementById('gridHint');
    if (hint) hint.style.display = (data.plots && data.plots.length > 0) ? '' : 'none';
}

function renderMetrics(metrics) {
    const bar = document.getElementById('metricsBar');
    if (!bar || !metrics || metrics.length === 0) return;
    bar.style.display = '';
    bar.innerHTML = '';
    const colorMap = { 'primary': 'var(--accent-primary)', 'success': 'var(--accent-success)', 'warning': 'var(--accent-warning)', 'danger': 'var(--accent-danger)', 'info': '#06b6d4' };
    metrics.forEach(m => {
        const c = document.createElement('div');
        c.className = 'metric-card';
        c.innerHTML = '<div class="metric-card-value" style="color:' + (colorMap[m.color] || 'var(--accent-primary)') + '">' + m.value + '</div><div class="metric-card-label">' + m.label + '</div>';
        bar.appendChild(c);
    });
}

function renderPlots(plots) {
    const grid = document.getElementById('dashboardGrid');
    if (!grid) return;
    grid.innerHTML = '';
    if (!plots || plots.length === 0) {
        grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1;"><p style="color:var(--text-secondary);">' + HermeniusI18n.t('no_data') + '</p><p style="margin-top:0.5rem;"><a href="profile.html" style="color:var(--accent-primary);">' + HermeniusI18n.t('go_back') + '</a></p></div>';
        return;
    }
    const plotlyConfig = HermeniusThemes.getPlotlyConfig();
    plots.forEach((plot, index) => {
        let colSpan = 1, rowSpan = 2;
        if (plot.type === 'heatmap' || plot.type === 'scatter' || plot.type === 'line' || plot.type === 'violin') { colSpan = 2; rowSpan = 3; }
        else if (plot.type === 'pie' || plot.type === 'boxplot') { colSpan = 1; rowSpan = 3; }

        const plotId = 'plot-' + index;
        const card = document.createElement('div');
        card.className = 'dash-card';
        card.dataset.plotIndex = index;
        card.dataset.plotId = plotId;
        card.style.gridColumn = 'span ' + colSpan;
        card.style.gridRow = 'span ' + rowSpan;
        card.setAttribute('draggable', 'true');

        const header = document.createElement('div');
        header.className = 'dash-card-header';
        header.innerHTML = '<div class="dash-card-drag-handle" title="Перетащите"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"></line><line x1="6" y1="3" x2="6" y2="15"></line><line x1="3" y1="12" x2="21" y2="12"></line></svg></div>' +
            '<div style="flex:1;min-width:0;"><h3 class="dash-card-title">' + (plot.title || 'График') + '</h3>' + (plot.reason ? '<div class="dash-card-reason">' + plot.reason + '</div>' : '') + '</div>' +
            '<div class="dash-card-actions"><button class="dash-btn download-btn" data-plot-id="' + plotId + '" title="Скачать PNG"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg></button></div>';

        let bodyHTML = '';
        if (plot.type === 'boxplot') { bodyHTML = renderBoxplotTable(plot); }
        else { bodyHTML = '<div id="' + plotId + '" style="width:100%;height:100%;min-height:200px;"></div>'; }

        const body = document.createElement('div');
        body.className = 'dash-card-body';
        body.innerHTML = bodyHTML;

        const resizeHandle = document.createElement('div');
        resizeHandle.className = 'dash-resize-handle';
        resizeHandle.setAttribute('draggable', 'false');

        card.appendChild(header);
        card.appendChild(body);
        card.appendChild(resizeHandle);
        grid.appendChild(card);

        card.addEventListener('click', (e) => {
            if (e.target.closest('.dash-btn') || e.target.closest('.dash-resize-handle') || e.target.closest('.dash-card-drag-handle')) return;
            // Убираем .focused со всех карточек
            document.querySelectorAll('.dash-card.focused').forEach(c => c.classList.remove('focused'));
            card.classList.add('focused');
            window._currentFocusedPlotId = plotId;
        });

        const dlBtn = card.querySelector('.download-btn');
        if (dlBtn) {
            dlBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (plot.type === 'boxplot') {
                    var tableEl = card.querySelector('.box-table');
                    var safeName = (plot.title || 'table').replace(/[^a-zA-Zа-яА-ЯёЁ0-9\-_ ]/g, '').trim().replace(/\s+/g, '-').substring(0, 50);
                    if (tableEl) HermeniusExport.exportTableExcel(tableEl, safeName);
                } else {
                    downloadCardPNG(plotId, plot.title);
                }
            });
        }

        if (plot.type !== 'boxplot') {
            setTimeout(() => {
                try { renderSinglePlot(plotId, plot, plotlyConfig); } catch (err) {
                    console.error('Ошибка рендера:', err);
                    const div = document.getElementById(plotId);
                    if (div) div.innerHTML = '<p style="color:var(--accent-danger);padding:1rem;">Ошибка: ' + err.message + '</p>';
                }
            }, 200 + index * 60);
        }
    });
}

function renderSinglePlot(divId, plot, plotlyConfig) {
    const plotDiv = document.getElementById(divId);
    if (!plotDiv) return;
    if (typeof Plotly === 'undefined') { plotDiv.innerHTML = '<p style="color:var(--accent-danger);padding:1rem;">Plotly.js не загружен</p>'; return; }

    const baseLayout = {
        paper_bgcolor: plotlyConfig.paper_bgcolor, plot_bgcolor: plotlyConfig.plot_bgcolor,
        font: { color: plotlyConfig.font_color, family: 'Space Grotesk, sans-serif', size: 12 },
        margin: { t: 30, b: 40, l: 50, r: 30 }, autosize: true,
        xaxis: { gridcolor: plotlyConfig.grid_color, zerolinecolor: plotlyConfig.grid_color },
        yaxis: { gridcolor: plotlyConfig.grid_color, zerolinecolor: plotlyConfig.grid_color }
    };
    let traces = [];
    let layout = JSON.parse(JSON.stringify(baseLayout));
    const colors = plotlyConfig.trace_colors;

    switch (plot.type) {
        case 'scatter': {
            const ds = plot.data.datasets;
            if (ds && ds[0] && ds[0].data) traces.push({ x: ds[0].data.map(p => p.x), y: ds[0].data.map(p => p.y), mode: 'markers', type: 'scatter', name: ds[0].label || '', marker: { size: 8, opacity: 0.7, color: colors[0] } });
            break;
        }
        case 'line': {
            const ds = plot.data.datasets;
            if (ds && ds[0] && ds[0].data && plot.data.labels) traces.push({ x: plot.data.labels, y: ds[0].data, type: 'scatter', mode: 'lines+markers', name: ds[0].label || '', line: { color: colors[0], width: 2.5 }, marker: { size: 6, color: colors[0] } });
            break;
        }
        case 'bar': {
            const ds = plot.data.datasets;
            if (ds && ds[0] && ds[0].data && plot.data.labels) traces.push({ x: plot.data.labels, y: ds[0].data, type: 'bar', name: ds[0].label || '', marker: { color: colors[0], opacity: 0.85 }, width: 0.7 });
            break;
        }
        case 'pie': {
            if (plot.data.labels && plot.data.values) {
                traces.push({ labels: plot.data.labels, values: plot.data.values, type: 'pie', hole: 0.45, textinfo: 'percent+label', insidetextorientation: 'radial', marker: { colors: colors } });
                layout.showlegend = true; layout.legend = { font: { color: plotlyConfig.font_color } };
                delete layout.xaxis; delete layout.yaxis;
            }
            break;
        }
        case 'heatmap': {
            if (plot.data.matrix && plot.data.labels) {
                traces.push({ z: plot.data.matrix, x: plot.data.labels, y: plot.data.labels, type: 'heatmap', colorscale: plotlyConfig.colorscale_heatmap, showscale: true, colorbar: { tickfont: { color: plotlyConfig.font_color } } });
                layout.margin = { t: 30, b: 100, l: 100, r: 60 };
                layout.xaxis = { ...layout.xaxis, tickangle: -45 };
            }
            break;
        }
        case 'violin': {
            if (plot.data.datasets && plot.data.labels) {
                plot.data.datasets.forEach((vals, i) => {
                    if (Array.isArray(vals) && vals.length > 0) traces.push({ type: 'violin', y: vals, name: plot.data.labels[i], box: { visible: true }, meanline: { visible: true }, marker: { color: colors[i % colors.length] } });
                });
                if (traces.length > 0) layout.violinmode = 'group';
            }
            break;
        }
        default: return;
    }

    if (traces.length > 0) {
        try {
            window._plotRawData[divId] = {
                data: JSON.parse(JSON.stringify(traces)),
                layout: JSON.parse(JSON.stringify(layout))
            };
        } catch(e) {
            console.warn('Не удалось сохранить данные для экспорта:', e);
        }

        Plotly.newPlot(plotDiv, traces, layout, { responsive: true, displayModeBar: false });
    }
}

function renderBoxplotTable(plot) {
    let h = '<table class="box-table" id="table-' + plot.title.replace(/[^a-zA-Zа-яА-ЯёЁ0-9\-_ ]/g, '').substring(0,40) + '"><thead><tr><th>Группа</th><th>Min</th><th>Q1</th><th>Медиана</th><th>Q3</th><th>Max</th></tr></thead><tbody>';
    if (plot.data.datasets && plot.data.labels) {
        plot.data.datasets.forEach((s, i) => {
            if (s.min !== undefined) h += '<tr><td style="font-weight:600">' + plot.data.labels[i] + '</td><td>' + s.min.toFixed(2) + '</td><td>' + s.q1.toFixed(2) + '</td><td style="font-weight:700;color:var(--accent-primary)">' + s.median.toFixed(2) + '</td><td>' + s.q3.toFixed(2) + '</td><td>' + s.max.toFixed(2) + '</td></tr>';
        });
    }
    return h + '</tbody></table>';
}

function updateAllPlotlyThemes(e) {
    const plotlyConfig = e && e.detail && e.detail.plotly ? e.detail.plotly : HermeniusThemes.getPlotlyConfig();
    const colors = plotlyConfig.trace_colors;
    const updateLayout = {
        paper_bgcolor: plotlyConfig.paper_bgcolor,
        plot_bgcolor: plotlyConfig.plot_bgcolor,
        font: { color: plotlyConfig.font_color, family: 'Space Grotesk, sans-serif', size: 12 },
        xaxis: { gridcolor: plotlyConfig.grid_color, zerolinecolor: plotlyConfig.grid_color },
        yaxis: { gridcolor: plotlyConfig.grid_color, zerolinecolor: plotlyConfig.grid_color }
    };
    document.querySelectorAll('.dash-card-body [id^="plot-"]').forEach(plotEl => {
        if (plotEl.data && plotEl.layout) {
            Plotly.relayout(plotEl, updateLayout);

            plotEl.data.forEach((trace, i) => {
                if (trace.type === 'scatter' && trace.mode === 'markers') {
                    Plotly.restyle(plotEl, { 'marker.color': colors[0] }, i);
                } else if (trace.type === 'scatter' && trace.mode === 'lines+markers') {
                    Plotly.restyle(plotEl, { 'line.color': colors[0], 'marker.color': colors[0] }, i);
                } else if (trace.type === 'bar') {
                    Plotly.restyle(plotEl, { 'marker.color': colors[0] }, i);
                } else if (trace.type === 'pie') {
                    Plotly.restyle(plotEl, { 'marker.colors': colors }, i);
                } else if (trace.type === 'violin') {
                    Plotly.restyle(plotEl, { 'marker.color': colors[i % colors.length] }, i);
                } else if (trace.type === 'heatmap') {
                    Plotly.restyle(plotEl, { 'colorscale': plotlyConfig.colorscale_heatmap }, i);
                }
            });
        }
    });

    const plotDivs = document.querySelectorAll('.dash-card-body [id^="plot-"]');
    plotDivs.forEach(plotEl => {
        const raw = window._plotRawData[plotEl.id];
        if (raw && raw.data) {
            raw.data.forEach((trace, i) => {
                if (trace.type === 'pie') {
                    if (trace.marker) trace.marker.colors = [...colors];
                } else if (trace.type === 'heatmap') {
                    trace.colorscale = plotlyConfig.colorscale_heatmap;
                } else if (trace.marker) {
                    trace.marker.color = colors[trace.type === 'violin' ? i % colors.length : 0];
                }
                if (trace.line) trace.line.color = colors[0];
            });
        }
    });
}

function renderInsights(insights) {
    const section = document.getElementById('insightsSection');
    const list = document.getElementById('insightsList');
    if (!section || !list) return;
    if (!insights || insights.length === 0) { section.style.display = 'none'; return; }
    section.style.display = '';
    list.innerHTML = '';
    insights.forEach((ins, i) => {
        const item = document.createElement('div');
        item.className = 'insight-item';
        item.innerHTML = '<span class="insight-number">' + (i + 1) + '</span><span>' + ins + '</span>';
        list.appendChild(item);
    });
}

function renderFileInfo(data) {
    const bar = document.getElementById('fileInfoBar');
    if (!bar || !data || !data.file_info) return;
    bar.style.display = 'flex';
    document.getElementById('fileInfoName').textContent = data.file_info.file_name || '—';
    document.getElementById('fileInfoRows').textContent = (data.file_info.total_rows || '—') + ' строк';
    document.getElementById('fileInfoTime').textContent = (data.processing_time_sec || 0) + ' сек';
}

function initDashboardDragResize() {
    const grid = document.getElementById('dashboardGrid');
    if (!grid) return;

    const MAX_COL_SPAN = 3;
    const MIN_COL_SPAN = 1;
    const MAX_ROW_SPAN = 5;
    const MIN_ROW_SPAN = 2;

    const placeholder = document.createElement('div');
    placeholder.className = 'drag-placeholder';

    let dragSrcEl = null;
    let dragStarted = false;

    grid.addEventListener('dragstart', (e) => {
        if (window._isResizing) { e.preventDefault(); return; }

        const card = e.target.closest('.dash-card');
        if (!card) { e.preventDefault(); return; }

        const handle = e.target.closest('.dash-resize-handle');
        if (handle) { e.preventDefault(); return; }

        dragSrcEl = card;
        dragStarted = false;

        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', '');

        placeholder.style.gridColumn = card.style.gridColumn;
        placeholder.style.gridRow = card.style.gridRow;

        requestAnimationFrame(() => {
            card.style.display = 'none';
            grid.insertBefore(placeholder, card);
            dragStarted = true;
        });
    });

    grid.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (!dragStarted || !placeholder.parentNode) return;

        const target = e.target.closest('.dash-card');
        if (!target || target === dragSrcEl) {
            grid.appendChild(placeholder);
            return;
        }

        const rect = target.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;

        if (e.clientY < midY) {
            grid.insertBefore(placeholder, target);
        } else {
            if (target.nextSibling) {
                grid.insertBefore(placeholder, target.nextSibling);
            } else {
                grid.appendChild(placeholder);
            }
        }
    });

    grid.addEventListener('dragend', () => {
        if (!dragSrcEl) return;

        if (dragSrcEl.style.display === 'none') {
            dragSrcEl.style.display = '';
            if (placeholder.parentNode) {
                grid.insertBefore(dragSrcEl, placeholder);
                placeholder.remove();
            }
        }

        dragSrcEl.classList.remove('dragging');
        dragSrcEl = null;
        dragStarted = false;
        window._isResizing = false;
    });

    grid.addEventListener('drop', (e) => {
        e.preventDefault();
        if (!dragSrcEl || !placeholder.parentNode) return;

        dragSrcEl.style.display = '';
        dragSrcEl.classList.remove('dragging');
        grid.insertBefore(dragSrcEl, placeholder);
        placeholder.remove();

        const plotEl = dragSrcEl.querySelector('[id^="plot-"]');
        if (plotEl && plotEl.data) {
            setTimeout(() => { try { Plotly.Plots.resize(plotEl); } catch(e) {} }, 80);
        }

        dragSrcEl = null;
        dragStarted = false;
    });

    grid.querySelectorAll('.dash-resize-handle').forEach(handle => {
        handle.addEventListener('mousedown', startResize);
        // Touch support
        handle.addEventListener('touchstart', startResizeTouch, { passive: false });
    });

    function startResize(e) {
        e.preventDefault();
        e.stopPropagation();
        window._isResizing = true;

        const handle = e.currentTarget;
        const card = handle.closest('.dash-card');
        if (!card) return;

        const currentColSpan = parseGridSpan(card.style.gridColumn, 1);
        const currentRowSpan = parseGridSpan(card.style.gridRow, 2);

        const gridStyle = getComputedStyle(grid);
        const gap = parseFloat(gridStyle.gap) || 16;
        const rowH = parseFloat(gridStyle.gridAutoRows) || 120;
        const cols = getGridColumns();

        const startW = card.offsetWidth;
        const startH = card.offsetHeight;
        const startX = e.clientX;
        const startY = e.clientY;

        const gridRect = grid.getBoundingClientRect();
        const colW = (gridRect.width - gap * (cols - 1)) / cols;

        card.classList.add('resizing');
        showSizeTooltip(card, currentColSpan, currentRowSpan);

        function onMove(ev) {
            const dx = ev.clientX - startX;
            const dy = ev.clientY - startY;

            let newCol = currentColSpan + Math.round(dx / (colW + gap));
            let newRow = currentRowSpan + Math.round(dy / (rowH + gap));

            newCol = Math.max(MIN_COL_SPAN, Math.min(MAX_COL_SPAN, newCol));
            newRow = Math.max(MIN_ROW_SPAN, Math.min(MAX_ROW_SPAN, newRow));

            card.style.gridColumn = 'span ' + newCol;
            card.style.gridRow = 'span ' + newRow;

            updateResizeHighlights(card, newCol, currentColSpan, newRow, currentRowSpan);
            showSizeTooltip(card, newCol, newRow);
        }

        function onUp() {
            window._isResizing = false;
            card.classList.remove('resizing');
            clearResizeHighlights(card);
            removeSizeTooltip(card);

            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);

            const plotEl = card.querySelector('[id^="plot-"]');
            if (plotEl && plotEl.data) {
                setTimeout(() => { try { Plotly.Plots.resize(plotEl); } catch(e) {} }, 60);
            }
        }

        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
    }

    function startResizeTouch(e) {
        if (e.touches.length !== 1) return;
        e.preventDefault();
        window._isResizing = true;

        const touch = e.touches[0];
        const handle = e.currentTarget;
        const card = handle.closest('.dash-card');
        if (!card) return;

        const currentColSpan = parseGridSpan(card.style.gridColumn, 1);
        const currentRowSpan = parseGridSpan(card.style.gridRow, 2);

        const gridStyle = getComputedStyle(grid);
        const gap = parseFloat(gridStyle.gap) || 16;
        const rowH = parseFloat(gridStyle.gridAutoRows) || 120;
        const cols = getGridColumns();
        const gridRect = grid.getBoundingClientRect();
        const colW = (gridRect.width - gap * (cols - 1)) / cols;

        const startW = card.offsetWidth;
        const startH = card.offsetHeight;
        const startX = touch.clientX;
        const startY = touch.clientY;

        card.classList.add('resizing');

        function onTouchMove(ev) {
            ev.preventDefault();
            const t = ev.touches[0];
            const dx = t.clientX - startX;
            const dy = t.clientY - startY;

            let newCol = currentColSpan + Math.round(dx / (colW + gap));
            let newRow = currentRowSpan + Math.round(dy / (rowH + gap));
            newCol = Math.max(MIN_COL_SPAN, Math.min(MAX_COL_SPAN, newCol));
            newRow = Math.max(MIN_ROW_SPAN, Math.min(MAX_ROW_SPAN, newRow));

            card.style.gridColumn = 'span ' + newCol;
            card.style.gridRow = 'span ' + newRow;
        }

        function onTouchEnd() {
            window._isResizing = false;
            card.classList.remove('resizing');
            document.removeEventListener('touchmove', onTouchMove);
            document.removeEventListener('touchend', onTouchEnd);

            const plotEl = card.querySelector('[id^="plot-"]');
            if (plotEl && plotEl.data) {
                setTimeout(() => { try { Plotly.Plots.resize(plotEl); } catch(e) {} }, 60);
            }
        }

        document.addEventListener('touchmove', onTouchMove, { passive: false });
        document.addEventListener('touchend', onTouchEnd);
    }

    function getGridColumns() {
        const style = getComputedStyle(grid);
        const cols = style.gridTemplateColumns.split(' ').length;
        return cols || 3;
    }

    function parseGridSpan(cssValue, fallback) {
        if (!cssValue) return fallback;
        const m = cssValue.match(/span\s+(\d+)/);
        return m ? parseInt(m[1]) : fallback;
    }

    function updateResizeHighlights(card, newCol, oldCol, newRow, oldRow) {
        clearResizeHighlights(card);
        if (newCol > oldCol) card.classList.add('resize-grow-h');
        else if (newCol < oldCol) card.classList.add('resize-shrink-h');
        if (newRow > oldRow) card.classList.add('resize-grow-v');
        else if (newRow < oldRow) card.classList.add('resize-shrink-v');
    }

    function clearResizeHighlights(card) {
        card.classList.remove('resize-grow-h', 'resize-shrink-h', 'resize-grow-v', 'resize-shrink-v');
    }

    function showSizeTooltip(card, cols, rows) {
        let tip = card.querySelector('.resize-size-tooltip');
        if (!tip) {
            tip = document.createElement('div');
            tip.className = 'resize-size-tooltip';
            card.appendChild(tip);
        }
        tip.textContent = cols + ' × ' + rows;
    }

    function removeSizeTooltip(card) {
        const tip = card.querySelector('.resize-size-tooltip');
        if (tip) tip.remove();
    }
}

function initThemePanel() {
    const panel = document.getElementById('themePanel');
    const openBtn = document.getElementById('themeBtn');
    const closeBtn = document.getElementById('themePanelClose');
    const grid = document.getElementById('themeGrid');
    if (!panel || !openBtn || !grid) return;

    openBtn.addEventListener('click', () => panel.classList.add('active'));
    closeBtn.addEventListener('click', () => panel.classList.remove('active'));
    panel.addEventListener('click', (e) => { if (e.target === panel) panel.classList.remove('active'); });

    const themes = HermeniusThemes.getAll();
    const current = HermeniusThemes.getCurrent();
    themes.forEach(theme => {
        const opt = document.createElement('div');
        opt.className = 'theme-option' + (theme.id === current ? ' active' : '');
        opt.innerHTML = '<div class="theme-option-icon">' + theme.icon + '</div><div class="theme-option-name">' + theme.name + '</div><div class="theme-option-check">✓</div>';
        opt.addEventListener('click', () => {
            HermeniusThemes.apply(theme.id);
            grid.querySelectorAll('.theme-option').forEach(o => o.classList.remove('active'));
            opt.classList.add('active');
        });
        grid.appendChild(opt);
    });
}

var _floatingExportMenu = null;

function initExportButtons() {
    var toggle = document.getElementById('exportToggle');
    if (!toggle) {
        console.warn('Hermenius: exportToggle not found');
        return;
    }

    toggle.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        if (_floatingExportMenu) {
            _destroyExportMenu();
        } else {
            _createExportMenu(toggle);
        }
    });

    console.log('Hermenius: Export buttons initialized');
}

function _createExportMenu(anchorEl) {
    var menu = document.createElement('div');
    menu.id = 'floating-export-menu';

    var cs = getComputedStyle(document.documentElement);
    var bgCard = cs.getPropertyValue('--bg-card').trim() || '#ffffff';
    var textColor = cs.getPropertyValue('--text-secondary').trim() || '#4a4a4a';
    var borderColor = cs.getPropertyValue('--border-color').trim() || 'rgba(0,0,0,0.1)';
    var accentColor = cs.getPropertyValue('--accent-primary').trim() || '#0078e7';
    var font = getComputedStyle(document.body).fontFamily || 'sans-serif';

    menu.style.cssText =
        'position:fixed;z-index:999999;min-width:220px;padding:0.5rem;' +
        'background:' + bgCard + ';' +
        'backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);' +
        'border-radius:12px;border:1px solid ' + borderColor + ';' +
        'box-shadow:0 -8px 40px rgba(0,0,0,0.22);' +
        'font-family:' + font + ';';

    var lang = HermeniusI18n.getLang();
    menu.innerHTML =
        '<div style="font-size:0.7rem;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;color:' +
            cs.getPropertyValue('--text-muted').trim() + ';padding:0.5rem 0.75rem 0.25rem;">' +
            (lang === 'en' ? 'Current chart' : 'Текущий график') + '</div>' +

        '<button data-action="png" style="display:flex;align-items:center;gap:0.6rem;width:100%;padding:0.55rem 0.75rem;border:none;border-radius:8px;background:transparent;color:' + textColor + ';font-size:0.85rem;font-weight:500;font-family:inherit;cursor:pointer;">' +
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"></rect><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>' +
            (lang === 'en' ? 'Download PNG' : 'Скачать PNG') + '</button>' +

        '<button data-action="svg" style="display:flex;align-items:center;gap:0.6rem;width:100%;padding:0.55rem 0.75rem;border:none;border-radius:8px;background:transparent;color:' + textColor + ';font-size:0.85rem;font-weight:500;font-family:inherit;cursor:pointer;">' +
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>' +
            (lang === 'en' ? 'Download SVG' : 'Скачать SVG') + '</button>' +

        '<div style="height:1px;background:' + borderColor + ';margin:0.35rem 0.5rem;"></div>' +

        '<div style="font-size:0.7rem;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;color:' +
            cs.getPropertyValue('--text-muted').trim() + ';padding:0.5rem 0.75rem 0.25rem;">' +
            (lang === 'en' ? 'Entire dashboard' : 'Весь дашборд') + '</div>' +

        '<button data-action="html" style="display:flex;align-items:center;gap:0.6rem;width:100%;padding:0.55rem 0.75rem;border:none;border-radius:8px;background:transparent;color:' + textColor + ';font-size:0.85rem;font-weight:500;font-family:inherit;cursor:pointer;">' +
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>' +
            (lang === 'en' ? 'Export HTML' : 'Экспорт HTML') + '</button>' +

        '<button data-action="pdf" style="display:flex;align-items:center;gap:0.6rem;width:100%;padding:0.55rem 0.75rem;border:none;border-radius:8px;background:transparent;color:' + textColor + ';font-size:0.85rem;font-weight:500;font-family:inherit;cursor:pointer;">' +
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>' +
            (lang === 'en' ? 'Export PDF' : 'Экспорт PDF') + '</button>' +

        '<button data-action="dashboard-png" style="display:flex;align-items:center;gap:0.6rem;width:100%;padding:0.55rem 0.75rem;border:none;border-radius:8px;background:transparent;color:' + textColor + ';font-size:0.85rem;font-weight:500;font-family:inherit;cursor:pointer;">' +
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>' +
            (lang === 'en' ? 'Dashboard PNG' : 'Дашборд PNG') + '</button>';

    var buttons = menu.querySelectorAll('button[data-action]');
    buttons.forEach(function(btn) {
        btn.addEventListener('mouseenter', function() {
            this.style.background = 'rgba(0,120,231,0.1)';
            this.style.color = accentColor;
        });
        btn.addEventListener('mouseleave', function() {
            this.style.background = 'transparent';
            this.style.color = textColor;
        });
    });

    menu.addEventListener('click', function(e) {
        e.stopPropagation();
        var btn = e.target.closest('[data-action]');
        if (!btn) return;
        var action = btn.getAttribute('data-action');
        _destroyExportMenu();
        _doExportAction(action);
    });

    document.body.appendChild(menu);
    _floatingExportMenu = menu;

    _positionExportMenu(menu, anchorEl);

    setTimeout(function() {
        document.addEventListener('mousedown', _onExportMenuOutsideClick);
        document.addEventListener('touchstart', _onExportMenuOutsideClick);
    }, 10);

    document.addEventListener('keydown', _onExportMenuEscape);
}

function _positionExportMenu(menu, anchorEl) {
    var rect = anchorEl.getBoundingClientRect();
    var menuH = menu.offsetHeight || 250;
    var menuW = menu.offsetWidth || 220;

    var top = rect.top - menuH - 10;
    var left = rect.left;

    if (top < 10) {
        top = rect.bottom + 10;
    }

    if (left + menuW > window.innerWidth - 10) {
        left = window.innerWidth - menuW - 10;
    }
    if (left < 10) left = 10;

    menu.style.top = top + 'px';
    menu.style.left = left + 'px';
}

function _onExportMenuOutsideClick(e) {
    if (_floatingExportMenu && !_floatingExportMenu.contains(e.target)) {
        _destroyExportMenu();
    }
}

function _onExportMenuEscape(e) {
    if (e.key === 'Escape' && _floatingExportMenu) {
        _destroyExportMenu();
    }
}

function _destroyExportMenu() {
    if (_floatingExportMenu) {
        _floatingExportMenu.remove();
        _floatingExportMenu = null;
    }
    document.removeEventListener('mousedown', _onExportMenuOutsideClick);
    document.removeEventListener('touchstart', _onExportMenuOutsideClick);
    document.removeEventListener('keydown', _onExportMenuEscape);
}

function _doExportAction(action) {
    var id = window._currentFocusedPlotId || _getAnyPlotId();
    switch (action) {
        case 'png':
            if (id) HermeniusExport.exportChartPNG(id, 'hermenius-chart');
            else alert(HermeniusI18n.t('no_data'));
            break;
        case 'svg':
            if (id) HermeniusExport.exportChartSVG(id, 'hermenius-chart');
            else alert(HermeniusI18n.t('no_data'));
            break;
        case 'html':
            HermeniusExport.exportDashboardHTML();
            break;
        case 'pdf':
            HermeniusExport.exportDashboardPDF();
            break;
        case 'dashboard-png':
            HermeniusExport.exportDashboardPNG();
            break;
    }
}

function _getAnyPlotId() {
    var el = document.querySelector('.dash-card-body [id^="plot-"]');
    return el ? el.id : null;
}

function initFooterButtons() {
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) refreshBtn.addEventListener('click', () => window.location.reload());
    const fullScreenBtn = document.getElementById('fullScreenBtn');
    if (fullScreenBtn) fullScreenBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
        else document.exitFullscreen().catch(() => {});
    });
}

function initLangToggle() {
    const btn = document.getElementById('langBtn');
    if (!btn) return;

    updateLangBtn(btn);

    btn.addEventListener('click', () => {
        const newLang = HermeniusI18n.getLang() === 'ru' ? 'en' : 'ru';
        HermeniusI18n.setLang(newLang);
        updateLangBtn(btn);
        HermeniusI18n.apply();
    });
}

function updateLangBtn(btn) {
    const lang = HermeniusI18n.getLang();
    const label = btn.querySelector('.lang-label');
    if (label) label.textContent = lang === 'ru' ? 'РУ' : 'EN';
}

function checkProjectAuth() {
    const isRegistered = localStorage.getItem('dpo_registered');
    if (isRegistered === 'true') return;

    const overlay = document.createElement('div');
    overlay.className = 'auth-banner';
    overlay.innerHTML =
        '<div class="auth-banner-card">' +
            '<div class="auth-banner-icon">' +
                '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
                    '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>' +
                    '<path d="M7 11V7a5 5 0 0 1 10 0v4"></path>' +
                '</svg>' +
            '</div>' +
            '<h2 class="auth-banner-title">' + (HermeniusI18n.getLang() === 'en' ? 'Authorization Required' : 'Требуется авторизация') + '</h2>' +
            '<p class="auth-banner-text">' + (HermeniusI18n.getLang() === 'en'
                ? 'Please register or sign in to access project analytics.'
                : 'Зарегистрируйтесь или войдите в аккаунт, чтобы получить доступ к аналитике.') +
            '</p>' +
            '<button class="auth-banner-btn" id="authRedirectBtn">' +
                '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
                    '<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>' +
                    '<polyline points="10 17 15 12 10 7"></polyline>' +
                    '<line x1="15" y1="12" x2="3" y2="12"></line>' +
                '</svg>' +
                (HermeniusI18n.getLang() === 'en' ? 'Sign In' : 'Войти') +
            '</button>' +
        '</div>';

    document.body.appendChild(overlay);

    document.getElementById('authRedirectBtn').addEventListener('click', () => {
        window.location.href = 'register.html';
    });
}

async function downloadCardPNG(plotId, plotTitle) {
    const plotDiv = document.getElementById(plotId);
    if (!plotDiv) return;
    if (typeof Plotly === 'undefined') return;

    const safeName = (plotTitle || 'hermenius-chart').replace(/[^a-zA-Zа-яА-ЯёЁ0-9\-_ ]/g, '').trim().replace(/\s+/g, '-').substring(0, 60);

    const card = plotDiv.closest('.dash-card');
    const btn = card ? card.querySelector('.download-btn') : null;
    if (btn) {
        const existing = btn.querySelector('.download-toast');
        if (existing) existing.remove();
        const toast = document.createElement('span');
        toast.className = 'download-toast';
        toast.textContent = 'PNG ✓';
        btn.appendChild(toast);
        setTimeout(() => { if (toast.parentNode) toast.remove(); }, 2000);
    }

    try {
        await HermeniusExport.exportChartPNG(plotId, safeName);
    } catch (err) {
        console.error('PNG export error:', err);
    }
}
