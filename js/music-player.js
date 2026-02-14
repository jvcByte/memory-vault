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
    const playlist = document.getElementById('playlist');
    
    // Playlist - Array of song objects
    const songs = [
        {
            title: "Beautiful Things",
            artist: "Benson Boone",
            src: "music/beautiful_things.mp3",
            cover: "images/songs/beautiful_things.jpeg"
        },
        // Add more songs here in the same format
        // {
        //     title: "Song Title",
        //     artist: "Artist Name",
        //     src: "music/song.mp3",
        //     cover: "images/cover.jpg"
        // }
    ];

    // Current song index
    let currentSongIndex = 0;
    let isPlaying = false;
    let audio = new Audio();

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
        const progressContainer = document.querySelector('.progress-container');
        progressContainer.addEventListener('click', setProgress);
    }

    // Load song
    function loadSong(index) {
        const song = songs[index];
        songTitle.textContent = song.title;
        artist.textContent = song.artist;
        albumArt.src = song.cover;
        audio.src = song.src;
    }

    // Play/Pause
    function togglePlay() {
        if (isPlaying) {
            pauseSong();
        } else {
            playSong();
        }
    }

    function playSong() {
        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
        playBtn.title = 'Pause';
        isPlaying = true;
        audio.play();
    }

    function pauseSong() {
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
        playBtn.title = 'Play';
        isPlaying = false;
        audio.pause();
    }

    // Previous Song
    function prevSong() {
        currentSongIndex--;
        if (currentSongIndex < 0) {
            currentSongIndex = songs.length - 1;
        }
        loadSong(currentSongIndex);
        if (isPlaying) playSong();
        updateActiveSong();
    }

    // Next Song
    function nextSong() {
        currentSongIndex++;
        if (currentSongIndex >= songs.length) {
            currentSongIndex = 0;
        }
        loadSong(currentSongIndex);
        if (isPlaying) playSong();
        updateActiveSong();
    }

    // Update Progress Bar
    function updateProgressBar() {
        const { duration, currentTime } = audio;
        const progressPercent = (currentTime / duration) * 100;
        progress.style.width = `${progressPercent}%`;
    }

    // Set Progress Bar
    function setProgress(e) {
        const width = this.clientWidth;
        const clickX = e.offsetX;
        const duration = audio.duration;
        audio.currentTime = (clickX / width) * duration;
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
    initPlayer();
});
