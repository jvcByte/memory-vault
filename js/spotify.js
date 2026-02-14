// Spotify Web Playback SDK configuration
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

// Connection retry counter
let retryCount = 0;
const MAX_RETRIES = 5;

// Helper function to show error messages
function showError(message) {
    console.error('Error:', message);
    if (authMessage) {
        authMessage.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <span>${message}</span>
            </div>
        `;
        authMessage.style.display = 'block';
    }
}

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
        // Clear any existing tokens and state
        localStorage.removeItem('spotify_token_data');
        localStorage.removeItem('code_verifier');
        
        const codeVerifier = generateRandomString(128);
        const codeChallenge = await generateCodeChallenge(codeVerifier);
        
        // Store the code verifier for later use
        localStorage.setItem('code_verifier', codeVerifier);
        
        // Create the authorization URL
        const params = new URLSearchParams({
            client_id: clientId,
            response_type: 'code',
            redirect_uri: redirectUri,
            code_challenge_method: 'S256',
            code_challenge: codeChallenge,
            scope: scopes.join(' '),
            show_dialog: 'true' // Force the approval prompt
        });
        
        // Open the authorization URL in the same window
        window.location.href = `${authEndpoint}?${params.toString()}`;
        
    } catch (error) {
        console.error('Login error:', error);
        showError(`Login failed: ${error.message}`);
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
        
        const params = new URLSearchParams({
            client_id: clientId,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: redirectUri,
            code_verifier: codeVerifier
        });
        
        console.log('Making token request...');
        
        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Token exchange failed:', errorData);
            throw new Error(errorData.error_description || 'Failed to get access token');
        }
        
        const responseData = await response.json();
        console.log('Token exchange successful');
        
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
        
        // Set the access token
        accessToken = responseData.access_token;
        
        // Show loading state
        if (authMessage) {
            authMessage.innerHTML = '<div class="loading">Connecting to Spotify...</div>';
            authMessage.style.display = 'block';
        }
        
        // Initialize the player after a short delay
        setTimeout(() => {
            initializePlayer().catch(error => {
                console.error('Failed to initialize player:', error);
                showError(`Failed to initialize player: ${error.message}`);
            });
        }, 500);
        
    } catch (error) {
        console.error('Error during authentication:', error);
        
        // Clear any partial token data
        localStorage.removeItem('spotify_token_data');
        
        showError(`Authentication failed: ${error.message || 'Unknown error occurred'}`);
        
        // Add retry button
        if (authMessage) {
            const retryBtn = document.createElement('button');
            retryBtn.id = 'retryLogin';
            retryBtn.className = 'btn spotify-btn';
            retryBtn.innerHTML = '<i class="fas fa-redo"></i> Try Again';
            retryBtn.onclick = handleLogin;
            
            authMessage.appendChild(document.createElement('br'));
            authMessage.appendChild(document.createElement('br'));
            authMessage.appendChild(retryBtn);
        }
    }
}

// Verify the Spotify access token
async function verifyToken(token) {
    try {
        const response = await fetch('https://api.spotify.com/v1/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Invalid token');
        }
        
        const data = await response.json();
        console.log('Verified user:', data.display_name || data.id);
        return true;
        
    } catch (error) {
        console.error('Token verification failed:', error);
        return false;
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
        return;
    }
    
    try {
        console.log('Initializing Spotify Player...');
        
        // Check if we have a valid token
        if (!accessToken) {
            const tokenData = localStorage.getItem('spotify_token_data');
            if (tokenData) {
                const { access_token, timestamp } = JSON.parse(tokenData);
                // Check if token is expired (expires in 1 hour)
                if (Date.now() - timestamp < 3600000) {
                    accessToken = access_token;
                } else {
                    throw new Error('Access token expired');
                }
            } else {
                throw new Error('No access token found');
            }
        }
        
        // Create a new Spotify Player instance with error handling
        player = new window.Spotify.Player({
            name: 'Memory Vault Player',
            getOAuthToken: cb => {
                console.log('Providing access token to player');
                cb(accessToken);
            },
            volume: 0.5
        });
        
        // Error handling
        player.addListener('initialization_error', ({ message }) => { 
            console.error('Initialization Error:', message);
            showError('Failed to initialize player: ' + message);
            // Try to reinitialize after a delay
            setTimeout(initializePlayer, 3000);
        });
        
        player.addListener('authentication_error', ({ message }) => {
            console.error('Authentication Error:', message);
            // Clear any stored tokens and restart auth flow
            localStorage.removeItem('spotify_token_data');
            showError('Authentication failed. Please try logging in again.');
        });
        
        player.addListener('account_error', ({ message }) => {
            console.error('Account Error:', message);
            showError('Account error. Please check your Spotify account.');
        });
        
        player.addListener('playback_error', ({ message }) => {
            console.error('Playback Error:', message);
            showError('Playback error: ' + message);
        });
        
        // Playback status updates
        player.addListener('player_state_changed', state => {
            console.log('Player state changed:', state);
            updatePlaybackState(state);
        });
        
        // Ready
        player.addListener('ready', ({ device_id }) => {
            console.log('Player is ready with Device ID', device_id);
            isPlayerInitialized = true;
            currentDeviceId = device_id;
            
            // Hide any error messages
            if (authMessage) {
                authMessage.style.display = 'none';
            }
            
            // Load user's playlists
            loadUserPlaylists();
        });
        
        // Not Ready
        player.addListener('not_ready', ({ device_id }) => {
            console.log('Device ID is not ready for playback', device_id);
            showError('Player is not ready for playback');
            // Try to reconnect
            setTimeout(initializePlayer, 3000);
        });
        
        // Connect to the player with a timeout
        const connectPromise = player.connect();
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Connection timeout')), 10000)
        );
        
        try {
            const connected = await Promise.race([connectPromise, timeoutPromise]);
            if (!connected) {
                throw new Error('Failed to connect to Spotify player');
            }
        } catch (error) {
            console.error('Connection error:', error);
            if (error.message.includes('timeout') || error.message.includes('WebSocket')) {
                // Try fallback connection method
                console.log('Attempting fallback connection method...');
                await new Promise(resolve => setTimeout(resolve, 2000));
                return initializePlayer();
            }
            throw error;
        }
        
    } catch (error) {
        console.error('Failed to initialize player:', error);
        showError(`Failed to initialize player: ${error.message}`);
        
        // Retry with exponential backoff
        const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 30000); // Max 30s delay
        console.log(`Retrying in ${retryDelay}ms...`);
        retryCount++;
        
        setTimeout(initializePlayer, retryDelay);
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
