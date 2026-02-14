// ============================================
//      LOGIC SYSTEM & DOWNLOAD HANDLER
// ============================================

const API_URL = "https://api-faa.my.id/faa/ai-text2img-pro";

// Elements
const promptInput = document.getElementById('promptInput');
const generateBtn = document.getElementById('generateBtn');
const imageContainer = document.getElementById('imageContainer');
const resultImage = document.getElementById('resultImage');
const loader = document.getElementById('loader');
const placeholder = document.getElementById('placeholder');
const statusMessage = document.getElementById('statusMessage');
const downloadBtn = document.getElementById('downloadBtn'); // New

// 1. Initial Icon Set
generateBtn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M15 2L12.9 6.2 8.5 7.4l3.9 4.7-.4 5.9 5-3.3 5 3.3-.4-5.9 3.9-4.7-4.4-1.2L15 2z"></path></svg>`;

// 2. Event Listeners
generateBtn.addEventListener('click', handleGeneration);
downloadBtn.addEventListener('click', downloadImage);

promptInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleGeneration();
        promptInput.blur();
    }
});

// Change icon based on input (Mobile UX touch)
promptInput.addEventListener('input', () => {
    const iconPath = promptInput.value.length > 0 
       ? "M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" // Send plane
       : "M7.5 5.6L10 7 8.6 4.5 10 2 7.5 3.4 5 2 6.4 4.5 5 7zM19.5 15.4L22 14l-2.5-1.4L22 10l-2.5 1.4L17 10l1.4 2.6L16 14l2.5 1.4L16 18l2.5-1.4L21 18l-1.5-2.6zM15 2L12.9 6.2 8.5 7.4l3.9 4.7-.4 5.9 5-3.3 5 3.3-.4-5.9 3.9-4.7-4.4-1.2L15 2z"; // Sparkles
    
    generateBtn.innerHTML = `<svg viewBox="0 0 24 24"><path d="${iconPath}"></path></svg>`;
});

// Helper untuk tag UI
window.addTag = function(text) {
    const currentVal = promptInput.value;
    promptInput.value = currentVal + (currentVal.length > 0 ? " " : "") + text;
    showStatus(`Tag added: ${text}`, "neutral");
}

// 3. Main Generation Logic
async function handleGeneration() {
    const prompt = promptInput.value.trim();

    if (!prompt) {
        showStatus("Please enter a prompt first", "error");
        return;
    }

    setLoadingState(true);
    showStatus("Dreaming...", "neutral");
    
    // Reset image state
    resultImage.classList.remove('loaded');
    downloadBtn.classList.remove('visible'); // Hide download button during gen

    try {
        const targetUrl = `${API_URL}?prompt=${encodeURIComponent(prompt)}`;
        const response = await fetch(targetUrl);

        if (!response.ok) {
            throw new Error(`Server status: ${response.status}`);
        }

        const contentType = response.headers.get("content-type");
        
        if (contentType && contentType.includes("application/json")) {
            const data = await response.json();
            if (data.url || data.image_url || data.result) {
                const imageUrl = data.url || data.image_url || data.result;
                displayImage(imageUrl);
            } else {
                console.warn("JSON Error", data);
                throw new Error("Invalid format received.");
            }
        } else {
            const blob = await response.blob();
            const imageUrl = URL.createObjectURL(blob);
            displayImage(imageUrl);
        }

        showStatus("Ready", "neutral");

    } catch (error) {
        console.error("Exec Error:", error);
        showStatus("Connection Error", "error");
        setLoadingState(false);
    }
}

// 4. Display Logic
function displayImage(src) {
    // Prevent old image flash
    resultImage.src = "";
    
    const img = new Image();
    img.onload = () => {
        resultImage.src = src;
        resultImage.classList.add('loaded');
        setLoadingState(false);
        // Show download button
        downloadBtn.classList.add('visible');
    };
    img.onerror = () => {
        showStatus("Failed to render", "error");
        setLoadingState(false);
    };
    img.src = src;
}

// 5. Download Feature (NEW)
async function downloadImage() {
    const imgSrc = resultImage.src;
    if (!imgSrc) return;

    showStatus("Saving...", "neutral");

    try {
        // Fetch fetch ulang sebagai blob untuk memastikan download berjalan di semua browser
        // terutama jika gambar berasal dari URL eksternal (mengatasi beberapa isu cross-origin simple)
        const response = await fetch(imgSrc);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = blobUrl;
        // Penamaan file unik berdasarkan waktu
        link.download = `SANN404_Neural_${Date.now()}.png`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Bersihkan memori
        window.URL.revokeObjectURL(blobUrl);
        showStatus("Saved to Gallery", "neutral");
        
    } catch (e) {
        console.error("Download fail:", e);
        // Fallback method jika fetch gagal (misal CORS ketat)
        const link = document.createElement('a');
        link.href = imgSrc;
        link.download = `SANN404_Neural_${Date.now()}.png`;
        link.target = "_blank";
        link.click();
        showStatus("Opened image", "neutral");
    }
}

// 6. UI State Helpers
function setLoadingState(isLoading) {
    if (isLoading) {
        generateBtn.disabled = true;
        generateBtn.style.opacity = "0.7";
        loader.style.display = "block";
        placeholder.style.display = "none";
        resultImage.style.display = "none";
    } else {
        generateBtn.disabled = false;
        generateBtn.style.opacity = "1";
        loader.style.display = "none";
        // Don't show placeholder again if we have an image
        if(!resultImage.src || resultImage.src === "") {
            placeholder.style.display = "flex"; // Revert to flex for centering
        }
        resultImage.style.display = "block";
    }
}

function showStatus(message, type) {
    statusMessage.textContent = message;
    statusMessage.classList.add('visible');
    
    setTimeout(() => {
        statusMessage.classList.remove('visible');
    }, 3000);

    if (type === "error") {
        statusMessage.style.color = "#FF4B4B";
        statusMessage.style.borderColor = "rgba(255, 75, 75, 0.3)";
    } else {
        statusMessage.style.color = "#fff";
        statusMessage.style.borderColor = "rgba(255, 255, 255, 0.1)";
    }
}
