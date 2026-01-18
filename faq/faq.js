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

// FAQ functionality
let faqData = [];

async function loadFAQ() {
    try {
        const response = await fetch('faq.json');
        if (!response.ok) throw new Error('Failed to load FAQ');
        faqData = await response.json();
        renderFAQ();
    } catch (error) {
        console.error('Error loading FAQ:', error);
        document.getElementById('faq-list').innerHTML = 
            '<div class="error-message">Failed to load FAQ. Please try again later.</div>';
    }
}

function renderFAQ() {
    const faqList = document.getElementById('faq-list');
    faqList.innerHTML = faqData.map((item, index) => `
        <div class="faq-item">
            <button class="faq-question" aria-expanded="false" data-index="${index}">
                <span class="faq-question-text">${item.question}</span>
                <span class="faq-icon">+</span>
            </button>
            <div class="faq-answer" aria-hidden="true">
                <div class="faq-answer-content">${item.answer}</div>
            </div>
        </div>
    `).join('');

    // Add click handlers
    document.querySelectorAll('.faq-question').forEach(button => {
        button.addEventListener('click', () => {
            const index = parseInt(button.dataset.index);
            const faqItem = button.closest('.faq-item');
            const answer = faqItem.querySelector('.faq-answer');
            const icon = button.querySelector('.faq-icon');
            const isExpanded = button.getAttribute('aria-expanded') === 'true';

            if (isExpanded) {
                button.setAttribute('aria-expanded', 'false');
                answer.setAttribute('aria-hidden', 'true');
                icon.textContent = '+';
                faqItem.classList.remove('active');
            } else {
                // Close all other items
                document.querySelectorAll('.faq-item').forEach(item => {
                    if (item !== faqItem) {
                        item.classList.remove('active');
                        const otherButton = item.querySelector('.faq-question');
                        const otherAnswer = item.querySelector('.faq-answer');
                        const otherIcon = item.querySelector('.faq-icon');
                        otherButton.setAttribute('aria-expanded', 'false');
                        otherAnswer.setAttribute('aria-hidden', 'true');
                        otherIcon.textContent = '+';
                    }
                });
                
                button.setAttribute('aria-expanded', 'true');
                answer.setAttribute('aria-hidden', 'false');
                icon.textContent = '−';
                faqItem.classList.add('active');
            }
        });
    });
}

loadFAQ();
