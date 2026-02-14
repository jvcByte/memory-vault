// Spotify Web API configuration
const clientId = '1ce3893c730c480689dc13df6183f212';
const redirectUri = 'https://valndinma.vercel.app/spotify.html';
const authEndpoint = 'https://accounts.spotify.com/authorize';
const responseType = 'token';
const scopesArray = [
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
    'streaming',
    'user-library-read',
    'user-library-modify'
];
const scopes = scopesArray.join('%20');

// Token handling is moved to the main flow below

// DOM Elements
const loginBtn = document.getElementById('loginBtn');
const authMessage = document.getElementById('authMessage');
const spotifyPlayer = document.querySelector('.spotify-player');
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
let player;
let deviceId;
let currentTrack = null;
let isPlaying = false;
let progressInterval;
let playlistTracks = [];
let filteredTracks = [];

// Check for access token in URL
const urlParams = new URLSearchParams(window.location.hash.substring(1));
const token = urlParams.get('access_token');
const expiresIn = urlParams.get('expires_in');

if (token) {
    // Remove token from URL
    window.history.pushState({}, document.title, window.location.pathname);
    
    // Store token and related data
    accessToken = token;
    localStorage.setItem('spotify_access_token', token);
    localStorage.setItem('spotify_token_timestamp', Date.now());
    localStorage.setItem('spotify_token_expires_in', expiresIn || '3600');
    
    // Initialize player
    initializePlayer();
} else {
    // Check for token in localStorage
    const storedToken = localStorage.getItem('spotify_access_token');
    if (storedToken) {
        accessToken = storedToken;
        initializePlayer();
    } else {
        // Show login button
        authMessage.style.display = 'block';
    }
}

// Event Listeners
if (loginBtn) {
    loginBtn.addEventListener('click', () => {
        const params = new URLSearchParams({
            client_id: clientId,
            response_type: 'token',
            redirect_uri: redirectUri,
            scope: scopesArray.join(' '),
            show_dialog: 'true'
        });
        
        window.location.href = `${authEndpoint}?${params.toString()}`;
    });
}

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
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') filterTracks();
    });
}

// Initialize Spotify Web Playback SDK
function initializePlayer() {
    const accessToken = window.localStorage.getItem('spotify_access_token');
    if (!accessToken) {
        // If no token, redirect to Spotify authorization
        window.location = `${authEndpoint}?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopesArray.join('%20')}&response_type=${responseType}&show_dialog=true`;
        return;
    }
    // Hide auth message and show player
    authMessage.style.display = 'none';
    spotifyPlayer.style.display = 'block';
    
    // Load the Spotify Web Playback SDK script
    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;
    document.body.appendChild(script);
    
    // Wait for Spotify Web Playback SDK to be ready
    window.onSpotifyWebPlaybackSDKReady = () => {
        player = new window.Spotify.Player({
            name: 'Memory Vault Player',
            getOAuthToken: cb => { cb(accessToken); },
            volume: 0.5
        });

        // Ready
        player.addListener('ready', ({ device_id }) => {
            console.log('Ready with Device ID', device_id);
            deviceId = device_id;
            transferPlayback(device_id);
            fetchPlaylist();
        });

        // Not Ready
        player.addListener('not_ready', ({ device_id }) => {
            console.log('Device ID has gone offline', device_id);
        });
        
        // Player state changed
        player.addListener('player_state_changed', (state) => {
            if (!state) return;
            
            // Update UI with current track info
            const { current_track, position, duration } = state.track_window;
            updateNowPlaying(current_track, position, duration);
            
            // Update play/pause button
            isPlaying = !state.paused;
            updatePlayButton();
        });

        // Connect to the player
        player.connect().then(success => {
            if (success) {
                console.log('Connected to Spotify player');
            }
        });
    };
}

// Transfer playback to this device
function transferPlayback(deviceId) {
    fetch('https://api.spotify.com/v1/me/player', {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            device_ids: [deviceId],
            play: false
        })
    }).catch(error => console.error('Error transferring playback:', error));
}

// Fetch user's playlists
async function fetchPlaylist() {
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
        
        // For now, let's use the first playlist
        if (data.items && data.items.length > 0) {
            const playlistId = data.items[0].id;
            fetchPlaylistTracks(playlistId);
        } else {
            // No playlists found, show a message
            playlistEl.innerHTML = '<div class="no-tracks">No playlists found. Create one on Spotify and try again.</div>';
        }
    } catch (error) {
        console.error('Error fetching playlists:', error);
        playlistEl.innerHTML = `<div class="error">Error loading playlists: ${error.message}</div>`;
    }
}

// Fetch tracks from a playlist
async function fetchPlaylistTracks(playlistId) {
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
        
        // Process tracks
        playlistTracks = data.items
            .filter(item => item.track) // Filter out null tracks
            .map(item => ({
                id: item.track.id,
                name: item.track.name,
                artist: item.track.artists.map(a => a.name).join(', '),
                album: item.track.album.name,
                cover: item.track.album.images[0]?.url || 'images/spotify-logo.png',
                previewUrl: item.track.preview_url,
                duration: formatDuration(item.track.duration_ms),
                uri: item.track.uri
            }));
        
        // Display tracks
        filteredTracks = [...playlistTracks];
        renderTracks();
        
    } catch (error) {
        console.error('Error fetching playlist tracks:', error);
        playlistEl.innerHTML = `<div class="error">Error loading tracks: ${error.message}</div>`;
    }
}

// Render tracks in the playlist
function renderTracks() {
    if (!playlistEl) return;
    
    if (filteredTracks.length === 0) {
        playlistEl.innerHTML = '<div class="no-tracks">No tracks found. Try a different search.</div>';
        return;
    }
    
    playlistEl.innerHTML = filteredTracks.map((track, index) => `
        <div class="track ${currentTrack?.id === track.id ? 'playing' : ''}" data-index="${index}">
            <img src="${track.cover}" alt="${track.album}" class="track-cover">
            <div class="track-info">
                <div class="track-name">${track.name}</div>
                <div class="track-artist">${track.artist}</div>
            </div>
            <div class="track-duration">${track.duration}</div>
        </div>
    `).join('');
    
    // Add click event listeners to tracks
    document.querySelectorAll('.track').forEach((trackEl, index) => {
        trackEl.addEventListener('click', () => {
            playTrack(filteredTracks[index]);
        });
    });
}

// Play a specific track
function playTrack(track) {
    if (!player || !deviceId) return;
    
    currentTrack = track;
    
    // Update UI
    trackNameEl.textContent = track.name;
    artistNameEl.textContent = track.artist;
    albumArtEl.src = track.cover;
    
    // Play the track using the Web Playback SDK
    fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            uris: [track.uri],
            position_ms: 0
        })
    }).then(response => {
        if (!response.ok) {
            throw new Error('Failed to play track');
        }
        isPlaying = true;
        updatePlayButton();
        updateActiveTrack();
    }).catch(error => {
        console.error('Error playing track:', error);
    });
}

// Toggle play/pause
function togglePlay() {
    if (!player) return;
    
    if (isPlaying) {
        player.pause();
    } else {
        player.resume();
    }
    
    isPlaying = !isPlaying;
    updatePlayButton();
}

// Play previous track
function playPreviousTrack() {
    if (!currentTrack || !playlistTracks.length) return;
    
    const currentIndex = playlistTracks.findIndex(t => t.id === currentTrack.id);
    const prevIndex = (currentIndex - 1 + playlistTracks.length) % playlistTracks.length;
    
    playTrack(playlistTracks[prevIndex]);
}

// Play next track
function playNextTrack() {
    if (!currentTrack || !playlistTracks.length) return;
    
    const currentIndex = playlistTracks.findIndex(t => t.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % playlistTracks.length;
    
    playTrack(playlistTracks[nextIndex]);
}

// Update the play/pause button
function updatePlayButton() {
    if (!playBtn) return;
    
    const icon = playBtn.querySelector('i');
    if (isPlaying) {
        icon.classList.remove('fa-play');
        icon.classList.add('fa-pause');
    } else {
        icon.classList.remove('fa-pause');
        icon.classList.add('fa-play');
    }
}

// Update the now playing information
function updateNowPlaying(track, position = 0, duration = 0) {
    if (!track) return;
    
    // Only update if it's a new track
    if (!currentTrack || currentTrack.id !== track.id) {
        currentTrack = {
            id: track.id,
            name: track.name,
            artist: track.artists.map(a => a.name).join(', '),
            cover: track.album.images[0]?.url || 'images/spotify-logo.png',
            duration: formatDuration(track.duration_ms)
        };
        
        trackNameEl.textContent = currentTrack.name;
        artistNameEl.textContent = currentTrack.artist;
        albumArtEl.src = currentTrack.cover;
        
        updateActiveTrack();
    }
    
    // Update progress bar
    const progressPercent = (position / track.duration_ms) * 100;
    progressBar.style.width = `${progressPercent}%`;
    
    // Update time displays
    currentTimeEl.textContent = formatDuration(position);
    durationEl.textContent = formatDuration(track.duration_ms);
}

// Update the active track in the playlist
function updateActiveTrack() {
    if (!currentTrack || !playlistEl) return;
    
    // Remove 'playing' class from all tracks
    document.querySelectorAll('.track').forEach(el => {
        el.classList.remove('playing');
    });
    
    // Find and highlight the current track
    const trackEl = document.querySelector(`.track[data-track-id="${currentTrack.id}"]`);
    if (trackEl) {
        trackEl.classList.add('playing');
        trackEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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

// Format duration in ms to MM:SS
function formatDuration(ms) {
    if (!ms) return '0:00';
    
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

// Start progress update interval
function startProgressUpdate() {
    clearInterval(progressInterval);
    progressInterval = setInterval(updateProgress, 1000);
}

// Stop progress update interval
function stopProgressUpdate() {
    clearInterval(progressInterval);
}

// Update progress bar
function updateProgress() {
    if (!currentTrack) return;
    
    // In a real implementation, you would get the current position from the player
    // For now, we'll just update the UI based on the player's state
}

// Clean up on page unload
window.addEventListener('beforeunload', () => {
    stopProgressUpdate();
    if (player) {
        player.disconnect();
    }
});
