const SETTINGS_JSON_URL = './settings.json';

let settings = [];
let values = {};

function getParentUrl() {
    const currentUrl = window.location.href.split('?')[0];
    const urlParts = currentUrl.split('/');
    urlParts.pop();
    urlParts.pop();
    return urlParts.join('/') + '/';
}

function buildQueryString() {
    return settings.map(s => `${encodeURIComponent(s.id)}=${encodeURIComponent(values[s.id])}`).join('&');
}

function getWidgetUrl() {
    return `${getParentUrl()}?${buildQueryString()}`;
}

function updateWidget() {
    document.getElementById('widget').src = getWidgetUrl();
}

function copyUrl() {
    navigator.clipboard.writeText(getWidgetUrl()).then(() => {
        const btn = document.getElementById('copy-btn');
        btn.textContent = 'Copied!';
        btn.classList.add('copied');
        setTimeout(() => { btn.textContent = 'Copy Widget URL'; btn.classList.remove('copied'); }, 2000);
    });
}

function makeControl(s) {
    switch (s.type) {
        case 'checkbox': {
            const label = document.createElement('label');
            label.className = 'toggle';
            const input = document.createElement('input');
            input.type = 'checkbox';
            input.checked = s.defaultValue;
            input.addEventListener('change', () => { values[s.id] = input.checked; updateWidget(); });
            const track = document.createElement('div'); track.className = 'toggle-track';
            const thumb = document.createElement('div'); thumb.className = 'toggle-thumb';
            label.append(input, track, thumb);
            return label;
        }
        case 'color': {
            const input = document.createElement('input');
            input.type = 'color'; input.value = s.defaultValue;
            input.addEventListener('input', () => { values[s.id] = input.value; updateWidget(); });
            return input;
        }
        case 'number': {
            const input = document.createElement('input');
            input.type = 'number'; input.value = s.defaultValue;
            if (s.min !== undefined) input.min = s.min;
            if (s.max !== undefined) input.max = s.max;
            input.addEventListener('input', () => { values[s.id] = input.value; updateWidget(); });
            return input;
        }
        case 'select': {
            const sel = document.createElement('select');
            s.options.forEach(opt => {
                const o = document.createElement('option');
                o.value = opt.value; o.textContent = opt.label;
                if (opt.value === s.defaultValue) o.selected = true;
                sel.appendChild(o);
            });
            sel.addEventListener('change', () => { values[s.id] = sel.value; updateWidget(); });
            return sel;
        }
        default: {
            const input = document.createElement('input');
            input.type = 'text'; input.value = s.defaultValue;
            input.addEventListener('input', () => { values[s.id] = input.value; updateWidget(); });
            return input;
        }
    }
}

async function init() {
    const res = await fetch(SETTINGS_JSON_URL);
    const json = await res.json();
    settings = json.settings;
    settings.forEach(s => { values[s.id] = s.defaultValue; });

    const scroll = document.getElementById('settings-scroll');
    const groups = {};
    settings.forEach(s => { if (!groups[s.group]) groups[s.group] = []; groups[s.group].push(s); });

    Object.entries(groups).forEach(([group, items]) => {
        const label = document.createElement('div');
        label.className = 'group-label';
        label.textContent = group;
        scroll.appendChild(label);

        items.forEach(s => {
            const row = document.createElement('div');
            row.className = 'setting-row';
            const left = document.createElement('div');
            left.innerHTML = `<div class="setting-label">${s.label}</div>${s.description ? `<div class="setting-desc">${s.description}</div>` : ''}`;
            row.append(left, makeControl(s));
            scroll.appendChild(row);
        });
    });

    updateWidget();
}

init();