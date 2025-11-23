document.addEventListener('DOMContentLoaded', () => {
    // State
    const state = {
        headlines: ['Headline 1', 'Headline 2', 'Headline 3'],
        descriptions: ['Description 1', 'Description 2'],
        finalUrl: '',
        path1: '',
        path2: '',
        exportList: []
    };

    // DOM Elements
    const adForm = document.getElementById('adForm');
    const headlinesList = document.getElementById('headlinesList');
    const descriptionsList = document.getElementById('descriptionsList');
    const addHeadlineBtn = document.getElementById('addHeadlineBtn');
    const addDescBtn = document.getElementById('addDescBtn');
    const refreshPreviewBtn = document.getElementById('refreshPreviewBtn');
    const exportBtn = document.getElementById('exportBtn');
    const addToListBtn = document.getElementById('addToListBtn');
    const listCount = document.getElementById('listCount');
    const deviceBtns = document.querySelectorAll('.toggle-btn');
    const adPreview = document.getElementById('adPreview');

    // Preview Elements
    const previewDisplayUrl = document.getElementById('previewDisplayUrl');
    const previewPath = document.getElementById('previewPath');
    const previewHeadline = document.getElementById('previewHeadline');
    const previewDescription = document.getElementById('previewDescription');
    const favicon = document.getElementById('favicon');

    // Constants
    const MAX_HEADLINES = 15;
    const MAX_DESCRIPTIONS = 4;

    // Initialization
    renderInputs();
    updatePreview();

    // Event Listeners
    addHeadlineBtn.addEventListener('click', () => addAsset('headline'));
    addDescBtn.addEventListener('click', () => addAsset('description'));

    document.getElementById('finalUrl').addEventListener('input', (e) => {
        state.finalUrl = e.target.value;
        updatePreview();
    });

    document.getElementById('path1').addEventListener('input', (e) => {
        state.path1 = e.target.value;
        updatePreview();
    });

    document.getElementById('path2').addEventListener('input', (e) => {
        state.path2 = e.target.value;
        updatePreview();
    });

    refreshPreviewBtn.addEventListener('click', () => {
        // Add a small rotation animation
        refreshPreviewBtn.style.transform = 'rotate(360deg)';
        setTimeout(() => refreshPreviewBtn.style.transform = 'none', 300);
        updatePreview(true);
    });

    deviceBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            deviceBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const device = btn.dataset.device;
            if (device === 'mobile') {
                adPreview.classList.add('mobile');
            } else {
                adPreview.classList.remove('mobile');
            }
        });
    });

    addToListBtn.addEventListener('click', addToExportList);
    exportBtn.addEventListener('click', exportToCSV);

    // Functions
    function renderInputs() {
        // Render Headlines
        headlinesList.innerHTML = '';
        state.headlines.forEach((text, index) => {
            const div = createAssetInput('headline', text, index);
            headlinesList.appendChild(div);
        });
        document.getElementById('headlineCount').textContent = `${state.headlines.length}/${MAX_HEADLINES}`;
        addHeadlineBtn.style.display = state.headlines.length >= MAX_HEADLINES ? 'none' : 'block';

        // Render Descriptions
        descriptionsList.innerHTML = '';
        state.descriptions.forEach((text, index) => {
            const div = createAssetInput('description', text, index);
            descriptionsList.appendChild(div);
        });
        document.getElementById('descCount').textContent = `${state.descriptions.length}/${MAX_DESCRIPTIONS}`;
        addDescBtn.style.display = state.descriptions.length >= MAX_DESCRIPTIONS ? 'none' : 'block';
    }

    function createAssetInput(type, value, index) {
        const div = document.createElement('div');
        div.className = 'asset-item';

        const input = document.createElement('input');
        input.type = 'text';
        input.value = value;
        input.placeholder = type === 'headline' ? `Headline ${index + 1}` : `Description ${index + 1}`;
        input.maxLength = type === 'headline' ? 30 : 90;
        input.addEventListener('input', (e) => {
            if (type === 'headline') state.headlines[index] = e.target.value;
            else state.descriptions[index] = e.target.value;
            updatePreview();
        });

        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-btn';
        removeBtn.innerHTML = '&times;';
        removeBtn.title = 'Remove';
        removeBtn.addEventListener('click', () => {
            if (type === 'headline') {
                if (state.headlines.length > 1) {
                    state.headlines.splice(index, 1);
                    renderInputs();
                    updatePreview();
                }
            } else {
                if (state.descriptions.length > 1) {
                    state.descriptions.splice(index, 1);
                    renderInputs();
                    updatePreview();
                }
            }
        });

        div.appendChild(input);
        div.appendChild(removeBtn);
        return div;
    }

    function addAsset(type) {
        if (type === 'headline') {
            if (state.headlines.length < MAX_HEADLINES) {
                state.headlines.push('');
                renderInputs();
            }
        } else {
            if (state.descriptions.length < MAX_DESCRIPTIONS) {
                state.descriptions.push('');
                renderInputs();
            }
        }
    }

    function updatePreview(randomize = false) {
        // Update URL display
        let domain = 'example.com';
        try {
            if (state.finalUrl) {
                const url = new URL(state.finalUrl.startsWith('http') ? state.finalUrl : `https://${state.finalUrl}`);
                domain = url.hostname;
                favicon.src = `https://www.google.com/s2/favicons?domain=${domain}`;
            }
        } catch (e) {
            // Invalid URL, ignore
        }
        previewDisplayUrl.textContent = domain;

        // Update Path
        let pathText = '';
        if (state.path1) pathText += ` › ${state.path1}`;
        if (state.path2) pathText += ` › ${state.path2}`;
        previewPath.textContent = pathText;

        // Update Headlines
        // Google shows up to 3 headlines
        const filledHeadlines = state.headlines.filter(h => h.trim() !== '');
        let selectedHeadlines = [];

        if (filledHeadlines.length > 0) {
            if (randomize) {
                // Shuffle and pick 2 or 3
                const shuffled = [...filledHeadlines].sort(() => 0.5 - Math.random());
                const count = Math.random() > 0.5 ? 3 : 2;
                selectedHeadlines = shuffled.slice(0, count);
            } else {
                // Just pick first 3 for stability unless randomized
                selectedHeadlines = filledHeadlines.slice(0, 3);
            }
        } else {
            selectedHeadlines = ['Headline 1', 'Headline 2', 'Headline 3'];
        }
        previewHeadline.textContent = selectedHeadlines.join(' | ');

        // Update Descriptions
        // Google shows 1 or 2 descriptions
        const filledDescs = state.descriptions.filter(d => d.trim() !== '');
        let selectedDesc = '';

        if (filledDescs.length > 0) {
            if (randomize) {
                const shuffled = [...filledDescs].sort(() => 0.5 - Math.random());
                selectedDesc = shuffled[0];
            } else {
                selectedDesc = filledDescs[0];
            }
        } else {
            selectedDesc = 'Description text goes here. It should be long enough to demonstrate how it wraps on different devices.';
        }
        previewDescription.textContent = selectedDesc;
    }

    function addToExportList() {
        // Validate
        if (!state.finalUrl) {
            alert('Please enter a Final URL before adding to list.');
            return;
        }

        const adData = {
            'Final URL': state.finalUrl,
            'Path 1': state.path1,
            'Path 2': state.path2,
        };

        // Add headlines
        for (let i = 0; i < 15; i++) {
            adData[`Headline ${i + 1}`] = state.headlines[i] || '';
        }

        // Add descriptions
        for (let i = 0; i < 4; i++) {
            adData[`Description ${i + 1}`] = state.descriptions[i] || '';
        }

        state.exportList.push(adData);
        listCount.textContent = state.exportList.length;

        // Animation feedback
        addToListBtn.textContent = 'Added!';
        setTimeout(() => {
            addToListBtn.innerHTML = `Add to Export List <span class="badge" id="listCount">${state.exportList.length}</span>`;
            // Re-bind element since innerHTML replaced it
            document.getElementById('listCount').textContent = state.exportList.length;
        }, 1000);
    }

    function exportToCSV() {
        if (state.exportList.length === 0) {
            alert('No ads in the export list. Add some ads first!');
            return;
        }

        const headers = Object.keys(state.exportList[0]);
        const csvRows = [];

        // Header row
        csvRows.push(headers.join(','));

        // Data rows
        for (const row of state.exportList) {
            const values = headers.map(header => {
                const escaped = ('' + row[header]).replace(/"/g, '\\"');
                return `"${escaped}"`;
            });
            csvRows.push(values.join(','));
        }

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', 'google_ads_rsa_export.csv');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
});
