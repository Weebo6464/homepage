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

window.addEventListener('load', () => {
    setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
        }
    }, 1000);
});

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Throttle scroll event for better performance
let scrollTimeout;
window.addEventListener('scroll', () => {
    if (scrollTimeout) return;
    scrollTimeout = setTimeout(() => {
        const header = document.querySelector('header');
        const scrolled = window.pageYOffset;
        if (header) {
            header.style.transform = `translateY(${scrolled * 0.3}px)`;
            header.style.opacity = 1 - (scrolled / 500);
        }
        scrollTimeout = null;
    }, 16); // ~60fps
}, { passive: true });

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.skill-card, .project-card, .link-card').forEach((element, index) => {
    element.style.opacity = '0';
    element.style.transform = 'translateY(30px)';
    element.style.transition = `all 0.6s ease ${index * 0.1}s`;
    observer.observe(element);
});

// Throttle sparkle creation for better performance
let lastSparkleTime = 0;
const sparkleThrottle = 200; // ms

document.addEventListener('mousemove', (e) => {
    const now = Date.now();
    if (Math.random() > 0.98 && now - lastSparkleTime > sparkleThrottle) {
        createSparkle(e.clientX, e.clientY);
        lastSparkleTime = now;
    }
});

function createSparkle(x, y) {
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle';
    sparkle.style.left = x + 'px';
    sparkle.style.top = y + 'px';
    document.body.appendChild(sparkle);
    setTimeout(() => {
        sparkle.remove();
    }, 1000);
}

// Reduced frequency of random sparkles
setInterval(() => {
    if (Math.random() > 0.9) {
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight;
        createSparkle(x, y);
    }
}, 5000);

document.querySelectorAll('.skill-card, .project-card, .link-card').forEach(card => {
    card.addEventListener('mouseenter', function () {
        this.style.transform = 'translateY(-10px) scale(1.02)';
    });
    card.addEventListener('mouseleave', function () {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

const tagline = document.querySelector('.tagline');
if (tagline) {
    const text = tagline.textContent;
    tagline.textContent = '';
    tagline.style.opacity = '1';
    let i = 0;
    const typeWriter = () => {
        if (i < text.length) {
            tagline.textContent += text.charAt(i);
            i++;
            setTimeout(typeWriter, 50);
        }
    };
    setTimeout(typeWriter, 1000);
}

document.querySelectorAll('.skill-icon').forEach((icon, index) => {
    icon.style.animationDelay = `${index * 0.2}s`;
});

const DISCORD_USER_ID = '257196097494188032';
const discordWidget = document.getElementById('discord-widget');
const discordToggle = document.getElementById('discord-toggle');
const discordClose = document.getElementById('discord-close');
const discordContent = document.getElementById('discord-content');
let isDiscordOpen = false;

if (discordToggle) {
    discordToggle.addEventListener('click', () => {
        isDiscordOpen = !isDiscordOpen;
        discordWidget.classList.toggle('active', isDiscordOpen);
        if (isDiscordOpen && !discordContent.dataset.loaded) {
            loadDiscordPresence();
        }
    });
}

if (discordClose) {
    discordClose.addEventListener('click', () => {
        isDiscordOpen = false;
        discordWidget.classList.remove('active');
    });
}

async function loadDiscordPresence() {
    try {
        const response = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_USER_ID}`);
        const data = await response.json();
        if (data.success && data.data) {
            const presence = data.data;
            const user = presence.discord_user;
            const displayName = user.display_name || user.global_name || user.username;
            let html = `
                <div class="discord-user">
                    <img src="${getUserAvatar(user)}" alt="${displayName}" class="discord-avatar" onerror="this.src='Weebo_logo.png'">
                    <div class="discord-user-info">
                        <div class="discord-username">${displayName}</div>
                        <div class="discord-status">
                            <span class="status-indicator status-${presence.discord_status}"></span>
                            ${getStatusText(presence.discord_status)}
                        </div>
                    </div>
                </div>
            `;
            if (presence.listening_to_spotify && presence.spotify) {
                html += buildSpotifyCard(presence.spotify);
            }
            if (presence.activities && presence.activities.length > 0) {
                presence.activities.forEach(activity => {
                    html += buildActivityCard(activity, presence);
                });
            }
            if ((!presence.activities || presence.activities.length === 0) && !presence.listening_to_spotify) {
                html += '<div class="discord-activity"><div class="activity-title">No current activity</div></div>';
            }
            discordContent.innerHTML = html;
            discordContent.dataset.loaded = 'true';
            console.log('✅ Discord presence loaded:', displayName, presence.discord_status);
        } else {
            throw new Error('No data received');
        }
    } catch (error) {
        console.error('Failed to load Discord presence:', error);
        discordContent.innerHTML = '<div class="discord-loading">Could not load Discord status</div>';
    }
}

function getUserAvatar(user) {
    if (user.avatar) {
        return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`;
    } else {
        const defaultIndex = user.discriminator === "0"
            ? (parseInt(user.id) >> 22) % 6
            : parseInt(user.discriminator) % 5;
        return `https://cdn.discordapp.com/embed/avatars/${defaultIndex}.png`;
    }
}

function getStatusText(status) {
    const statusMap = {
        'online': 'Online',
        'idle': 'Idle',
        'dnd': 'Do Not Disturb',
        'offline': 'Offline'
    };
    return statusMap[status] || 'Unknown';
}

function buildActivityCard(activity) {
    const activityTypes = {
        0: 'Playing',
        1: 'Streaming',
        2: 'Listening to',
        3: 'Watching',
        4: 'Custom Status',
        5: 'Competing in'
    };
    const typeText = activityTypes[activity.type] || 'Activity';
    if (activity.type === 4) {
        const emoji = activity.emoji ? (activity.emoji.id ?
            `<img src="https://cdn.discordapp.com/emojis/${activity.emoji.id}.${activity.emoji.animated ? 'gif' : 'png'}" style="width: 20px; height: 20px; vertical-align: middle;">` :
            activity.emoji.name) : '';
        return `
            <div class="discord-activity">
                <div class="activity-title">💭 Custom Status</div>
                <div class="activity-content">
                    <div class="activity-details" style="width: 100%;">
                        <div class="activity-name">${emoji} ${activity.state || 'No status set'}</div>
                    </div>
                </div>
            </div>
        `;
    }
    let image = '';
    if (activity.assets?.large_image) {
        if (activity.assets.large_image.startsWith('mp:')) {
            image = `https://media.discordapp.net/${activity.assets.large_image.replace('mp:', '')}`;
        } else {
            image = `https://cdn.discordapp.com/app-assets/${activity.application_id}/${activity.assets.large_image}.png`;
        }
    }
    return `
        <div class="discord-activity">
            <div class="activity-title">${typeText}</div>
            <div class="activity-content">
                ${image ? `<img src="${image}" alt="${activity.name}" class="activity-image">` : ''}
                <div class="activity-details">
                    <div class="activity-name">${activity.name}</div>
                    ${activity.details ? `<div class="activity-details-text">${activity.details}</div>` : ''}
                    ${activity.state ? `<div class="activity-state">${activity.state}</div>` : ''}
                </div>
            </div>
        </div>
    `;
}

function buildSpotifyCard(spotify) {
    return `
        <div class="discord-activity spotify-activity">
            <div class="activity-title">🎵 Listening to Spotify</div>
            <div class="activity-content">
                <img src="${spotify.album_art_url}" alt="${spotify.album}" class="activity-image">
                <div class="activity-details">
                    <div class="activity-name">${spotify.song}</div>
                    <div class="activity-details-text">by ${spotify.artist}</div>
                    <div class="activity-state">on ${spotify.album}</div>
                </div>
            </div>
        </div>
    `;
}

setInterval(() => {
    if (isDiscordOpen && discordContent.dataset.loaded) {
        loadDiscordPresence();
    }
}, 30000);

let konamiCode = [];
const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.key);
    konamiCode = konamiCode.slice(-10);
    if (konamiCode.join(',') === konamiSequence.join(',')) {
        activateEasterEgg();
    }
});

function activateEasterEgg() {
    const audio = new Audio('https://lambda.vgmtreasurechest.com/soundtracks/super-mario-64-soundtrack/ikyoyaip/25.%20Course%20Clear.mp3');
    audio.volume = 0.5;
    audio.play().catch(err => console.log('Audio play failed:', err));
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const x = Math.random() * window.innerWidth;
            const y = Math.random() * window.innerHeight;
            createSparkle(x, y);
        }, i * 50);
    }
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.3s ease;
    `;
    const marioContainer = document.createElement('div');
    marioContainer.style.cssText = `
        position: relative;
        text-align: center;
        animation: bounceIn 0.6s ease;
    `;
    const marioGif = document.createElement('img');
    marioGif.src = 'https://i.gifer.com/origin/25/2592644fb79ccd767120c1e6a6ff8aeb_w200.gif';
    marioGif.style.cssText = `
        width: 300px;
        height: auto;
        filter: drop-shadow(0 0 30px rgba(255, 223, 0, 0.8));
        margin-bottom: 30px;
    `;
    const message = document.createElement('div');
    message.textContent = '⭐ You got a star! ⭐';
    message.style.cssText = `
        background: linear-gradient(135deg, #ffdf00 0%, #ff6b6b 100%);
        color: #000;
        padding: 25px 50px;
        border-radius: 20px;
        font-size: 1.8rem;
        font-weight: 700;
        box-shadow: 0 20px 60px rgba(255, 223, 0, 0.8);
        border: 4px solid #fff;
        animation: pulse 1s ease-in-out infinite;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
    `;
    marioContainer.appendChild(marioGif);
    marioContainer.appendChild(message);
    overlay.appendChild(marioContainer);
    document.body.appendChild(overlay);
    if (!document.getElementById('easter-egg-styles')) {
        const style = document.createElement('style');
        style.id = 'easter-egg-styles';
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes bounceIn {
                0% { transform: scale(0) translateY(100px); opacity: 0; }
                50% { transform: scale(1.1) translateY(-20px); }
                100% { transform: scale(1) translateY(0); opacity: 1; }
            }
            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    setTimeout(() => {
        overlay.style.animation = 'fadeOut 0.5s ease';
        setTimeout(() => {
            overlay.remove();
            audio.pause();
        }, 500);
    }, 5000);
}
