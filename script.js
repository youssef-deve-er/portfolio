const langBtn = document.getElementById('lang-btn');
const elementsToTranslate = document.querySelectorAll('[data-ar]');
const htmlTag = document.documentElement;
const siteTitle = document.getElementById('site-title');

// اللغة الافتراضية هي العربية
let currentLang = 'ar';

langBtn.addEventListener('click', () => {
    if (currentLang === 'ar') {
        // التحويل إلى الإنجليزية
        currentLang = 'en';
        langBtn.textContent = 'العربية';
        htmlTag.setAttribute('dir', 'ltr');
        htmlTag.setAttribute('lang', 'en');
        
        // تغيير نصوص العناصر والتأكد من عنوان الصفحة
        elementsToTranslate.forEach(el => {
            el.textContent = el.getAttribute('data-en');
        });
        siteTitle.textContent = siteTitle.getAttribute('data-en');
        
    } else {
        // العودة إلى العربية
        currentLang = 'ar';
        langBtn.textContent = 'English';
        htmlTag.setAttribute('dir', 'rtl');
        htmlTag.setAttribute('lang', 'ar');
        
        elementsToTranslate.forEach(el => {
            el.textContent = el.getAttribute('data-ar');
        });
        siteTitle.textContent = siteTitle.getAttribute('data-ar');
    }
});