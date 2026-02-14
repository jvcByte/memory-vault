// Spotify Web API configuration
const clientId = '1ce3893c730c480689dc13df6183f212';
const redirectUri = 'https://valndinma.vercel.app/spotify.html';
const authEndpoint = 'https://accounts.spotify.com/authorize';
const scopes = [
    'user-read-private',
    'user-read-email',
    'user-modify-playback-state',
    'user-read-playback-state',
    'user-read-currently-playing',
    'user-read-recently-played',
    'user-read-playback-position',
    'user-top-read',
    'playlist-read-private',
    'playlist-read-collaborative',
    'streaming'
];

// DOM Elements
const loginBtn = document.getElementById('loginBtn');
const authMessage = document.getElementById('authMessage');
const playerContainer = document.querySelector('.spotify-player');
const playBtn = document.getElementById('playBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const progressBar = document.querySelector('.progress');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');
const trackNameEl = document.getElementById('trackName');
const artistNameEl = document.getElementById('artistName');
const albumArtEl = document.getElementById('albumArt');
const playlistEl = document.getElementById('playlist');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');

// State
let accessToken = null;
let player = null;
let deviceId = null;
let currentTrack = null;
let isPlaying = false;
let progressInterval = null;
let playlistTracks = [];
let filteredTracks = [];
let isPlayerInitialized = false;

// Generate random string for PKCE
function generateRandomString(length) {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from(crypto.getRandomValues(new Uint8Array(length)))
        .map(byte => possible[byte % possible.length])
        .join('');
}

// Generate code challenge for PKCE
async function generateCodeChallenge(verifier) {
    const data = new TextEncoder().encode(verifier);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(...new Uint8Array(hash)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

// Handle login
async function handleLogin() {
    try {
        const codeVerifier = generateRandomString(128);
        const codeChallenge = await generateCodeChallenge(codeVerifier);
        
        // Store the code verifier for later use
        localStorage.setItem('code_verifier', codeVerifier);
        
        // Create the authorization URL
        const authUrl = new URL(authEndpoint);
        
        // Manually build the query parameters to ensure proper encoding
        const params = new URLSearchParams();
        params.append('response_type', 'code');
        params.append('client_id', clientId);
        params.append('scope', scopes.join(' '));
        params.append('code_challenge_method', 'S256');
        params.append('code_challenge', codeChallenge);
        params.append('redirect_uri', redirectUri);
        
        // Use a new window for authentication to avoid CORS issues
        const authWindow = window.open(`${authEndpoint}?${params.toString()}`, '_self');
        
        if (!authWindow) {
            throw new Error('Popup was blocked. Please allow popups for this site.');
        }
    } catch (error) {
        console.error('Login error:', error);
        if (authMessage) {
            authMessage.innerHTML = `Error during login: ${error.message}`;
            authMessage.style.display = 'block';
        }
    }
}

// Handle the OAuth code exchange
async function handleCodeExchange(code) {
    try {
        console.log('Exchanging authorization code for access token...');
        const codeVerifier = localStorage.getItem('code_verifier');
        
        if (!codeVerifier) {
            throw new Error('No code verifier found in local storage. Please try logging in again.');
        }
        
        // Clear any existing token data
        localStorage.removeItem('spotify_token_data');
        
        const params = new URLSearchParams();
        params.append('client_id', clientId);
        params.append('grant_type', 'authorization_code');
        params.append('code', code);
        params.append('redirect_uri', redirectUri);
        params.append('code_verifier', codeVerifier);
        
        console.log('Making token request with params:', params.toString());
        
        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params
        });
        
        const responseData = await response.json();
        
        if (!response.ok) {
            console.error('Token exchange failed:', responseData);
            throw new Error(responseData.error_description || 'Failed to get access token');
        }
        
        console.log('Token exchange successful:', responseData);
        
        // Store token data with timestamp
        const tokenDataToStore = {
            ...responseData,
            timestamp: Date.now()
        };
        
        localStorage.setItem('spotify_token_data', JSON.stringify(tokenDataToStore));
        
        // Clear the code from URL
        if (window.history.replaceState) {
            const cleanUrl = window.location.origin + window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);
        }
        
        // Initialize player with new token
        accessToken = responseData.access_token;
        
        // Small delay to ensure token is properly set
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Initialize the player
        await initializePlayer();
        
    } catch (error) {
        console.error('Error during authentication:', error);
        
        // Clear any partial token data
        localStorage.removeItem('spotify_token_data');
        
        if (authMessage) {
            authMessage.innerHTML = `
                <p>Authentication failed. Please try again.</p>
                <p>${error.message || 'Unknown error occurred'}</p>
                <button id="retryLogin" class="btn spotify-btn">
                    <i class="fas fa-redo"></i> Try Again
                </button>
            `;
            authMessage.style.display = 'block';
            
            // Add retry button handler
            const retryBtn = document.getElementById('retryLogin');
            if (retryBtn) {
                retryBtn.addEventListener('click', handleLogin);
            }
        }
    }
}

// Initialize the Spotify Web Playback SDK
async function initializePlayer() {
    if (isPlayerInitialized) return;
    
    // Check if Web Playback SDK is ready
    if (!window.Spotify) {
        console.log('Spotify Web Playback SDK not loaded yet, waiting...');
        
        // Wait for the SDK to be ready
        if (!window.spotifySDKReady) {
            await new Promise((resolve) => {
                window.pendingSpotifyInit = resolve;
                
                // Set a timeout in case the SDK never loads
                setTimeout(() => {
                    if (window.pendingSpotifyInit) {
                        console.error('Spotify Web Playback SDK loading timed out');
                        window.pendingSpotifyInit = null;
                        resolve();
                    }
                }, 10000); // 10 second timeout
            });
        }
        
        if (!window.Spotify) {
            console.error('Spotify Web Playback SDK still not available');
            if (authMessage) {
                authMessage.innerHTML = 'Failed to load Spotify player. Please refresh the page and try again.';
                authMessage.style.display = 'block';
            }
            return;
        }
    }
    
    if (!accessToken) {
        console.error('No access token available');
        return;
    }
    
    console.log('Initializing Spotify Player...');
    
    try {
        // Create the player instance
        player = new window.Spotify.Player({
            name: 'Memory Vault Player',
            getOAuthToken: cb => { 
                console.log('Providing access token to player');
                if (!accessToken) {
                    console.error('No access token available, triggering re-authentication');
                    handleLogin().catch(console.error);
                    return;
                }
                cb(accessToken); 
            },
            volume: 0.5
        });
        
        // Add a small delay to help with WebSocket connection
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        isPlayerInitialized = true;
        
        // Add error handling
        player.addListener('initialization_error', ({ message }) => { 
            console.error('Initialization Error:', message);
        });
        
        player.addListener('authentication_error', ({ message }) => {
            console.error('Authentication Error:', message);
            // Clear invalid token and show login
            localStorage.removeItem('spotify_token_data');
            if (authMessage) {
                authMessage.style.display = 'block';
                authMessage.innerHTML = 'Session expired. Please log in again.';
            }
        });
        
        player.addListener('account_error', ({ message }) => { 
            console.error('Account Error:', message);
        });
        
        player.addListener('playback_error', ({ message }) => {
            console.error('Playback Error:', message);
        });
        
        // Player state changed
        player.addListener('player_state_changed', state => {
            if (!state) return;
            
            const { current_track, position, duration } = state.track_window;
            
            // Update UI with current track info
            updateNowPlaying(current_track, position, duration);
            
            // Update play/pause button
            isPlaying = !state.paused;
            updatePlayButton();
            
            // Update progress bar
            updateProgress();
        });
        
        // Successfully connected to the player
        player.addListener('ready', ({ device_id }) => {
            console.log('Player is ready with Device ID', device_id);
            deviceId = device_id;
            
            // Show player and hide auth message
            if (playerContainer) playerContainer.style.display = 'block';
            if (authMessage) authMessage.style.display = 'none';
            
            // Load the playlist
            loadPlaylist();
        });
        
        // Connect to the player
        const connected = await player.connect();
        if (connected) {
            console.log('Successfully connected to Spotify player');
        } else {
            console.error('Failed to connect to Spotify player');
        }
        
    } catch (error) {
        console.error('Error initializing Spotify player:', error);
    }
}

// Load user's playlists
async function loadPlaylist() {
    try {
        const response = await fetch('https://api.spotify.com/v1/me/playlists', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch playlists');
        }
        
        const data = await response.json();
        
        if (data.items && data.items.length > 0) {
            // For now, just load the first playlist
            const playlistId = data.items[0].id;
            await loadPlaylistTracks(playlistId);
        }
        
    } catch (error) {
        console.error('Error loading playlists:', error);
    }
}

// Load tracks from a playlist
async function loadPlaylistTracks(playlistId) {
    try {
        const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch playlist tracks');
        }
        
        const data = await response.json();
        
        // Process and store tracks
        playlistTracks = data.items.map(item => ({
            id: item.track.id,
            name: item.track.name,
            artist: item.track.artists[0].name,
            album: item.track.album.name,
            albumArt: item.track.album.images[0]?.url,
            duration: item.track.duration_ms,
            uri: item.track.uri
        }));
        
        filteredTracks = [...playlistTracks];
        renderTracks();
        
    } catch (error) {
        console.error('Error loading playlist tracks:', error);
    }
}

// Render tracks in the playlist
function renderTracks() {
    if (!playlistEl) return;
    
    if (filteredTracks.length === 0) {
        playlistEl.innerHTML = '<div class="empty">No tracks found</div>';
        return;
    }
    
    playlistEl.innerHTML = filteredTracks.map(track => `
        <div class="track" data-id="${track.id}">
            <div class="track-info">
                <div class="track-name">${track.name}</div>
                <div class="track-artist">${track.artist} • ${track.album}</div>
            </div>
            <div class="track-duration">${formatDuration(track.duration)}</div>
        </div>
    `).join('');
    
    // Add click handlers to tracks
    document.querySelectorAll('.track').forEach(trackEl => {
        trackEl.addEventListener('click', () => {
            const trackId = trackEl.dataset.id;
            const track = filteredTracks.find(t => t.id === trackId);
            if (track) {
                playTrack(track);
            }
        });
    });
}

// Play a specific track
async function playTrack(track) {
    if (!player || !deviceId) return;
    
    try {
        const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                uris: [track.uri],
                offset: { uri: track.uri },
                position_ms: 0
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to play track');
        }
        
        currentTrack = track;
        isPlaying = true;
        updatePlayButton();
        updateNowPlaying(track, 0, track.duration);
        updateActiveTrack();
        
    } catch (error) {
        console.error('Error playing track:', error);
    }
}

// Toggle play/pause
async function togglePlay() {
    if (!player) return;
    
    try {
        if (isPlaying) {
            await player.pause();
        } else {
            await player.resume();
        }
        
        isPlaying = !isPlaying;
        updatePlayButton();
        
    } catch (error) {
        console.error('Error toggling playback:', error);
    }
}

// Update the play/pause button
function updatePlayButton() {
    if (!playBtn) return;
    
    const icon = playBtn.querySelector('i');
    if (isPlaying) {
        playBtn.classList.add('playing');
        icon.classList.remove('fa-play');
        icon.classList.add('fa-pause');
    } else {
        playBtn.classList.remove('playing');
        icon.classList.remove('fa-pause');
        icon.classList.add('fa-play');
    }
}

// Update the now playing information
function updateNowPlaying(track, position = 0, duration = 0) {
    if (trackNameEl) trackNameEl.textContent = track.name;
    if (artistNameEl) artistNameEl.textContent = track.artist;
    if (albumArtEl) {
        albumArtEl.style.backgroundImage = `url(${track.albumArt || ''})`;
        albumArtEl.style.display = track.albumArt ? 'block' : 'none';
    }
    
    if (currentTimeEl) currentTimeEl.textContent = formatDuration(position || 0);
    if (durationEl) durationEl.textContent = formatDuration(duration || track.duration || 0);
    
    // Update progress bar
    if (progressBar) {
        const progress = duration > 0 ? (position / duration) * 100 : 0;
        progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
    }
}

// Update the active track in the playlist
function updateActiveTrack() {
    if (!currentTrack || !playlistEl) return;
    
    // Remove active class from all tracks
    document.querySelectorAll('.track').forEach(el => {
        el.classList.remove('active');
    });
    
    // Add active class to current track
    const activeTrack = document.querySelector(`.track[data-id="${currentTrack.id}"]`);
    if (activeTrack) {
        activeTrack.classList.add('active');
        activeTrack.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// Format duration in ms to MM:SS
function formatDuration(ms) {
    if (!ms) return '0:00';
    
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / 1000) / 60);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Initialize the app
async function init() {
    // Check for authorization code in URL
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code) {
        // Handle the OAuth code exchange
        await handleCodeExchange(code);
        return;
    }
    
    // Check for existing token
    const tokenData = JSON.parse(localStorage.getItem('spotify_token_data'));
    if (tokenData && tokenData.access_token) {
        // Check if token is expired
        const expiresAt = tokenData.timestamp + (tokenData.expires_in * 1000);
        if (Date.now() < expiresAt - 60000) { // 1 minute buffer
            // Token is still valid
            accessToken = tokenData.access_token;
            await initializePlayer();
            return;
        }
    }
    
    // Show login button if no valid token
    if (authMessage) {
        authMessage.style.display = 'block';
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', handleLogin);
        console.log('Login button event listener added');
    } else {
        console.error('Login button not found');
    }
});

if (playBtn) {
    playBtn.addEventListener('click', togglePlay);
}

if (prevBtn) {
    prevBtn.addEventListener('click', playPreviousTrack);
}

if (nextBtn) {
    nextBtn.addEventListener('click', playNextTrack);
}

if (searchBtn && searchInput) {
    searchBtn.addEventListener('click', filterTracks);
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') filterTracks();
    });
}

// Play previous track
async function playPreviousTrack() {
    if (!currentTrack || !player) return;
    
    const currentIndex = filteredTracks.findIndex(t => t.id === currentTrack.id);
    if (currentIndex > 0) {
        await playTrack(filteredTracks[currentIndex - 1]);
    }
}

// Play next track
async function playNextTrack() {
    if (!currentTrack || !player) return;
    
    const currentIndex = filteredTracks.findIndex(t => t.id === currentTrack.id);
    if (currentIndex < filteredTracks.length - 1) {
        await playTrack(filteredTracks[currentIndex + 1]);
    }
}

// Filter tracks based on search input
function filterTracks() {
    if (!searchInput) return;
    
    const searchTerm = searchInput.value.toLowerCase();
    
    if (!searchTerm) {
        filteredTracks = [...playlistTracks];
    } else {
        filteredTracks = playlistTracks.filter(track => 
            track.name.toLowerCase().includes(searchTerm) ||
            track.artist.toLowerCase().includes(searchTerm) ||
            track.album.toLowerCase().includes(searchTerm)
        );
    }
    
    renderTracks();
}

// Start the app
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the app
    init();

    // Add click handler for login button
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', (e) => {
            console.log('Login button clicked');
            handleLogin().catch(error => {
                console.error('Login error:', error);
            });
        });
    } else {
        console.error('Login button not found in DOM');
    }
});

// Clean up on page unload
window.addEventListener('beforeunload', () => {
    if (progressInterval) {
        clearInterval(progressInterval);
    }
    
    if (player) {
        player.disconnect();
    }
});
