



const ALLOWED_VIDEO_EXTENSIONS = [
    'mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv', 'flv', 'wmv', 'm4v', '3gp'
];

const ALLOWED_MIME_TYPES = [
    'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime',
    'video/x-msvideo', 'video/x-matroska', 'video/x-flv',
    'video/x-ms-wmv', 'video/3gpp'
];

const MAX_FILE_SIZE_MB = 2048;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const TRUSTED_DOMAINS = [
    'youtube.com', 'youtu.be', 'vimeo.com', 'dailymotion.com',
    'drive.google.com', 'docs.google.com', 'dropbox.com',
    'disk.yandex.com', 'disk.yandex.ru', 'disk.yandex.tr',
    'onedrive.live.com', 'sharepoint.com', 'box.com',
    'cloudinary.com', 'imgur.com', 'streamable.com'
];




export function validateVideoUrl(url) {
    const warnings = [];

    if (!url || url.trim().length === 0) {
        return { valid: false, message: 'URL boş olamaz', warnings };
    }

    const trimmed = url.trim();

    let parsedUrl;
    try {
        parsedUrl = new URL(trimmed);
    } catch (e) {
        return { valid: false, message: 'Geçersiz URL formatı', warnings };
    }

    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        return {
            valid: false,
            message: 'URL http:// veya https:// ile başlamalıdır',
            warnings
        };
    }

    if (parsedUrl.protocol === 'http:') {
        warnings.push('Güvenlik için HTTPS kullanmanız önerilir');
    }

    const hostname = parsedUrl.hostname.toLowerCase();
    const isTrusted = TRUSTED_DOMAINS.some(domain =>
        hostname === domain || hostname.endsWith('.' + domain)
    );

    if (!isTrusted) {
        warnings.push('Bu domain tanınmıyor. Video oynatılamayabilir.');
    }

    const path = parsedUrl.pathname.toLowerCase();
    const hasVideoExtension = ALLOWED_VIDEO_EXTENSIONS.some(ext =>
        path.endsWith('.' + ext)
    );

    if (path.includes('.') && !hasVideoExtension) {
        const extension = path.split('.').pop();
        warnings.push(`Dosya uzantısı (.${extension}) video formatı olmayabilir`);
    }

    if (trimmed.includes('<script') || trimmed.includes('javascript:')) {
        return {
            valid: false,
            message: 'Güvenlik nedeniyle bu URL kullanılamaz',
            warnings
        };
    }

    return {
        valid: true,
        message: 'URL geçerli',
        warnings
    };
}




export function validateVideoFile(file) {
    const warnings = [];

    if (!file) {
        return { valid: false, message: 'Dosya seçilmedi', warnings };
    }

    if (file.size === 0) {
        return { valid: false, message: 'Dosya boş', warnings };
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
        return {
            valid: false,
            message: `Dosya boyutu ${MAX_FILE_SIZE_MB}MB'dan büyük olamaz (${formatFileSize(file.size)})`,
            warnings
        };
    }

    if (file.size > 500 * 1024 * 1024) {
        warnings.push(`Büyük dosya (${formatFileSize(file.size)}). Yükleme uzun sürebilir.`);
    }

    if (file.type && !ALLOWED_MIME_TYPES.includes(file.type)) {
        warnings.push(`MIME tipi (${file.type}) standart video formatı olmayabilir`);
    }

    const extension = file.name.split('.').pop().toLowerCase();
    if (!ALLOWED_VIDEO_EXTENSIONS.includes(extension)) {
        return {
            valid: false,
            message: `Desteklenmeyen dosya uzantısı: .${extension}`,
            warnings
        };
    }

    if (file.name.length > 255) {
        warnings.push('Dosya adı çok uzun');
    }

    if (/[<>:"|?*]/.test(file.name)) {
        warnings.push('Dosya adında geçersiz karakterler var');
    }

    return {
        valid: true,
        message: 'Dosya geçerli',
        warnings
    };
}

// ──────────────────────────────────────────────────────────────
// CONTENT VALIDATION (Advanced)
// ──────────────────────────────────────────────────────────────

/**
 * Attempts to validate video content by loading metadata
 * @param {string} videoUrl - URL or blob URL
 * @returns {Promise<{valid: boolean, message: string, metadata: object}>}
 */
export async function validateVideoContent(videoUrl) {
    return new Promise((resolve) => {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.muted = true;
        video.playsInline = true;

        const timeout = setTimeout(() => {
            cleanup();
            resolve({
                valid: false,
                message: 'Video metadata yüklenemedi (timeout)',
                metadata: null
            });
        }, 10000); // 10 second timeout

        const cleanup = () => {
            clearTimeout(timeout);
            video.removeEventListener('loadedmetadata', onLoaded);
            video.removeEventListener('error', onError);
            video.src = '';
        };

        const onLoaded = () => {
            cleanup();

            const metadata = {
                duration: video.duration,
                width: video.videoWidth,
                height: video.videoHeight,
                hasAudio: video.mozHasAudio || Boolean(video.webkitAudioDecodedByteCount) ||
                         Boolean(video.audioTracks && video.audioTracks.length)
            };

            // Validate metadata
            if (video.duration === 0 || isNaN(video.duration)) {
                resolve({
                    valid: false,
                    message: 'Video süresi algılanamadı',
                    metadata
                });
                return;
            }

            if (video.videoWidth === 0 || video.videoHeight === 0) {
                resolve({
                    valid: false,
                    message: 'Video boyutları algılanamadı',
                    metadata
                });
                return;
            }

            resolve({
                valid: true,
                message: 'Video içeriği geçerli',
                metadata
            });
        };

        const onError = (e) => {
            cleanup();
            const errorMessage = video.error ?
                getVideoErrorMessage(video.error.code) :
                'Video yüklenemedi';

            resolve({
                valid: false,
                message: errorMessage,
                metadata: null
            });
        };

        video.addEventListener('loadedmetadata', onLoaded);
        video.addEventListener('error', onError);

        video.src = videoUrl;
    });
}

/**
 * Get user-friendly error message from video error code
 * @param {number} errorCode
 * @returns {string}
 */
function getVideoErrorMessage(errorCode) {
    switch (errorCode) {
        case 1: // MEDIA_ERR_ABORTED
            return 'Video yükleme iptal edildi';
        case 2: // MEDIA_ERR_NETWORK
            return 'Ağ hatası nedeniyle video yüklenemedi';
        case 3: // MEDIA_ERR_DECODE
            return 'Video formatı desteklenmiyor veya bozuk';
        case 4: // MEDIA_ERR_SRC_NOT_SUPPORTED
            return 'Video kaynağı desteklenmiyor veya erişilemiyor';
        default:
            return 'Bilinmeyen video hatası';
    }
}

// ──────────────────────────────────────────────────────────────
// UTILITY FUNCTIONS
// ──────────────────────────────────────────────────────────────

/**
 * Formats file size to human-readable string
 * @param {number} bytes
 * @returns {string}
 */
export function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Formats video duration to human-readable string
 * @param {number} seconds
 * @returns {string}
 */
export function formatDuration(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Sanitizes filename for safe display
 * @param {string} filename
 * @returns {string}
 */
export function sanitizeFilename(filename) {
    return filename
        .replace(/[<>:"|?*]/g, '_')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 255);
}

export function isCloudStorageUrl(url) {
    try {
        const hostname = new URL(url).hostname.toLowerCase();
        const cloudProviders = [
            'drive.google.com', 'docs.google.com',
            'disk.yandex', 'dropbox.com', 'onedrive.live.com'
        ];
        return cloudProviders.some(provider => hostname.includes(provider));
    } catch {
        return false;
    }
}
