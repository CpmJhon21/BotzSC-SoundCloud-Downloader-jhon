document.addEventListener('DOMContentLoaded', () => {
    // === Elements ===
    const fileInput = document.getElementById('imageInput');
    const dropArea = document.getElementById('dropArea');
    const previewImage = document.getElementById('previewImage');
    const uploadContent = document.querySelector('.upload-content');
    const removeImgBtn = document.getElementById('removeImgBtn');
    const generateBtn = document.getElementById('generateBtn');
    
    // Result Elements
    const emptyState = document.getElementById('emptyState');
    const loading = document.getElementById('loading');
    const resultContent = document.getElementById('resultContent');
    const promptResult = document.getElementById('promptResult');
    const copyBtn = document.getElementById('copyBtn');
    const modelTag = document.getElementById('modelTag');
    const charCount = document.getElementById('charCount');

    // Sidebar
    const menuToggle = document.getElementById('menuToggle');
    const sidebarMenu = document.getElementById('sidebarMenu');
    const closeSidebar = document.getElementById('closeSidebar');

    let currentFile = null;

    // === Sidebar Logic ===
    function toggleSidebar() {
        sidebarMenu.classList.toggle('active');
    }
    menuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleSidebar();
    });
    closeSidebar.addEventListener('click', toggleSidebar);
    document.addEventListener('click', (e) => {
        if (!sidebarMenu.contains(e.target) && !menuToggle.contains(e.target)) {
            sidebarMenu.classList.remove('active');
        }
    });

    // === Drag & Drop + Upload Logic ===
    dropArea.addEventListener('click', () => fileInput.click());

    dropArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropArea.style.borderColor = 'var(--primary)';
        dropArea.style.background = 'var(--primary-soft)';
    });

    dropArea.addEventListener('dragleave', () => {
        dropArea.style.borderColor = '';
        dropArea.style.background = '';
    });

    dropArea.addEventListener('drop', (e) => {
        e.preventDefault();
        dropArea.style.borderColor = '';
        dropArea.style.background = '';
        const file = e.dataTransfer.files[0];
        handleFileSelect(file);
    });

    fileInput.addEventListener('change', (e) => {
        handleFileSelect(e.target.files[0]);
    });

    function handleFileSelect(file) {
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            alert('Harap upload file gambar.');
            return;
        }

        currentFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImage.src = e.target.result;
            previewImage.style.display = 'block';
            uploadContent.style.display = 'none';
            removeImgBtn.style.display = 'block';
            generateBtn.disabled = false;
        };
        reader.readAsDataURL(file);
    }

    removeImgBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        resetUpload();
    });

    function resetUpload() {
        currentFile = null;
        fileInput.value = '';
        previewImage.style.display = 'none';
        uploadContent.style.display = 'block';
        removeImgBtn.style.display = 'none';
        generateBtn.disabled = true;
    }

    // === Generate API Logic ===
    generateBtn.addEventListener('click', async () => {
        if (!currentFile) return;

        // UI Transition
        generateBtn.disabled = true;
        emptyState.style.display = 'none';
        resultContent.style.display = 'none';
        loading.style.display = 'block';

        const language = document.getElementById('language').value;
        const model = document.getElementById('model').value;

        try {
            const base64 = await toBase64(currentFile);

            const response = await fetch('/api/index1', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    imageBase64: base64,
                    language: language,
                    model: model
                })
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.error || 'Server Error');

            // Success Display
            promptResult.value = data.prompt;
            modelTag.textContent = model.toUpperCase();
            charCount.textContent = data.prompt.length;
            
            loading.style.display = 'none';
            resultContent.style.display = 'flex'; // Flex untuk layout vertical

        } catch (error) {
            alert('JHON404 Error: ' + error.message);
            loading.style.display = 'none';
            emptyState.style.display = 'flex';
        } finally {
            generateBtn.disabled = false;
        }
    });

    // Helper
    const toBase64 = file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });

    // === Copy To Clipboard ===
    copyBtn.addEventListener('click', () => {
        promptResult.select();
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(promptResult.value);
        } else {
            document.execCommand('copy');
        }

        const originalHTML = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="ri-check-line"></i> Tersalin';
        copyBtn.style.background = '#dcfce7';
        copyBtn.style.color = '#15803d';
        copyBtn.style.borderColor = '#dcfce7';

        setTimeout(() => {
            copyBtn.innerHTML = originalHTML;
            copyBtn.style.background = '';
            copyBtn.style.color = '';
            copyBtn.style.borderColor = '';
        }, 2000);
    });
});
