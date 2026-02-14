// Music Player Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const playBtn = document.getElementById('playBtn');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const songTitle = document.getElementById('songTitle');
    const artist = document.getElementById('artist');
    const albumArt = document.getElementById('albumArt');
    const progress = document.querySelector('.progress');
    const progressContainer = document.querySelector('.progress-container');
    const currentTimeEl = document.getElementById('currentTime');
    const durationEl = document.getElementById('duration');
    const playlist = document.getElementById('playlist');
    
    // Songs data with album art and duration
    const songs = [
        {
            title: 'Beautiful Things',
            artist: 'Benson Boone',
            src: 'music/benson-boone-beautiful-things.mp3',
            cover: 'images/songs/beautiful_things.jpeg',
            duration: '3:13'  // Update this with actual duration if needed
        }
    ];

    // Current song index
    let currentSongIndex = 0;
    let isPlaying = false;
    const audio = new Audio();

    // Format time in seconds to MM:SS
    function formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    }

    // Update the progress bar
    function updateProgressBar() {
        const { duration, currentTime } = audio;
        const progressPercent = (currentTime / duration) * 100;
        progress.style.width = `${progressPercent}%`;
        currentTimeEl.textContent = formatTime(currentTime);
    }

    // Set progress bar when clicking on it
    function setProgress(e) {
        if (!audio.duration) return;
        const width = this.clientWidth;
        const clickX = e.offsetX;
        const duration = audio.duration;
        audio.currentTime = (clickX / width) * duration;
    }

    // Play the current song
    function playSong() {
        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
        playBtn.title = 'Pause';
        isPlaying = true;
        
        // Play the audio and handle any errors
        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.error('Playback failed:', error);
                // Show play button in case of error
                playBtn.innerHTML = '<i class="fas fa-play"></i>';
                isPlaying = false;
                
                // Show error message to user
                alert('Unable to play audio. Please interact with the page first or check the console for details.');
            });
        }
    }

    // Pause the current song
    function pauseSong() {
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
        playBtn.title = 'Play';
        isPlaying = false;
        audio.pause();
    }

    // Toggle play/pause
    function togglePlay() {
        if (isPlaying) {
            pauseSong();
        } else {
            playSong();
        }
    }

    // Load a song
    function loadSong(index) {
        const song = songs[index];
        console.log('Loading song:', song);
        songTitle.textContent = song.title;
        artist.textContent = song.artist;
        albumArt.src = song.cover;
        audio.src = song.src;
        
        // Set up audio element
        audio.load();
        
        // When audio metadata is loaded, update the duration
        audio.addEventListener('loadedmetadata', function() {
            console.log('Audio metadata loaded');
            durationEl.textContent = formatTime(audio.duration);
        });
        
        // Log any errors
        audio.onerror = function(e) {
            console.error('Error loading audio:', e);
            console.error('Audio source:', audio.src);
        };
    }

    // Previous song
    function prevSong() {
        currentSongIndex--;
        if (currentSongIndex < 0) {
            currentSongIndex = songs.length - 1;
        }
        loadSong(currentSongIndex);
        if (isPlaying) playSong();
        updateActiveSong();
    }

    // Next song
    function nextSong() {
        currentSongIndex = (currentSongIndex + 1) % songs.length;
        loadSong(currentSongIndex);
        if (isPlaying) playSong();
        updateActiveSong();
    }

    // Update active song in playlist
    function updateActiveSong() {
        const playlistItems = document.querySelectorAll('.playlist-item');
        playlistItems.forEach(item => item.classList.remove('active'));
        if (playlistItems[currentSongIndex]) {
            playlistItems[currentSongIndex].classList.add('active');
        }
    }

    // Create playlist items
    function renderPlaylist() {
        playlist.innerHTML = '';
        songs.forEach((song, index) => {
            const songEl = document.createElement('div');
            songEl.classList.add('playlist-item');
            if (index === currentSongIndex) {
                songEl.classList.add('active');
            }
            songEl.innerHTML = `
                <img src="${song.cover}" alt="${song.title}">
                <div class="song-info">
                    <h4>${song.title}</h4>
                    <p>${song.artist}</p>
                </div>
                <span class="duration">${song.duration}</span>
            `;
            songEl.addEventListener('click', () => {
                currentSongIndex = index;
                loadSong(currentSongIndex);
                playSong();
                updateActiveSong();
            });
            playlist.appendChild(songEl);
        });
    }

    // Initialize the player
    function initPlayer() {
        // Load the first song
        loadSong(currentSongIndex);
        
        // Create playlist items
        renderPlaylist();
        
        // Event Listeners
        playBtn.addEventListener('click', togglePlay);
        prevBtn.addEventListener('click', prevSong);
        nextBtn.addEventListener('click', nextSong);
        
        // Time update
        audio.addEventListener('timeupdate', updateProgressBar);
        
        // When song ends
        audio.addEventListener('ended', nextSong);
        
        // Click on progress bar to seek
        progressContainer.addEventListener('click', setProgress);
        
        // Set initial time display
        currentTimeEl.textContent = '0:00';
        
        // Set initial volume
        audio.volume = 0.7;
        
        // Log for debugging
        console.log('Music player initialized');
    }

    // Load song
    function loadSong(index) {
        const song = songs[index];
        console.log('Loading song:', song);
        songTitle.textContent = song.title;
        artist.textContent = song.artist;
        albumArt.src = song.cover;
        audio.src = song.src;
        
        // Set up audio element
        audio.load();
        
        // When audio metadata is loaded, update the duration
        audio.addEventListener('loadedmetadata', function() {
            console.log('Audio metadata loaded');
            durationEl.textContent = formatTime(audio.duration);
        });
        
        // Log any errors
        audio.onerror = function(e) {
            console.error('Error loading audio:', e);
            console.error('Audio source:', audio.src);
        };
    }


    // Create playlist items
    function renderPlaylist() {
        songs.forEach((song, index) => {
            const li = document.createElement('li');
            li.className = 'playlist-item';
            if (index === currentSongIndex) li.classList.add('active');
            
            li.innerHTML = `
                <span class="song-number">${index + 1}.</span>
                <div class="song-details">
                    <span class="song-title">${song.title}</span>
                    <span class="song-artist">${song.artist}</span>
                </div>
                <span class="song-duration">3:45</span>
            `;
            
            li.addEventListener('click', () => {
                currentSongIndex = index;
                loadSong(currentSongIndex);
                playSong();
                updateActiveSong();
            });
            
            playlist.appendChild(li);
        });
    }

    // Update active song in playlist
    function updateActiveSong() {
        const items = document.querySelectorAll('.playlist-item');
        items.forEach(item => item.classList.remove('active'));
        items[currentSongIndex].classList.add('active');
        
        // Scroll to active song
        items[currentSongIndex].scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    }

    // Initialize the player when the DOM is fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        console.log('DOM fully loaded, initializing player...');
        initPlayer();
        
        // Add a one-time click event to the document to help with autoplay restrictions
        document.body.addEventListener('click', function enableAudio() {
            console.log('Page clicked, enabling audio...');
            // This helps with autoplay restrictions in some browsers
            if (audio.paused) {
                audio.play().then(() => {
                    audio.pause();
                }).catch(e => {
                    console.log('Initial play attempt failed (this is normal):', e);
                });
            }
            // Remove the event after first click
            document.body.removeEventListener('click', enableAudio);
        }, { once: true });
    });
});
