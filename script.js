document.addEventListener("DOMContentLoaded", () => {
    
    // 1. تبديل الوضع (Dark / Light)
    const themeToggleBtn = document.getElementById("theme-toggle");
    const themeIcon = document.getElementById("theme-icon");
    const savedTheme = localStorage.getItem("theme") || "dark";
    
    document.documentElement.setAttribute("data-theme", savedTheme);
    if (themeIcon) themeIcon.textContent = savedTheme === "dark" ? "🌙" : "☀️";

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener("click", () => {
            const currentTheme = document.documentElement.getAttribute("data-theme");
            const newTheme = currentTheme === "dark" ? "light" : "dark";
            document.documentElement.setAttribute("data-theme", newTheme);
            localStorage.setItem("theme", newTheme);
            if (themeIcon) themeIcon.textContent = newTheme === "dark" ? "🌙" : "☀️";
        });
    }

    // 2. العداد المتحرك للإحصائيات
    const statsSection = document.querySelector(".stats-section");
    const statNumbers = document.querySelectorAll(".stat-number");
    let animated = false;

    const startCounting = () => {
        statNumbers.forEach(stat => {
            const target = +stat.getAttribute("data-target");
            const speed = 100;
            const increment = target / speed;

            const updateCount = () => {
                const current = +stat.innerText;
                if (current < target) {
                    stat.innerText = Math.ceil(current + increment);
                    setTimeout(updateCount, 15);
                } else {
                    stat.innerText = target;
                }
            };
            updateCount();
        });
    };

    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !animated) {
                startCounting();
                animated = true;
            }
        });
    }, { threshold: 0.5 });

    if (statsSection) statsObserver.observe(statsSection);

    // 3. التحقق من نموذج التواصل
    const contactForm = document.getElementById("contact-form");
    const formStatus = document.getElementById("form-status");

    if (contactForm) {
        contactForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const currentLang = document.documentElement.getAttribute("lang") || "ar";
            
            const messages = {
                ar: { success: "تم إرسال الرسالة بنجاح!", error: "حدث خطأ أثناء الإرسال." },
                en: { success: "Message sent successfully!", error: "Something went wrong." }
            };

            const formData = new FormData(contactForm);

            try {
                const response = await fetch(contactForm.action, {
                    method: contactForm.method,
                    body: formData,
                    headers: { 'Accept': 'application/json' }
                });

                if (response.ok) {
                    formStatus.textContent = messages[currentLang].success;
                    formStatus.style.color = "#38bdf8";
                    contactForm.reset();
                } else {
                    formStatus.textContent = messages[currentLang].error;
                    formStatus.style.color = "#ef4444";
                }
            } catch (error) {
                formStatus.textContent = messages[currentLang].error;
                formStatus.style.color = "#ef4444";
            }
        });
    }

    // 4. نظام الترجمة المزدوج وتعديل اتجاه الصفحة (RTL / LTR)
    const langToggleBtn = document.getElementById("lang-toggle");
    
    if (langToggleBtn) {
        langToggleBtn.addEventListener("click", () => {
            const currentLang = document.documentElement.getAttribute("lang");
            const newLang = currentLang === "ar" ? "en" : "ar";
            
            document.documentElement.setAttribute("lang", newLang);
            document.documentElement.setAttribute("dir", newLang === "ar" ? "rtl" : "ltr");
            langToggleBtn.textContent = newLang === "ar" ? "EN" : "AR";

            // ترجمة جميع العناصر التي تحتوي على خصائص data-ar و data-en
            const translatableElements = document.querySelectorAll("[data-ar][data-en]");
            translatableElements.forEach(el => {
                el.textContent = el.getAttribute(`data-${newLang}`);
            });
        });
    }
});