




export function validatePasswordStrength(password) {
    if (!password) {
        return { valid: false, strength: 0, message: 'Şifre boş olamaz' };
    }

    let strength = 0;
    const issues = [];

    if (password.length < 8) {
        issues.push('en az 8 karakter');
    } else if (password.length >= 8) {
        strength += 25;
    }
    if (password.length >= 12) strength += 10;

    if (!/[A-Z]/.test(password)) {
        issues.push('en az 1 büyük harf');
    } else {
        strength += 25;
    }

    if (!/[a-z]/.test(password)) {
        issues.push('en az 1 küçük harf');
    } else {
        strength += 25;
    }

    if (!/[0-9]/.test(password)) {
        issues.push('en az 1 rakam');
    } else {
        strength += 15;
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        issues.push('en az 1 özel karakter (!@#$%^&*)');
    } else {
        strength += 10;
    }

    // Common password check
    const commonPasswords = [
        '12345678', 'password', 'password123', '123456789', 'qwerty',
        'abc123', '111111', '123123', 'admin', 'letmein', 'welcome',
        'monkey', '1234567890', 'password1', 'qwerty123'
    ];
    if (commonPasswords.includes(password.toLowerCase())) {
        return {
            valid: false,
            strength: 0,
            message: 'Bu şifre çok yaygın kullanılıyor. Daha güçlü bir şifre seçin.'
        };
    }

    const valid = issues.length === 0;
    const message = valid
        ? 'Güçlü şifre'
        : `Şifre şunları içermelidir: ${issues.join(', ')}`;

    return { valid, strength, message };
}

/**
 * Returns password strength label and color
 * @param {number} strength (0-100)
 * @returns {{label: string, color: string}}
 */
export function getPasswordStrengthLabel(strength) {
    if (strength < 40) return { label: 'Zayıf', color: '#ef4444' };
    if (strength < 70) return { label: 'Orta', color: '#f59e0b' };
    if (strength < 90) return { label: 'İyi', color: '#10b981' };
    return { label: 'Güçlü', color: '#059669' };
}

// ──────────────────────────────────────────────────────────────
// USERNAME VALIDATION
// ──────────────────────────────────────────────────────────────

/**
 * Validates username
 * @param {string} username
 * @returns {{valid: boolean, message: string}}
 */
export function validateUsername(username) {
    if (!username || username.trim().length === 0) {
        return { valid: false, message: 'Kullanıcı adı boş olamaz' };
    }

    const trimmed = username.trim();

    // Length check
    if (trimmed.length < 3) {
        return { valid: false, message: 'Kullanıcı adı en az 3 karakter olmalıdır' };
    }
    if (trimmed.length > 20) {
        return { valid: false, message: 'Kullanıcı adı en fazla 20 karakter olabilir' };
    }

    // Character check (alphanumeric, underscore, dash)
    if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
        return {
            valid: false,
            message: 'Kullanıcı adı sadece harf, rakam, tire (-) ve alt çizgi (_) içerebilir'
        };
    }

    // Must start with letter
    if (!/^[a-zA-Z]/.test(trimmed)) {
        return { valid: false, message: 'Kullanıcı adı harf ile başlamalıdır' };
    }

    // Reserved words check
    const reserved = [
        'admin', 'administrator', 'root', 'system', 'moderator', 'mod',
        'support', 'help', 'api', 'www', 'mail', 'ftp', 'null', 'undefined',
        'switch', 'player', 'video', 'official'
    ];
    if (reserved.includes(trimmed.toLowerCase())) {
        return { valid: false, message: 'Bu kullanıcı adı kullanılamaz' };
    }

    // Profanity check (basic Turkish)
    const profanity = ['test1', 'test2']; // Add actual profanity list
    if (profanity.some(word => trimmed.toLowerCase().includes(word))) {
        return { valid: false, message: 'Uygunsuz kelimeler içeremez' };
    }

    return { valid: true, message: 'Kullanıcı adı uygun' };
}

// ──────────────────────────────────────────────────────────────
// EMAIL VALIDATION
// ──────────────────────────────────────────────────────────────

/**
 * Enhanced email validation
 * @param {string} email
 * @returns {{valid: boolean, message: string}}
 */
export function validateEmail(email) {
    if (!email || email.trim().length === 0) {
        return { valid: false, message: 'E-posta adresi boş olamaz' };
    }

    const trimmed = email.trim().toLowerCase();

    // Basic format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
        return { valid: false, message: 'Geçersiz e-posta formatı' };
    }

    // Disposable email check (basic)
    const disposableDomains = [
        'tempmail.com', 'throwaway.email', '10minutemail.com',
        'guerrillamail.com', 'mailinator.com'
    ];
    const domain = trimmed.split('@')[1];
    if (disposableDomains.includes(domain)) {
        return { valid: false, message: 'Geçici e-posta adresleri kullanılamaz' };
    }

    return { valid: true, message: 'E-posta geçerli' };
}

// ──────────────────────────────────────────────────────────────
// RATE LIMITING (Client-side)
// ──────────────────────────────────────────────────────────────

class RateLimiter {
    constructor() {
        this.attempts = new Map();
    }

    /**
     * Check if action is allowed
     * @param {string} key - Unique identifier (e.g., 'login:email@example.com')
     * @param {number} maxAttempts - Maximum attempts allowed
     * @param {number} windowMs - Time window in milliseconds
     * @returns {{allowed: boolean, remainingTime: number}}
     */
    checkLimit(key, maxAttempts = 5, windowMs = 15 * 60 * 1000) {
        const now = Date.now();

        if (!this.attempts.has(key)) {
            this.attempts.set(key, []);
        }

        const attempts = this.attempts.get(key);

        // Remove old attempts outside the window
        const validAttempts = attempts.filter(time => now - time < windowMs);
        this.attempts.set(key, validAttempts);

        if (validAttempts.length >= maxAttempts) {
            const oldestAttempt = Math.min(...validAttempts);
            const remainingTime = windowMs - (now - oldestAttempt);
            return { allowed: false, remainingTime };
        }

        return { allowed: true, remainingTime: 0 };
    }

    /**
     * Record an attempt
     * @param {string} key
     */
    recordAttempt(key) {
        if (!this.attempts.has(key)) {
            this.attempts.set(key, []);
        }
        this.attempts.get(key).push(Date.now());
    }

    /**
     * Clear attempts for a key
     * @param {string} key
     */
    clearAttempts(key) {
        this.attempts.delete(key);
    }

    /**
     * Format remaining time as human-readable string
     * @param {number} ms
     * @returns {string}
     */
    formatRemainingTime(ms) {
        const minutes = Math.ceil(ms / 60000);
        if (minutes < 1) return 'birkaç saniye';
        if (minutes === 1) return '1 dakika';
        return `${minutes} dakika`;
    }
}

export const rateLimiter = new RateLimiter();

// ──────────────────────────────────────────────────────────────
// ERROR MESSAGE SANITIZATION
// ──────────────────────────────────────────────────────────────

/**
 * Sanitizes auth error messages to prevent information leakage
 * @param {string} code - Firebase error code
 * @param {string} context - 'login' | 'register' | 'reset'
 * @returns {string}
 */
export function getSafeAuthErrorMessage(code, context = 'login') {
    // Generic messages to prevent email enumeration
    const genericMessages = {
        login: 'E-posta veya şifre hatalı. Lütfen kontrol edip tekrar deneyin.',
        register: 'Kayıt işlemi başarısız oldu. Lütfen bilgilerinizi kontrol edin.',
        reset: 'İşlem tamamlanamadı. Lütfen tekrar deneyin.'
    };

    switch (code) {
        // Login errors - use generic message
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
            return genericMessages.login;

        // Registration errors
        case 'auth/email-already-in-use':
            return 'Bu e-posta adresi zaten kullanımda.';
        case 'auth/weak-password':
            return 'Şifre çok zayıf. Daha güçlü bir şifre seçin.';

        // Common errors
        case 'auth/invalid-email':
            return 'Geçersiz e-posta adresi.';
        case 'auth/user-disabled':
            return 'Bu hesap devre dışı bırakılmış. Destek ile iletişime geçin.';
        case 'auth/network-request-failed':
            return 'Ağ hatası. İnternet bağlantınızı kontrol edin.';
        case 'auth/too-many-requests':
            return 'Çok fazla deneme yapıldı. Lütfen daha sonra tekrar deneyin.';
        case 'auth/popup-closed-by-user':
            return 'Giriş penceresi kapatıldı.';
        case 'auth/operation-not-allowed':
            return 'Bu işlem şu anda kullanılamıyor.';

        default:
            return genericMessages[context] || 'Bir hata oluştu. Lütfen tekrar deneyin.';
    }
}

// ──────────────────────────────────────────────────────────────
// SESSION MANAGEMENT
// ──────────────────────────────────────────────────────────────

/**
 * Stores login timestamp for session timeout tracking
 */
export function recordLoginTime() {
    localStorage.setItem('svp-last-activity', Date.now().toString());
}

/**
 * Updates last activity timestamp
 */
export function updateActivity() {
    localStorage.setItem('svp-last-activity', Date.now().toString());
}

/**
 * Checks if session has timed out
 * @param {number} timeoutMinutes - Session timeout in minutes (default: 24 hours)
 * @returns {boolean}
 */
export function isSessionExpired(timeoutMinutes = 24 * 60) {
    const lastActivity = localStorage.getItem('svp-last-activity');
    if (!lastActivity) return false;

    const elapsed = Date.now() - parseInt(lastActivity);
    return elapsed > timeoutMinutes * 60 * 1000;
}

/**
 * Clears session data
 */
export function clearSessionData() {
    localStorage.removeItem('svp-last-activity');
}
