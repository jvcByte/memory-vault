// Local Music Player Implementation
class LocalMusicPlayer {
    constructor() {
        this.audio = new Audio();
        this.playlist = [];
        this.currentTrack = null;
        this.currentIndex = 0;
        this.isPlaying = false;
        this.volume = 0.7;
        
        // Initialize event listeners
        this.audio.addEventListener('ended', () => this.next());
        this.audio.addEventListener('error', (e) => {
            console.error('Local player error:', e);
            this.next();
        });
        
        // Example playlist - replace with actual music files from your server
        this.playlist = [
            { 
                id: 'local-1',
                name: 'Local Track 1',
                artists: [{ name: 'Local Artist' }],
                album: { images: [{ url: 'images/local-music.png' }] },
                duration_ms: 180000, // 3 minutes
                preview_url: '/music/track1.mp3'
            },
            // Add more tracks as needed
        ];
    }
    
    // Initialize the player UI
    init() {
        this.renderPlayer();
        this.updateNowPlaying();
        return this;
    }
    
    // Render the player UI
    renderPlayer() {
        const container = document.querySelector('.spotify-player');
        if (!container) return;
        
        container.innerHTML = `
            <div class="now-playing">
                <div class="album-art">
                    <img id="albumArt" src="images/local-music.png" alt="Album Art">
                </div>
                <div class="track-info">
                    <h2 id="trackName">Not Playing</h2>
                    <p id="artistName">-</p>
                </div>
                <div class="player-controls">
                    <button id="prevBtn" class="control-btn"><i class="fas fa-step-backward"></i></button>
                    <button id="playBtn" class="control-btn play"><i class="fas fa-play"></i></button>
                    <button id="nextBtn" class="control-btn"><i class="fas fa-step-forward"></i></button>
                </div>
                <div class="progress-container">
                    <span id="currentTime">0:00</span>
                    <div class="progress-bar">
                        <div class="progress"></div>
                    </div>
                    <span id="duration">0:00</span>
                </div>
            </div>
            <div class="playlist-container">
                <h3>Local Music</h3>
                <div class="playlist" id="playlist">
                    ${this.playlist.map((track, index) => `
                        <div class="track" data-index="${index}">
                            <div class="track-number">${index + 1}</div>
                            <div class="track-info">
                                <div class="track-name">${track.name}</div>
                                <div class="track-artist">${track.artists[0].name}</div>
                            </div>
                            <div class="track-duration">${this.formatDuration(track.duration_ms)}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        // Add event listeners
        document.getElementById('playBtn').addEventListener('click', () => this.togglePlay());
        document.getElementById('prevBtn').addEventListener('click', () => this.previous());
        document.getElementById('nextBtn').addEventListener('click', () => this.next());
        
        // Add click handlers for playlist items
        document.querySelectorAll('.track').forEach((trackEl, index) => {
            trackEl.addEventListener('click', () => this.playTrack(index));
        });
    }
    
    // Play a specific track by index
    playTrack(index) {
        if (index >= 0 && index < this.playlist.length) {
            this.currentIndex = index;
            this.currentTrack = this.playlist[index];
            this.audio.src = this.currentTrack.preview_url;
            this.play();
        }
    }
    
    // Play the current track
    play() {
        this.audio.play()
            .then(() => {
                this.isPlaying = true;
                this.updateNowPlaying();
            })
            .catch(e => console.error('Playback failed:', e));
    }
    
    // Pause the current track
    pause() {
        this.audio.pause();
        this.isPlaying = false;
        this.updateNowPlaying();
    }
    
    // Toggle play/pause
    togglePlay() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }
    
    // Play next track
    next() {
        this.currentIndex = (this.currentIndex + 1) % this.playlist.length;
        this.playTrack(this.currentIndex);
    }
    
    // Play previous track
    previous() {
        this.currentIndex = (this.currentIndex - 1 + this.playlist.length) % this.playlist.length;
        this.playTrack(this.currentIndex);
    }
    
    // Update the now playing UI
    updateNowPlaying() {
        const playBtn = document.getElementById('playBtn');
        const trackName = document.getElementById('trackName');
        const artistName = document.getElementById('artistName');
        const albumArt = document.getElementById('albumArt');
        
        if (this.currentTrack) {
            trackName.textContent = this.currentTrack.name;
            artistName.textContent = this.currentTrack.artists[0].name;
            albumArt.src = this.currentTrack.album.images[0]?.url || 'images/local-music.png';
        }
        
        if (playBtn) {
            const icon = playBtn.querySelector('i');
            if (this.isPlaying) {
                icon.classList.remove('fa-play');
                icon.classList.add('fa-pause');
            } else {
                icon.classList.remove('fa-pause');
                icon.classList.add('fa-play');
            }
        }
    }
    
    // Format duration in ms to MM:SS
    formatDuration(ms) {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
}

// Initialize the local player when the page loads
window.localPlayer = new LocalMusicPlayer().init();
