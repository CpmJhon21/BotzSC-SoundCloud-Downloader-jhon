// api/index.js
const axios = require('axios');

// --- Kode Asli Anda (dengan sedikit modifikasi agar reusable) ---
async function img2prompt(image, { language = 'en', model = 'general' } = {}) {
    try {
        const conf = {
            language: ['en', 'es', 'zh', 'zh-TW', 'fr', 'de', 'ja', 'ru', 'pt', 'ar', 'ko', 'it', 'nl', 'tr', 'pl', 'vi', 'th', 'hi', 'id'],
            model: ['general', 'midjourney', 'dalle', 'stable_diffusion', 'flux']
        };
        
        if (!Buffer.isBuffer(image)) throw new Error('Image must be a buffer.');
        if (!conf.language.includes(language)) throw new Error(`Available languages: ${conf.language.join(', ')}.`);
        if (!conf.model.includes(model)) throw new Error(`Available models: ${conf.model.join(', ')}.`);
        
        const { data } = await axios.post('https://api.imagepromptguru.net/image-to-prompt', {
            // Kita memastikan format base64 header-nya benar
            image: 'data:image/jpeg;base64,' + image.toString('base64'),
            language: language,
            model: model
        }, {
            headers: {
                origin: 'https://imagepromptguru.net',
                referer: 'https://imagepromptguru.net/',
                'user-agent': 'Mozilla/5.0 (Linux; Android 15; SM-F958 Build/AP3A.240905.015) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.6723.86 Mobile Safari/537.36'
            }
        });
        
        return data.prompt;
    } catch (error) {
        throw new Error(error.message || 'Internal Server Error');
    }
}

// --- Handler untuk Vercel ---
module.exports = async (req, res) => {
    // Tambahkan CORS agar frontend bisa mengakses
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { imageBase64, language, model } = req.body;

        if (!imageBase64) {
            return res.status(400).json({ error: 'Image data is required' });
        }

        // Frontend mengirim base64 string lengkap (ex: "data:image/jpeg;base64,...")
        // Kita perlu menghapus prefix header untuk mendapatkan raw buffer
        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
        const imageBuffer = Buffer.from(base64Data, 'base64');

        const result = await img2prompt(imageBuffer, { 
            language: language || 'en', 
            model: model || 'general' 
        });

        res.status(200).json({ prompt: result });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};
