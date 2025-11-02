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

let allPosts = [];
let currentFilter = 'all';

async function loadPosts() {
    try {
        const response = await fetch('posts.json');
        const data = await response.json();
        allPosts = data.posts || data;
        
        allPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        const allTags = new Set();
        allPosts.forEach(post => {
            post.tags.forEach(tag => allTags.add(tag));
        });
        
        buildTagFilters(Array.from(allTags));
        
        displayPosts(allPosts);
    } catch (error) {
        console.error('Failed to load posts:', error);
        document.getElementById('blog-posts').innerHTML = '<div class="no-posts">Failed to load posts</div>';
    }
}

function buildTagFilters(tags) {
    const tagFilters = document.getElementById('tag-filters');
    
    const allButton = tagFilters.querySelector('[data-tag="all"]');
    
    tags.sort().forEach(tag => {
        const button = document.createElement('button');
        button.className = 'tag-filter';
        button.dataset.tag = tag;
        button.textContent = tag;
        button.addEventListener('click', () => filterByTag(tag));
        tagFilters.appendChild(button);
    });
    
    allButton.addEventListener('click', () => filterByTag('all'));
}

function filterByTag(tag) {
    currentFilter = tag;
    
    document.querySelectorAll('.tag-filter').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tag === tag);
    });
    
    if (tag === 'all') {
        displayPosts(allPosts);
    } else {
        const filtered = allPosts.filter(post => post.tags.includes(tag));
        displayPosts(filtered);
    }
}

function displayPosts(posts) {
    const container = document.getElementById('blog-posts');
    
    if (posts.length === 0) {
        container.innerHTML = '<div class="no-posts">No posts found</div>';
        return;
    }
    
    container.innerHTML = posts.map(post => {
        const content = escapeHtml(post.content);
        const isLong = content.length > 300;
        const preview = isLong ? content.substring(0, 300) + '...' : content;
        
        return `
            <article class="post-card" data-post-id="${post.id}">
                <div class="post-header">
                    <h2 class="post-title">${escapeHtml(post.title)}</h2>
                    <span class="post-date">${formatDate(post.date)}</span>
                </div>
                <div class="post-content">
                    <div class="post-preview">${preview}</div>
                    ${isLong ? `<div class="post-full" style="display: none;">${content}</div>` : ''}
                </div>
                ${isLong ? '<button class="read-more-btn" onclick="togglePost(this)">Read more →</button>' : ''}
                <div class="post-tags">
                    ${post.tags.map(tag => `<span class="post-tag">#${escapeHtml(tag)}</span>`).join('')}
                </div>
            </article>
        `;
    }).join('');
}

function togglePost(button) {
    const card = button.closest('.post-card');
    const preview = card.querySelector('.post-preview');
    const full = card.querySelector('.post-full');
    
    if (full.style.display === 'none') {
        preview.style.display = 'none';
        full.style.display = 'block';
        button.textContent = 'Show less ←';
    } else {
        preview.style.display = 'block';
        full.style.display = 'none';
        button.textContent = 'Read more →';
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

window.addEventListener('load', () => {
    setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
        }
    }, 800);
});

loadPosts();
