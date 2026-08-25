# Katkıda Bulunma Rehberi

Switch Video Player projesine katkıda bulunduğunuz için teşekkürler! 🎉

##

### Kod Standartları

#### JavaScript

- **ES6+ Syntax** — Modern JavaScript özellikleri kullanın
- **Semantic Naming** — Değişken ve fonksiyon isimleri açıklayıcı olmalı
- **JSDoc Comments** — Karmaşık fonksiyonlar için JSDoc yazın

```javascript
/**
 * Calculates sync offset between two video sources
 * @param {number} activeTime - Current playback position in seconds
 * @param {Object} pair - Video pair configuration
 * @returns {number} Adjusted time for background video
 */
function calculateOffset(activeTime, pair) {
    // ...
}
```

#### CSS

- **Design System Değişkenleri** — Renk ve boyutlar için CSS custom properties kullanın
- **BEM Naming** — Block Element Modifier convention
- **Responsive First** — Mobil uyumlu tasarım

```css
.card { }
.card__title { }
.card--featured { }
```

##

### Commit Mesajları

Anlamlı commit mesajları yazın:

```
feat: Add video pair comparison view
fix: Resolve sync offset calculation bug
docs: Update installation instructions
refactor: Extract Firebase auth logic
style: Format code with consistent spacing
```

##

### Hata Raporlama

Hata raporlamak için GitHub Issues kullanın. Şunları ekleyin:

1. **Açıklama** — Kısa ve net problem tanımı
2. **Adımlar** — Problemi yeniden oluşturmak için adımlar
3. **Beklenen Davranış** — Ne olması gerektiği
4. **Gerçek Davranış** — Ne olduğu
5. **Ortam** — Tarayıcı, OS, cihaz bilgileri

##

### Özellik İstekleri

Yeni özellikler için GitHub Discussions kullanın veya PR açın. Özelliklerin:

- Projenin hedefleriyle uyumlu olması
- Kullanıcı ihtiyaçlarını karşılaması
- Mevcut kod tabanına zarar vermemesi

##

### Pull Request Süreci

1. Fork edin ve feature branch oluşturun
2. Değişikliklerinizi test edin
3. Commit message formatına uyun
4. PR açıklamasında değişiklikleri açıklayın
5. Code review bekleyin

##

### Test Etme

Değişikliklerinizi test edin:

```bash
# Geliştirme sunucusu
npm run dev

# Production build
npm run build

# Önizleme
npm run preview
```

##

### Sorular

Soru veya yardım için:
- GitHub Discussions
- GitHub Issues (hata raporları için)

---

Her katkı değerlidir. Teşekkürler! 🙏
