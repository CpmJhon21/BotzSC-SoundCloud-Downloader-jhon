// pages/api/index.js
import * as cheerio from 'cheerio';
const axios = require('axios');

// ============ GENERATOR EMAIL FUNCTIONS ============
const generatorEmail = {
  api: {
    base: 'https://generator.email/',
    validate: 'check_adres_validation3.php'
  },
  h: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  },
  _f: async (u, o, r = 5) => {
    for (let i = 0, e; i < r; i++) {
      try { 
        const res = await fetch(u, o); 
        return o._t ? await res.text() : await res.json(); 
      }
      catch (err) { 
        e = err.message; 
        if (i === r - 1) throw new Error(e); 
      }
    }
  },
  _v: async function(u, d) {
    try {
      return await this._f(this.api.base + this.api.validate, {
        method: 'POST',
        headers: { ...this.h, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ usr: u, dmn: d })
      });
    } catch (e) { return { err: e.message }; }
  },
  _p: (e) => e?.includes('@') ? e.split('@') : null,

  generate: async function() {
    try {
      const $ = cheerio.load(await this._f(this.api.base, { headers: this.h, cache: 'no-store', _t: 1 }));
      const em = $('#email_ch_text').text();
      if (!em) return { success: false, result: 'Gagal generate email' };
      
      const [u, d] = this._p(em), v = await this._v(u, d);
      return { 
        success: true, 
        result: { 
          email: em, 
          emailStatus: v.status || null, 
          uptime: v.uptime || null, 
          ...(v.err && { error: v.err }) 
        } 
      };
    } catch (e) { return { success: false, result: e.message }; }
  },

  inbox: async function(em) {
    const p = this._p(em);
    if (!p) return { success: false, result: 'Email tidak boleh kosong' };
    
    const [u, d] = p, v = await this._v(u, d), ck = `surl=${d}/${u}`;
    let h;
    try { 
      h = await this._f(this.api.base, { headers: { ...this.h, Cookie: ck }, cache: 'no-store', _t: 1 }); 
    }
    catch (e) { 
      return { success: true, result: { email: em, emailStatus: v.status, uptime: v.uptime, inbox: [], error: e.message } }; 
    }

    if (h.includes('Email generator is ready')) return { success: true, result: { email: em, emailStatus: v.status, uptime: v.uptime, inbox: [] } };

    const $ = cheerio.load(h), c = parseInt($('#mess_number').text()) || 0, ib = [];
    
    if (c === 1) {
      const el = $('#email-table .e7m.row'), sp = el.find('.e7m.col-md-9 span');
      ib.push({ from: sp.eq(3).text().replace(/\(.*?\)/, '').trim(), to: sp.eq(1).text(), created: el.find('.e7m.tooltip').text().replace('Created: ', ''), subject: el.find('h1').text(), message: el.find('.e7m.mess_bodiyy').text().trim() });
    } else if (c > 1) {
      for (const l of $('#email-table a').map((_, a) => $(a).attr('href')).get()) {
        const m = cheerio.load(await this._f(this.api.base, { headers: { ...this.h, Cookie: `surl=${l.replace('/', '')}` }, cache: 'no-store', _t: 1 }));
        const sp = m('.e7m.col-md-9 span');
        ib.push({ from: sp.eq(3).text().replace(/\(.*?\)/, '').trim(), to: sp.eq(1).text(), created: m('.e7m.tooltip').text().replace('Created: ', ''), subject: m('h1').text(), message: m('.e7m.mess_bodiyy').text().trim() });
      }
    }
    return { success: true, result: { email: em, emailStatus: v.status, uptime: v.uptime, inbox: ib } };
  }
};

// ============ SPOTIFY DOWNLOADER FUNCTIONS ============
async function spotifydl(url) {
    try {
        if (!url.includes('spotify.com')) throw new Error('Invalid Spotify URL.');
        
        const rynn = await axios.get('https://spotmate.online/', {
            headers: {
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        const $ = cheerio.load(rynn.data);
        
        const api = axios.create({
            baseURL: 'https://spotmate.online',
            headers: {
                cookie: rynn.headers['set-cookie']?.join('; ') || '',
                'content-type': 'application/json',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'x-csrf-token': $('meta[name="csrf-token"]').attr('content')
            }
        });
        
        const [{ data: meta }, { data: dl }] = await Promise.all([
            api.post('/getTrackData', { spotify_url: url }),
            api.post('/convert', { urls: url })
        ]);
        
        return {
            status: true,
            title: meta.title || "Music Siap Download",
            artist: meta.artist || "Artist",
            cover: meta.cover || "",
            download_url: dl.url
        };
    } catch (error) {
        console.error(error);
        return { status: false, message: error.message };
    }
}

// ============ MAIN API HANDLER ============
export default async function handler(req, res) {
    // Setup CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    // Handle OPTIONS request (preflight)
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        // ============ HANDLE GENERATOR EMAIL ENDPOINTS (GET) ============
        if (req.method === 'GET') {
            const { action, email } = req.query;

            if (action === 'generate') {
                const data = await generatorEmail.generate();
                return res.status(200).json({
                    service: 'email-generator',
                    ...data
                });
            } 
            else if (action === 'inbox' && email) {
                const data = await generatorEmail.inbox(email);
                return res.status(200).json({
                    service: 'email-inbox',
                    ...data
                });
            }
            else {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Invalid action or missing email. Available actions: generate, inbox' 
                });
            }
        }

        // ============ HANDLE SPOTIFY DOWNLOADER (POST) ============
        if (req.method === 'POST') {
            const { url } = req.body;

            if (!url) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'URL is required' 
                });
            }

            // Cek apakah URL Spotify
            if (url.includes('spotify.com')) {
                const result = await spotifydl(url);
                if (!result.status) {
                    return res.status(500).json({ 
                        success: false,
                        service: 'spotify-downloader',
                        error: result.message 
                    });
                }
                return res.status(200).json({
                    service: 'spotify-downloader',
                    ...result
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'URL must be a valid Spotify URL'
                });
            }
        }

        // Method not allowed
        return res.status(405).json({ 
            success: false, 
            error: 'Method Not Allowed' 
        });

    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ 
            success: false, 
            error: 'Internal Server Error',
            message: error.message 
        });
    }
}