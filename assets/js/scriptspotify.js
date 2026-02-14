// Referensi Elemen UI
const ui = {
    inputView: document.getElementById('view-input'),
    loadingView: document.getElementById('view-loading'),
    resultView: document.getElementById('view-result'),
    
    urlInput: document.getElementById('spotifyUrl'),
    searchBtn: document.getElementById('searchBtn'),
    finalDownloadBtn: document.getElementById('finalDownloadBtn'),
    resetBtn: document.getElementById('resetBtn'),
    
    // Elemen Hasil
    img: document.getElementById('albumArt'),
    title: document.getElementById('trackTitle'),
    artist: document.getElementById('artistName'),
    duration: document.getElementById('durationTxt'),
    size: document.getElementById('sizeTxt'),
    
    // Elemen Loading
    loadingTitle: document.querySelector('.loader-container h3'),
    loadingText: document.querySelector('.loader-container p')
};

// Variabel Global
let currentDownloadUrl = "";
let currentFileName = "music.mp3";
let loadingTextInterval = null;
let currentAlert = null;

// Konstanta
const API_ENDPOINT = '/api';
const DEFAULT_COVER = 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=640&h=640&fit=crop&crop=face';
const LOADING_TEXTS = [
    "Fetching track metadata...",
    "Analyzing audio quality...",
    "Preparing download link...",
    "Optimizing for best experience..."
];
const SPOTIFY_REGEX = /(?:https?:\/\/)?(?:open\.spotify\.com|spotify\.link)\/(track|album|playlist|artist)\/([a-zA-Z0-9]+)/;

// Cache untuk track yang sudah di-process
const trackCache = new Map();
let lastProcessedUrl = '';

// ========== UTILITY FUNCTIONS ==========

// Fungsi Navigasi Tampilan dengan efek smooth
function showView(viewName) {
    // Hapus semua hidden terlebih dahulu
    [ui.inputView, ui.loadingView, ui.resultView].forEach(view => {
        view.classList.add('hidden');
        view.style.opacity = '0';
    });

    // Reset animasi
    setTimeout(() => {
        if (viewName === 'input') {
            ui.inputView.classList.remove('hidden');
            ui.inputView.style.animation = 'fadeIn 0.5s ease forwards';
            ui.urlInput.focus();
        }
        if (viewName === 'loading') {
            ui.loadingView.classList.remove('hidden');
            ui.loadingView.style.animation = 'fadeIn 0.5s ease forwards';
            startLoadingAnimation();
        }
        if (viewName === 'result') {
            ui.resultView.classList.remove('hidden');
            ui.resultView.style.animation = 'fadeIn 0.5s ease forwards';
        }
    }, 10);
}

// Fungsi untuk menampilkan custom alert
function showCustomAlert(message, type = "warning", duration = 5000) {
    // Hapus alert sebelumnya jika ada
    if (currentAlert) {
        currentAlert.remove();
    }
    
    // Buat element alert
    const alertDiv = document.createElement('div');
    alertDiv.className = `custom-alert alert-${type}`;
    currentAlert = alertDiv;
    
    // Tentukan ikon berdasarkan type
    let icon, sound;
    switch(type) {
        case "success":
            icon = '<i class="fas fa-check-circle"></i>';
            sound = 'success';
            break;
        case "error":
            icon = '<i class="fas fa-exclamation-circle"></i>';
            sound = 'error';
            break;
        case "warning":
        default:
            icon = '<i class="fas fa-exclamation-triangle"></i>';
            sound = 'warning';
            break;
    }
    
    alertDiv.innerHTML = `
        <div class="alert-content">
            <span class="alert-icon">${icon}</span>
            <span class="alert-message">${message}</span>
            <button class="alert-close">&times;</button>
        </div>
    `;
    
    // Tambahkan ke body
    document.body.appendChild(alertDiv);
    
    // Tambahkan class show setelah sedikit delay untuk trigger animation
    setTimeout(() => {
        alertDiv.classList.add('show');
        playAlertSound(sound);
    }, 10);
    
    // Auto hide setelah durasi tertentu
    const autoHide = setTimeout(() => {
        hideAlert(alertDiv);
    }, duration);
    
    // Event listener untuk tombol close
    const closeBtn = alertDiv.querySelector('.alert-close');
    closeBtn.addEventListener('click', () => {
        clearTimeout(autoHide);
        hideAlert(alertDiv);
    });
    
    // Click outside untuk close
    alertDiv.addEventListener('click', (e) => {
        if (e.target === alertDiv) {
            clearTimeout(autoHide);
            hideAlert(alertDiv);
        }
    });
    
    return alertDiv;
}

function hideAlert(alertElement) {
    if (!alertElement) return;
    
    alertElement.classList.remove('show');
    setTimeout(() => {
        if (alertElement.parentNode) {
            alertElement.remove();
            if (currentAlert === alertElement) {
                currentAlert = null;
            }
        }
    }, 300);
}

// Fungsi untuk memutar sound effect
function playAlertSound(type) {
    try {
        // Buat audio context untuk sound effects
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        let frequency, duration;
        switch(type) {
            case 'success':
                frequency = 800;
                duration = 0.3;
                break;
            case 'warning':
                frequency = 400;
                duration = 0.2;
                break;
            case 'error':
                frequency = 300;
                duration = 0.4;
                break;
            default:
                frequency = 600;
                duration = 0.2;
        }
        
        // Buat oscillator untuk sound effect
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
        
    } catch (error) {
        console.log('Audio context not supported or blocked');
    }
}

// Fungsi untuk preload gambar dengan timeout
function preloadImage(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const timeout = setTimeout(() => {
            reject(new Error('Image load timeout'));
        }, 10000);
        
        img.onload = () => {
            clearTimeout(timeout);
            resolve(img);
        };
        img.onerror = () => {
            clearTimeout(timeout);
            reject(new Error('Failed to load image'));
        };
        img.src = url;
        
        // Untuk gambar dari Spotify, tambahkan cache busting untuk URL yang sama
        if (url.includes('spotify.com')) {
            if (!url.includes('?')) {
                img.src = url + '?t=' + Date.now();
            } else {
                img.src = url + '&t=' + Date.now();
            }
        }
    });
}

// Fungsi untuk sanitize filename
function sanitizeFilename(filename) {
    if (!filename) return 'Unknown';
    
    return filename
        .replace(/[<>:"/\\|?*]+/g, '_') // Ganti karakter ilegal dengan underscore
        .replace(/\s+/g, ' ') // Normalize spasi
        .trim()
        .substring(0, 100); // Batasi panjang
}

// Fungsi untuk memformat durasi
function formatDuration(seconds) {
    if (!seconds || isNaN(seconds)) return "Unknown";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Fungsi untuk memformat ukuran file
function formatFileSize(bytes) {
    if (!bytes || isNaN(bytes)) return "High Quality";
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }
    
    return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

// Fungsi untuk memulai animasi loading
function startLoadingAnimation() {
    // Hentikan interval sebelumnya jika ada
    if (loadingTextInterval) {
        clearInterval(loadingTextInterval);
    }
    
    let index = 0;
    
    // Update text loading secara berkala
    loadingTextInterval = setInterval(() => {
        if (ui.loadingView.classList.contains('hidden')) {
            clearInterval(loadingTextInterval);
            return;
        }
        
        if (ui.loadingText) {
            ui.loadingText.textContent = LOADING_TEXTS[index];
            ui.loadingText.style.opacity = '0.7';
            
            // Animasi fade in
            setTimeout(() => {
                ui.loadingText.style.opacity = '1';
                ui.loadingText.style.transform = 'translateY(-2px)';
            }, 10);
            
            setTimeout(() => {
                ui.loadingText.style.transform = 'translateY(0)';
            }, 200);
        }
        
        index = (index + 1) % LOADING_TEXTS.length;
        
        // Animasi untuk title
        if (ui.loadingTitle) {
            ui.loadingTitle.style.textShadow = 
                `0 0 ${10 + Math.sin(Date.now() / 500) * 5}px rgba(29, 185, 84, ${0.5 + Math.sin(Date.now() / 300) * 0.3})`;
        }
        
    }, 2000);
}

// Fungsi untuk optimasi cover URL Spotify
function optimizeSpotifyCoverUrl(url, size = 640) {
    if (!url) return DEFAULT_COVER;
    
    try {
        // Jika sudah ada parameter size, replace dengan size yang kita mau
        if (url.includes('?size=')) {
            return url.replace(/\?size=\d+/, `?size=${size}`);
        }
        
        // Jika sudah ada parameter lain, tambahkan size
        if (url.includes('?')) {
            return `${url}&size=${size}`;
        }
        
        // Jika belum ada parameter, tambahkan
        return `${url}?size=${size}`;
        
    } catch (error) {
        console.warn('Error optimizing cover URL:', error);
        return url || DEFAULT_COVER;
    }
}

// Fungsi untuk memvalidasi Spotify URL
function validateSpotifyUrl(url) {
    if (!url) {
        return { valid: false, message: "Please enter a Spotify URL" };
    }
    
    // Bersihkan URL dari whitespace
    url = url.trim();
    
    // Cek apakah URL mengandung spotify domain
    if (!url.includes('spotify.com') && !url.includes('spotify.link')) {
        return { valid: false, message: "Please enter a valid Spotify URL" };
    }
    
    // Cek pattern menggunakan regex
    const match = url.match(SPOTIFY_REGEX);
    if (!match) {
        return { valid: false, message: "Invalid Spotify URL format" };
    }
    
    // Validasi untuk track URL (kita hanya support track untuk sekarang)
    const type = match[1];
    if (type !== 'track') {
        return { 
            valid: false, 
            message: "Only Spotify track URLs are supported at the moment" 
        };
    }
    
    return { valid: true, type: type, id: match[2] };
}

// Fungsi untuk mengekstrak ID dari URL Spotify
function extractSpotifyId(url) {
    const match = url.match(SPOTIFY_REGEX);
    return match ? match[2] : null;
}

// Fungsi untuk handle loading state button
function setButtonLoading(button, isLoading, text = null) {
    if (isLoading) {
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ' + (text || 'Processing...');
        button.style.cursor = 'not-allowed';
        button.style.opacity = '0.8';
    } else {
        button.disabled = false;
        button.innerHTML = '<i class="fas fa-bolt"></i> Download Music';
        button.style.cursor = 'pointer';
        button.style.opacity = '1';
    }
}

// Fungsi untuk mengupdate metadata track
function updateTrackMetadata(data) {
    // Update title dan artist
    ui.title.innerText = data.title || "Unknown Title";
    ui.artist.innerText = data.artist || "Unknown Artist";
    
    // Update duration jika tersedia
    if (data.duration) {
        const formattedDuration = formatDuration(data.duration);
        ui.duration.innerHTML = `<i class="fas fa-clock"></i> ${formattedDuration}`;
    }
    
    // Update size jika tersedia
    if (data.size) {
        const formattedSize = formatFileSize(data.size);
        ui.size.innerHTML = `<i class="fas fa-hdd"></i> ${formattedSize}`;
    } else {
        ui.size.innerHTML = `<i class="fas fa-star"></i> High Quality`;
    }
    
    // Update cover image
    if (data.cover) {
        const optimizedCover = optimizeSpotifyCoverUrl(data.cover);
        
        // Tambahkan loading state untuk gambar
        ui.img.classList.add('loading');
        ui.img.style.opacity = '0.5';
        
        preloadImage(optimizedCover)
            .then(() => {
                ui.img.src = optimizedCover;
                ui.img.alt = `Album cover: ${data.title} - ${data.artist}`;
                
                // Animasi fade in untuk gambar
                setTimeout(() => {
                    ui.img.classList.remove('loading');
                    ui.img.style.opacity = '1';
                    ui.img.style.transform = 'scale(1.02)';
                    
                    setTimeout(() => {
                        ui.img.style.transform = 'scale(1)';
                    }, 200);
                }, 100);
            })
            .catch(() => {
                // Fallback ke default cover
                ui.img.src = DEFAULT_COVER;
                ui.img.alt = 'Default album cover';
                ui.img.classList.remove('loading');
                ui.img.style.opacity = '1';
            });
    } else {
        ui.img.src = DEFAULT_COVER;
        ui.img.alt = 'Default album cover';
        ui.img.classList.remove('loading');
    }
    
    // Tambahkan efek hover untuk gambar
    ui.img.addEventListener('mouseenter', () => {
        if (!ui.img.classList.contains('loading')) {
            ui.img.style.transform = 'scale(1.05) rotate(1deg)';
            ui.img.style.filter = 'brightness(1.1)';
        }
    });
    
    ui.img.addEventListener('mouseleave', () => {
        if (!ui.img.classList.contains('loading')) {
            ui.img.style.transform = 'scale(1)';
            ui.img.style.filter = 'brightness(1)';
        }
    });
}

// Fungsi untuk memproses download
async function processSpotifyDownload(url) {
    // Cek cache terlebih dahulu
    const cacheKey = extractSpotifyId(url);
    if (cacheKey && trackCache.has(cacheKey)) {
        console.log('Using cached track data');
        return trackCache.get(cacheKey);
    }
    
    // Jika tidak ada di cache, fetch dari API
    const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({ 
            url: url,
            timestamp: Date.now() // Untuk cache busting
        })
    });
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Validasi response
    if (!data || data.status !== true) {
        throw new Error(data.message || data.error || "Invalid response from server");
    }
    
    // Simpan ke cache
    if (cacheKey) {
        trackCache.set(cacheKey, data);
        
        // Batasi cache size
        if (trackCache.size > 10) {
            const firstKey = trackCache.keys().next().value;
            trackCache.delete(firstKey);
        }
    }
    
    return data;
}

// Fungsi untuk menangani download file
function handleFileDownload(downloadUrl, fileName) {
    if (!downloadUrl) {
        showCustomAlert("Download link is not ready yet.", "error");
        return false;
    }
    
    // Tampilkan loading state pada tombol
    const originalText = ui.finalDownloadBtn.innerHTML;
    ui.finalDownloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Preparing download...';
    ui.finalDownloadBtn.disabled = true;
    
    // Buat link untuk download
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.style.display = 'none';
    
    // Event untuk cleanup
    const cleanup = () => {
        setTimeout(() => {
            if (link.parentNode) {
                document.body.removeChild(link);
            }
            ui.finalDownloadBtn.innerHTML = originalText;
            ui.finalDownloadBtn.disabled = false;
        }, 1000);
    };
    
    // Tambahkan ke document dan trigger click
    document.body.appendChild(link);
    
    // Trigger download
    setTimeout(() => {
        try {
            link.click();
            showCustomAlert("Download started! Check your downloads folder.", "success", 3000);
            
            // Track download event (analytics)
            console.log('Download initiated:', {
                fileName: fileName,
                url: downloadUrl.substring(0, 100) + '...',
                timestamp: new Date().toISOString()
            });
            
        } catch (error) {
            console.error('Download error:', error);
            showCustomAlert("Failed to start download. Please try again.", "error");
        } finally {
            cleanup();
        }
    }, 300);
    
    // Fallback cleanup setelah 5 detik
    setTimeout(cleanup, 5000);
    
    return true;
}

// ========== EVENT LISTENERS ==========

// 1. EVENT: KLIK TOMBOL CARI/DOWNLOAD AWAL
ui.searchBtn.addEventListener('click', async () => {
    const url = ui.urlInput.value.trim();
    
    // Validasi URL
    const validation = validateSpotifyUrl(url);
    if (!validation.valid) {
        showCustomAlert(validation.message, "warning");
        ui.urlInput.focus();
        ui.urlInput.select();
        return;
    }
    
    // Cek jika URL sama dengan yang terakhir di-process
    if (url === lastProcessedUrl && trackCache.has(validation.id)) {
        showCustomAlert("Loading from cache...", "success", 2000);
    }
    
    lastProcessedUrl = url;
    
    // Set loading state
    setButtonLoading(ui.searchBtn, true);
    showView('loading');
    
    try {
        // Process Spotify download
        const trackData = await processSpotifyDownload(url);
        
        // Update UI dengan data track
        updateTrackMetadata(trackData);
        
        // Simpan download URL dan filename
        currentDownloadUrl = trackData.download_url;
        
        // Generate filename
        const safeTitle = sanitizeFilename(trackData.title || "Unknown Track");
        const safeArtist = sanitizeFilename(trackData.artist || "Unknown Artist");
        currentFileName = `${safeArtist} - ${safeTitle}.mp3`;
        
        // Tampilkan hasil dengan delay untuk efek smooth
        setTimeout(() => {
            showView('result');
            showCustomAlert("✓ Track ready for download!", "success", 3000);
            
            // Scroll ke hasil jika di mobile
            if (window.innerWidth < 768) {
                setTimeout(() => {
                    ui.resultView.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }, 500);
            }
        }, 800);
        
    } catch (error) {
        console.error("Error processing track:", error);
        
        // Tampilkan error message yang lebih spesifik
        let errorMessage = "Failed to process track. Please check the URL and try again.";
        
        if (error.message.includes('network') || error.message.includes('Network')) {
            errorMessage = "Network error. Please check your internet connection.";
        } else if (error.message.includes('404') || error.message.includes('not found')) {
            errorMessage = "Track not found. The URL might be invalid or the track is unavailable.";
        } else if (error.message.includes('timeout')) {
            errorMessage = "Request timeout. The server is taking too long to respond.";
        }
        
        showCustomAlert(errorMessage, "error", 7000);
        showView('input');
        
    } finally {
        // Reset button state
        setButtonLoading(ui.searchBtn, false);
        
        // Hentikan loading animation
        if (loadingTextInterval) {
            clearInterval(loadingTextInterval);
            loadingTextInterval = null;
        }
    }
});

// 2. EVENT: KLIK TOMBOL DOWNLOAD FINAL
ui.finalDownloadBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    handleFileDownload(currentDownloadUrl, currentFileName);
});

// 3. EVENT: TOMBOL RESET
ui.resetBtn.addEventListener('click', () => {
    // Reset form
    ui.urlInput.value = '';
    ui.img.src = '';
    ui.img.classList.remove('loading');
    ui.img.style.transform = '';
    ui.img.style.filter = '';
    
    // Reset cache untuk track ini
    if (lastProcessedUrl) {
        const id = extractSpotifyId(lastProcessedUrl);
        if (id) {
            trackCache.delete(id);
        }
    }
    
    // Tampilkan input view
    showView('input');
    
    // Show confirmation
    showCustomAlert("Ready for new download!", "success", 2000);
});

// 4. EVENT: SUPPORT TOMBOL ENTER
ui.urlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        ui.searchBtn.click();
    }
});

// 5. EVENT: PASTE DARI CLIPBOARD
ui.urlInput.addEventListener('paste', (e) => {
    // Delay sedikit untuk mengambil value setelah paste
    setTimeout(() => {
        const pastedText = ui.urlInput.value.trim();
        if (pastedText && validateSpotifyUrl(pastedText).valid) {
            showCustomAlert("URL detected! Click Download to proceed.", "success", 2000);
            
            // Auto-klik tombol jika URL valid
            if (pastedText.includes('spotify.com/track/')) {
                setTimeout(() => {
                    ui.searchBtn.focus();
                }, 100);
            }
        }
    }, 50);
});

// 6. EVENT: INPUT CHANGE
ui.urlInput.addEventListener('input', (e) => {
    // Highlight URL jika valid
    const url = e.target.value.trim();
    if (validateSpotifyUrl(url).valid) {
        e.target.style.borderColor = 'var(--primary)';
        e.target.style.boxShadow = '0 0 0 2px rgba(29, 185, 84, 0.2)';
    } else if (url) {
        e.target.style.borderColor = 'var(--warning)';
        e.target.style.boxShadow = '0 0 0 2px rgba(255, 204, 0, 0.2)';
    } else {
        e.target.style.borderColor = '';
        e.target.style.boxShadow = '';
    }
});

// 7. EVENT: VISIBILITY CHANGE (tab switching)
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && ui.urlInput.value.trim()) {
        // Jika user kembali ke tab dan ada URL, fokuskan input
        ui.urlInput.focus();
    }
});

// 8. EVENT: PAGE LOAD COMPLETE
window.addEventListener('load', () => {
    // Cek jika ada URL di hash (untuk sharing)
    const hash = window.location.hash.substring(1);
    if (hash && hash.includes('spotify.com')) {
        ui.urlInput.value = decodeURIComponent(hash);
        showCustomAlert("URL loaded from link!", "success", 3000);
        setTimeout(() => ui.searchBtn.focus(), 500);
    }
    
    // Cek untuk service worker (PWA support)
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('Service Worker registered:', reg))
            .catch(err => console.log('Service Worker registration failed:', err));
    }
});

// 9. EVENT: ONLINE/OFFLINE DETECTION
window.addEventListener('online', () => {
    showCustomAlert("You're back online!", "success", 2000);
});

window.addEventListener('offline', () => {
    showCustomAlert("You're offline. Please check your connection.", "error", 5000);
});

// ========== INITIALIZATION ==========

// Init aplikasi
function initApp() {
    // Tampilkan input view
    showView('input');
    
    // Fokus ke input field
    setTimeout(() => {
        ui.urlInput.focus();
        
        // Tampilkan welcome message setelah delay
        setTimeout(() => {
            showCustomAlert("Welcome! Paste any Spotify track URL to begin.", "success", 4000);
        }, 1000);
    }, 300);
    
    // Log initialization
    console.log('Spotify Downloader initialized');
    console.log('Features:', {
        cache: 'enabled',
        validation: 'enabled',
        animations: 'enabled',
        pwa: 'serviceWorker' in navigator
    });
}

// Panggil init saat DOM siap
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// Export untuk testing (jika diperlukan)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        validateSpotifyUrl,
        formatDuration,
        formatFileSize,
        sanitizeFilename,
        optimizeSpotifyCoverUrl
    };
}