/**
 * Linktree Builder Premium
 * Final Complete Version with All Features
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Linktree Builder Starting...');
    
    // ==================== LOCAL STORAGE KEYS ====================
    const STORAGE_KEY = 'linktree_builder_data';
    
    // ==================== DOM ELEMENTS ====================
    const elements = {
        bannerText: document.getElementById('bannerText'),
        subBanner: document.getElementById('subBanner'),
        tickerText: document.getElementById('tickerText'),
        img: document.getElementById('img'),
        nama: document.getElementById('nama'),
        deskripsi: document.getElementById('deskripsi'),
        footer: document.getElementById('footer'),
        template: document.getElementById('template'),
        noticeContainer: document.getElementById('notice-container'),
        medsosContainer: document.getElementById('medsos-container'),
        linksContainer: document.getElementById('links-container'),
        addNoticeBtn: document.getElementById('add-notice'),
        addMedsosBtn: document.getElementById('add-medsos'),
        addLinkBtn: document.getElementById('add-link'),
        previewBtn: document.getElementById('preview-btn'),
        resetBtn: document.getElementById('reset-btn'),
        copyBtn: document.getElementById('copy-btn'),
        downloadBtn: document.getElementById('download-btn'),
        previewFrame: document.getElementById('preview-frame'),
        htmlOutput: document.getElementById('html-output'),
        iframePlaceholder: document.getElementById('iframe-placeholder'),
        copyOverlay: document.getElementById('copy-overlay')
    };
    
    // Ticker elements
    const tickerRadios = document.querySelectorAll('input[name="tickerType"]');
    
    // ==================== GLOBAL VARIABLES ====================
    let digitalClockInterval = null;
    let analogClockInterval = null;
    let isInitializing = true;
    
    // ==================== TEMPLATES ====================
    const templates = {
        '1': {
            name: 'Pixel Modern',
            font: '"Press Start 2P", cursive',
            primaryColor: '#00ff88',
            secondaryColor: '#2b2b2b',
            style: `
                body {
                    background: linear-gradient(45deg, #2b2b2b, #4a4a4a);
                    font-family: "Press Start 2P", cursive;
                    color: #00ff88;
                }
                .linktree-container {
                    border: 4px solid #00ff88;
                    box-shadow: 0 0 20px #00ff88;
                    background: rgba(43, 43, 43, 0.95);
                }
                .linktree-btn {
                    background: #2b2b2b;
                    border: 2px solid #00ff88;
                    color: #00ff88;
                }
                .linktree-btn:hover {
                    background: #00ff88;
                    color: #2b2b2b;
                    transform: translateY(-2px);
                }
                .notice-box {
                    background: rgba(0, 255, 136, 0.1);
                    border: 2px solid #00ff88;
                    color: #00ff88;
                }
                .ticker {
                    color: #00ff88;
                    border: 2px solid #00ff88;
                    background: rgba(43, 43, 43, 0.9);
                }
            `
        },
        '2': {
            name: 'Minimal Clean',
            font: '"Poppins", sans-serif',
            primaryColor: '#667eea',
            secondaryColor: '#ffffff',
            style: `
                body {
                    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                    font-family: "Poppins", sans-serif;
                    color: #333;
                }
                .linktree-container {
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
                }
                .linktree-btn {
                    background: white;
                    border: 1px solid #ddd;
                    color: #333;
                    transition: all 0.3s ease;
                }
                .linktree-btn:hover {
                    border-color: #667eea;
                    color: #667eea;
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
                }
                .notice-box {
                    background: rgba(102, 126, 234, 0.1);
                    border: 1px solid #667eea;
                    color: #667eea;
                }
                .ticker {
                    color: #667eea;
                    border: 1px solid #667eea;
                    background: rgba(255, 255, 255, 0.9);
                }
            `
        },
        '3': {
            name: 'Cyber Neon',
            font: '"Poppins", sans-serif',
            primaryColor: '#00dbde',
            secondaryColor: '#000000',
            style: `
                body {
                    background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
                    font-family: "Poppins", sans-serif;
                    color: white;
                }
                .linktree-container {
                    background: rgba(0, 0, 0, 0.7);
                    backdrop-filter: blur(10px);
                    border: 2px solid #00dbde;
                    box-shadow: 0 0 30px rgba(0, 219, 222, 0.5);
                }
                .linktree-btn {
                    background: rgba(0, 219, 222, 0.1);
                    border: 2px solid #00dbde;
                    color: white;
                    position: relative;
                    overflow: hidden;
                }
                .linktree-btn:hover {
                    background: rgba(0, 219, 222, 0.3);
                    transform: translateY(-2px);
                    box-shadow: 0 0 20px rgba(0, 219, 222, 0.5);
                }
                .notice-box {
                    background: rgba(0, 219, 222, 0.1);
                    border: 2px solid #00dbde;
                    color: #00dbde;
                }
                .ticker {
                    color: #00dbde;
                    border: 2px solid #00dbde;
                    background: rgba(0, 0, 0, 0.7);
                    text-shadow: 0 0 10px rgba(0, 219, 222, 0.5);
                }
            `
        }
    };
    
    // ==================== UTILITY FUNCTIONS ====================
    function saveToLocalStorage(data) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            console.log('💾 Data saved to localStorage');
        } catch (error) {
            console.error('❌ Failed to save to localStorage:', error);
        }
    }
    
    function loadFromLocalStorage() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                console.log('📂 Loading saved data from localStorage');
                return JSON.parse(saved);
            }
        } catch (error) {
            console.error('❌ Failed to load from localStorage:', error);
        }
        return null;
    }
    
    function clearLocalStorage() {
        localStorage.removeItem(STORAGE_KEY);
        console.log('🗑️ localStorage cleared');
    }
    
    function formatURL(url, platform = '') {
        if (!url) return '';
        
        url = url.trim();
        
        // Jika sudah ada http:// atau https://, biarkan
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }
        
        // Jika hanya username (tanpa . dan tanpa /)
        if (!url.includes('.') && !url.includes('/') && !url.includes('@')) {
            if (platform) {
                // Special cases
                if (platform === 'whatsapp') {
                    return `https://wa.me/${url.replace(/\D/g, '')}`;
                }
                if (platform === 'telegram') {
                    return `https://t.me/${url.replace('@', '')}`;
                }
                return `https://${platform}.com/${url}`;
            }
            return `https://${url}.com`;
        }
        
        // Jika dimulai dengan @
        if (url.startsWith('@')) {
            if (platform) {
                return `https://${platform}.com/${url.substring(1)}`;
            }
            return `https://instagram.com/${url.substring(1)}`;
        }
        
        // Jika ada www. tapi tanpa https://
        if (url.startsWith('www.')) {
            return 'https://' + url;
        }
        
        // Jika ada domain tapi tanpa protokol
        if (url.includes('.') && !url.includes('://')) {
            return 'https://' + url;
        }
        
        return url;
    }
    
    function detectIcon(url, platform = '', text = '') {
        const str = (url + ' ' + platform + ' ' + text).toLowerCase();
        
        const iconMap = {
            'youtube': 'fa-youtube',
            'github': 'fa-github',
            'instagram': 'fa-instagram',
            'linkedin': 'fa-linkedin',
            'twitter': 'fa-x-twitter',
            'x.com': 'fa-x-twitter',
            'facebook': 'fa-facebook',
            'telegram': 'fa-telegram',
            'discord': 'fa-discord',
            'spotify': 'fa-spotify',
            'whatsapp': 'fa-whatsapp',
            'tiktok': 'fa-tiktok',
            'reddit': 'fa-reddit',
            'twitch': 'fa-twitch',
            'snapchat': 'fa-snapchat',
            'portfolio': 'fa-briefcase',
            'website': 'fa-globe',
            'blog': 'fa-blog',
            'store': 'fa-store',
            'shop': 'fa-shopping-bag',
            'donate': 'fa-heart',
            'support': 'fa-hand-holding-heart',
            'email': 'fa-envelope',
            'mail': 'fa-envelope',
            'calendar': 'fa-calendar',
            'event': 'fa-calendar-alt',
            'file': 'fa-file',
            'document': 'fa-file-alt',
            'download': 'fa-download',
            'video': 'fa-video',
            'music': 'fa-music',
            'podcast': 'fa-podcast',
            'book': 'fa-book',
            'newsletter': 'fa-newspaper'
        };
        
        for (const [keyword, icon] of Object.entries(iconMap)) {
            if (str.includes(keyword)) {
                return icon;
            }
        }
        
        return 'fa-link';
    }
    
    function showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        // Add to body
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    // ==================== CLOCK FUNCTIONS ====================
    function updateDigitalClockPreview() {
        const preview = document.getElementById('digitalClockPreview');
        if (!preview) return;
        
        const showSeconds = document.getElementById('showSeconds')?.checked ?? true;
        const showDate = document.getElementById('showDate')?.checked ?? false;
        const militaryTime = document.getElementById('militaryTime')?.checked ?? false;
        const blinkSeparator = document.getElementById('blinkSeparator')?.checked ?? true;
        const timezone = document.getElementById('timezone')?.value || 'local';
        
        let now;
        try {
            if (timezone === 'local') {
                now = new Date();
            } else {
                now = new Date(new Date().toLocaleString('en-US', { timeZone: timezone }));
            }
        } catch (error) {
            console.error('Error getting time:', error);
            now = new Date();
        }
        
        let hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        
        // Format 12/24 jam
        let hourDisplay;
        if (militaryTime) {
            hourDisplay = hours.toString().padStart(2, '0');
        } else {
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12;
            hourDisplay = hours.toString().padStart(2, '0');
            hourDisplay = `${hourDisplay} ${ampm}`;
        }
        
        // Bangun string waktu
        let timeString = `${hourDisplay}<span class="${blinkSeparator ? 'colon' : ''}">:</span>${minutes}`;
        if (showSeconds) {
            timeString += `<span class="${blinkSeparator ? 'colon' : ''}">:</span>${seconds}`;
        }
        
        // Tambah tanggal jika dipilih
        if (showDate) {
            const date = now.toLocaleDateString('id-ID', {
                weekday: 'short',
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
            preview.innerHTML = `<div style="font-size: 0.8em; margin-bottom: 5px;">${date}</div><div>${timeString}</div>`;
        } else {
            preview.innerHTML = timeString;
        }
    }
    
    function updateAnalogClockPreview() {
        const clockFace = document.querySelector('.clock-face');
        if (!clockFace) return;
        
        const showSeconds = document.getElementById('showAnalogSeconds')?.checked ?? true;
        const showNumbers = document.getElementById('showAnalogNumbers')?.checked ?? true;
        const smooth = document.getElementById('smoothAnalog')?.checked ?? true;
        const timezone = document.getElementById('analogTimezone')?.value || 'local';
        
        let now;
        try {
            if (timezone === 'local') {
                now = new Date();
            } else {
                now = new Date(new Date().toLocaleString('en-US', { timeZone: timezone }));
            }
        } catch (error) {
            console.error('Error getting time:', error);
            now = new Date();
        }
        
        const hours = now.getHours() % 12;
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();
        const milliseconds = smooth ? now.getMilliseconds() : 0;
        
        // Hitung derajat
        const secondDegrees = ((seconds + milliseconds / 1000) * 6) - 90;
        const minuteDegrees = ((minutes + seconds / 60) * 6) - 90;
        const hourDegrees = ((hours + minutes / 60) * 30) - 90;
        
        // Update jarum jam
        const hourHand = document.querySelector('.hour-hand');
        const minuteHand = document.querySelector('.minute-hand');
        const secondHand = document.querySelector('.second-hand');
        
        if (hourHand) hourHand.style.transform = `rotate(${hourDegrees}deg)`;
        if (minuteHand) minuteHand.style.transform = `rotate(${minuteDegrees}deg)`;
        if (secondHand) {
            secondHand.style.transform = `rotate(${secondDegrees}deg)`;
            secondHand.style.display = showSeconds ? 'block' : 'none';
        }
        
        // Update angka jam
        updateClockNumbers(showNumbers);
    }
    
    function updateClockNumbers(showNumbers) {
        const clockFace = document.querySelector('.clock-face');
        if (!clockFace) return;
        
        // Hapus angka sebelumnya
        const existingNumbers = clockFace.querySelectorAll('.clock-number');
        existingNumbers.forEach(num => num.remove());
        
        if (!showNumbers) return;
        
        // Tambah angka 1-12
        for (let i = 1; i <= 12; i++) {
            const number = document.createElement('div');
            number.className = 'clock-number';
            number.textContent = i;
            number.style.color = '#4361ee';
            number.style.fontSize = '10px';
            number.style.fontWeight = 'bold';
            number.style.position = 'absolute';
            number.style.transform = 'translate(-50%, -50%)';
            
            // Hitung posisi
            const angle = (i * 30) * (Math.PI / 180);
            const radius = 35;
            const x = 50 + radius * Math.sin(angle);
            const y = 50 - radius * Math.cos(angle);
            
            number.style.left = `${x}%`;
            number.style.top = `${y}%`;
            
            clockFace.appendChild(number);
        }
    }
    
    function startClockIntervals() {
        // Hentikan interval sebelumnya
        stopClockIntervals();
        
        // Digital clock interval
        digitalClockInterval = setInterval(updateDigitalClockPreview, 100);
        
        // Analog clock interval
        analogClockInterval = setInterval(updateAnalogClockPreview, 50);
    }
    
    function stopClockIntervals() {
        if (digitalClockInterval) {
            clearInterval(digitalClockInterval);
            digitalClockInterval = null;
        }
        if (analogClockInterval) {
            clearInterval(analogClockInterval);
            analogClockInterval = null;
        }
    }
    
    // ==================== DYNAMIC FIELDS ====================
    function addNoticeField(text = '') {
        const div = document.createElement('div');
        div.className = 'dynamic-item';
        div.innerHTML = `
            <input type="text" class="notice-text" placeholder="Website ini GRATIS 100% dan DILARANG DIJUAL BELIKAN" value="${text || ''}">
            <button type="button" class="btn-remove" title="Hapus">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        elements.noticeContainer.appendChild(div);
        
        const removeBtn = div.querySelector('.btn-remove');
        removeBtn.addEventListener('click', function() {
            div.remove();
            autoSave();
            showNotification('Informasi dihapus', 'info');
        });
        
        const input = div.querySelector('.notice-text');
        input.addEventListener('input', autoSave);
        
        return div;
    }
    
    function addMedsosField(platform = '', url = '') {
        const div = document.createElement('div');
        div.className = 'dynamic-item';
        div.innerHTML = `
            <select class="platform-select">
                <option value="">Pilih Platform</option>
                <option value="youtube">YouTube</option>
                <option value="instagram">Instagram</option>
                <option value="github">GitHub</option>
                <option value="linkedin">LinkedIn</option>
                <option value="twitter">Twitter/X</option>
                <option value="facebook">Facebook</option>
                <option value="telegram">Telegram</option>
                <option value="discord">Discord</option>
                <option value="spotify">Spotify</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="tiktok">TikTok</option>
                <option value="reddit">Reddit</option>
                <option value="twitch">Twitch</option>
                <option value="snapchat">Snapchat</option>
            </select>
            <input type="text" class="url-input" placeholder="username atau URL" value="${url || ''}">
            <button type="button" class="btn-remove" title="Hapus">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        elements.medsosContainer.appendChild(div);
        
        if (platform) {
            div.querySelector('.platform-select').value = platform;
        }
        
        const removeBtn = div.querySelector('.btn-remove');
        removeBtn.addEventListener('click', function() {
            div.remove();
            autoSave();
            showNotification('Media sosial dihapus', 'info');
        });
        
        const select = div.querySelector('.platform-select');
        const input = div.querySelector('.url-input');
        
        select.addEventListener('change', function() {
            if (this.value === 'whatsapp') {
                input.placeholder = '628123456789 (nomor WhatsApp)';
            } else if (this.value === 'telegram') {
                input.placeholder = '@username';
            } else if (this.value) {
                input.placeholder = `${this.value}.com/username`;
            } else {
                input.placeholder = 'username atau URL';
            }
            autoSave();
        });
        
        input.addEventListener('input', autoSave);
        
        return div;
    }
    
    function addLinkField(platform = '', text = '', url = '') {
        const div = document.createElement('div');
        div.className = 'dynamic-item';
        div.innerHTML = `
            <select class="link-platform-select">
                <option value="">Pilih Tipe</option>
                <option value="website">Website/Blog</option>
                <option value="portfolio">Portfolio</option>
                <option value="store">Online Store</option>
                <option value="donate">Donasi/Support</option>
                <option value="email">Email</option>
                <option value="calendar">Kalender</option>
                <option value="file">File/Dokumen</option>
                <option value="other">Lainnya</option>
            </select>
            <input type="text" class="link-text" placeholder="Nama link" value="${text || ''}">
            <input type="text" class="link-url" placeholder="https://example.com" value="${url || ''}">
            <button type="button" class="btn-remove" title="Hapus">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        elements.linksContainer.appendChild(div);
        
        if (platform) {
            div.querySelector('.link-platform-select').value = platform;
        }
        
        const removeBtn = div.querySelector('.btn-remove');
        removeBtn.addEventListener('click', function() {
            div.remove();
            autoSave();
            showNotification('Link dihapus', 'info');
        });
        
        const platformSelect = div.querySelector('.link-platform-select');
        const textInput = div.querySelector('.link-text');
        const urlInput = div.querySelector('.link-url');
        
        platformSelect.addEventListener('change', function() {
            const platform = this.value;
            
            if (platform === 'email') {
                urlInput.placeholder = 'email@example.com';
            } else if (platform === 'website' || platform === 'portfolio' || platform === 'store') {
                urlInput.placeholder = 'https://example.com';
            } else if (platform && platform !== 'other' && platform !== 'donate') {
                urlInput.placeholder = `https://${platform}.com/username`;
            } else {
                urlInput.placeholder = 'https://example.com';
            }
            
            autoSave();
        });
        
        textInput.addEventListener('input', autoSave);
        urlInput.addEventListener('input', autoSave);
        
        return div;
    }
    
    // ==================== FORM DATA COLLECTION ====================
    function collectFormData() {
        const notices = [];
        const medsos = [];
        const links = [];
        
        // Collect notices
        elements.noticeContainer.querySelectorAll('.dynamic-item').forEach(item => {
            const text = item.querySelector('.notice-text').value.trim();
            if (text) {
                notices.push(text);
            }
        });
        
        // Collect social media
        elements.medsosContainer.querySelectorAll('.dynamic-item').forEach(item => {
            const platform = item.querySelector('.platform-select').value;
            const url = item.querySelector('.url-input').value.trim();
            
            if (platform && url) {
                const formattedUrl = formatURL(url, platform);
                medsos.push({
                    platform: platform,
                    url: formattedUrl,
                    icon: detectIcon(formattedUrl, platform)
                });
            }
        });
        
        // Collect custom links
        elements.linksContainer.querySelectorAll('.dynamic-item').forEach(item => {
            const platform = item.querySelector('.link-platform-select').value;
            const text = item.querySelector('.link-text').value.trim();
            const url = item.querySelector('.link-url').value.trim();
            
            if (text && url) {
                const formattedUrl = formatURL(url, platform);
                links.push({
                    platform: platform,
                    text: text,
                    url: formattedUrl,
                    icon: detectIcon(formattedUrl, platform, text)
                });
            }
        });
        
        // Get ticker type and data
        const tickerType = document.querySelector('input[name="tickerType"]:checked')?.value || 'static';
        let tickerData = {};
        
        if (tickerType === 'static') {
            tickerData = {
                type: 'static',
                text: elements.tickerText?.value.trim() || ''
            };
        } else if (tickerType === 'digital') {
            tickerData = {
                type: 'digital',
                showSeconds: document.getElementById('showSeconds')?.checked ?? true,
                showDate: document.getElementById('showDate')?.checked ?? false,
                militaryTime: document.getElementById('militaryTime')?.checked ?? false,
                blinkSeparator: document.getElementById('blinkSeparator')?.checked ?? true,
                timezone: document.getElementById('timezone')?.value || 'local'
            };
        } else if (tickerType === 'analog') {
            tickerData = {
                type: 'analog',
                showSeconds: document.getElementById('showAnalogSeconds')?.checked ?? true,
                showNumbers: document.getElementById('showAnalogNumbers')?.checked ?? true,
                smooth: document.getElementById('smoothAnalog')?.checked ?? true,
                timezone: document.getElementById('analogTimezone')?.value || 'local'
            };
        } else if (tickerType === 'none') {
            tickerData = {
                type: 'none'
            };
        }
        
        return {
            bannerText: elements.bannerText?.value.trim() || '',
            subBanner: elements.subBanner?.value.trim() || '',
            ticker: tickerData,
            img: elements.img?.value.trim() || '',
            nama: elements.nama?.value.trim() || '',
            deskripsi: elements.deskripsi?.value.trim() || '',
            notices: notices,
            medsos: medsos,
            links: links,
            footer: elements.footer?.value.trim() || '',
            template: elements.template?.value || '1'
        };
    }
    
    function autoSave() {
        if (isInitializing) return;
        const data = collectFormData();
        saveToLocalStorage(data);
    }
    
    // ==================== TICKER TYPE HANDLING ====================
    function setupTickerTypeSelector() {
        const staticContainer = document.getElementById('static-ticker-container');
        const digitalContainer = document.getElementById('digital-ticker-container');
        const analogContainer = document.getElementById('analog-ticker-container');
        
        function updateTickerDisplay() {
            // Sembunyikan semua container
            [staticContainer, digitalContainer, analogContainer].forEach(container => {
                if (container) {
                    container.style.display = 'none';
                    container.classList.remove('active');
                }
            });
            
            // Tampilkan container yang dipilih
            const selectedType = document.querySelector('input[name="tickerType"]:checked')?.value || 'static';
            
            if (selectedType === 'static') {
                if (staticContainer) {
                    staticContainer.style.display = 'block';
                    staticContainer.classList.add('active');
                }
                stopClockIntervals();
            } else if (selectedType === 'digital') {
                if (digitalContainer) {
                    digitalContainer.style.display = 'block';
                    digitalContainer.classList.add('active');
                }
                updateDigitalClockPreview();
                startClockIntervals();
            } else if (selectedType === 'analog') {
                if (analogContainer) {
                    analogContainer.style.display = 'block';
                    analogContainer.classList.add('active');
                }
                updateAnalogClockPreview();
                startClockIntervals();
            } else if (selectedType === 'none') {
                stopClockIntervals();
            }
            
            autoSave();
        }
        
        // Initial setup
        updateTickerDisplay();
        
        // Add event listeners to radio buttons
        tickerRadios.forEach(radio => {
            radio.addEventListener('change', updateTickerDisplay);
        });
        
        // Event listeners untuk konfigurasi jam digital
        const digitalConfigs = ['showSeconds', 'showDate', 'militaryTime', 'blinkSeparator', 'timezone'];
        digitalConfigs.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', function() {
                    updateDigitalClockPreview();
                    autoSave();
                });
            }
        });
        
        // Event listeners untuk konfigurasi jam analog
        const analogConfigs = ['showAnalogSeconds', 'showAnalogNumbers', 'smoothAnalog', 'analogTimezone'];
        analogConfigs.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', function() {
                    updateAnalogClockPreview();
                    autoSave();
                });
            }
        });
    }
    
    function restoreTickerConfig(savedTicker) {
        if (!savedTicker) return;
        
        // Set ticker type radio button
        const tickerType = savedTicker.type || 'static';
        const radio = document.querySelector(`input[name="tickerType"][value="${tickerType}"]`);
        if (radio) {
            radio.checked = true;
            radio.dispatchEvent(new Event('change'));
        }
        
        // Restore config based on type
        if (tickerType === 'static') {
            if (elements.tickerText && savedTicker.text !== undefined) {
                elements.tickerText.value = savedTicker.text;
            }
        } else if (tickerType === 'digital') {
            const configs = ['showSeconds', 'showDate', 'militaryTime', 'blinkSeparator'];
            configs.forEach(key => {
                const element = document.getElementById(key);
                if (element && savedTicker[key] !== undefined) {
                    element.checked = savedTicker[key];
                }
            });
            
            const timezoneSelect = document.getElementById('timezone');
            if (timezoneSelect && savedTicker.timezone) {
                timezoneSelect.value = savedTicker.timezone;
            }
        } else if (tickerType === 'analog') {
            const configs = ['showAnalogSeconds', 'showAnalogNumbers', 'smoothAnalog'];
            configs.forEach(key => {
                const element = document.getElementById(key);
                if (element && savedTicker[key] !== undefined) {
                    element.checked = savedTicker[key];
                }
            });
            
            const timezoneSelect = document.getElementById('analogTimezone');
            if (timezoneSelect && savedTicker.timezone) {
                timezoneSelect.value = savedTicker.timezone;
            }
        }
    }
    
    // ==================== HTML GENERATION ====================
    function generateDigitalClockScript(tickerConfig) {
        return `
        function updateDigitalClock() {
            const clockElement = document.querySelector('.digital-clock');
            if (!clockElement) return;
            
            let now;
            try {
                if ('${tickerConfig.timezone}' === 'local') {
                    now = new Date();
                } else {
                    now = new Date(new Date().toLocaleString('en-US', { timeZone: '${tickerConfig.timezone}' }));
                }
            } catch (error) {
                now = new Date();
            }
            
            let hours = now.getHours();
            const minutes = now.getMinutes().toString().padStart(2, '0');
            const seconds = now.getSeconds().toString().padStart(2, '0');
            
            let hourDisplay;
            if (${tickerConfig.militaryTime}) {
                hourDisplay = hours.toString().padStart(2, '0');
            } else {
                const ampm = hours >= 12 ? 'PM' : 'AM';
                hours = hours % 12;
                hours = hours ? hours : 12;
                hourDisplay = hours.toString().padStart(2, '0') + ' ' + ampm;
            }
            
            let timeString = hourDisplay + '<span class="${tickerConfig.blinkSeparator ? 'colon' : ''}">:</span>' + minutes;
            if (${tickerConfig.showSeconds}) {
                timeString += '<span class="${tickerConfig.blinkSeparator ? 'colon' : ''}">:</span>' + seconds;
            }
            
            if (${tickerConfig.showDate}) {
                const date = now.toLocaleDateString('id-ID', {
                    weekday: 'short',
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                });
                clockElement.innerHTML = '<div style="font-size: 0.8em; margin-bottom: 5px;">' + date + '</div><div>' + timeString + '</div>';
            } else {
                clockElement.innerHTML = timeString;
            }
        }
        
        updateDigitalClock();
        setInterval(updateDigitalClock, 1000);
    `;
    }
    
    function generateAnalogClockScript(tickerConfig) {
        return `
        function updateAnalogClock() {
            const clockFace = document.querySelector('.clock-face');
            if (!clockFace) return;
            
            let now;
            try {
                if ('${tickerConfig.timezone}' === 'local') {
                    now = new Date();
                } else {
                    now = new Date(new Date().toLocaleString('en-US', { timeZone: '${tickerConfig.timezone}' }));
                }
            } catch (error) {
                now = new Date();
            }
            
            const hours = now.getHours() % 12;
            const minutes = now.getMinutes();
            const seconds = now.getSeconds();
            const milliseconds = ${tickerConfig.smooth} ? now.getMilliseconds() : 0;
            
            const secondDegrees = ((seconds + milliseconds / 1000) * 6) - 90;
            const minuteDegrees = ((minutes + seconds / 60) * 6) - 90;
            const hourDegrees = ((hours + minutes / 60) * 30) - 90;
            
            const hourHand = document.querySelector('.hour-hand');
            const minuteHand = document.querySelector('.minute-hand');
            const secondHand = document.querySelector('.second-hand');
            
            if (hourHand) hourHand.style.transform = 'rotate(' + hourDegrees + 'deg)';
            if (minuteHand) minuteHand.style.transform = 'rotate(' + minuteDegrees + 'deg)';
            if (secondHand) secondHand.style.transform = 'rotate(' + secondDegrees + 'deg)';
            
            updateClockNumbers();
        }
        
        function updateClockNumbers() {
            const clockFace = document.querySelector('.clock-face');
            if (!clockFace || !${tickerConfig.showNumbers}) return;
            
            const existingNumbers = clockFace.querySelectorAll('.clock-number');
            existingNumbers.forEach(num => num.remove());
            
            for (let i = 1; i <= 12; i++) {
                const number = document.createElement('div');
                number.className = 'clock-number';
                number.textContent = i;
                number.style.color = getComputedStyle(document.documentElement).getPropertyValue('--primary-color') || '#00dbde';
                number.style.fontSize = '10px';
                number.style.fontWeight = 'bold';
                number.style.position = 'absolute';
                number.style.transform = 'translate(-50%, -50%)';
                
                const angle = (i * 30) * (Math.PI / 180);
                const radius = 35;
                const x = 50 + radius * Math.sin(angle);
                const y = 50 - radius * Math.cos(angle);
                
                number.style.left = x + '%';
                number.style.top = y + '%';
                
                clockFace.appendChild(number);
            }
        }
        
        updateClockNumbers();
        updateAnalogClock();
        setInterval(updateAnalogClock, ${tickerConfig.smooth ? 50 : 1000});
    `;
    }
    
    function generatePreviewHTML(data) {
        const template = templates[data.template] || templates['1'];
        
        // Banner HTML
        let bannerHTML = '';
        if (data.bannerText) {
            bannerHTML += `<h1 class="banner-title">${data.bannerText}</h1>`;
        }
        if (data.subBanner) {
            bannerHTML += `<p class="banner-subtitle">${data.subBanner}</p>`;
        }
        
        // Ticker HTML berdasarkan type
        let tickerHTML = '';
        let clockCSS = '';
        let clockScript = '';
        
        if (data.ticker && data.ticker.type !== 'none') {
            if (data.ticker.type === 'static' && data.ticker.text) {
                tickerHTML = `<div class="ticker">${data.ticker.text}</div>`;
            } else if (data.ticker.type === 'digital') {
                const clockId = 'digital-clock-' + Date.now();
                tickerHTML = `<div id="${clockId}" class="digital-clock"></div>`;
                clockCSS = `
                    .digital-clock {
                        font-family: 'Courier New', monospace;
                        font-size: 1.2rem;
                        font-weight: bold;
                        text-align: center;
                        color: ${template.primaryColor};
                        padding: 10px;
                        margin-bottom: 20px;
                        background: rgba(0, 0, 0, 0.2);
                        border-radius: 8px;
                        display: inline-block;
                    }
                    
                    .digital-clock .colon {
                        animation: blink 1s infinite;
                    }
                    
                    @keyframes blink {
                        0%, 100% { opacity: 1; }
                        50% { opacity: 0.3; }
                    }
                `;
                clockScript = generateDigitalClockScript(data.ticker);
            } else if (data.ticker.type === 'analog') {
                const clockId = 'analog-clock-' + Date.now();
                tickerHTML = `
                    <div id="${clockId}" class="analog-clock-container">
                        <div class="analog-clock">
                            <div class="clock-face">
                                <div class="hand hour-hand"></div>
                                <div class="hand minute-hand"></div>
                                <div class="hand second-hand" style="display: ${data.ticker.showSeconds ? 'block' : 'none'}"></div>
                            </div>
                        </div>
                    </div>
                `;
                clockCSS = `
                    .analog-clock-container {
                        display: flex;
                        justify-content: center;
                        margin-bottom: 20px;
                    }
                    
                    .analog-clock {
                        width: 80px;
                        height: 80px;
                        border: 3px solid ${template.primaryColor};
                        border-radius: 50%;
                        position: relative;
                        background: rgba(0, 0, 0, 0.3);
                    }
                    
                    .clock-face {
                        width: 100%;
                        height: 100%;
                        position: relative;
                    }
                    
                    .clock-face::after {
                        content: '';
                        position: absolute;
                        width: 8px;
                        height: 8px;
                        background: ${template.primaryColor};
                        border-radius: 50%;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                    }
                    
                    .hand {
                        position: absolute;
                        background: ${template.primaryColor};
                        transform-origin: bottom center;
                        border-radius: 2px 2px 0 0;
                    }
                    
                    .hour-hand {
                        width: 3px;
                        height: 20px;
                        top: calc(50% - 20px);
                        left: calc(50% - 1.5px);
                    }
                    
                    .minute-hand {
                        width: 2px;
                        height: 30px;
                        top: calc(50% - 30px);
                        left: calc(50% - 1px);
                    }
                    
                    .second-hand {
                        width: 1px;
                        height: 35px;
                        top: calc(50% - 35px);
                        left: calc(50% - 0.5px);
                        background: #ff6b6b;
                    }
                `;
                clockScript = generateAnalogClockScript(data.ticker);
            }
        }
        
        // Notice boxes HTML
        let noticesHTML = '';
        if (data.notices.length > 0) {
            data.notices.forEach(notice => {
                noticesHTML += `<div class="notice-box">${notice}</div>`;
            });
        }
        
        // Social media buttons
        let medsosHTML = '';
        if (data.medsos.length > 0) {
            medsosHTML = '<div class="social-links">';
            data.medsos.forEach(item => {
                medsosHTML += `
                    <a href="${item.url}" target="_blank" class="linktree-btn medsos-btn" rel="noopener noreferrer">
                        <i class="fab ${item.icon}"></i>
                    </a>
                `;
            });
            medsosHTML += '</div>';
        }
        
        // Custom links
        let linksHTML = '';
        if (data.links.length > 0) {
            linksHTML = '<div class="links-container">';
            data.links.forEach(item => {
                linksHTML += `
                    <a href="${item.url}" target="_blank" class="linktree-btn custom-link" rel="noopener noreferrer">
                        <i class="fas ${item.icon}"></i>
                        <span>${item.text}</span>
                    </a>
                `;
            });
            linksHTML += '</div>';
        }
        
        return `
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.nama || 'Linktree'} - Linktree</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Press+Start+2P&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <style>
        ${template.style}
        
        ${clockCSS}
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
            font-family: ${template.font};
        }
        
        .linktree-container {
            max-width: 480px;
            width: 100%;
            padding: 40px;
            border-radius: 24px;
            text-align: center;
            animation: fadeIn 0.8s ease-out;
        }
        
        .banner-title {
            font-size: 1.8rem;
            margin-bottom: 5px;
            font-weight: 700;
        }
        
        .banner-subtitle {
            font-size: 0.9rem;
            opacity: 0.8;
            margin-bottom: 20px;
        }
        
        .ticker {
            display: inline-block;
            padding: 8px 15px;
            border-radius: 8px;
            font-family: monospace;
            font-size: 1.2rem;
            font-weight: bold;
            margin-bottom: 20px;
            letter-spacing: 2px;
        }
        
        .profile-img {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            object-fit: cover;
            border: 3px solid rgba(255, 255, 255, 0.2);
            margin: 0 auto 20px;
            display: ${data.img ? 'block' : 'none'};
        }
        
        .profile-name {
            font-size: 1.5rem;
            margin-bottom: 10px;
            font-weight: 700;
            display: ${data.nama ? 'block' : 'none'};
        }
        
        .profile-bio {
            font-size: 1rem;
            opacity: 0.9;
            margin-bottom: 30px;
            line-height: 1.6;
            display: ${data.deskripsi ? 'block' : 'none'};
        }
        
        .notice-box {
            padding: 15px;
            border-radius: 12px;
            margin-bottom: 20px;
            font-size: 0.9rem;
            text-align: left;
            line-height: 1.5;
        }
        
        .social-links {
            display: flex;
            justify-content: center;
            gap: 15px;
            margin-bottom: 30px;
            flex-wrap: wrap;
        }
        
        .medsos-btn {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            text-decoration: none;
            font-size: 1.2rem;
            transition: all 0.3s ease;
        }
        
        .links-container {
            display: flex;
            flex-direction: column;
            gap: 15px;
            margin-bottom: 30px;
        }
        
        .linktree-btn {
            padding: 18px 24px;
            border-radius: 12px;
            text-decoration: none;
            font-size: 1rem;
            font-weight: 600;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            transition: all 0.3s ease;
            cursor: pointer;
        }
        
        .custom-link i {
            font-size: 1.1rem;
        }
        
        .footer-text {
            font-size: 0.9rem;
            opacity: 0.7;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            display: ${data.footer ? 'block' : 'none'};
        }
        
        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @media (max-width: 480px) {
            .linktree-container {
                padding: 25px 20px;
            }
            
            .banner-title {
                font-size: 1.5rem;
            }
            
            .ticker {
                font-size: 1rem;
                padding: 6px 12px;
            }
            
            .analog-clock {
                width: 60px;
                height: 60px;
            }
            
            .hour-hand { height: 15px; top: calc(50% - 15px); }
            .minute-hand { height: 22px; top: calc(50% - 22px); }
            .second-hand { height: 25px; top: calc(50% - 25px); }
            
            .digital-clock {
                font-size: 1rem;
                padding: 8px;
            }
        }
    </style>
</head>
<body>
    <div class="linktree-container">
        ${bannerHTML}
        ${tickerHTML}
        
        ${data.img ? `<img src="${data.img}" alt="${data.nama || 'Profile'}" class="profile-img">` : ''}
        ${data.nama ? `<h1 class="profile-name">${data.nama}</h1>` : ''}
        ${data.deskripsi ? `<p class="profile-bio">${data.deskripsi}</p>` : ''}
        
        ${noticesHTML}
        ${medsosHTML}
        ${linksHTML}
        
        ${data.footer ? `<p class="footer-text">${data.footer}</p>` : ''}
    </div>
    
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // Button hover effects
            const buttons = document.querySelectorAll('.linktree-btn');
            buttons.forEach(btn => {
                btn.addEventListener('mouseenter', function() {
                    this.style.transform = 'translateY(-3px)';
                });
                
                btn.addEventListener('mouseleave', function() {
                    this.style.transform = 'translateY(0)';
                });
            });
            
            ${clockScript}
        });
    </script>
</body>
</html>`;
    }
    
    function generateFullHTML(data) {
        return generatePreviewHTML(data);
    }
    
    // ==================== EVENT HANDLERS ====================
    function handlePreview() {
        console.log('👁️ Generating preview...');
        
        const data = collectFormData();
        console.log('Collected data:', data);
        
        // Validation
        const errors = [];
        
        if (!data.nama) {
            errors.push('⚠️ Harap isi Nama terlebih dahulu');
        }
        
        if (!data.deskripsi) {
            errors.push('⚠️ Harap isi Deskripsi terlebih dahulu');
        }
        
        if (data.medsos.length === 0 && data.links.length === 0) {
            errors.push('🔗 Tambahkan minimal satu link (media sosial atau custom link)');
        }
        
        if (errors.length > 0) {
            showNotification(errors.join('<br>'), 'error');
            return;
        }
        
        // Save current state
        saveToLocalStorage(data);
        
        // Generate preview
        const previewHTML = generatePreviewHTML(data);
        const fullHTML = generateFullHTML(data);
        
        console.log('Generated HTML length:', previewHTML.length);
        
        // Update iframe
        elements.previewFrame.srcdoc = previewHTML;
        elements.iframePlaceholder.style.display = 'none';
        elements.previewFrame.style.display = 'block';
        
        // Update code output
        elements.htmlOutput.textContent = fullHTML;
        
        // Enable buttons
        elements.copyBtn.disabled = false;
        elements.downloadBtn.disabled = false;
        
        showNotification('✅ Preview berhasil digenerate', 'success');
        console.log('✅ Preview generated successfully');
    }
    
    function handleReset() {
        if (!confirm('Reset semua input? Semua data akan dihapus dan tidak bisa dikembalikan.')) {
            return;
        }
        
        // Clear all inputs
        elements.bannerText.value = '';
        elements.subBanner.value = '';
        elements.tickerText.value = '';
        elements.img.value = '';
        elements.nama.value = '';
        elements.deskripsi.value = '';
        elements.footer.value = '';
        
        // Clear dynamic containers
        elements.noticeContainer.innerHTML = '';
        elements.medsosContainer.innerHTML = '';
        elements.linksContainer.innerHTML = '';
        
        // Reset template selector
        document.querySelectorAll('.template-option').forEach(option => {
            option.classList.remove('active');
        });
        const defaultTemplate = document.querySelector('.template-option[data-template="1"]');
        if (defaultTemplate) {
            defaultTemplate.classList.add('active');
        }
        elements.template.value = '1';
        
        // Reset ticker to static
        const staticRadio = document.querySelector('input[name="tickerType"][value="static"]');
        if (staticRadio) {
            staticRadio.checked = true;
            staticRadio.dispatchEvent(new Event('change'));
        }
        
        // Reset clock configs
        const digitalConfigs = ['showSeconds', 'showDate', 'militaryTime', 'blinkSeparator'];
        digitalConfigs.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                if (id === 'showSeconds' || id === 'blinkSeparator') {
                    element.checked = true;
                } else {
                    element.checked = false;
                }
            }
        });
        
        if (document.getElementById('timezone')) {
            document.getElementById('timezone').value = 'local';
        }
        
        const analogConfigs = ['showAnalogSeconds', 'showAnalogNumbers', 'smoothAnalog'];
        analogConfigs.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.checked = true;
            }
        });
        
        if (document.getElementById('analogTimezone')) {
            document.getElementById('analogTimezone').value = 'local';
        }
        
        // Reset preview
        elements.iframePlaceholder.style.display = 'flex';
        elements.previewFrame.style.display = 'none';
        elements.previewFrame.srcdoc = '';
        
        // Reset code output
        elements.htmlOutput.textContent = '// HTML akan muncul di sini...';
        
        // Disable buttons
        elements.copyBtn.disabled = true;
        elements.downloadBtn.disabled = true;
        
        // Clear localStorage
        clearLocalStorage();
        
        // Add empty fields
        setTimeout(() => {
            addNoticeField();
            addMedsosField();
            addLinkField();
        }, 100);
        
        showNotification('✅ Form telah direset', 'success');
        console.log('✅ Form reset complete');
    }
    
    async function handleCopy() {
        const html = elements.htmlOutput.textContent;
        
        try {
            await navigator.clipboard.writeText(html);
            elements.copyOverlay.classList.add('show');
            setTimeout(() => {
                elements.copyOverlay.classList.remove('show');
            }, 2000);
            showNotification('✅ HTML berhasil disalin ke clipboard', 'success');
            console.log('✅ HTML copied to clipboard');
        } catch (err) {
            console.error('❌ Failed to copy:', err);
            
            // Fallback method
            const textArea = document.createElement('textarea');
            textArea.value = html;
            document.body.appendChild(textArea);
            textArea.select();
            
            try {
                document.execCommand('copy');
                elements.copyOverlay.classList.add('show');
                setTimeout(() => {
                    elements.copyOverlay.classList.remove('show');
                }, 2000);
                showNotification('✅ HTML berhasil disalin ke clipboard', 'success');
            } catch (fallbackErr) {
                console.error('❌ Fallback copy failed:', fallbackErr);
                showNotification('❌ Gagal menyalin. Silakan copy manual dari text area.', 'error');
            }
            
            document.body.removeChild(textArea);
        }
    }
    
    function handleDownload() {
        const html = elements.htmlOutput.textContent;
        const data = collectFormData();
        const filename = `linktree-${data.nama.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'linktree'}.html`;
        
        const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showNotification(`✅ File berhasil diunduh: ${filename}`, 'success');
        console.log('✅ File downloaded:', filename);
    }
    
    // ==================== INITIALIZATION ====================
    function restoreSavedData() {
        const saved = loadFromLocalStorage();
        
        if (saved) {
            console.log('🔄 Restoring saved data...');
            
            // Restore basic fields
            elements.bannerText.value = saved.bannerText || '';
            elements.subBanner.value = saved.subBanner || '';
            elements.img.value = saved.img || '';
            elements.nama.value = saved.nama || '';
            elements.deskripsi.value = saved.deskripsi || '';
            elements.footer.value = saved.footer || '';
            
            // Restore ticker config
            if (saved.ticker) {
                restoreTickerConfig(saved.ticker);
            }
            
            // Restore template
            if (saved.template) {
                elements.template.value = saved.template;
                document.querySelectorAll('.template-option').forEach(option => {
                    option.classList.remove('active');
                    if (option.dataset.template === saved.template) {
                        option.classList.add('active');
                    }
                });
            }
            
            // Clear existing dynamic fields
            elements.noticeContainer.innerHTML = '';
            elements.medsosContainer.innerHTML = '';
            elements.linksContainer.innerHTML = '';
            
            // Restore notices
            if (saved.notices && saved.notices.length > 0) {
                saved.notices.forEach(notice => {
                    addNoticeField(notice);
                });
            } else {
                addNoticeField();
            }
            
            // Restore social media
            if (saved.medsos && saved.medsos.length > 0) {
                saved.medsos.forEach(item => {
                    let displayUrl = item.url;
                    try {
                        const urlObj = new URL(item.url);
                        displayUrl = urlObj.pathname.replace(/^\//, '') || urlObj.hostname;
                    } catch (e) {}
                    addMedsosField(item.platform, displayUrl);
                });
            } else {
                addMedsosField();
            }
            
            // Restore custom links
            if (saved.links && saved.links.length > 0) {
                saved.links.forEach(item => {
                    addLinkField(item.platform, item.text, item.url);
                });
            } else {
                addLinkField();
            }
            
            console.log('✅ Saved data restored');
            
            // Auto-generate preview if we have enough data
            if (saved.nama && saved.deskripsi && 
                (saved.notices?.length > 0 || saved.medsos?.length > 0 || saved.links?.length > 0)) {
                setTimeout(() => {
                    handlePreview();
                }, 500);
            }
            
            return true;
        }
        
        return false;
    }
    
    function initialize() {
        console.log('⚡ Initializing Linktree Builder...');
        
        // Debug: Cek apakah elemen ditemukan
        console.log('Elements found:', {
            bannerText: !!elements.bannerText,
            subBanner: !!elements.subBanner,
            nama: !!elements.nama,
            deskripsi: !!elements.deskripsi,
            addNoticeBtn: !!elements.addNoticeBtn,
            addMedsosBtn: !!elements.addMedsosBtn,
            addLinkBtn: !!elements.addLinkBtn,
            previewBtn: !!elements.previewBtn
        });
        
        // Setup event listeners
        elements.addNoticeBtn.addEventListener('click', () => {
            console.log('Add notice clicked');
            addNoticeField();
        });
        
        elements.addMedsosBtn.addEventListener('click', () => {
            console.log('Add medsos clicked');
            addMedsosField();
        });
        
        elements.addLinkBtn.addEventListener('click', () => {
            console.log('Add link clicked');
            addLinkField();
        });
        
        elements.previewBtn.addEventListener('click', handlePreview);
        elements.resetBtn.addEventListener('click', handleReset);
        elements.copyBtn.addEventListener('click', handleCopy);
        elements.downloadBtn.addEventListener('click', handleDownload);
        
        // Template selector
        document.querySelectorAll('.template-option').forEach(option => {
            option.addEventListener('click', function() {
                document.querySelectorAll('.template-option').forEach(opt => {
                    opt.classList.remove('active');
                });
                this.classList.add('active');
                elements.template.value = this.dataset.template;
                autoSave();
                
                // Force preview update if already generated
                if (elements.previewFrame.style.display === 'block') {
                    handlePreview();
                }
            });
        });
        
        // Setup ticker type selector
        setupTickerTypeSelector();
        
        // Auto-save on input for basic fields
        [elements.bannerText, elements.subBanner, elements.tickerText, 
         elements.img, elements.nama, elements.deskripsi, elements.footer].forEach(input => {
            if (input) input.addEventListener('input', autoSave);
        });
        
        // Try to restore saved data
        const hasSavedData = restoreSavedData();
        
        // If no saved data, start with empty form
        if (!hasSavedData) {
            console.log('🆕 Starting with empty form');
            
            // Add empty fields
            addNoticeField();
            addMedsosField();
            addLinkField();
            
            // Start clock previews
            startClockIntervals();
        }
        
        isInitializing = false;
        console.log('🎉 Linktree Builder initialized successfully!');
    }
    
    // Start the application
    initialize();
    
    // Clean up intervals when page unloads
    window.addEventListener('beforeunload', function() {
        stopClockIntervals();
    });
});