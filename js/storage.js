

const SVP_PAIRS_KEY = 'svp-video-pairs';
const SVP_SETTINGS_KEY = 'svp-settings';




function getVideoPairs() {
    try {
        return JSON.parse(localStorage.getItem(SVP_PAIRS_KEY) || '[]');
    } catch {
        return [];
    }
}

function getVideoPair(id) {
    return getVideoPairs().find(p => p.id === id) || null;
}

function saveVideoPair(pair) {
    const pairs = getVideoPairs();
    const idx = pairs.findIndex(p => p.id === pair.id);
    if (idx >= 0) {
        pairs[idx] = pair;
    } else {
        pairs.unshift(pair);
    }
    localStorage.setItem(SVP_PAIRS_KEY, JSON.stringify(pairs));
}

function deleteVideoPair(id) {
    const pairs = getVideoPairs().filter(p => p.id !== id);
    localStorage.setItem(SVP_PAIRS_KEY, JSON.stringify(pairs));
}




const DEFAULT_SETTINGS = {
    uiScale: 1.0,
    keys: {
        playPause: ' ',
        seekForward: 'ArrowRight',
        seekBackward: 'ArrowLeft',
        switchAngle: 'KeyA',
        fullscreen: 'KeyF',
        close: 'Escape',
        speedUp: 'ArrowUp',
        speedDown: 'ArrowDown',
    },
    mouseButtons: {
        playPause: -1,
        switchAngle: -1,
    },
};

function getSettings() {
    try {
        const saved = JSON.parse(localStorage.getItem(SVP_SETTINGS_KEY) || '{}');
        return deepMerge(DEFAULT_SETTINGS, saved);
    } catch {
        return { ...DEFAULT_SETTINGS };
    }
}

function saveSettings(settings) {
    localStorage.setItem(SVP_SETTINGS_KEY, JSON.stringify(settings));
}

function deepMerge(base, override) {
    const result = { ...base };
    for (const key of Object.keys(override)) {
        if (
            typeof override[key] === 'object' &&
            override[key] !== null &&
            !Array.isArray(override[key])
        ) {
            result[key] = deepMerge(base[key] || {}, override[key]);
        } else {
            result[key] = override[key];
        }
    }
    return result;
}



const SVP_LOCAL_FOLDERS_KEY = 'svp-local-folders';

function getLocalFolders() {
    try { return JSON.parse(localStorage.getItem(SVP_LOCAL_FOLDERS_KEY) || '[]'); } catch { return []; }
}

function saveLocalFolder(folder) {
    const folders = getLocalFolders();
    const idx = folders.findIndex(f => f.id === folder.id);
    if (idx >= 0) { folders[idx] = folder; } else { folders.unshift(folder); }
    localStorage.setItem(SVP_LOCAL_FOLDERS_KEY, JSON.stringify(folders));
}

function deleteLocalFolder(id) {
    const folders = getLocalFolders().filter(f => f.id !== id);
    localStorage.setItem(SVP_LOCAL_FOLDERS_KEY, JSON.stringify(folders));
}



const SVP_USER_AVATAR_KEY = 'svp-user-avatar';

function getUserAvatarIcon() {
    return localStorage.getItem(SVP_USER_AVATAR_KEY) || null;
}

function saveUserAvatarIcon(iconName) {
    if (iconName) { localStorage.setItem(SVP_USER_AVATAR_KEY, iconName); }
    else { localStorage.removeItem(SVP_USER_AVATAR_KEY); }
}



function getVideoNotes(pairId) {
    try {
        var raw = localStorage.getItem('svp-notes-' + pairId);
        return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
}

function saveVideoNotes(pairId, notes) {
    localStorage.setItem('svp-notes-' + pairId, JSON.stringify(notes));
}

function addVideoNote(pairId, time, text, userName, userAvatar, userId) {
    var notes = getVideoNotes(pairId);
    var note = { id: Date.now().toString(36), time: Math.round(time * 10) / 10, text: text, userName: userName || null, userAvatar: userAvatar || null, userId: userId || null };
    notes.push(note);
    notes.sort(function(a, b) { return a.time - b.time; });
    saveVideoNotes(pairId, notes);
    return note;
}

function deleteVideoNote(pairId, noteId) {
    var notes = getVideoNotes(pairId).filter(function(n) { return n.id !== noteId; });
    saveVideoNotes(pairId, notes);
}



var LUCIDE_ICON_PATHS = {
  'user': '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>',
  'smile': '<circle cx="12" cy="12" r="10"></circle><path d="M8 13s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line>',
  'star': '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>',
  'zap': '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>',
  'flame': '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>',
  'heart': '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>',
  'trophy': '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"></path>',
  'award': '<circle cx="12" cy="8" r="6"></circle><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"></path>',
  'crown': '<path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"></path>',
  'shield': '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>',
  'rocket': '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path>',
  'camera': '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path><circle cx="12" cy="13" r="3"></circle>',
  'video': '<polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>',
  'music': '<path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle>',
  'headphones': '<path d="M3 18v-6a9 9 0 0 1 18 0v6"></path><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>',
  'gamepad2': '<line x1="6" x2="10" y1="11" y2="11"></line><line x1="8" x2="8" y1="9" y2="13"></line><line x1="15" x2="15.01" y1="12" y2="12"></line><line x1="17" x2="17.01" y1="10" y2="10"></line><rect width="20" height="12" x="2" y="6" rx="2"></rect>',
  'target': '<circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle>',
  'sun': '<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>',
  'moon': '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>',
  'cloud': '<path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path>',
  'leaf': '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"></path><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path>',
  'feather': '<path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"></path><line x1="16" y1="8" x2="2" y2="22"></line><line x1="17.5" y1="15" x2="9" y2="15"></line>',
  'compass': '<circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>',
  'globe': '<circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>',
  'mountain': '<polygon points="3 20 9 4 15 16 19 10 21 20 3 20"></polygon>',
  'cat': '<path d="M12 5c.67 0 1.35.09 2 .26 1.78-2 5.03-2.84 6.42-2.26 1.4.58-.42 7-.42 7 .57 1.07 1 2.24 1 3.44C21 17.9 16.97 21 12 21s-9-3-9-7.56c0-1.25.5-2.4 1-3.44 0 0-1.89-6.42-.5-7 1.39-.58 4.72.23 6.5 2.26A9.25 9.25 0 0 1 12 5z"></path>',
  'dog': '<path d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.47-4.113 6.006-4 7 .08.703 1.725 1.722 3.656 2 3.199.04 9.034-2.2 9.5-6-.25-1.429-1.997-2.123-3.5-2 1.354-1.048 1.553-3.403-.636-3.979C9.261 1.3 10 5.172 10 5.172z"></path>',
  'bike': '<circle cx="18.5" cy="17.5" r="3.5"></circle><circle cx="5.5" cy="17.5" r="3.5"></circle><circle cx="15" cy="5" r="1"></circle><path d="M12 17.5V14l-3-3 4-3 2 3h2"></path>',
  'coffee': '<path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line>',
  'code': '<polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline>',
  'terminal': '<polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line>',
  'cpu': '<rect x="4" y="4" width="16" height="16" rx="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line>',
  'book': '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>'
};




function generateId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

function applyUiScale() {
    const s = getSettings();
    document.documentElement.style.setProperty('--ui-scale', s.uiScale);
}

async function generateThumbnail(videoUrl, timeSecs = 2) {
    return new Promise((resolve) => {
        const video = document.createElement('video');
        video.crossOrigin = 'anonymous';
        video.muted = true;
        video.playsInline = true;
        video.src = videoUrl;

        video.addEventListener('loadeddata', () => {
            if (video.duration < timeSecs) {
                timeSecs = video.duration / 2;
            }
            video.currentTime = timeSecs;
        });

        video.addEventListener('seeked', () => {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                resolve(dataUrl);
            } catch {
                resolve(null);
            }
        });

        video.addEventListener('error', () => {
            resolve(null);
        });
    });
}
