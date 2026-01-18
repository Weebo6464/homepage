const themeToggle = document.getElementById('theme-toggle');
const themeMenu = document.getElementById('theme-menu');
const themeOptions = document.querySelectorAll('.theme-option');
const themeIcon = document.querySelector('.theme-icon');
let currentTheme = localStorage.getItem('theme') || 'auto';

function applyTheme(theme) {
    if (theme === 'auto') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.body.classList.toggle('light-mode', !prefersDark);
        themeIcon.textContent = '💻';
    } else if (theme === 'light') {
        document.body.classList.add('light-mode');
        themeIcon.textContent = '☀️';
    } else {
        document.body.classList.remove('light-mode');
        themeIcon.textContent = '🌙';
    }
    themeOptions.forEach(option => {
        option.classList.toggle('active', option.dataset.theme === theme);
    });
    currentTheme = theme;
    localStorage.setItem('theme', theme);
}

applyTheme(currentTheme);

themeToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    themeMenu.classList.toggle('active');
});

document.addEventListener('click', () => {
    themeMenu.classList.remove('active');
});

themeOptions.forEach(option => {
    option.addEventListener('click', (e) => {
        e.stopPropagation();
        applyTheme(option.dataset.theme);
        themeMenu.classList.remove('active');
    });
});

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (currentTheme === 'auto') {
        applyTheme('auto');
    }
});

// Stars animation
if (typeof initStars === 'function') {
    initStars();
}

// Loading screen
window.addEventListener('load', () => {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 300);
    }
});

// Form handling
const form = document.getElementById('idea-form');

// Check for success parameter in URL
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('success') === 'true') {
    const formSection = document.querySelector('.form-section');
    formSection.innerHTML = `
        <div class="success-message">
            <div class="success-icon">✨</div>
            <h2>Thank you!</h2>
            <p>Your idea has been submitted successfully. I'll review it and get back to you if needed!</p>
            <a href="/ideas/" class="submit-btn" style="text-decoration: none; display: inline-block; margin-top: 20px;">
                <span class="submit-text">Submit Another Idea</span>
            </a>
        </div>
    `;
}

form.addEventListener('submit', (e) => {
    const submitBtn = form.querySelector('.submit-btn');
    const originalText = submitBtn.innerHTML;
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="submit-text">Submitting...</span><span class="submit-icon">⏳</span>';
    
    // Let Netlify handle the form submission
    // If not on Netlify, the form will fail gracefully
});
