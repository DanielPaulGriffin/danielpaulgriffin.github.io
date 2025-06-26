export const keys = {};

let openPanelBtn, closePanelBtn;
let sidePanel, openPanel, closePanel, gameRunningGetter;

function isTouchDevice() {
    return (
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        navigator.msMaxTouchPoints > 0
    );
}

export function initControls(options = {}) {
    // Keyboard input handling
    window.addEventListener('keydown', e => {
        keys[e.key] = true;
    });

    window.addEventListener('keyup', e => {
        keys[e.key] = false;
    });

    // Save references for panel/game state
    sidePanel = options.sidePanel;
    openPanel = options.openPanel;
    closePanel = options.closePanel;
    gameRunningGetter = options.gameRunningGetter;

    // Create touch controls and panel buttons for mobile
    if (isTouchDevice()) {
        createTouchControls();
        createMobilePanelButtons();
        updateMobilePanelButtons();
    }
}

function createTouchControls() {
    if (document.getElementById('controls')) return; // Prevent duplicates

    const controls = document.createElement('div');
    controls.id = 'controls';

    controls.innerHTML = `
        <div class="control-btn" id="left">&#8592;</div>
        <div class="control-btn" id="up">&#8593;</div>
        <div class="control-btn" id="right">&#8594;</div>
    `;

    document.body.appendChild(controls);

    // Add touch event listeners for WASD keys
    document.getElementById('left').addEventListener('touchstart', () => keys['a'] = true);
    document.getElementById('left').addEventListener('touchend', () => keys['a'] = false);

    document.getElementById('up').addEventListener('touchstart', () => keys['w'] = true);
    document.getElementById('up').addEventListener('touchend', () => keys['w'] = false);

    document.getElementById('right').addEventListener('touchstart', () => keys['d'] = true);
    document.getElementById('right').addEventListener('touchend', () => keys['d'] = false);
}

function createMobilePanelButtons() {
    if (document.getElementById('open-panel-btn') || document.getElementById('close-panel-btn')) return;

    openPanelBtn = document.createElement('button');
    openPanelBtn.id = 'open-panel-btn';
    openPanelBtn.textContent = '☰ Website';

    closePanelBtn = document.createElement('button');
    closePanelBtn.id = 'close-panel-btn';
    closePanelBtn.textContent = '▶ Play';

    // Style and position buttons
    openPanelBtn.style.position = 'fixed';
    openPanelBtn.style.top = '24px';
    openPanelBtn.style.left = '24px';
    openPanelBtn.style.zIndex = '3000';
    openPanelBtn.style.padding = '1em 1.5em';
    openPanelBtn.style.fontSize = '1.2em';
    openPanelBtn.style.borderRadius = '2em';
    openPanelBtn.style.background = 'var(--poly-fill-color, #181818)';
    openPanelBtn.style.color = 'var(--line-color, #16f110)';
    openPanelBtn.style.border = '2px solid var(--line-color, #16f110)';
    openPanelBtn.style.display = 'none';

    closePanelBtn.style.position = 'fixed';
    closePanelBtn.style.bottom = '24px';
    closePanelBtn.style.right = '24px';
    closePanelBtn.style.zIndex = '3000';
    closePanelBtn.style.padding = '1em 1.5em';
    closePanelBtn.style.fontSize = '1.2em';
    closePanelBtn.style.borderRadius = '2em';
    closePanelBtn.style.background = 'var(--poly-fill-color, #181818)';
    closePanelBtn.style.color = 'var(--line-color, #16f110)';
    closePanelBtn.style.border = '2px solid var(--line-color, #16f110)';
    closePanelBtn.style.display = 'none';

    document.body.appendChild(openPanelBtn);
    document.body.appendChild(closePanelBtn);

    openPanelBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (openPanel) openPanel();
        updateMobilePanelButtons();
    });

    closePanelBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (closePanel) closePanel();
        updateMobilePanelButtons();
    });
}

export function updateMobilePanelButtons() {
    if (!isTouchDevice() || !openPanelBtn || !closePanelBtn || !sidePanel || !gameRunningGetter) {
        if (openPanelBtn) openPanelBtn.style.display = 'none';
        if (closePanelBtn) closePanelBtn.style.display = 'none';
        return;
    }
    if (sidePanel.classList.contains('open')) {
        openPanelBtn.style.display = 'none';
        closePanelBtn.style.display = 'block';
    } else if (gameRunningGetter()) {
        openPanelBtn.style.display = 'block';
        closePanelBtn.style.display = 'none';
    } else {
        openPanelBtn.style.display = 'none';
        closePanelBtn.style.display = 'none';
    }
}
