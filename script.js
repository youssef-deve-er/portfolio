document.addEventListener("DOMContentLoaded", () => {
    // ==========================================================================
    // 1. ميزة تبديل المظهر الليلي والنهاري (Dark/Light Mode)
    // ==========================================================================
    const themeToggleBtn = document.getElementById("theme-toggle");
    const themeIcon = document.getElementById("theme-icon");
    
    // التحقق من وجود خيار مستخدم سابق في المتصفح، وإلا الاعتماد على الوضع الداكن كافتراضي
    const savedTheme = localStorage.getItem("theme") || "dark";
    document.documentElement.setAttribute("data-theme", savedTheme);
    updateThemeIcon(savedTheme);

    themeToggleBtn.addEventListener("click", () => {
        const currentTheme = document.documentElement.getAttribute("data-theme");
        const newTheme = currentTheme === "dark" ? "light" : "dark";
        
        document.documentElement.setAttribute("data-theme", newTheme);
        localStorage.setItem("theme", newTheme); // حفظ الخيار للمرة القادمة
        updateThemeIcon(newTheme);
    });

    function updateThemeIcon(theme) {
        themeIcon.textContent = theme === "dark" ? "🌙" : "☀️";
    }

    // ==========================================================================
    // 2. ميزة العداد المتحرك للإحصائيات (Animated Counter)
    // ==========================================================================
    const statsSection = document.querySelector(".stats-section");
    const statNumbers = document.querySelectorAll(".stat-number");
    let animated = false; // لمنع إعادة الحركة المرة تلو الأخرى

    const startCounting = () => {
        statNumbers.forEach(stat => {
            const target = +stat.getAttribute("data-target");
            const speed = 100; // سرعة الحركة كلما قل الرقم زادت السرعة
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

    // مراقبة الصفحة: تشغيل العداد فقط عندما يمر الزائر فوق قسم الإحصائيات
    const observerOptions = { threshold: 0.5 };
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !animated) {
                startCounting();
                animated = true; // تم التنفيذ بنجاح
            }
        });
    }, observerOptions);

    if (statsSection) statsObserver.observe(statsSection);

    // ==========================================================================
    // 3. ميزة التحقق التفاعلي من صندوق الرسائل (Form Validation)
    // ==========================================================================
    const contactForm = document.getElementById("contact-form");
    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const messageInput = document.getElementById("message");
    const formStatus = document.getElementById("form-status");

    contactForm.addEventListener("submit", (e) => {
        e.preventDefault(); // منع الصفحة من إعادة التحميل الافتراضية
        
        let isValid = true;
        const currentLang = document.documentElement.getAttribute("lang") || "ar";

        // نصوص الأخطاء حسب اللغة الحالية للموقع
        const messages = {
            ar: {
                nameErr: "يرجى كتابة الاسم الكامل.",
                emailErr: "يرجى إدخال بريد إلكتروني صحيح.",
                msgErr: "يرجى كتابة تفاصيل رسالتك.",
                success: "🎉 تم إرسال رسالتك بنجاح! سأتواصل معك قريباً."
            },
            en: {
                nameErr: "Please enter your full name.",
                emailErr: "Please enter a valid email address.",
                msgErr: "Please enter your message details.",
                success: "🎉 Message sent successfully! I will contact you soon."
            }
        };

        const langMsgs = messages[currentLang];

        // 1. التحقق من الاسم
        if (nameInput.value.trim() === "") {
            document.getElementById("name-error").textContent = langMsgs.nameErr;
            isValid = false;
        } else {
            document.getElementById("name-error").textContent = "";
        }

        // 2. التحقق من البريد الإلكتروني
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailInput.value.trim())) {
            document.getElementById("email-error").textContent = langMsgs.emailErr;
            isValid = false;
        } else {
            document.getElementById("email-error").textContent = "";
        }

        // 3. التحقق من نص الرسالة
        if (messageInput.value.trim() === "") {
            document.getElementById("message-error").textContent = langMsgs.msgErr;
            isValid = false;
        } else {
            document.getElementById("message-error").textContent = "";
        }

        // إذا كانت كل الحقول سليمة، أظهر رسالة النجاح
        if (isValid) {
            formStatus.textContent = langMsgs.success;
            formStatus.className = "status-success";
            contactForm.reset(); // تفريغ الخانات بعد النجاح
            
            // إخفاء رسالة النجاح بعد 5 ثوانٍ تلقائياً
            setTimeout(() => { formStatus.textContent = ""; }, 5000);
        }
    });

    // ==========================================================================
    // 4. ميزة تبديل اللغة الخاصة بك (تحديث مدمج يدعم الميزات الجديدة)
    // ==========================================================================
    const langToggleBtn = document.getElementById("lang-toggle");
    
    langToggleBtn.addEventListener("click", () => {
        const currentLang = document.documentElement.getAttribute("lang");
        const newLang = currentLang === "ar" ? "en" : "ar";
        
        // تبديل السمات الأساسية للغة والاتجاه
        document.documentElement.setAttribute("lang", newLang);
        document.documentElement.setAttribute("dir", newLang === "ar" ? "rtl" : "ltr");
        langToggleBtn.textContent = newLang === "ar" ? "EN" : "AR";

        // تبديل نصوص العناصر التي تحمل سمات data-ar و data-en
        const translatableElements = document.querySelectorAll("[data-ar][data-en]");
        translatableElements.forEach(el => {
            el.textContent = el.getAttribute(`data-${newLang}`);
        });

        // تحديث الـ Placeholder لحقول الإدخال والـ Textarea عند تغيير اللغة
        const placeholders = {
            ar: { name: "الاسم الكامل", email: "البريد الإلكتروني", message: "تفاصيل مشروعك..." },
            en: { name: "Full Name", email: "Email Address", message: "Project details..." }
        };
        
        // مسح أي رسائل خطأ ظاهرة عند تحويل اللغة لتجنب التداخل
        document.querySelectorAll(".error-message").forEach(el => el.textContent = "");
        formStatus.textContent = "";
    });
});
