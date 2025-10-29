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

function initStars() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    stars = [];
    const numStars = 200;

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
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.fill();

        star.opacity += star.speed * 0.01;
        if (star.opacity > 1 || star.opacity < 0) {
            star.speed *= -1;
        }
    });

    requestAnimationFrame(animateStars);
}

window.addEventListener('resize', initStars);
initStars();
animateStars();

const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.querySelector('.theme-icon');

function setTheme(theme) {
    if (theme === 'light') {
        document.body.classList.add('light-mode');
        themeIcon.textContent = '☀️';
        localStorage.setItem('theme', 'light');
    } else {
        document.body.classList.remove('light-mode');
        themeIcon.textContent = '🌙';
        localStorage.setItem('theme', 'dark');
    }
}

const savedTheme = localStorage.getItem('theme') || 'dark';
setTheme(savedTheme);

themeToggle.addEventListener('click', () => {
    const currentTheme = document.body.classList.contains('light-mode') ? 'light' : 'dark';
    setTheme(currentTheme === 'light' ? 'dark' : 'light');
});

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



async function displayRooms(groups) {
    const roomsGrid = document.getElementById('roomsGrid');
    roomsGrid.innerHTML = '';

    let totalPlayers = 0;

    groups.forEach((group, index) => {
        const roomCard = createRoomCard(group, index);
        roomsGrid.appendChild(roomCard);
        if (group.players) {
            totalPlayers += Object.keys(group.players).length;
        }
    });

    updateStats(groups.length, totalPlayers);

    await loadMiiImages(groups);
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

    for (const player of allPlayers) {
        const imageUrl = await getMiiImageForPlayer(player);
        const imgElement = document.querySelector(`img[data-player-fc="${player.fc}"]`);
        if (imgElement) {
            imgElement.src = imageUrl;
        }
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

    card.innerHTML = `
        <div class="room-header">
            <div class="room-title-section">
                <div class="room-title">Room ${index + 1}</div>
                <div class="room-meta">
                    <span class="lobby-type ${lobbyClass}">${lobbyType}</span>
                    <span class="gamemode">🎮 ${gamemodeName}</span>
                    <span class="time-active">⏱️ ${timeActive}</span>
                </div>
            </div>
            <div class="room-info">
                <div class="room-id">ID: ${roomId}</div>
                <div class="player-count ${statusClass}">${playerStatus}</div>
                <div class="joinable-status ${joinableClass}">
                    <span class="status-dot"></span>
                    ${joinableStatus}
                </div>
            </div>
        </div>
        <div class="players-list">
            ${playersArray.map(player => createPlayerHTML(player)).join('')}
        </div>
    `;

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

function createPlayerHTML(player) {
    const miiName = (player.mii && player.mii[0] && player.mii[0].name) || player.name || 'Unknown Player';
    const fc = player.fc || 'N/A';
    const vr = player.ev || 0;
    const br = player.eb || 0;

    const isOpenhost = player.openhost === 'true';
    const fcClass = isOpenhost ? 'fc-code openhost' : 'fc-code';

    const placeholderImage = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="70" height="70"%3E%3Crect fill="%23ddd" width="70" height="70"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em" font-family="sans-serif" font-size="14"%3E...%3C/text%3E%3C/svg%3E';

    return `
        <div class="player-item" data-fc="${fc}">
            <img src="${placeholderImage}" alt="${escapeHtml(miiName)}" class="mii-image" data-player-fc="${fc}">
            <div class="player-info">
                <div class="player-name">${escapeHtml(miiName)}</div>
                <div class="player-stats">
                    <div class="stat">
                        <span class="stat-label-small">FC:</span>
                        <span class="${fcClass}" ${isOpenhost ? 'title="Openhost Enabled"' : ''}>${fc}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label-small">VR:</span>
                        <span class="stat-value-small">${vr}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label-small">BR:</span>
                        <span class="stat-value-small">${br}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function updateStats(roomCount, playerCount) {
    document.getElementById('totalRooms').textContent = roomCount;
    document.getElementById('totalPlayers').textContent = playerCount;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

setInterval(() => {
    fetchRooms();
}, 60000);

fetchRooms();
