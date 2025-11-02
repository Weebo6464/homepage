// Hall of Fame data - will be loaded from JSON
let fameData = [];

// Theme management
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'auto';
    applyTheme(savedTheme);
    updateThemeButtons(savedTheme);
}

function applyTheme(theme) {
    if (theme === 'auto') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.body.classList.toggle('light-mode', !prefersDark);
    } else {
        document.body.classList.toggle('light-mode', theme === 'light');
    }

    const icon = document.querySelector('.theme-icon');
    if (icon) {
        icon.textContent = theme === 'light' ? '☀️' : theme === 'dark' ? '🌙' : '💻';
    }
}

function updateThemeButtons(activeTheme) {
    document.querySelectorAll('.theme-option').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === activeTheme);
    });
}

// Load fame data from JSON
async function loadFameData() {
    try {
        const response = await fetch('fame.json');
        fameData = await response.json();
        renderFameCards();
    } catch (error) {
        console.error('Error loading fame data:', error);
        document.getElementById('fame-grid').innerHTML = '<p class="loading-message">Failed to load Hall of Fame data.</p>';
    }
}

// Render fame cards
function renderFameCards() {
    const grid = document.getElementById('fame-grid');

    if (!grid) return;

    if (fameData.length === 0) {
        grid.innerHTML = '<p class="loading-message">No achievements yet. Stay tuned for legendary moments!</p>';
        return;
    }

    grid.innerHTML = fameData.map((item, index) => `
        <div class="fame-card">
            <div class="fame-rank">#${index + 1}</div>
            <div class="fame-icon">${item.icon}</div>
            <h3 class="fame-title">${item.title}</h3>
            <p class="fame-date">${item.date}</p>
            <p class="fame-description">${item.description}</p>
            ${item.images && item.images.length > 0 ? `
                <div class="fame-images">
                    ${item.images.map(img => `
                        <img src="${img}" alt="${item.title}" class="fame-image" onclick="openImageModal('${img}')">
                    `).join('')}
                </div>
            ` : ''}
            <div class="fame-participants">
                ${item.participants.map(p => `<span class="participant-tag">${p}</span>`).join('')}
            </div>
        </div>
    `).join('');
}

// Image modal functionality
function openImageModal(imageSrc) {
    const modal = document.createElement('div');
    modal.className = 'image-modal';
    modal.innerHTML = `
        <div class="modal-backdrop" onclick="this.parentElement.remove()"></div>
        <div class="modal-content">
            <button class="modal-close" onclick="this.parentElement.parentElement.remove()">✕</button>
            <img src="${imageSrc}" alt="Hall of Fame Image">
        </div>
    `;
    document.body.appendChild(modal);

    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';

    // Close on Escape key
    const closeModal = (e) => {
        if (e.key === 'Escape') {
            modal.remove();
            document.body.style.overflow = '';
            document.removeEventListener('keydown', closeModal);
        }
    };
    document.addEventListener('keydown', closeModal);

    // Restore scroll when modal is removed
    modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.classList.contains('modal-backdrop')) {
            document.body.style.overflow = '';
        }
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Hide loading screen
    setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
        }
    }, 500);

    // Initialize theme
    initTheme();

    // Load and render fame cards
    loadFameData();

    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    const themeMenu = document.getElementById('theme-menu');

    if (themeToggle && themeMenu) {
        themeToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            themeMenu.classList.toggle('active');
        });

        document.addEventListener('click', () => {
            themeMenu.classList.remove('active');
        });

        themeMenu.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    // Theme options
    document.querySelectorAll('.theme-option').forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.dataset.theme;
            localStorage.setItem('theme', theme);
            applyTheme(theme);
            updateThemeButtons(theme);
            if (themeMenu) {
                themeMenu.classList.remove('active');
            }
        });
    });

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        const savedTheme = localStorage.getItem('theme') || 'auto';
        if (savedTheme === 'auto') {
            applyTheme('auto');
        }
    });
});
