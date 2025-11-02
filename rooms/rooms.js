const API_ENDPOINT = 'http://rwfc.net/api/groups';
const CORS_PROXIES = [
    'https://corsproxy.io/?',
    'https://api.codetabs.com/v1/proxy?quest=',
    'https://api.allorigins.win/raw?url='
];
let currentProxyIndex = 0;

const GAMEMODE_MAP = {
    "10": "Retro Tracks",
    "11": "Online TT",
    "12": "200cc",
    "13": "Item Rain",
    "14": "Regular Battle",
    "15": "Elimination Battle",
    "20": "Custom Tracks",
    "21": "Vanilla Tracks",
    "22": "CT 200cc",
    "666": "Luminous 150cc",
    "667": "Luminous Online TT",
    "668": "CTGP-C",
    "751": "Versus",
    "-1": "Regular",
    "69": "IKW Default",
    "70": "IKW Ultras VS",
    "71": "IKW Countdown",
    "72": "IKW Bob-omb Blast",
    "73": "IKW Infinite Accel",
    "74": "IKW Banana Slip",
    "75": "IKW Random Items",
    "76": "IKW Unfair Items",
    "77": "IKW Blue Shell Madness",
    "78": "IKW Mushroom Dash",
    "79": "IKW Bumper Karts",
    "80": "IKW Item Rampage",
    "81": "IKW Item Rain",
    "82": "IKW Shell Break",
    "83": "IKW Riibalanced",
    "875": "OptPack 150cc",
    "876": "OptPack Online TT",
    "877": "OptPack",
    "878": "OptPack",
    "879": "OptPack",
    "880": "OptPack",
    "1312": "WTP 150cc",
    "1313": "WTP 200cc",
    "1314": "WTP Online TT",
    "1315": "WTP Item Rain",
    "1316": "WTP STYD"
};

const canvas = document.getElementById('stars');
const ctx = canvas.getContext('2d');
let stars = [];
let animationFrameId = null;

function initStars() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    stars = [];
    const numStars = 100; // Reduced from 200

    for (let i = 0; i < numStars; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 1.5,
            speed: Math.random() * 0.5 + 0.1,
            opacity: Math.random()
        });
    }
}

function animateStars() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    stars.forEach(star => {
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.fillRect(star.x, star.y, star.radius, star.radius); // Use fillRect instead of arc for better performance

        star.opacity += star.speed * 0.01;
        if (star.opacity > 1 || star.opacity < 0) {
            star.speed *= -1;
        }
    });

    animationFrameId = requestAnimationFrame(animateStars);
}

let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(initStars, 250); // Debounce resize
});

initStars();
animateStars();

async function fetchRooms() {
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    const roomsGrid = document.getElementById('roomsGrid');

    try {
        let lastError;

        for (let i = 0; i < CORS_PROXIES.length; i++) {
            try {
                const proxy = CORS_PROXIES[(currentProxyIndex + i) % CORS_PROXIES.length];
                console.log(`Trying proxy: ${proxy}`);

                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000);

                const response = await fetch(proxy + encodeURIComponent(API_ENDPOINT), {
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                const groups = await response.json();

                currentProxyIndex = (currentProxyIndex + i) % CORS_PROXIES.length;
                console.log(`Success with proxy: ${proxy}`);

                loading.style.display = 'none';

                if (!groups || groups.length === 0) {
                    roomsGrid.innerHTML = '<div class="no-rooms">🏁 No active rooms at the moment</div>';
                    updateStats(0, 0);
                    return;
                }

                displayRooms(groups);
                return;

            } catch (proxyErr) {
                lastError = proxyErr;
                console.warn(`Proxy ${CORS_PROXIES[(currentProxyIndex + i) % CORS_PROXIES.length]} failed:`, proxyErr.message);
            }
        }

        throw lastError || new Error('All proxies failed');

    } catch (err) {
        console.error('Error fetching rooms:', err);
        loading.style.display = 'none';
        error.style.display = 'block';
    }
}



let allGroups = [];

async function displayRooms(groups) {
    allGroups = groups;
    const roomsGrid = document.getElementById('roomsGrid');
    roomsGrid.innerHTML = '';

    let totalPlayers = 0;

    groups.forEach(group => {
        if (!group.players || Object.keys(group.players).length === 0) {
            group.averageVR = null;
        } else {
            const players = Object.values(group.players);
            const playersWithVR = players.filter(player => player.ev !== undefined);
            const totalVR = playersWithVR.reduce((sum, player) => sum + Number(player.ev || 0), 0);
            const averageVR = playersWithVR.length > 0 ? totalVR / playersWithVR.length : 0;
            group.averageVR = Math.round(averageVR);
        }
    });

    const publicOnlyFilter = document.getElementById('publicOnlyFilter');
    const showPublicOnly = publicOnlyFilter && publicOnlyFilter.checked;

    const filteredGroups = showPublicOnly
        ? groups.filter(group => group.type !== 'private')
        : groups;

    if (filteredGroups.length === 0) {
        roomsGrid.innerHTML = '<div class="no-rooms">🏁 No rooms match the current filter</div>';
        updateStats(0, 0);
        return;
    }

    filteredGroups.forEach((group, index) => {
        const roomCard = createRoomCard(group, index);
        roomsGrid.appendChild(roomCard);
        if (group.players) {
            totalPlayers += Object.keys(group.players).length;
        }
    });

    updateStats(filteredGroups.length, totalPlayers);

    await loadMiiImages(filteredGroups);
}

async function loadMiiImages(groups) {
    const allPlayers = [];

    groups.forEach(group => {
        if (group.players) {
            Object.values(group.players).forEach(player => {
                allPlayers.push(player);
            });
        }
    });

    // Load images in batches to avoid overwhelming the browser
    const batchSize = 10;
    for (let i = 0; i < allPlayers.length; i += batchSize) {
        const batch = allPlayers.slice(i, i + batchSize);
        await Promise.all(batch.map(async player => {
            const imageUrl = await getMiiImageForPlayer(player);
            const imgElement = document.querySelector(`img[data-player-fc="${player.fc}"]`);
            if (imgElement) {
                imgElement.src = imageUrl;
            }
        }));
    }
}

function createRoomCard(group, index) {
    const card = document.createElement('div');
    card.className = 'room-card';
    card.style.animationDelay = `${index * 0.1}s`;

    const roomId = group.id || 'Unknown';
    const playersObj = group.players || {};

    const playersArray = Object.values(playersObj);
    const playerCount = playersArray.length;
    const maxPlayers = 12;

    const createdTime = new Date(group.created);
    const timeActive = getTimeActive(createdTime);

    const lobbyType = group.type === 'private' ? 'Private' : 'Public';
    const lobbyClass = group.type === 'private' ? 'lobby-private' : 'lobby-public';

    const roomKey = group.rk || '';
    const gamemodeId = roomKey.startsWith('vs_') ? roomKey.split('_')[1] : '';
    const gamemodeName = GAMEMODE_MAP[gamemodeId] || 'Unknown Mode';

    let playerStatus = `${playerCount}/${maxPlayers} Players`;
    let statusClass = '';
    if (playerCount === maxPlayers) {
        playerStatus = '🔥 Full Lobby!';
        statusClass = 'status-full';
    } else if (playerCount >= 10) {
        playerStatus = `${playerCount}/${maxPlayers} - Almost Full!`;
        statusClass = 'status-almost-full';
    }

    const raceState = group.racestate || 0;
    const isInRace = raceState === 1;
    const isInVoting = raceState === 2;
    const isFull = playerCount >= maxPlayers;

    let joinableStatus = '';
    let joinableClass = '';

    if (isFull || isInVoting) {
        joinableStatus = 'Not Joinable';
        joinableClass = 'not-joinable';
    } else if (isInRace) {
        joinableStatus = 'Joinable';
        joinableClass = 'joinable';
    } else {
        joinableStatus = 'Joinable';
        joinableClass = 'joinable';
    }

    const isPrivate = group.type === 'private';
    const averageVR = group.averageVR;
    const averageVRText = !isPrivate && averageVR !== null ? ` • Avg VR: ${averageVR}` : '';

    let raceStatusHTML = '';
    if (isInVoting) {
        raceStatusHTML = '<div class="race-status voting">🗳️ In Voting!</div>';
    } else if (isInRace) {
        raceStatusHTML = '<div class="race-status racing">🏁 Racing!</div>';
    }

    const gamemodeHTML = !isPrivate ? `<span class="gamemode">🎮 ${gamemodeName}</span>` : '';

    card.innerHTML = `
        <div class="room-header">
            <div class="room-title-section">
                <div class="room-title">Room ${index + 1}</div>
                <div class="room-meta">
                    <span class="lobby-type ${lobbyClass}">${lobbyType}</span>
                    ${gamemodeHTML}
                    <span class="time-active">⏱️ ${timeActive}</span>
                </div>
            </div>
            <div class="room-info">
                <div class="room-id">ID: ${roomId}</div>
                <div class="player-count ${statusClass}">${playerStatus}</div>
                ${raceStatusHTML}
                <div class="joinable-status ${joinableClass}" title="${averageVR !== null ? `Average VR: ${averageVR}` : ''}">
                    <span class="status-dot"></span>
                    ${joinableStatus}${averageVRText}
                </div>
            </div>
        </div>
        <div class="players-toggle">
            <span class="toggle-icon">▼</span>
            <span class="toggle-text">Show Players (${playerCount})</span>
        </div>
        <div class="players-list collapsed">
            ${playersArray.map(player => createPlayerHTML(player, isPrivate)).join('')}
        </div>
    `;

    const toggleBtn = card.querySelector('.players-toggle');
    const playersList = card.querySelector('.players-list');
    const toggleIcon = card.querySelector('.toggle-icon');
    const toggleText = card.querySelector('.toggle-text');

    toggleBtn.addEventListener('click', () => {
        playersList.classList.toggle('collapsed');
        toggleIcon.textContent = playersList.classList.contains('collapsed') ? '▼' : '▲';
        toggleText.textContent = playersList.classList.contains('collapsed')
            ? `Show Players (${playerCount})`
            : `Hide Players (${playerCount})`;
    });

    return card;
}

function getTimeActive(createdTime) {
    const now = new Date();
    const diff = now - createdTime;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m`;
    return 'Just now';
}

async function convertMiiDataToStudioFormat(miiData) {
    try {
        const bytes = atob(miiData);
        const byteArray = new Uint8Array(bytes.length);
        for (let i = 0; i < bytes.length; i++) {
            byteArray[i] = bytes.charCodeAt(i);
        }
        const blob = new Blob([byteArray]);

        const formData = new FormData();
        formData.append('data', blob, 'mii.dat');
        formData.append('platform', 'wii');

        const response = await fetch('https://miicontestp.wii.rc24.xyz/cgi-bin/studio.cgi', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            return null;
        }

        const json = await response.json();
        return json && json.mii ? json.mii : null;
    } catch (error) {
        console.error('Error converting Mii data:', error);
        return null;
    }
}

function getMiiImageUrl(studioData) {
    if (!studioData) {
        return 'https://via.placeholder.com/70?text=Mii';
    }

    return `https://studio.mii.nintendo.com/miis/image.png?data=${studioData}&type=face&expression=normal&width=270&bgColor=FFFFFF00&clothesColor=default&cameraXRotate=0&cameraYRotate=0&cameraZRotate=0&characterXRotate=0&characterYRotate=0&characterZRotate=0&lightDirectionMode=none&instanceCount=1&instanceRotationMode=model`;
}

const miiImageCache = {};

async function getMiiImageForPlayer(player) {
    const fc = player.fc;

    if (miiImageCache[fc]) {
        return miiImageCache[fc];
    }

    if (player.mii && player.mii[0] && player.mii[0].data) {
        const studioData = await convertMiiDataToStudioFormat(player.mii[0].data);
        const imageUrl = getMiiImageUrl(studioData);
        miiImageCache[fc] = imageUrl;
        return imageUrl;
    }

    const fallbackUrl = 'https://via.placeholder.com/70?text=Mii';
    miiImageCache[fc] = fallbackUrl;
    return fallbackUrl;
}

function createPlayerHTML(player, isPrivateRoom = false) {
    const miiName = (player.mii && player.mii[0] && player.mii[0].name) || player.name || 'Unknown Player';
    const fc = player.fc || 'N/A';
    const vr = player.ev || 0;
    const br = player.eb || 0;

    const isOpenhost = player.openhost === 'true';
    const fcClass = isOpenhost ? 'fc-code openhost' : 'fc-code';

    const placeholderImage = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="70" height="70"%3E%3Crect fill="%23ddd" width="70" height="70"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-family="sans-serif" font-size="14"%3E...%3C/text%3E%3C/svg%3E';

    const vrBrStats = !isPrivateRoom ? `
                    <div class="stat">
                        <span class="stat-label-small">VR:</span>
                        <span class="stat-value-small">${vr}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label-small">BR:</span>
                        <span class="stat-value-small">${br}</span>
                    </div>` : '';

    const openhostTooltip = isOpenhost ? '<span class="openhost-tooltip">Openhost Enabled</span>' : '';

    return `
        <div class="player-item" data-fc="${fc}">
            <img src="${placeholderImage}" alt="${escapeHtml(miiName)}" class="mii-image" data-player-fc="${fc}">
            <div class="player-info">
                <div class="player-name">${escapeHtml(miiName)}</div>
                <div class="player-stats">
                    <div class="stat fc-stat">
                        <span class="stat-label-small">FC:</span>
                        <span class="${fcClass}" ${isOpenhost ? 'data-openhost="true"' : ''}>${fc}</span>
                        ${openhostTooltip}
                    </div>
                    ${vrBrStats}
                </div>
            </div>
        </div>
    `;
}

let hasTriggered100 = false;
let hasTriggered67 = false;

function updateStats(roomCount, playerCount) {
    document.getElementById('totalRooms').textContent = roomCount;
    document.getElementById('totalPlayers').textContent = playerCount;

    const playersStatCard = document.getElementById('totalPlayers').closest('.stat-card');
    let existingEasterEgg = playersStatCard.querySelector('.easter-egg');
    if (existingEasterEgg) {
        existingEasterEgg.remove();
    }

    let easterEggText = '';
    let easterEggClass = '';

    if (playerCount === 67) {
        easterEggText = '🏀 six-seven! 🏀';
        easterEggClass = 'easter-egg-67';

        if (!hasTriggered67) {
            hasTriggered67 = true;
            trigger67Hands(playersStatCard);
            setTimeout(() => {
                hasTriggered67 = false;
            }, 60000);
        }
    } else if (playerCount === 69) {
        easterEggText = '😏 haha funny number';
        easterEggClass = 'easter-egg-69';
    } else if (playerCount >= 100) {
        easterEggText = '🎉 CENTURY CELEBRATION! 🎉';
        easterEggClass = 'easter-egg-100';

        if (!hasTriggered100) {
            hasTriggered100 = true;
            triggerCelebration();
            setTimeout(() => {
                hasTriggered100 = false;
            }, 60000);
        }
    }

    if (easterEggText) {
        const easterEgg = document.createElement('div');
        easterEgg.className = `easter-egg ${easterEggClass}`;
        easterEgg.textContent = easterEggText;
        playersStatCard.appendChild(easterEgg);
    }
}

function trigger67Hands(statCard) {
    const leftHand = document.createElement('img');
    leftHand.className = 'hand-67 hand-left';
    leftHand.src = 'image/hand.png';
    leftHand.alt = 'hand';

    const rightHand = document.createElement('img');
    rightHand.className = 'hand-67 hand-right';
    rightHand.src = 'image/hand.png';
    rightHand.alt = 'hand';

    statCard.appendChild(leftHand);
    statCard.appendChild(rightHand);

    setTimeout(() => {
        leftHand.remove();
        rightHand.remove();
    }, 10000);
}

function triggerCelebration() {
    document.body.classList.add('celebrating');

    createConfetti();

    setTimeout(() => {
        document.body.classList.remove('celebrating');
    }, 10000);
}

function createConfetti() {
    const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#e67e22'];
    const confettiCount = 100;

    for (let i = 0; i < confettiCount; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = Math.random() * 0.5 + 's';
            confetti.style.animationDuration = (Math.random() * 2 + 3) + 's';
            document.body.appendChild(confetti);

            setTimeout(() => {
                confetti.remove();
            }, 10000);
        }, i * 30);
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

document.addEventListener('DOMContentLoaded', () => {
    const publicOnlyFilter = document.getElementById('publicOnlyFilter');
    if (publicOnlyFilter) {
        publicOnlyFilter.addEventListener('change', () => {
            if (allGroups.length > 0) {
                displayRooms(allGroups);
            }
        });
    }
});

document.addEventListener('click', (e) => {
    if (e.target.classList.contains('openhost') && e.target.dataset.openhost === 'true') {
        const tooltip = e.target.nextElementSibling;
        if (tooltip && tooltip.classList.contains('openhost-tooltip')) {
            tooltip.classList.toggle('show');

            setTimeout(() => {
                tooltip.classList.remove('show');
            }, 3000);
        }
    } else {
        document.querySelectorAll('.openhost-tooltip.show').forEach(tooltip => {
            tooltip.classList.remove('show');
        });
    }
});

setInterval(() => {
    fetchRooms();
}, 60000);

fetchRooms();
