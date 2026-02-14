document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.querySelector('.prev');
    const nextBtn = document.querySelector('.next');
    const envelope = document.querySelector('.envelope');
    const yesBtn = document.getElementById('yesBtn');
    const noBtn = document.getElementById('noBtn');
    const responseMessage = document.getElementById('response');
    const playBtn = document.getElementById('playBtn');
    const prevBtnMusic = document.getElementById('prevBtn');
    const nextBtnMusic = document.getElementById('nextBtn');
    const progress = document.querySelector('.progress');
    const progressContainer = document.querySelector('.progress-container');
    const audio = document.getElementById('bgMusic');
    const songTitle = document.getElementById('songTitle');
    const artist = document.getElementById('artist');

    // Current slide index
    let currentSlide = 0;
    let isAnimating = false;
    let touchStartY = 0;
    let touchEndY = 0;
    let isEnvelopeOpen = false;

    // Songs data
    const songs = [
        {
            title: 'Perfect',
            artist: 'Ed Sheeran',
            src: 'music/perfect.mp3'
        },
        {
            title: 'All of Me',
            artist: 'John Legend',
            src: 'music/all-of-me.mp3'
        },
        {
            title: 'A Thousand Years',
            artist: 'Christina Perri',
            src: 'music/a-thousand-years.mp3'
        }
    ];

    let songIndex = 0;

    // Initialize the slideshow
    function init() {
        // Show first slide
        showSlide(0);
        
        // Set up event listeners
        setupEventListeners();
        
        // Load first song
        loadSong(songs[songIndex]);
    }

    // Set up all event listeners
    function setupEventListeners() {
        // Navigation dots
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => goToSlide(index));
        });

        // Navigation buttons
        if (prevBtn) prevBtn.addEventListener('click', prevSlide);
        if (nextBtn) nextBtn.addEventListener('click', nextSlide);

        // Envelope interaction
        if (envelope) {
            envelope.addEventListener('click', toggleEnvelope);
        }

        // Valentine buttons
        if (yesBtn) {
            yesBtn.addEventListener('click', () => showResponse('Yay! I knew you would say yes! ❤️'));
        }

        if (noBtn) {
            noBtn.addEventListener('mouseover', moveButton);
            noBtn.addEventListener('touchstart', moveButton);
            noBtn.addEventListener('click', () => showResponse("I knew you couldn't resist! 😘"));
        }

        // Music player controls
        if (playBtn) {
            playBtn.addEventListener('click', togglePlay);
        }

        if (prevBtnMusic) {
            prevBtnMusic.addEventListener('click', prevSong);
        }

        if (nextBtnMusic) {
            nextBtnMusic.addEventListener('click', nextSong);
        }

        // Progress bar
        if (progressContainer) {
            progressContainer.addEventListener('click', setProgress);
        }

        // Time update
        if (audio) {
            audio.addEventListener('timeupdate', updateProgress);
            audio.addEventListener('ended', nextSong);
        }

        // Touch events for mobile swipe
        document.addEventListener('touchstart', handleTouchStart, { passive: true });
        document.addEventListener('touchend', handleTouchEnd, { passive: true });

        // Keyboard navigation
        document.addEventListener('keydown', handleKeyDown);
    }

    // Show specific slide
    function showSlide(index) {
        if (isAnimating || index < 0 || index >= slides.length) return;
        
        isAnimating = true;
        
        // Hide current slide
        slides[currentSlide].classList.remove('active');
        if (dots[currentSlide]) dots[currentSlide].classList.remove('active');
        
        // Show new slide
        currentSlide = index;
        slides[currentSlide].classList.add('active');
        if (dots[currentSlide]) dots[currentSlide].classList.add('active');
        
        // Update URL hash
        window.location.hash = slides[currentSlide].id;
        
        // Reset animation flag after transition
        setTimeout(() => {
            isAnimating = false;
        }, 800);
        
        // Special behaviors for specific slides
        if (slides[currentSlide].id === 'music' && audio && audio.paused) {
            // Auto-play music when reaching the music slide
            audio.play().catch(e => console.log("Audio play failed:", e));
            updatePlayButton();
        }
    }

    // Go to next slide
    function nextSlide() {
        if (currentSlide < slides.length - 1) {
            showSlide(currentSlide + 1);
        } else {
            // Loop back to first slide
            showSlide(0);
        }
    }

    // Go to previous slide
    function prevSlide() {
        if (currentSlide > 0) {
            showSlide(currentSlide - 1);
        } else {
            // Go to last slide
            showSlide(slides.length - 1);
        }
    }

    // Go to specific slide by index
    function goToSlide(index) {
        showSlide(index);
    }

    // Toggle envelope open/close
    function toggleEnvelope() {
        isEnvelopeOpen = !isEnvelopeOpen;
        if (isEnvelopeOpen) {
            envelope.classList.add('open');
            // Auto-scroll to letter content after a delay
            setTimeout(() => {
                showSlide(2); // Assuming letter content is the 3rd slide (index 2)
            }, 1000);
        } else {
            envelope.classList.remove('open');
        }
    }

    // Move button when hovered (for 'No' button)
    function moveButton(e) {
        e.preventDefault();
        const button = e.currentTarget;
        const buttonRect = button.getBoundingClientRect();
        const maxX = window.innerWidth - buttonRect.width - 20;
        const maxY = window.innerHeight - buttonRect.height - 20;
        
        // Calculate random position
        const randomX = Math.floor(Math.random() * maxX);
        const randomY = Math.floor(Math.random() * maxY);
        
        // Apply new position
        button.style.position = 'absolute';
        button.style.left = `${randomX}px`;
        button.style.top = `${randomY}px`;
        button.style.transition = 'all 0.3s ease-out';
    }

    // Show response message
    function showResponse(message) {
        if (!responseMessage) return;
        
        responseMessage.textContent = message;
        responseMessage.classList.add('show');
        
        // Hide message after 3 seconds
        setTimeout(() => {
            responseMessage.classList.remove('show');
        }, 3000);
    }

    // Music player functions
    function loadSong(song) {
        if (!songTitle || !artist || !audio) return;
        
        songTitle.textContent = song.title;
        artist.textContent = song.artist;
        audio.src = song.src;
    }

    function togglePlay() {
        if (!audio) return;
        
        if (audio.paused) {
            audio.play().catch(e => console.log("Audio play failed:", e));
        } else {
            audio.pause();
        }
        updatePlayButton();
    }

    function updatePlayButton() {
        if (!playBtn || !audio) return;
        
        const icon = playBtn.querySelector('i');
        if (!icon) return;
        
        if (audio.paused) {
            icon.classList.remove('fa-pause');
            icon.classList.add('fa-play');
            playBtn.classList.remove('playing');
        } else {
            icon.classList.remove('fa-play');
            icon.classList.add('fa-pause');
            playBtn.classList.add('playing');
        }
    }

    function prevSong() {
        if (!audio) return;
        
        songIndex--;
        if (songIndex < 0) {
            songIndex = songs.length - 1;
        }
        loadSong(songs[songIndex]);
        audio.play().catch(e => console.log("Audio play failed:", e));
        updatePlayButton();
    }

    function nextSong() {
        if (!audio) return;
        
        songIndex = (songIndex + 1) % songs.length;
        loadSong(songs[songIndex]);
        audio.play().catch(e => console.log("Audio play failed:", e));
        updatePlayButton();
    }

    function updateProgress() {
        if (!progress || !audio) return;
        
        const { duration, currentTime } = audio;
        const progressPercent = (currentTime / duration) * 100;
        progress.style.width = `${progressPercent}%`;
    }

    function setProgress(e) {
        if (!progressContainer || !audio) return;
        
        const width = this.clientWidth;
        const clickX = e.offsetX;
        const duration = audio.duration;
        audio.currentTime = (clickX / width) * duration;
    }

    // Touch event handlers for swipe
    function handleTouchStart(e) {
        touchStartY = e.touches[0].clientY;
    }

    function handleTouchEnd(e) {
        if (!touchStartY) return;
        
        touchEndY = e.changedTouches[0].clientY;
        const diffY = touchStartY - touchEndY;
        
        // Minimum swipe distance
        if (Math.abs(diffY) > 50) {
            if (diffY > 0) {
                // Swipe up - next slide
                nextSlide();
            } else {
                // Swipe down - previous slide
                prevSlide();
            }
        }
        
        touchStartY = 0;
        touchEndY = 0;
    }

    // Keyboard navigation
    function handleKeyDown(e) {
        switch(e.key) {
            case 'ArrowUp':
            case 'ArrowLeft':
                e.preventDefault();
                prevSlide();
                break;
            case 'ArrowDown':
            case 'ArrowRight':
            case ' ':
                e.preventDefault();
                nextSlide();
                break;
            case 'Home':
                e.preventDefault();
                showSlide(0);
                break;
            case 'End':
                e.preventDefault();
                showSlide(slides.length - 1);
                break;
        }
    }

    // Initialize the slideshow
    init();
});
