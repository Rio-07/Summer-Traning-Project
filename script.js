// 1. LINKED LIST - For Playlist Management
class SongNode {
    constructor(title, file) {
        this.title = title;
        this.file = file;
        this.url = URL.createObjectURL(file);
        this.next = null;
        this.prev = null;
    }
}

class PlaylistLinkedList {
    constructor() {
        this.head = null;
        this.tail = null;
        this.current = null;
        this.size = 0;
    }

    add(title, file) {
        const newNode = new SongNode(title, file);
        if (!this.head) {
            this.head = this.tail = this.current = newNode;
        } else {
            this.tail.next = newNode;
            newNode.prev = this.tail;
            this.tail = newNode;
        }
        this.size++;
        return newNode;
    }

    next() {
        if (this.current && this.current.next) {
            this.current = this.current.next;
            return this.current;
        }
        return null;
    }

    prev() {
        if (this.current && this.current.prev) {
            this.current = this.current.prev;
            return this.current;
        }
        return null;
    }

    toArray() {
        const result = [];
        let current = this.head;
        while (current) {
            result.push({ title: current.title, file: current.file, url: current.url });
            current = current.next;
        }
        return result;
    }
}

// 2. STACK - For Recently Played Songs (LIFO)
class HistoryStack {
    constructor(maxSize = 5) {
        this.items = [];
        this.maxSize = maxSize;
    }

    push(song) {
        if (this.items.length >= this.maxSize) {
            this.items.shift();
        }
        this.items.push(song);
    }

    getAll() {
        return [...this.items].reverse();
    }

    clear() {
        this.items = [];
    }
}

// Music Player Class
class MusicPlayer {
    constructor() {
        this.playlist = new PlaylistLinkedList();
        this.history = new HistoryStack();
        this.isPlaying = false;
        this.audioPlayer = document.getElementById('audioPlayer');
        this.initializeEventListeners();
        this.initializeAudioEvents();
        this.updateDisplay();
        this.updatePlayButton();
    }

    initializeEventListeners() {
        document.getElementById('loadFilesBtn').addEventListener('click', () => this.loadFiles());
        document.getElementById('playBtn').addEventListener('click', () => this.togglePlay());
        document.getElementById('nextBtn').addEventListener('click', () => this.nextSong());
        document.getElementById('prevBtn').addEventListener('click', () => this.prevSong());
        document.getElementById('clearHistoryBtn').addEventListener('click', () => this.clearHistory());
        document.getElementById('progressContainer').addEventListener('click', (e) => this.seek(e));
        document.getElementById('volumeSlider').addEventListener('input', (e) => this.setVolume(e.target.value));
        document.getElementById('volumeUpBtn').addEventListener('click', () => this.volumeUp());
        document.getElementById('volumeDownBtn').addEventListener('click', () => this.volumeDown());
    }

    initializeAudioEvents() {
        this.audioPlayer.addEventListener('ended', () => this.nextSong());
        this.audioPlayer.addEventListener('timeupdate', () => this.updateProgress());
        this.audioPlayer.addEventListener('loadedmetadata', () => this.updateDuration());
        this.audioPlayer.addEventListener('play', () => this.updatePlayButton());
        this.audioPlayer.addEventListener('pause', () => this.updatePlayButton());
        this.audioPlayer.volume = 0.5;
    }

    updatePlayButton() {
        const playBtn = document.getElementById('playBtn');
        if (this.audioPlayer.paused) {
            playBtn.innerHTML = `
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z"/>
                </svg>
            `;
        } else {
            playBtn.innerHTML = `
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                </svg>
            `;
        }
    }

    loadFiles() {
        const fileInput = document.getElementById('fileInput');
        const files = Array.from(fileInput.files);
        
        if (files.length === 0) {
            alert('Please select MP3 files first!');
            return;
        }

        files.forEach(file => {
            if (file.type.startsWith('audio/')) {
                const title = file.name.replace(/\.[^/.]+$/, "");
                this.playlist.add(title, file);
            }
        });
        
        this.updateDisplay();
        fileInput.value = '';
    }

    togglePlay() {
        if (!this.playlist.current) {
            alert('Please load songs first!');
            return;
        }

        if (this.audioPlayer.src !== this.playlist.current.url) {
            this.audioPlayer.src = this.playlist.current.url;
        }

        if (this.audioPlayer.paused) {
            this.audioPlayer.play();
            this.isPlaying = true;
            this.history.push({ title: this.playlist.current.title });
        } else {
            this.audioPlayer.pause();
            this.isPlaying = false;
        }
        
        this.updateDisplay();
    }

    nextSong() {
        if (!this.playlist.next()) {
            this.playlist.current = this.playlist.head;
        }
        if (this.playlist.current) {
            this.audioPlayer.src = this.playlist.current.url;
            if (this.isPlaying) {
                this.audioPlayer.play();
            }
            this.history.push({ title: this.playlist.current.title });
        }
        this.updateDisplay();
    }

    prevSong() {
        this.playlist.prev();
        if (this.playlist.current) {
            this.audioPlayer.src = this.playlist.current.url;
            if (this.isPlaying) {
                this.audioPlayer.play();
            }
            this.history.push({ title: this.playlist.current.title });
        }
        this.updateDisplay();
    }

    clearHistory() {
        this.history.clear();
        this.updateDisplay();
    }

    updateProgress() {
        if (this.audioPlayer.duration) {
            const progress = (this.audioPlayer.currentTime / this.audioPlayer.duration) * 100;
            document.getElementById('progressBar').style.width = progress + '%';
            document.getElementById('currentTime').textContent = this.formatTime(this.audioPlayer.currentTime);
        }
    }

    updateDuration() {
        if (this.audioPlayer.duration) {
            document.getElementById('totalTime').textContent = this.formatTime(this.audioPlayer.duration);
        }
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    seek(e) {
        if (this.audioPlayer.duration) {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const width = rect.width;
            const newTime = (clickX / width) * this.audioPlayer.duration;
            this.audioPlayer.currentTime = newTime;
        }
    }

    setVolume(value) {
        this.audioPlayer.volume = value / 100;
    }

    volumeUp() {
        const slider = document.getElementById('volumeSlider');
        const newValue = Math.min(100, parseInt(slider.value) + 10);
        slider.value = newValue;
        this.setVolume(newValue);
    }

    volumeDown() {
        const slider = document.getElementById('volumeSlider');
        const newValue = Math.max(0, parseInt(slider.value) - 10);
        slider.value = newValue;
        this.setVolume(newValue);
    }

    updateDisplay() {
        // Update current song display
        const currentSong = document.getElementById('currentSong');
        if (this.playlist.current) {
            currentSong.textContent = this.playlist.current.title;
        } else {
            currentSong.textContent = 'No song selected';
        }

        // Update playlist display
        const playlistDiv = document.getElementById('playlist');
        const songs = this.playlist.toArray();
        
        playlistDiv.innerHTML = songs.map(song => 
            `<div class="song-item ${this.playlist.current && song.title === this.playlist.current.title ? 'current' : ''}" 
                 onclick="player.selectSong('${song.title}')">
                <div class="song-title">${song.title}</div>
            </div>`
        ).join('');

        // Update history display
        const historyDiv = document.getElementById('history');
        const historyItems = this.history.getAll();
        
        if (historyItems.length === 0) {
            historyDiv.innerHTML = '<p>No history</p>';
        } else {
            historyDiv.innerHTML = historyItems.map(song => 
                `<div class="song-item">
                    <div class="song-title">${song.title}</div>
                </div>`
            ).join('');
        }
    }

    selectSong(title) {
        let current = this.playlist.head;
        while (current) {
            if (current.title === title) {
                this.playlist.current = current;
                this.audioPlayer.src = current.url;
                this.updateDisplay();
                break;
            }
            current = current.next;
        }
    }
}

// Initialize the music player
const player = new MusicPlayer();