const HermeniusThemes = (() => {

    const THEMES = {
        'classic-light': {
            name: 'Классическая', icon: '☀️',
            site: {
                '--bg-primary': '#ffffff', '--bg-secondary': '#f8fafc',
                '--bg-card': 'rgba(255, 255, 255, 0.98)', '--bg-card-hover': 'rgba(255, 255, 255, 1)',
                '--text-primary': '#1a1a1a', '--text-secondary': '#4a4a4a', '--text-muted': '#888888',
                '--accent-primary': '#0078e7', '--accent-secondary': '#4da6ff',
                '--accent-success': '#10b981', '--accent-warning': '#f59e0b', '--accent-danger': '#ef4444',
                '--border-color': 'rgba(0, 0, 0, 0.08)', '--border-hover': '#4da6ff',
                '--shadow-sm': '0 4px 12px rgba(0,0,0,0.08)', '--shadow-md': '0 10px 30px rgba(0,0,0,0.1)', '--shadow-lg': '0 20px 40px rgba(0,0,0,0.15)',
                'body-bg-gradient': 'linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)'
            },
            plotly: {
                paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0.03)',
                font_color: '#333333', grid_color: 'rgba(0,0,0,0.08)',
                colorscale_heatmap: 'RdBu',
                trace_colors: ['#0078e7', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4']
            }
        },
        'midnight': {
            name: 'Полночь', icon: '🌙',
            site: {
                '--bg-primary': '#0f172a', '--bg-secondary': '#1e293b',
                '--bg-card': 'rgba(30,41,59,0.98)', '--bg-card-hover': 'rgba(51,65,85,1)',
                '--text-primary': '#f1f5f9', '--text-secondary': '#94a3b8', '--text-muted': '#64748b',
                '--accent-primary': '#38bdf8', '--accent-secondary': '#0ea5e9',
                '--accent-success': '#34d399', '--accent-warning': '#fbbf24', '--accent-danger': '#f87171',
                '--border-color': 'rgba(148,163,184,0.15)', '--border-hover': '#38bdf8',
                '--shadow-sm': '0 4px 12px rgba(0,0,0,0.3)', '--shadow-md': '0 10px 30px rgba(0,0,0,0.4)', '--shadow-lg': '0 20px 40px rgba(0,0,0,0.5)',
                'body-bg-gradient': 'linear-gradient(-45deg, #0f172a, #1e1b4b, #0f172a, #172554)'
            },
            plotly: {
                paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(255,255,255,0.03)',
                font_color: '#e2e8f0', grid_color: 'rgba(148,163,184,0.15)',
                colorscale_heatmap: 'Viridis',
                trace_colors: ['#38bdf8', '#34d399', '#fbbf24', '#a78bfa', '#fb923c', '#f472b6']
            }
        },
        'ocean': {
            name: 'Океан', icon: '🌊',
            site: {
                '--bg-primary': '#0c4a6e', '--bg-secondary': '#075985',
                '--bg-card': 'rgba(7,89,133,0.95)', '--bg-card-hover': 'rgba(14,116,144,1)',
                '--text-primary': '#e0f2fe', '--text-secondary': '#7dd3fc', '--text-muted': '#38bdf8',
                '--accent-primary': '#22d3ee', '--accent-secondary': '#06b6d4',
                '--accent-success': '#2dd4bf', '--accent-warning': '#fcd34d', '--accent-danger': '#fb7185',
                '--border-color': 'rgba(34,211,238,0.15)', '--border-hover': '#22d3ee',
                '--shadow-sm': '0 4px 12px rgba(0,0,0,0.3)', '--shadow-md': '0 10px 30px rgba(0,0,0,0.4)', '--shadow-lg': '0 20px 40px rgba(0,0,0,0.5)',
                'body-bg-gradient': 'linear-gradient(-45deg, #0c4a6e, #164e63, #0e7490, #155e75)'
            },
            plotly: {
                paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(255,255,255,0.05)',
                font_color: '#e0f2fe', grid_color: 'rgba(34,211,238,0.15)',
                colorscale_heatmap: 'Cividis',
                trace_colors: ['#22d3ee', '#2dd4bf', '#fcd34d', '#c084fc', '#fb923c', '#f472b6']
            }
        },
        'forest': {
            name: 'Лес', icon: '🌲',
            site: {
                '--bg-primary': '#14532d', '--bg-secondary': '#166534',
                '--bg-card': 'rgba(22,101,52,0.95)', '--bg-card-hover': 'rgba(21,128,61,1)',
                '--text-primary': '#f0fdf4', '--text-secondary': '#86efac', '--text-muted': '#4ade80',
                '--accent-primary': '#a3e635', '--accent-secondary': '#84cc16',
                '--accent-success': '#34d399', '--accent-warning': '#fde047', '--accent-danger': '#fca5a5',
                '--border-color': 'rgba(163,230,53,0.15)', '--border-hover': '#a3e635',
                '--shadow-sm': '0 4px 12px rgba(0,0,0,0.3)', '--shadow-md': '0 10px 30px rgba(0,0,0,0.4)', '--shadow-lg': '0 20px 40px rgba(0,0,0,0.5)',
                'body-bg-gradient': 'linear-gradient(-45deg, #14532d, #064e3b, #166534, #065f46)'
            },
            plotly: {
                paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(255,255,255,0.05)',
                font_color: '#f0fdf4', grid_color: 'rgba(163,230,53,0.15)',
                colorscale_heatmap: 'Greens',
                trace_colors: ['#a3e635', '#34d399', '#fde047', '#c084fc', '#fb923c', '#f472b6']
            }
        },
        'sunset': {
            name: 'Закат', icon: '🌅',
            site: {
                '--bg-primary': '#7c2d12', '--bg-secondary': '#9a3412',
                '--bg-card': 'rgba(154,52,18,0.95)', '--bg-card-hover': 'rgba(194,65,12,1)',
                '--text-primary': '#fff7ed', '--text-secondary': '#fdba74', '--text-muted': '#fb923c',
                '--accent-primary': '#fbbf24', '--accent-secondary': '#f59e0b',
                '--accent-success': '#34d399', '--accent-warning': '#fde047', '--accent-danger': '#fca5a5',
                '--border-color': 'rgba(251,191,36,0.15)', '--border-hover': '#fbbf24',
                '--shadow-sm': '0 4px 12px rgba(0,0,0,0.3)', '--shadow-md': '0 10px 30px rgba(0,0,0,0.4)', '--shadow-lg': '0 20px 40px rgba(0,0,0,0.5)',
                'body-bg-gradient': 'linear-gradient(-45deg, #7c2d12, #9f1239, #c2410c, #a16207)'
            },
            plotly: {
                paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(255,255,255,0.05)',
                font_color: '#fff7ed', grid_color: 'rgba(251,191,36,0.15)',
                colorscale_heatmap: 'Hot',
                trace_colors: ['#fbbf24', '#fb923c', '#f87171', '#c084fc', '#34d399', '#38bdf8']
            }
        },
        'lavender': {
            name: 'Лаванда', icon: '💜',
            site: {
                '--bg-primary': '#3b0764', '--bg-secondary': '#4c1d95',
                '--bg-card': 'rgba(76,29,149,0.95)', '--bg-card-hover': 'rgba(91,33,182,1)',
                '--text-primary': '#faf5ff', '--text-secondary': '#c4b5fd', '--text-muted': '#a78bfa',
                '--accent-primary': '#e879f9', '--accent-secondary': '#d946ef',
                '--accent-success': '#34d399', '--accent-warning': '#fbbf24', '--accent-danger': '#fb7185',
                '--border-color': 'rgba(232,121,249,0.15)', '--border-hover': '#e879f9',
                '--shadow-sm': '0 4px 12px rgba(0,0,0,0.3)', '--shadow-md': '0 10px 30px rgba(0,0,0,0.4)', '--shadow-lg': '0 20px 40px rgba(0,0,0,0.5)',
                'body-bg-gradient': 'linear-gradient(-45deg, #3b0764, #581c87, #6b21a8, #4c1d95)'
            },
            plotly: {
                paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(255,255,255,0.05)',
                font_color: '#faf5ff', grid_color: 'rgba(232,121,249,0.15)',
                colorscale_heatmap: 'Purples',
                trace_colors: ['#e879f9', '#c084fc', '#fbbf24', '#34d399', '#fb923c', '#38bdf8']
            }
        },
        'rose': {
            name: 'Роза', icon: '🌹',
            site: {
                '--bg-primary': '#881337', '--bg-secondary': '#9f1239',
                '--bg-card': 'rgba(159,18,57,0.95)', '--bg-card-hover': 'rgba(190,24,93,1)',
                '--text-primary': '#fff1f2', '--text-secondary': '#fda4af', '--text-muted': '#fb7185',
                '--accent-primary': '#f472b6', '--accent-secondary': '#ec4899',
                '--accent-success': '#34d399', '--accent-warning': '#fbbf24', '--accent-danger': '#fca5a5',
                '--border-color': 'rgba(244,114,182,0.15)', '--border-hover': '#f472b6',
                '--shadow-sm': '0 4px 12px rgba(0,0,0,0.3)', '--shadow-md': '0 10px 30px rgba(0,0,0,0.4)', '--shadow-lg': '0 20px 40px rgba(0,0,0,0.5)',
                'body-bg-gradient': 'linear-gradient(-45deg, #881337, #9f1239, #be185d, #9f1239)'
            },
            plotly: {
                paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(255,255,255,0.05)',
                font_color: '#fff1f2', grid_color: 'rgba(244,114,182,0.15)',
                colorscale_heatmap: 'RdPu',
                trace_colors: ['#f472b6', '#fb7185', '#fbbf24', '#38bdf8', '#a78bfa', '#34d399']
            }
        },
        'arctic': {
            name: 'Арктика', icon: '❄️',
            site: {
                '--bg-primary': '#f0f9ff', '--bg-secondary': '#e0f2fe',
                '--bg-card': 'rgba(240,249,255,0.98)', '--bg-card-hover': 'rgba(224,242,254,1)',
                '--text-primary': '#0c4a6e', '--text-secondary': '#0369a1', '--text-muted': '#0284c7',
                '--accent-primary': '#0284c7', '--accent-secondary': '#0ea5e9',
                '--accent-success': '#059669', '--accent-warning': '#d97706', '--accent-danger': '#dc2626',
                '--border-color': 'rgba(2,132,199,0.12)', '--border-hover': '#0284c7',
                '--shadow-sm': '0 4px 12px rgba(0,0,0,0.06)', '--shadow-md': '0 10px 30px rgba(0,0,0,0.08)', '--shadow-lg': '0 20px 40px rgba(0,0,0,0.1)',
                'body-bg-gradient': 'linear-gradient(-45deg, #e0f2fe, #bae6fd, #e0f2fe, #bae6fd)'
            },
            plotly: {
                paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0.02)',
                font_color: '#0c4a6e', grid_color: 'rgba(2,132,199,0.1)',
                colorscale_heatmap: 'Blues',
                trace_colors: ['#0284c7', '#059669', '#d97706', '#7c3aed', '#dc2626', '#0891b2']
            }
        },
        'ember': {
            name: 'Тлеющие угли', icon: '🔥',
            site: {
                '--bg-primary': '#1c1917', '--bg-secondary': '#292524',
                '--bg-card': 'rgba(41,37,36,0.98)', '--bg-card-hover': 'rgba(68,64,60,1)',
                '--text-primary': '#fafaf9', '--text-secondary': '#a8a29e', '--text-muted': '#78716c',
                '--accent-primary': '#ef4444', '--accent-secondary': '#f97316',
                '--accent-success': '#22c55e', '--accent-warning': '#eab308', '--accent-danger': '#ef4444',
                '--border-color': 'rgba(239,68,68,0.15)', '--border-hover': '#ef4444',
                '--shadow-sm': '0 4px 12px rgba(0,0,0,0.4)', '--shadow-md': '0 10px 30px rgba(0,0,0,0.5)', '--shadow-lg': '0 20px 40px rgba(0,0,0,0.6)',
                'body-bg-gradient': 'linear-gradient(-45deg, #1c1917, #292524, #44403c, #1c1917)'
            },
            plotly: {
                paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(255,255,255,0.03)',
                font_color: '#fafaf9', grid_color: 'rgba(239,68,68,0.12)',
                colorscale_heatmap: 'Inferno',
                trace_colors: ['#ef4444', '#f97316', '#eab308', '#22c55e', '#38bdf8', '#a78bfa']
            }
        },
        'monochrome': {
            name: 'Монохром', icon: '⬛',
            site: {
                '--bg-primary': '#18181b', '--bg-secondary': '#27272a',
                '--bg-card': 'rgba(39,39,42,0.98)', '--bg-card-hover': 'rgba(63,63,70,1)',
                '--text-primary': '#fafafa', '--text-secondary': '#a1a1aa', '--text-muted': '#71717a',
                '--accent-primary': '#d4d4d8', '--accent-secondary': '#a1a1aa',
                '--accent-success': '#86efac', '--accent-warning': '#fde047', '--accent-danger': '#fca5a5',
                '--border-color': 'rgba(161,161,170,0.15)', '--border-hover': '#d4d4d8',
                '--shadow-sm': '0 4px 12px rgba(0,0,0,0.4)', '--shadow-md': '0 10px 30px rgba(0,0,0,0.5)', '--shadow-lg': '0 20px 40px rgba(0,0,0,0.6)',
                'body-bg-gradient': 'linear-gradient(-45deg, #18181b, #27272a, #3f3f46, #27272a)'
            },
            plotly: {
                paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(255,255,255,0.03)',
                font_color: '#e4e4e7', grid_color: 'rgba(161,161,170,0.12)',
                colorscale_heatmap: 'Greys',
                trace_colors: ['#e4e4e7', '#a1a1aa', '#71717a', '#d4d4d8', '#f4f4f5', '#52525b']
            }
        },
        'matrix': {
            name: 'Матрица', icon: '🟢',
            site: {
                '--bg-primary': '#000a00', '--bg-secondary': '#001200',
                '--bg-card': 'rgba(0,18,0,0.92)', '--bg-card-hover': 'rgba(0,40,0,0.95)',
                '--text-primary': '#00ff41', '--text-secondary': '#00cc33', '--text-muted': '#009926',
                '--accent-primary': '#00ff41', '--accent-secondary': '#39ff14',
                '--accent-success': '#39ff14', '--accent-warning': '#aaff00', '--accent-danger': '#ff3333',
                '--border-color': 'rgba(0,255,65,0.12)', '--border-hover': '#00ff41',
                '--shadow-sm': '0 4px 12px rgba(0,255,65,0.08)', '--shadow-md': '0 10px 30px rgba(0,255,65,0.12)', '--shadow-lg': '0 20px 40px rgba(0,255,65,0.18)',
                'body-bg-gradient': 'linear-gradient(-45deg, #000a00, #001a00, #000f00, #001200)'
            },
            plotly: {
                paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,255,65,0.04)',
                font_color: '#00ff41', grid_color: 'rgba(0,255,65,0.1)',
                colorscale_heatmap: 'YlGn',
                trace_colors: ['#00ff41', '#39ff14', '#aaff00', '#00cc33', '#66ff66', '#33cc33']
            }
        },
        'neon': {
            name: 'Неон', icon: '💜',
            site: {
                '--bg-primary': '#0a0015', '--bg-secondary': '#120024',
                '--bg-card': 'rgba(18,0,36,0.95)', '--bg-card-hover': 'rgba(30,0,60,0.98)',
                '--text-primary': '#f0e6ff', '--text-secondary': '#c9a8ff', '--text-muted': '#9370db',
                '--accent-primary': '#ff00ff', '--accent-secondary': '#00ffff',
                '--accent-success': '#00ff88', '--accent-warning': '#ffff00', '--accent-danger': '#ff0044',
                '--border-color': 'rgba(255,0,255,0.12)', '--border-hover': '#ff00ff',
                '--shadow-sm': '0 4px 12px rgba(255,0,255,0.1)', '--shadow-md': '0 10px 30px rgba(255,0,255,0.15)', '--shadow-lg': '0 20px 40px rgba(255,0,255,0.22)',
                'body-bg-gradient': 'linear-gradient(-45deg, #0a0015, #1a002e, #0a0015, #00102e)'
            },
            plotly: {
                paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(255,0,255,0.04)',
                font_color: '#e0ccff', grid_color: 'rgba(255,0,255,0.08)',
                colorscale_heatmap: 'Electric',
                trace_colors: ['#ff00ff', '#00ffff', '#ffff00', '#ff0088', '#00ff88', '#8800ff']
            }
        },
        'cyberpunk': {
            name: 'Киберпанк', icon: '🤖',
            site: {
                '--bg-primary': '#0d0221', '--bg-secondary': '#1a0a3e',
                '--bg-card': 'rgba(26,10,62,0.95)', '--bg-card-hover': 'rgba(45,20,100,0.98)',
                '--text-primary': '#ffeaa7', '--text-secondary': '#dfe6e9', '--text-muted': '#b2bec3',
                '--accent-primary': '#e91e63', '--accent-secondary': '#ff5722',
                '--accent-success': '#00e676', '--accent-warning': '#ffea00', '--accent-danger': '#ff1744',
                '--border-color': 'rgba(233,30,99,0.15)', '--border-hover': '#e91e63',
                '--shadow-sm': '0 4px 12px rgba(233,30,99,0.1)', '--shadow-md': '0 10px 30px rgba(233,30,99,0.15)', '--shadow-lg': '0 20px 40px rgba(233,30,99,0.22)',
                'body-bg-gradient': 'linear-gradient(-45deg, #0d0221, #1a0a3e, #2d1b69, #0d0221)'
            },
            plotly: {
                paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(233,30,99,0.04)',
                font_color: '#ffeaa7', grid_color: 'rgba(233,30,99,0.1)',
                colorscale_heatmap: 'Plasma',
                trace_colors: ['#e91e63', '#00e676', '#ffea00', '#00bcd4', '#ff5722', '#d500f9']
            }
        },
        'terminal': {
            name: 'Терминал', icon: '💻',
            site: {
                '--bg-primary': '#0c0c0c', '--bg-secondary': '#1a1a1a',
                '--bg-card': 'rgba(26,26,26,0.98)', '--bg-card-hover': 'rgba(40,40,40,1)',
                '--text-primary': '#33ff33', '--text-secondary': '#00cc00', '--text-muted': '#009900',
                '--accent-primary': '#33ff33', '--accent-secondary': '#00ff66',
                '--accent-success': '#00ff88', '--accent-warning': '#ffff00', '--accent-danger': '#ff0000',
                '--border-color': 'rgba(51,255,51,0.12)', '--border-hover': '#33ff33',
                '--shadow-sm': '0 4px 12px rgba(51,255,51,0.06)', '--shadow-md': '0 10px 30px rgba(51,255,51,0.1)', '--shadow-lg': '0 20px 40px rgba(51,255,51,0.15)',
                'body-bg-gradient': 'linear-gradient(-45deg, #0c0c0c, #1a1a1a, #0c0c0c, #1a1a1a)'
            },
            plotly: {
                paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(51,255,51,0.03)',
                font_color: '#33ff33', grid_color: 'rgba(51,255,51,0.08)',
                colorscale_heatmap: 'Greens',
                trace_colors: ['#33ff33', '#00cc00', '#66ff66', '#00ff66', '#009900', '#99ff99']
            }
        },
        'amber': {
            name: 'Янтарь', icon: '🟠',
            site: {
                '--bg-primary': '#1a120b', '--bg-secondary': '#2a1f0e',
                '--bg-card': 'rgba(42,31,14,0.95)', '--bg-card-hover': 'rgba(60,45,20,0.98)',
                '--text-primary': '#fef3c7', '--text-secondary': '#fcd34d', '--text-muted': '#d97706',
                '--accent-primary': '#f59e0b', '--accent-secondary': '#fbbf24',
                '--accent-success': '#84cc16', '--accent-warning': '#fde047', '--accent-danger': '#ef4444',
                '--border-color': 'rgba(245,158,11,0.15)', '--border-hover': '#f59e0b',
                '--shadow-sm': '0 4px 12px rgba(245,158,11,0.08)', '--shadow-md': '0 10px 30px rgba(245,158,11,0.12)', '--shadow-lg': '0 20px 40px rgba(245,158,11,0.18)',
                'body-bg-gradient': 'linear-gradient(-45deg, #1a120b, #2a1f0e, #443214, #1a120b)'
            },
            plotly: {
                paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(245,158,11,0.04)',
                font_color: '#fef3c7', grid_color: 'rgba(245,158,11,0.08)',
                colorscale_heatmap: 'YlOrBr',
                trace_colors: ['#f59e0b', '#fbbf24', '#fde047', '#d97706', '#84cc16', '#ef4444']
            }
        }
    };

    function getAll() {
        return Object.entries(THEMES).map(([id, t]) => ({ id, name: t.name, icon: t.icon }));
    }

    function apply(themeId) {
        const theme = THEMES[themeId];
        if (!theme) { console.warn(`Тема "${themeId}" не найдена`); return; }

        const root = document.documentElement;
        Object.entries(theme.site).forEach(([key, value]) => {
            if (key === 'body-bg-gradient') {
                document.body.style.background = value;
                document.body.style.backgroundSize = '400% 400%';
                document.body.style.animation = 'gradientBG 15s ease infinite';
            } else {
                root.style.setProperty(key, value);
            }
        });

        localStorage.setItem('hermenius_theme', themeId);
        document.dispatchEvent(new CustomEvent('themeChanged', { detail: { themeId, plotly: theme.plotly } }));
        return theme.plotly;
    }

    function getCurrent() { return localStorage.getItem('hermenius_theme') || 'classic-light'; }
    function getPlotlyConfig() { const t = THEMES[getCurrent()]; return t ? t.plotly : THEMES['classic-light'].plotly; }
    function init() { apply(getCurrent()); }

    return { getAll, apply, getCurrent, getPlotlyConfig, init, THEMES };
})();
