let currentEmail = localStorage.getItem('jhon_mail') || null;
let db; 

const DB_NAME = 'jhonMailDB';
const DB_VERSION = 1;
const STORE_NAME = 'messages';

document.addEventListener('DOMContentLoaded', async () => {
    await initDB();
    
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/assets/js/sw.js')
            .catch(err => console.log('SW Fail:', err));
    }

    if (currentEmail) {
        document.getElementById('emailAddress').innerText = currentEmail;
        await loadCachedMessages(); 
        fetchInbox(); 
    } else {
        generateNewEmail();
    }
    
    startAutoRefresh();
});

function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = (e) => {
            db = e.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };
        request.onsuccess = (e) => { db = e.target.result; resolve(db); };
        request.onerror = (e) => reject(e);
    });
}

function saveMessageToDB(msg) {
    return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.put(msg); 
        tx.oncomplete = () => resolve();
    });
}

function getAllMessagesFromDB() {
    return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result || []);
    });
}

function clearAllMessagesDB() {
    return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.clear();
        tx.oncomplete = () => resolve();
    });
}

function switchTab(viewId, element) {
    document.querySelectorAll('.tab-view').forEach(el => el.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');
    
    if(element) { 
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
        element.classList.add('active');
    }
}

async function confirmNewEmail() {
    if(confirm('Buat email baru? Inbox lama akan dihapus permanen.')) {
        generateNewEmail();
    }
}

async function generateNewEmail() {
    const emailDisplay = document.getElementById('emailAddress');
    emailDisplay.innerText = "Membuat ID baru...";
    
    await clearAllMessagesDB(); 
    updateBadge(0);
    
    try {
        const res = await fetch('/api?action=generate');
        const data = await res.json();
        
        if (data.success) {
            currentEmail = data.result.email;
            localStorage.setItem('jhon_mail', currentEmail);
            emailDisplay.innerText = currentEmail;
            
            document.getElementById('unreadList').innerHTML = emptyState('updates');
            document.getElementById('readList').innerHTML = emptyState('inbox');
            
            switchTab('view-home', document.querySelector('.nav-item:first-child'));
        } else {
            alert('Gagal: ' + data.result);
        }
    } catch (e) {
        emailDisplay.innerText = "Error Jaringan";
    }
}

async function loadCachedMessages() {
    const messages = await getAllMessagesFromDB();
    renderMessages(messages);
}

async function fetchInbox() {
    if (!currentEmail) return;

    try {
        const res = await fetch(`/api?action=inbox&email=${currentEmail}`);
        const data = await res.json();

        if (data.success && data.result.inbox) {
            const serverMessages = data.result.inbox;
            const existingMessages = await getAllMessagesFromDB();
            
            for (const msg of serverMessages) {
                const msgId = `${msg.created}_${msg.from}`.replace(/\s/g, '');
                const exists = existingMessages.find(m => m.id === msgId);
                
                if (!exists) {
                    await saveMessageToDB({ ...msg, id: msgId, isRead: false });
                }
            }
            await loadCachedMessages();
        }
    } catch (e) {
        console.log("Offline/Error Fetch");
    }
}

// --- FUNGSI RENDER UTAMA DIUPDATE ---
function renderMessages(messages) {
    const unreadContainer = document.getElementById('unreadList');
    const readContainer = document.getElementById('readList');
    
    let unreadHTML = '';
    let readHTML = '';
    let unreadCount = 0;

    messages.sort((a, b) => new Date(b.created) - new Date(a.created));

    messages.forEach((msg) => {
        // Ambil inisial huruf pertama
        const initial = msg.from ? msg.from.charAt(0).toUpperCase() : '?';
        // Format waktu (ambil jam saja biar rapi)
        const timeDisplay = msg.created.split(' ')[1] || msg.created;

        const html = `
            <div class="message-card ${msg.isRead ? 'read' : 'unread'}" onclick="openMessage('${msg.id}')">
                <div class="msg-avatar">${initial}</div>
                <div class="msg-content">
                    <div class="msg-header">
                        <span class="msg-from">${msg.from}</span>
                        <span class="msg-time">${timeDisplay}</span>
                    </div>
                    <div class="msg-subject">${msg.subject || '(Tanpa Subjek)'}</div>
                    <div class="msg-snippet">${msg.message}</div>
                </div>
            </div>
        `;

        if (msg.isRead) {
            readHTML += html;
        } else {
            unreadHTML += html;
            unreadCount++;
        }
    });

    unreadContainer.innerHTML = unreadHTML || emptyState('updates');
    readContainer.innerHTML = readHTML || emptyState('inbox');
    
    updateBadge(unreadCount);
}

async function openMessage(msgId) {
    const messages = await getAllMessagesFromDB();
    const msg = messages.find(m => m.id === msgId);
    
    if (!msg) return;

    // Data untuk Modal
    const initial = msg.from ? msg.from.charAt(0).toUpperCase() : '?';
    document.getElementById('modalSubject').innerText = msg.subject || '(No Subject)';
    document.getElementById('modalBody').innerText = msg.message;
    
    // Inject Meta Info ke Modal
    document.getElementById('modalMeta').innerHTML = `
        <div class="meta-avatar">${initial}</div>
        <div class="meta-info">
            <span class="meta-from">${msg.from}</span>
            <span class="meta-time">${msg.created}</span>
        </div>
    `;
    
    const modal = document.getElementById('msgModal');
    modal.classList.add('show');

    if (!msg.isRead) {
        msg.isRead = true;
        await saveMessageToDB(msg); 
        await loadCachedMessages(); 
    }
}

function closeModal() {
    document.getElementById('msgModal').classList.remove('show');
}

function updateBadge(count) {
    const badge = document.getElementById('badge-count');
    const dot = document.getElementById('nav-dot');
    
    if (count > 0) {
        badge.innerText = count;
        badge.style.display = 'inline-block';
        dot.style.display = 'block';
    } else {
        badge.style.display = 'none';
        dot.style.display = 'none';
    }
}

function emptyState(type) {
    const icon = type === 'updates' ? 'bi-bell-slash' : 'bi-inbox';
    const text = type === 'updates' ? 'Belum ada pesan baru.' : 'Belum ada pesan terbaca.';
    return `
        <div class="empty-placeholder">
            <i class="bi ${icon}"></i>
            <p>${text}</p>
        </div>
    `;
}

function copyEmail() {
    if (!currentEmail) return;
    navigator.clipboard.writeText(currentEmail);
    const toast = document.getElementById('toast');
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
}

function startAutoRefresh() {
    let timeLeft = 10;
    const timerText = document.getElementById('timerText');
    
    setInterval(() => {
        timeLeft--;
        timerText.innerText = `Auto-refresh: ${timeLeft}s`;
        if (timeLeft <= 0) {
            fetchInbox();
            timeLeft = 10;
        }
    }, 1000);
}
