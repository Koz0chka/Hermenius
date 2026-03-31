const HermeniusExport = (() => {

    function _getCardBgColor(plotDiv) {
        const card = plotDiv.closest('.dash-card');
        if (!card) return '#ffffff';
        const style = getComputedStyle(card);
        const bgCard = style.getPropertyValue('--bg-card');
        if (bgCard && bgCard !== '') {
            return bgCard.replace(/[\d.]+\)$/, '1.0)');
        }
        const bgColor = style.backgroundColor;
        if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
            return bgColor;
        }
        return '#ffffff';
    }

    async function exportChartPNG(plotDivId, filename) {
        const plotDiv = document.getElementById(plotDivId);
        if (!plotDiv) {
            console.error('Plot div not found:', plotDivId);
            alert('График не найден.');
            return;
        }
        if (typeof Plotly === 'undefined') {
            alert('Plotly.js не загружен.');
            return;
        }

        try {
            const bgColor = _getCardBgColor(plotDiv);
            const originalBg = (plotDiv.layout && plotDiv.layout.paper_bgcolor) || 'rgba(0,0,0,0)';

            await Plotly.relayout(plotDiv, { paper_bgcolor: bgColor });

            const imgData = await Plotly.toImage(plotDiv, {
                format: 'png',
                width: 1600,
                height: 900
            });

            await Plotly.relayout(plotDiv, { paper_bgcolor: originalBg }).catch(() => {});

            const safeName = (filename || 'hermenius-chart') + '-' + Date.now();
            _downloadDataURL(imgData, safeName + '.png');
        } catch (err) {
            console.error('PNG export error:', err);
            alert('Ошибка экспорта PNG: ' + err.message);
        }
    }

    async function exportChartSVG(plotDivId, filename) {
        const plotDiv = document.getElementById(plotDivId);
        if (!plotDiv) {
            console.error('Plot div not found:', plotDivId);
            alert('График не найден.');
            return;
        }
        if (typeof Plotly === 'undefined') {
            alert('Plotly.js не загружен.');
            return;
        }

        try {
            const bgColor = _getCardBgColor(plotDiv);
            const originalBg = (plotDiv.layout && plotDiv.layout.paper_bgcolor) || 'rgba(0,0,0,0)';

            await Plotly.relayout(plotDiv, { paper_bgcolor: bgColor });

            const imgData = await Plotly.toImage(plotDiv, {
                format: 'svg',
                width: 1600,
                height: 900
            });

            await Plotly.relayout(plotDiv, { paper_bgcolor: originalBg }).catch(() => {});

            const safeName = (filename || 'hermenius-chart') + '-' + Date.now();
            _downloadDataURL(imgData, safeName + '.svg');
        } catch (err) {
            console.error('SVG export error:', err);
            alert('Ошибка экспорта SVG: ' + err.message);
        }
    }

    async function exportDashboardHTML() {
        const dashboard = document.getElementById('dashboardGrid');
        if (!dashboard) { alert('Дашборд не найден'); return; }

        const loader = document.createElement('div');
        loader.id = 'export-html-loader';
        loader.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:10000;flex-direction:column;gap:1rem;';
        loader.innerHTML = '<div style="width:50px;height:50px;border:4px solid rgba(255,255,255,0.3);border-top-color:white;border-radius:50%;animation:spin 1s linear infinite;"></div><p style="color:white;font-size:1.1rem;">Загрузка Plotly для HTML-экспорта...</p><style>@keyframes spin { to { transform: rotate(360deg); } }</style>';
        document.body.appendChild(loader);

        try {
            const plotlyConfig = HermeniusThemes.getPlotlyConfig();
            const analysisData = window._currentAnalysisData || HermeniusAPI.loadAnalysisResult();
            const fileName = (analysisData && analysisData.file_info) ? analysisData.file_info.file_name : 'Данные';
            const cardBg = _getCardBgColor(document.querySelector('.dash-card-body [id^="plot-"]') || document.body);

            var plotlyJS = '';
            var cdnUrls = [
                'https://cdnjs.cloudflare.com/ajax/libs/plotly.js/2.32.0/plotly.min.js',
                'https://cdn.jsdelivr.net/npm/plotly.js@2.32.0/dist/plotly.min.js',
                'https://unpkg.com/plotly.js@2.32.0/dist/plotly.min.js'
            ];
            for (var ci = 0; ci < cdnUrls.length && !plotlyJS; ci++) {
                try {
                    loader.querySelector('p').textContent = 'Загрузка Plotly (' + (ci + 1) + '/' + cdnUrls.length + ')...';
                    var resp = await fetch(cdnUrls[ci]);
                    if (resp.ok) {
                        plotlyJS = await resp.text();
                        console.log('Hermenius: Plotly загружен с ' + cdnUrls[ci] + ' (' + (plotlyJS.length / 1024 / 1024).toFixed(1) + ' MB)');
                    }
                } catch (e) { /* пробуем следующий CDN */ }
            }

            if (!plotlyJS) {
                alert('Не удалось загрузить Plotly.js с CDN.\nПроверьте интернет-соединение и попробуйте ещё раз.');
                return;
            }

            // Экранируем </script> внутри Plotly-кода
            plotlyJS = plotlyJS.replace(/<\/script/gi, '<\\/script');

            var plotSourceData = [];
            if (analysisData && analysisData.plots) {
                analysisData.plots.forEach(function(plot, idx) {
                    plotSourceData.push({
                        plotIndex: idx,
                        type: plot.type,
                        title: plot.title,
                        reason: plot.reason || '',
                        data: JSON.parse(JSON.stringify(plot.data)),
                        colors: plotlyConfig.trace_colors
                    });
                });
            }

            // Экранируем </ в JSON
            var jsonStr = JSON.stringify(plotSourceData).replace(/<\//g, '<\\/');

            // === СТРОИМ HTML ===
            var html = '<!DOCTYPE html>\n<html lang="ru">\n<head>\n';
            html += '    <meta charset="UTF-8">\n';
            html += '    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n';
            html += '    <title>Hermenius — ' + fileName + '</title>\n';
            html += '    <style>\n';
            html += '        * { margin: 0; padding: 0; box-sizing: border-box; }\n';
            html += '        body { font-family: "Space Grotesk", -apple-system, sans-serif; background: ' + cardBg + '; color: ' + plotlyConfig.font_color + '; padding: 2rem; }\n';
            html += '        .header-bar { text-align: center; margin-bottom: 2rem; }\n';
            html += '        .header-bar h1 { font-size: 1.5rem; margin-bottom: 0.5rem; }\n';
            html += '        .header-bar p { opacity: 0.7; font-size: 0.9rem; }\n';
            html += '        .dashboard-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(500px, 1fr)); gap: 1.5rem; max-width: 1400px; margin: 0 auto; }\n';
            html += '        .dash-card { background: ' + cardBg + '; border-radius: 16px; overflow: hidden; border: 1px solid rgba(128,128,128,0.15); }\n';
            html += '        .dash-card-header { padding: 1rem 1.25rem; border-bottom: 1px solid rgba(128,128,128,0.15); }\n';
            html += '        .dash-card-title { font-size: 0.95rem; font-weight: 600; }\n';
            html += '        .dash-card-reason { font-size: 0.75rem; opacity: 0.6; margin-top: 0.15rem; }\n';
            html += '        .dash-card-body { padding: 1rem; min-height: 350px; }\n';
            html += '        .plot-box { width: 100%; height: 450px; }\n';
            html += '        .box-table { width: 100%; border-collapse: collapse; text-align: center; }\n';
            html += '        .box-table th { padding: 8px; border-bottom: 2px solid rgba(128,128,128,0.2); }\n';
            html += '        .box-table td { padding: 8px; border-bottom: 1px solid rgba(128,128,128,0.1); }\n';
            html += '        .insights-section { max-width: 1400px; margin: 2rem auto; }\n';
            html += '        .insights-title { font-size: 1.3rem; font-weight: 600; margin-bottom: 1rem; }\n';
            html += '        .insights-list { display: flex; flex-direction: column; gap: 0.75rem; }\n';
            html += '        .insight-item { padding: 1rem; border-radius: 8px; border-left: 3px solid; background: rgba(128,128,128,0.06); font-size: 0.9rem; }\n';
            html += '        @media (max-width: 1000px) { .dashboard-grid { grid-template-columns: 1fr; } }\n';
            html += '    </style>\n';
            html += '</head>\n<body>\n';

            html += '    <div class="header-bar">\n';
            html += '        <h1>Hermenius Dashboard</h1>\n';
            html += '        <p>' + fileName + ' | ' + new Date().toLocaleString('ru-RU') + '</p>\n';
            html += '    </div>\n';
            html += '    <div class="dashboard-grid">\n';

            var cards = dashboard.querySelectorAll('.dash-card');
            cards.forEach(function(card) {
                var titleEl = card.querySelector('.dash-card-title');
                var reasonEl = card.querySelector('.dash-card-reason');
                var titleText = titleEl ? titleEl.textContent : '';
                var reasonText = reasonEl ? reasonEl.textContent : '';
                var plotDiv = card.querySelector('.dash-card-body > [id^="plot-"]');
                var boxTable = card.querySelector('.box-table');
                var plotIdx = card.dataset.plotIndex;

                html += '        <div class="dash-card">\n';
                html += '            <div class="dash-card-header"><div class="dash-card-title">' + titleText + '</div>';
                if (reasonText) html += '<div class="dash-card-reason">' + reasonText + '</div>';
                html += '</div>\n';
                html += '            <div class="dash-card-body">\n';

                if (plotDiv) {
                    html += '                <div id="export-' + plotDiv.id + '" class="plot-box"></div>\n';
                } else if (boxTable) {
                    html += '                ' + boxTable.outerHTML + '\n';
                }

                html += '            </div>\n';
                html += '        </div>\n';
            });

            html += '    </div>\n';

            if (analysisData && analysisData.ai_insights && analysisData.ai_insights.length > 0) {
                html += '    <div class="insights-section">\n';
                html += '        <h2 class="insights-title">ИИ-инсайты</h2>\n';
                html += '        <div class="insights-list">\n';
                analysisData.ai_insights.forEach(function(ins) {
                    html += '            <div class="insight-item">' + ins + '</div>\n';
                });
                html += '        </div>\n';
                html += '    </div>\n';
            }

            // === PLOTLY INLINE ===
            html += '    <!-- Plotly.js v2.32.0 (встроен для работы offline / file://) -->\n';
            html += '    <script>\n' + plotlyJS + '\n    <\/script>\n';

            // === СКРИПТ РЕНДЕРА ГРАФИКОВ ===
            html += '    <script>\n';
            html += '        var _plotSourceData = ' + jsonStr + ';\n\n';
            html += '        function buildTraces(item) {\n';
            html += '            var colors = item.colors || ["#636efa","#ef553b","#00cc96","#ab63fa","#FFA15A","#19d3f3","#FF6692","#B6E880","#FF97FF","#FECB52"];\n';
            html += '            var traces = [];\n';
            html += '            var layout = { paper_bgcolor: "' + cardBg + '", plot_bgcolor: "rgba(0,0,0,0)", font: { color: "' + plotlyConfig.font_color + '", family: "Space Grotesk, sans-serif", size: 12 }, margin: { t: 30, b: 40, l: 50, r: 30 }, autosize: true, xaxis: { gridcolor: "rgba(128,128,128,0.2)", zerolinecolor: "rgba(128,128,128,0.2)" }, yaxis: { gridcolor: "rgba(128,128,128,0.2)", zerolinecolor: "rgba(128,128,128,0.2)" } };\n\n';

            // Scatter
            html += '            if (item.type === "scatter") {\n';
            html += '                var ds = item.data.datasets && item.data.datasets[0];\n';
            html += '                if (ds && ds.data) traces.push({ x: ds.data.map(function(p){return p.x}), y: ds.data.map(function(p){return p.y}), mode: "markers", type: "scatter", name: ds.label||"", marker: { size: 8, opacity: 0.7, color: colors[0] } });\n';
            html += '            }\n';
            // Line
            html += '            else if (item.type === "line") {\n';
            html += '                var ds = item.data.datasets && item.data.datasets[0];\n';
            html += '                if (ds && ds.data && item.data.labels) traces.push({ x: item.data.labels, y: ds.data, type: "scatter", mode: "lines+markers", name: ds.label||"", line: { color: colors[0], width: 2.5 }, marker: { size: 6, color: colors[0] } });\n';
            html += '            }\n';
            // Bar
            html += '            else if (item.type === "bar") {\n';
            html += '                var ds = item.data.datasets && item.data.datasets[0];\n';
            html += '                if (ds && ds.data && item.data.labels) traces.push({ x: item.data.labels, y: ds.data, type: "bar", name: ds.label||"", marker: { color: colors[0], opacity: 0.85 }, width: 0.7 });\n';
            html += '            }\n';
            // Pie
            html += '            else if (item.type === "pie") {\n';
            html += '                if (item.data.labels && item.data.values) {\n';
            html += '                    traces.push({ labels: item.data.labels, values: item.data.values, type: "pie", hole: 0.45, textinfo: "percent+label", insidetextorientation: "radial", marker: { colors: colors } });\n';
            html += '                    layout.showlegend = true; layout.legend = { font: { color: "' + plotlyConfig.font_color + '" } };\n';
            html += '                    delete layout.xaxis; delete layout.yaxis;\n';
            html += '                }\n';
            html += '            }\n';
            // Heatmap
            html += '            else if (item.type === "heatmap") {\n';
            html += '                if (item.data.matrix && item.data.labels) {\n';
            html += '                    traces.push({ z: item.data.matrix, x: item.data.labels, y: item.data.labels, type: "heatmap", colorscale: "Viridis", showscale: true, colorbar: { tickfont: { color: "' + plotlyConfig.font_color + '" } } });\n';
            html += '                    layout.margin = { t: 30, b: 100, l: 100, r: 60 };\n';
            html += '                    layout.xaxis = Object.assign({}, layout.xaxis, { tickangle: -45 });\n';
            html += '                }\n';
            html += '            }\n';
            // Violin
            html += '            else if (item.type === "violin") {\n';
            html += '                if (item.data.datasets && item.data.labels) {\n';
            html += '                    item.data.datasets.forEach(function(vals, i) {\n';
            html += '                        if (Array.isArray(vals) && vals.length > 0) traces.push({ type: "violin", y: vals, name: item.data.labels[i], box: { visible: true }, meanline: { visible: true }, marker: { color: colors[i % colors.length] } });\n';
            html += '                    });\n';
            html += '                    if (traces.length > 0) layout.violinmode = "group";\n';
            html += '                }\n';
            html += '            }\n\n';

            html += '            return { traces: traces, layout: layout };\n';
            html += '        }\n\n';

            html += '        _plotSourceData.forEach(function(item) {\n';
            html += '            try {\n';
            html += '                var el = document.getElementById("export-plot-" + item.plotIndex);\n';
            html += '                if (!el) return;\n';
            html += '                var result = buildTraces(item);\n';
            html += '                if (result.traces.length > 0) Plotly.newPlot(el, result.traces, result.layout, {responsive: true});\n';
            html += '            } catch(err) { console.error("Render error: " + err.message); }\n';
            html += '        });\n';
            html += '    <\/script>\n';
            html += '</body>\n</html>';

            loader.querySelector('p').textContent = 'Сборка файла...';
            await new Promise(function(r) { setTimeout(r, 100); });

            downloadBlob(new Blob([html], { type: 'text/html;charset=utf-8;' }), 'hermenius-dashboard.html');

        } catch (error) {
            console.error('Ошибка экспорта HTML:', error);
            alert('Ошибка при генерации HTML: ' + error.message);
        } finally {
            var loaderEl = document.getElementById('export-html-loader');
            if (loaderEl) loaderEl.remove();
        }
    }

    async function exportDashboardPDF() {
        if (typeof html2canvas === 'undefined' || typeof jspdf === 'undefined') {
            try {
                await loadExportLibs();
            } catch (e) {
                console.error('Ошибка загрузки библиотек:', e);
                alert('Не удалось загрузить библиотеки для PDF.\nПроверьте интернет и попробуйте ещё раз.');
                return;
            }
        }

        const dashboard = document.getElementById('dashboardGrid');
        if (!dashboard) {
            alert('Дашборд не найден');
            return;
        }

        const loader = document.createElement('div');
        loader.id = 'export-pdf-loader';
        loader.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:10000;flex-direction:column;gap:1rem;';
        loader.innerHTML = '<div style="width:50px;height:50px;border:4px solid rgba(255,255,255,0.3);border-top-color:white;border-radius:50%;animation:spin 1s linear infinite;"></div><p style="color:white;font-size:1.1rem;">Генерация PDF...</p><style>@keyframes spin { to { transform: rotate(360deg); } }</style>';
        document.body.appendChild(loader);

        try {
            const cards = dashboard.querySelectorAll('.dash-card');
            const originalBgs = [];
            const cardBg = _getCardBgColor(document.querySelector('.dash-card-body [id^="plot-"]') || document.body);

            dashboard.querySelectorAll('.dash-card-body [id^="plot-"]').forEach(plotEl => {
                if (plotEl.data && plotEl.layout) {
                    Plotly.relayout(plotEl, { paper_bgcolor: cardBg }).catch(() => {});
                }
            });

            await new Promise(resolve => setTimeout(resolve, 800));

            const canvas = await html2canvas(dashboard, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: cardBg,
                logging: false,
                width: dashboard.scrollWidth,
                height: dashboard.scrollHeight
            });

            const imgData = canvas.toDataURL('image/png');
            const { jsPDF } = jspdf;

            const imgWidth = canvas.width;
            const imgHeight = canvas.height;

            const orientation = imgWidth > imgHeight ? 'landscape' : 'portrait';
            const pdf = new jsPDF(orientation, 'mm', 'a4');

            const pdfContentWidth = orientation === 'landscape' ? 297 : 210;
            const pdfContentHeight = orientation === 'landscape' ? 210 : 297;

            const ratio = Math.min(pdfContentWidth / imgWidth, pdfContentHeight / imgHeight);
            const scaledWidth = imgWidth * ratio;
            const scaledHeight = imgHeight * ratio;

            if (scaledHeight <= pdfContentHeight) {
                const xOffset = (pdfContentWidth - scaledWidth) / 2;
                const yOffset = (pdfContentHeight - scaledHeight) / 2;
                pdf.addImage(imgData, 'PNG', xOffset, yOffset, scaledWidth, scaledHeight);
            } else {
                let yOffset = 0;
                let page = 0;
                while (yOffset < scaledHeight) {
                    if (page > 0) pdf.addPage();
                    pdf.addImage(imgData, 'PNG', 0, -yOffset, scaledWidth, scaledHeight);
                    yOffset += pdfContentHeight;
                    page++;
                }
            }

            pdf.save('hermenius-dashboard.pdf');

            dashboard.querySelectorAll('.dash-card-body [id^="plot-"]').forEach(plotEl => {
                if (plotEl.data && plotEl.layout) {
                    Plotly.relayout(plotEl, { paper_bgcolor: 'rgba(0,0,0,0)' }).catch(() => {});
                }
            });

        } catch (error) {
            console.error('Ошибка экспорта PDF:', error);
            alert('Ошибка при генерации PDF: ' + error.message);
        } finally {
            const loaderEl = document.getElementById('export-pdf-loader');
            if (loaderEl) loaderEl.remove();
        }
    }

    async function exportDashboardPNG() {
        if (typeof html2canvas === 'undefined') {
            try {
                await loadExportLibs();
            } catch (e) {
                console.error('Ошибка загрузки библиотеки:', e);
                alert('Не удалось загрузить библиотеку для PNG.\nПроверьте интернет и попробуйте ещё раз.');
                return;
            }
        }

        const dashboard = document.getElementById('dashboardGrid');
        if (!dashboard) {
            alert('Дашборд не найден');
            return;
        }

        const loader = document.createElement('div');
        loader.id = 'export-png-loader';
        loader.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:10000;flex-direction:column;gap:1rem;';
        loader.innerHTML = '<div style="width:50px;height:50px;border:4px solid rgba(255,255,255,0.3);border-top-color:white;border-radius:50%;animation:spin 1s linear infinite;"></div><p style="color:white;font-size:1.1rem;">Генерация PNG...</p><style>@keyframes spin { to { transform: rotate(360deg); } }</style>';
        document.body.appendChild(loader);

        try {
            const cardBg = _getCardBgColor(document.querySelector('.dash-card-body [id^="plot-"]') || document.body);

            dashboard.querySelectorAll('.dash-card-body [id^="plot-"]').forEach(plotEl => {
                if (plotEl.data && plotEl.layout) {
                    Plotly.relayout(plotEl, { paper_bgcolor: cardBg }).catch(() => {});
                }
            });

            await new Promise(resolve => setTimeout(resolve, 800));

            const canvas = await html2canvas(dashboard, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: cardBg,
                logging: false,
                width: dashboard.scrollWidth,
                height: dashboard.scrollHeight
            });

            const imgData = canvas.toDataURL('image/png');
            _downloadDataURL(imgData, 'hermenius-dashboard.png');

            dashboard.querySelectorAll('.dash-card-body [id^="plot-"]').forEach(plotEl => {
                if (plotEl.data && plotEl.layout) {
                    Plotly.relayout(plotEl, { paper_bgcolor: 'rgba(0,0,0,0)' }).catch(() => {});
                }
            });

        } catch (error) {
            console.error('Ошибка экспорта PNG:', error);
            alert('Ошибка при генерации PNG: ' + error.message);
        } finally {
            const loaderEl = document.getElementById('export-png-loader');
            if (loaderEl) loaderEl.remove();
        }
    }

    function loadExportLibs() {
        return new Promise((resolve, reject) => {
            let loaded = 0;
            const total = 2;

            function checkDone() {
                loaded++;
                if (loaded === total) resolve();
            }

            if (typeof html2canvas !== 'undefined') {
                checkDone();
            } else {
                const s1 = document.createElement('script');
                s1.id = 'html2canvas-script';
                s1.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
                s1.onload = checkDone;
                s1.onerror = () => reject(new Error('Не удалось загрузить html2canvas'));
                document.head.appendChild(s1);
            }

            if (typeof jspdf !== 'undefined') {
                checkDone();
            } else {
                const s2 = document.createElement('script');
                s2.id = 'jspdf-script';
                s2.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
                s2.onload = checkDone;
                s2.onerror = () => reject(new Error('Не удалось загрузить jsPDF'));
                document.head.appendChild(s2);
            }
        });
    }

    function _downloadDataURL(dataURL, filename) {
        const a = document.createElement('a');
        a.href = dataURL;
        a.download = filename;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
        }, 100);
    }

    function downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    }

    function exportTableExcel(tableElement, filename) {
        if (!tableElement) {
            alert('Таблица не найдена');
            return;
        }

        var html = '<html xmlns:o="urn:schemas-microsoft-com:office:office" ' +
            'xmlns:x="urn:schemas-microsoft-com:office:excel" ' +
            'xmlns="http://www.w3.org/TR/REC-html40">' +
            '<head><meta charset="utf-8">' +
            '<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>' +
            '<x:Name>Data</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>' +
            '</x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->' +
            '<style>' +
            'table { border-collapse: collapse; width: 100%; }' +
            'th { background: #4472C4; color: white; font-weight: bold; padding: 8px 12px; border: 1px solid #ddd; }' +
            'td { padding: 6px 12px; border: 1px solid #ddd; }' +
            'tr:nth-child(even) td { background: #f2f2f2; }' +
            '</style></head><body>' +
            tableElement.outerHTML +
            '</body></html>';

        var safeName = (filename || 'hermenius-table') + '.xls';
        downloadBlob(new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' }), safeName);
    }

    return {
        exportChartPNG,
        exportChartSVG,
        exportDashboardHTML,
        exportDashboardPDF,
        exportDashboardPNG,
        exportTableExcel,
        _getCardBgColor
    };
})();
