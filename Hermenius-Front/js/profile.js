document.addEventListener('DOMContentLoaded', function () {
    loadUserData();

    const datasets = [
        {
            id: 'iris',
            name: 'Iris',
            meta: '150 строк, 5 колонок',
            color: '#10b981',
            colorEnd: '#06b6d4'
        },
        {
            id: 'students',
            name: 'Students',
            meta: '395 строк, 33 колонки',
            color: '#0078e7',
            colorEnd: '#8b5cf6'
        },
        {
            id: 'titanic',
            name: 'Titanic',
            meta: '890 строк, 12 колонок',
            color: '#f59e0b',
            colorEnd: '#ef4444'
        }
    ];

    const wheel = document.getElementById('projectWheel');
    const wheelSelected = document.getElementById('wheelSelected');
    const searchInput = document.getElementById('searchInput');

    if (!wheel) return;

    const SECTOR_ANGLE = 360 / datasets.length;
    const WHEEL_CENTER = 200;
    const INNER_RADIUS = 70;
    const LABEL_RADIUS = (WHEEL_CENTER + INNER_RADIUS) / 2;

    createWheel();
    initWheelInteraction();
    initSearch();
    initUploadModal();

    function createWheel() {
        const stops = datasets.map((ds, i) => {
            const start = i * SECTOR_ANGLE;
            const end = (i + 1) * SECTOR_ANGLE;
            return `${ds.color} ${start}deg ${end}deg`;
        });
        wheel.style.background = `conic-gradient(from 0deg, ${stops.join(', ')})`;

        const highlight = document.createElement('div');
        highlight.id = 'wheelHighlight';
        highlight.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;border-radius:50%;pointer-events:none;transition:opacity 0.2s;opacity:0;';
        wheel.appendChild(highlight);

        datasets.forEach((_, i) => {
            const lineAngle = i * SECTOR_ANGLE * Math.PI / 180;
            const line = document.createElement('div');
            line.style.cssText = `position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;`;
            line.style.transformOrigin = '50% 50%';
            line.style.transform = `rotate(${i * SECTOR_ANGLE}deg)`;

            const lineInner = document.createElement('div');
            lineInner.style.cssText = `position:absolute;top:0;left:50%;width:2px;height:${WHEEL_CENTER}px;background:white;transform:translateX(-50%);opacity:0.7;`;
            line.appendChild(lineInner);
            wheel.appendChild(line);
        });

        datasets.forEach((dataset, index) => {
            const midAngleDeg = index * SECTOR_ANGLE + SECTOR_ANGLE / 2;
            const midAngleRad = midAngleDeg * Math.PI / 180;

            const x = WHEEL_CENTER + Math.sin(midAngleRad) * LABEL_RADIUS;
            const y = WHEEL_CENTER - Math.cos(midAngleRad) * LABEL_RADIUS;

            const label = document.createElement('div');
            label.className = 'wheel-sector-label';
            label.dataset.index = index;
            label.innerHTML = `
                <div class="wheel-sector-name">${dataset.name}</div>
                <div class="wheel-sector-meta">${dataset.meta}</div>
            `;
            label.style.left = x + 'px';
            label.style.top = y + 'px';
            label.style.transform = 'translate(-50%, -50%)';
            wheel.appendChild(label);
        });
    }

    function initWheelInteraction() {
        let activeSectorIndex = null;

        wheel.addEventListener('mousemove', function (e) {
            const rect = wheel.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const dx = e.clientX - centerX;
            const dy = e.clientY - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            const innerBound = INNER_RADIUS * (rect.width / (WHEEL_CENTER * 2));
            if (distance < innerBound || distance > rect.width / 2) {
                resetSectors();
                activeSectorIndex = null;
                return;
            }

            let angle = Math.atan2(dx, -dy) * (180 / Math.PI);
            if (angle < 0) angle += 360;

            let sectorIndex = Math.floor(angle / SECTOR_ANGLE);
            if (sectorIndex >= datasets.length) sectorIndex = 0;

            if (activeSectorIndex !== sectorIndex) {
                updateActiveSector(sectorIndex);
                activeSectorIndex = sectorIndex;
            }
        });

        wheel.addEventListener('mouseleave', function () {
            resetSectors();
            activeSectorIndex = null;
        });

        wheel.addEventListener('click', function () {
            if (activeSectorIndex !== null) {
                const dataset = datasets[activeSectorIndex];
                analyzeSampleDataset(dataset);
            }
        });

        function updateActiveSector(index) {
            const highlight = document.getElementById('wheelHighlight');
            if (highlight) {
                const start = index * SECTOR_ANGLE;
                const end = (index + 1) * SECTOR_ANGLE;
                highlight.style.background = `conic-gradient(from 0deg, rgba(0,0,0,0.35) 0deg ${start}deg, transparent ${start}deg ${end}deg, rgba(0,0,0,0.35) ${end}deg 360deg)`;
                highlight.style.opacity = '1';
            }

            const labels = wheel.querySelectorAll('.wheel-sector-label');
            labels.forEach((l, i) => {
                l.style.opacity = i === index ? '1' : '0.35';
                l.style.transform = `translate(-50%, -50%) scale(${i === index ? 1.08 : 1})`;
            });

            wheelSelected.textContent = datasets[index].name;
        }

        function resetSectors() {
            const highlight = document.getElementById('wheelHighlight');
            if (highlight) highlight.style.opacity = '0';

            const labels = wheel.querySelectorAll('.wheel-sector-label');
            labels.forEach(l => {
                l.style.opacity = '1';
                l.style.transform = 'translate(-50%, -50%) scale(1)';
            });

            wheelSelected.textContent = '—';
        }
    }

    function initSearch() {
        if (!searchInput) return;
        searchInput.addEventListener('input', function () {
            const query = this.value.toLowerCase().trim();
            const labels = wheel.querySelectorAll('.wheel-sector-label');

            datasets.forEach((dataset, index) => {
                const matches = dataset.name.toLowerCase().includes(query) || dataset.meta.toLowerCase().includes(query);
                if (query && !matches) {
                    labels[index].style.opacity = '0.15';
                } else {
                    labels[index].style.opacity = '1';
                }
            });
        });
    }

    async function analyzeSampleDataset(dataset) {
        showLoading(`Анализирую "${dataset.name}"...`, `Отправка данных в API`);

        try {
            const modelName = 'Llama';
            const result = await HermeniusAPI.analyzeDataset(dataset.id, modelName, 'ru');
            HermeniusAPI.storeAnalysisResult(result);
            window.location.href = 'project.html?dataset=' + dataset.id;
        } catch (error) {
            hideLoading();
            alert('Ошибка анализа: ' + error.message);
            console.error(error);
        }
    }

    function initUploadModal() {
        const modal = document.getElementById('uploadModal');
        const openBtn = document.getElementById('newProjectBtn');
        const closeBtn = document.getElementById('uploadModalClose');
        const cancelBtn = document.getElementById('cancelBtn');
        const analyzeBtn = document.getElementById('analyzeBtn');
        const uploadZone = document.getElementById('uploadZone');
        const fileInput = document.getElementById('fileInput');
        const fileInfo = document.getElementById('fileInfo');
        const fileNameEl = document.getElementById('fileName');
        const fileSizeEl = document.getElementById('fileSize');

        let selectedFile = null;

        if (!modal || !openBtn) return;

        openBtn.addEventListener('click', () => openModal());
        closeBtn.addEventListener('click', () => closeModal());
        cancelBtn.addEventListener('click', () => closeModal());

        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        uploadZone.addEventListener('click', () => fileInput.click());

        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.classList.add('dragover');
        });

        uploadZone.addEventListener('dragleave', () => {
            uploadZone.classList.remove('dragover');
        });

        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) handleFile(files[0]);
        });

        fileInput.addEventListener('change', () => {
            if (fileInput.files.length > 0) handleFile(fileInput.files[0]);
        });

        function handleFile(file) {
            selectedFile = file;
            fileNameEl.textContent = file.name;
            fileSizeEl.textContent = formatFileSize(file.size);
            fileInfo.classList.add('visible');
            uploadZone.style.display = 'none';
            analyzeBtn.disabled = false;
        }

        analyzeBtn.addEventListener('click', async () => {
            if (!selectedFile) return;

            const modelName = document.getElementById('modelSelect').value;
            closeModal();

            showLoading(`Анализирую "${selectedFile.name}"...`, `Отправка данных в API`);

            try {
                const result = await HermeniusAPI.analyzeFile(selectedFile, modelName, 'ru');
                HermeniusAPI.storeAnalysisResult(result);
                window.location.href = 'project.html?custom=true';
            } catch (error) {
                hideLoading();
                alert('Ошибка анализа: ' + error.message);
                console.error(error);
            }
        });

        function openModal() {
            modal.classList.add('active');
            resetModal();
        }

        function closeModal() {
            modal.classList.remove('active');
        }

        function resetModal() {
            selectedFile = null;
            fileInput.value = '';
            fileInfo.classList.remove('visible');
            uploadZone.style.display = '';
            analyzeBtn.disabled = true;
        }
    }

    function showLoading(text, subtext) {
        const overlay = document.getElementById('loadingOverlay');
        const loadingText = document.getElementById('loadingText');
        const loadingSubtext = document.getElementById('loadingSubtext');
        if (overlay) overlay.style.display = '';
        if (loadingText) loadingText.textContent = text;
        if (loadingSubtext) loadingSubtext.textContent = subtext || '';
    }

    function hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) overlay.style.display = 'none';
    }

    function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' Б';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' КБ';
        return (bytes / (1024 * 1024)).toFixed(1) + ' МБ';
    }

    console.log('Hermenius: Profile module loaded');
});
