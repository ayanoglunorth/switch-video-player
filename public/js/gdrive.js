



const GDRIVE_PATTERNS = [

    /\/file\/d\/([a-zA-Z0-9_-]{10,})/,

    /[?&]id=([a-zA-Z0-9_-]{10,})/,

    /\/uc\?.*id=([a-zA-Z0-9_-]{10,})/,

    /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]{10,})/,
];

const GDRIVE_LARGE_FILE_THRESHOLD_MB = 100;




function isGDriveUrl(url) {
    if (!url) return false;
    return url.includes('drive.google.com') || url.includes('docs.google.com');
}

function parseGDriveUrl(url) {
    if (!isGDriveUrl(url)) return null;

    for (const pattern of GDRIVE_PATTERNS) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
}

function getDirectUrl(fileId) {

    return `https://drive.google.com/uc?export=download&id=${fileId}&confirm=t`;
}

function getStreamUrl(fileId) {
    return `https://drive.google.com/file/d/${fileId}/preview`;
}

async function resolveCloudUrl(rawUrl) {
    if (isYandexUrl(rawUrl)) {
        const directUrl = await getYandexDirectUrl(rawUrl);
        return {
            fileId: rawUrl,
            directUrl: directUrl || rawUrl,
            isLarge: false,
            warning: directUrl ? null : "Yandex API'den direkt link alınamadı.",
            provider: 'yandex'
        };
    }

    const fileId = parseGDriveUrl(rawUrl);

    if (!fileId) {
        return { fileId: null, directUrl: rawUrl, isLarge: false, warning: null, provider: 'none' };
    }

    return {
        fileId,
        directUrl: getDirectUrl(fileId),
        isLarge: false,
        warning: null,
        provider: 'gdrive'
    };
}



function isYandexUrl(url) {
    if (!url) return false;
    return url.includes('disk.yandex.com') || url.includes('disk.yandex.ru') || url.includes('disk.yandex.tr');
}

async function getYandexDirectUrl(urlStr) {
    try {
        const u = new URL(urlStr);

        const parts = u.pathname.split('/');

        const publicKey = u.origin + '/' + parts[1] + '/' + parts[2];


        let pathParam = '';
        if (parts.length > 3) {
            pathParam = '&path=/' + parts.slice(3).join('/');
        }

        const apiUrl = `https://cloud-api.yandex.net/v1/disk/public/resources/download?public_key=${encodeURIComponent(publicKey)}${pathParam}`;

        const res = await fetch(apiUrl);
        if (!res.ok) return null;

        const data = await res.json();
        return data.href || null;
    } catch (e) {
        console.error('Yandex error:', e);
        return null;
    }
}




function getProxiedUrl(fileId, authToken) {

    const base = '/.netlify/functions/gdrive-proxy';
    const params = new URLSearchParams({ id: fileId });
    if (authToken) params.set('token', authToken);
    return `${base}?${params.toString()}`;
}

async function getDriveFileMetadata(fileId, apiKey) {



    console.warn('[gdrive] getDriveFileMetadata: not yet implemented. Configure API key to enable.');
    return null;
}




function getLargFileWarningMessage() {
    return `⚠️ Google Drive videolar 100 MB üzerindeyse doğrudan oynatma çalışmayabilir.
Bu durumda yakında sunulacak proxy API özelliğini kullanabilirsiniz.`;
}
