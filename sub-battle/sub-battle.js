const CHANNELS = {
    nintendo: 'ShyLucky64', // ShyLucky64 handle
    sega: 'NishisSonicWorld'      // NishisSonicWorld handle
};

const API_KEY = 'AIzaSyB6xGNe74qweNrsvN7YF525dVYrFRVPsx4';

const UPDATE_INTERVAL = 30000;

function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(2) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
}

async function fetchChannelData(channelHandle) {
    try {
        // Try by handle first (for @username format)
        let url;
        if (channelHandle.startsWith('UC')) {
            // It's a channel ID
            url = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelHandle}&key=${API_KEY}`;
        } else {
            // It's a handle
            url = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&forHandle=${channelHandle}&key=${API_KEY}`;
        }
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (!response.ok) {
            console.error('API Error:', data);
            if (data.error) {
                throw new Error(`API Error: ${data.error.message}`);
            }
            throw new Error('API request failed');
        }
        
        if (data.items && data.items.length > 0) {
            const channel = data.items[0];
            console.log('Channel found:', channel.snippet.title);
            return {
                name: channel.snippet.title,
                avatar: channel.snippet.thumbnails.high.url,
                subscribers: parseInt(channel.statistics.subscriberCount),
                videos: parseInt(channel.statistics.videoCount),
                views: parseInt(channel.statistics.viewCount)
            };
        }
        
        console.error('No channel data returned for:', channelHandle);
        throw new Error('Channel not found');
    } catch (error) {
        console.error('Error fetching channel data:', error);
        return null;
    }
}

function updateUI(team, data) {
    if (!data) return;
    
    document.getElementById(`${team}-name`).textContent = data.name;
    document.getElementById(`${team}-avatar`).src = data.avatar;
    document.querySelector(`#${team}-subs .count`).textContent = formatNumber(data.subscribers);
    document.getElementById(`${team}-videos`).textContent = formatNumber(data.videos);
    document.getElementById(`${team}-views`).textContent = formatNumber(data.views);
}

function updateDifference(nintendoSubs, segaSubs) {
    const diff = Math.abs(nintendoSubs - segaSubs);
    const leader = nintendoSubs > segaSubs ? 'Nintendo' : 'SEGA';
    const diffElement = document.querySelector('.diff-value');
    
    diffElement.textContent = `${formatNumber(diff)} (${leader} leads)`;
}

async function updateAllData() {
    const [nintendoData, segaData] = await Promise.all([
        fetchChannelData(CHANNELS.nintendo),
        fetchChannelData(CHANNELS.sega)
    ]);
    
    if (nintendoData && segaData) {
        updateUI('nintendo', nintendoData);
        updateUI('sega', segaData);
        updateDifference(nintendoData.subscribers, segaData.subscribers);
    }
}

function checkConfiguration() {
    if (API_KEY === 'YOUR_API_KEY_HERE' || 
        CHANNELS.nintendo === 'CHANNEL_ID_HERE' || 
        CHANNELS.sega === 'CHANNEL_ID_HERE') {
        
        document.querySelector('.container').innerHTML = `
            <div style="text-align: center; padding: 50px;">
                <h1>⚙️ Configuration Required</h1>
                <p style="margin-top: 20px; font-size: 1.2rem;">
                    Please configure the YouTube API key and channel IDs in sub-battle.js
                </p>
                <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; margin-top: 30px; text-align: left; max-width: 600px; margin-left: auto; margin-right: auto;">
                    <h3>Steps to configure:</h3>
                    <ol style="margin-top: 15px; line-height: 1.8;">
                        <li>Get a YouTube Data API v3 key from <a href="https://console.cloud.google.com/" target="_blank" style="color: #fff;">Google Cloud Console</a></li>
                        <li>Find the YouTube channel IDs for both channels</li>
                        <li>Update the API_KEY and CHANNELS values in sub-battle.js</li>
                    </ol>
                </div>
            </div>
        `;
        return false;
    }
    return true;
}

if (checkConfiguration()) {
    updateAllData();
    setInterval(updateAllData, UPDATE_INTERVAL);
}
