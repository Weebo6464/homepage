const GHOSTPAWZ_DISCORD_ID = '801089753038061669';

async function loadGhostpawzPresence() {
    try {
        const response = await fetch(`https://api.lanyard.rest/v1/users/${GHOSTPAWZ_DISCORD_ID}`);
        const data = await response.json();

        if (data.success && data.data) {
            const presence = data.data;
            const user = presence.discord_user;

            const avatarImg = document.getElementById('gh0stp4wz-avatar');
            const avatarPlaceholder = document.getElementById('gh0stp4wz-placeholder');
            if (avatarImg && user.avatar) {
                avatarImg.src = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=256`;
                avatarImg.style.display = 'block';
                if (avatarPlaceholder) avatarPlaceholder.style.display = 'none';
            }

            const usernameEl = document.getElementById('gh0stp4wz-username');
            if (usernameEl) {
                const displayName = user.display_name || user.global_name || user.username;
                usernameEl.textContent = `@${displayName}`;
            }

            const statusBadge = document.getElementById('gh0stp4wz-status');
            if (statusBadge) {
                statusBadge.className = `discord-status-badge status-${presence.discord_status}`;
                statusBadge.title = getStatusText(presence.discord_status);
            }

            const activityEl = document.getElementById('gh0stp4wz-activity');
            if (activityEl) {
                let activityHTML = '';

                if (presence.listening_to_spotify && presence.spotify) {
                    activityHTML = `<div class="activity-text">🎵 ${presence.spotify.song}</div>`;
                }
                else if (presence.activities && presence.activities.length > 0) {
                    const activity = presence.activities[0];
                    if (activity.type === 4) {
                        const emoji = activity.emoji ? (activity.emoji.name || '') : '';
                        activityHTML = `<div class="activity-text">${emoji} ${activity.state || ''}</div>`;
                    } else {
                        const activityTypes = {
                            0: 'Playing',
                            1: 'Streaming',
                            2: 'Listening to',
                            3: 'Watching',
                            5: 'Competing in'
                        };
                        const typeText = activityTypes[activity.type] || '';
                        activityHTML = `<div class="activity-text">${typeText} ${activity.name}</div>`;
                    }
                }

                activityEl.innerHTML = activityHTML;
            }

            console.log('✅ GH0STP4WZ presence loaded');
        }
    } catch (error) {
        console.error('Failed to load GH0STP4WZ presence:', error);
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

loadGhostpawzPresence();

setInterval(loadGhostpawzPresence, 30000);

document.querySelectorAll('.friend-card').forEach((card, index) => {
    const avatar = card.querySelector('.avatar-placeholder');
    if (avatar) {
        avatar.style.animationDelay = `${index * 0.3}s`;
    }

    card.addEventListener('mouseenter', function () {
        const rect = this.getBoundingClientRect();
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const x = rect.left + Math.random() * rect.width;
                const y = rect.top + Math.random() * rect.height;
                if (typeof createSparkle === 'function') {
                    createSparkle(x, y);
                }
            }, i * 100);
        }
    });
});

let lastHighlighted = null;

function highlightRandomFriend() {
    const cards = document.querySelectorAll('.friend-card');
    if (cards.length === 0) return;

    if (lastHighlighted) {
        lastHighlighted.style.transform = '';
        lastHighlighted.style.boxShadow = '';
    }

    const randomCard = cards[Math.floor(Math.random() * cards.length)];

    randomCard.style.transform = 'translateY(-10px) scale(1.05)';
    randomCard.style.boxShadow = '0 20px 60px rgba(255, 223, 0, 0.6)';

    lastHighlighted = randomCard;

    setTimeout(() => {
        if (lastHighlighted === randomCard) {
            randomCard.style.transform = '';
            randomCard.style.boxShadow = '';
            lastHighlighted = null;
        }
    }, 3000);
}

setInterval(highlightRandomFriend, 10000);

let clickSequence = [];
const correctSequence = ['zelda', 'kytronix', 'horse', 'fco64', 'gh0stp4wz', 'scyhigh'];

document.querySelectorAll('.friend-card').forEach(card => {
    card.addEventListener('click', function () {
        const friend = this.dataset.friend;
        clickSequence.push(friend);

        if (clickSequence.length > 6) {
            clickSequence.shift();
        }

        if (clickSequence.length === 6 &&
            clickSequence.every((val, idx) => val === correctSequence[idx])) {
            activateFriendsEasterEgg();
            clickSequence = [];
        }
    });
});

function activateFriendsEasterEgg() {
    for (let i = 0; i < 100; i++) {
        setTimeout(() => {
            const x = Math.random() * window.innerWidth;
            const y = Math.random() * window.innerHeight;
            if (typeof createSparkle === 'function') {
                createSparkle(x, y);
            }
        }, i * 20);
    }

    const message = document.createElement('div');
    message.textContent = '🎉 You found all the friends! 🎉';
    message.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #ffdf00 0%, #ff6b6b 100%);
        color: #000;
        padding: 30px 60px;
        border-radius: 20px;
        font-size: 2rem;
        font-weight: 700;
        z-index: 10001;
        box-shadow: 0 20px 60px rgba(255, 223, 0, 0.8);
        border: 4px solid #fff;
        animation: bounceIn 0.6s ease;
    `;
    document.body.appendChild(message);

    setTimeout(() => {
        message.style.animation = 'fadeOut 0.5s ease';
        setTimeout(() => message.remove(), 500);
    }, 3000);
}
