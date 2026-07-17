document.addEventListener("DOMContentLoaded", () => {
    
    // 1. ميزة تبديل المظهر الليلي والنهاري (Dark/Light Mode)
    const themeToggleBtn = document.getElementById("theme-toggle");
    const themeIcon = document.getElementById("theme-icon");
    const savedTheme = localStorage.getItem("theme") || "dark";
    
    document.documentElement.setAttribute("data-theme", savedTheme);
    updateThemeIcon(savedTheme);

    themeToggleBtn.addEventListener("click", () => {
        const currentTheme = document.documentElement.getAttribute("data-theme");
        const newTheme = currentTheme === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", newTheme);
        localStorage.setItem("theme", newTheme);
        updateThemeIcon(newTheme);
    });

    function updateThemeIcon(theme) {
        themeIcon.textContent = theme === "dark" ? "🌙" : "☀️";
    }

    // 2. ميزة العداد المتحرك للإحصائيات (Animated Counter)
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

    const observerOptions = { threshold: 0.5 };
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !animated) {
                startCounting();
                animated = true;
            }
        });
    }, observerOptions);

    if (statsSection) statsObserver.observe(statsSection);

    // 3. ميزة التحقق التفاعلي من صندوق الرسائل والإرسال الحقيقي (Form Validation & AJAX Submit)
    const contactForm = document.getElementById("contact-form");
    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("email");
    const messageInput = document.getElementById("message");
    const formStatus = document.getElementById("form-status");

    if (contactForm) {
        contactForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            let isValid = true;
            const currentLang = document.documentElement.getAttribute("lang") || "ar";
            
            const messages = {
                ar: {
                    nameErr: ". يرجى كتابة الاسم الكامل",
                    emailErr: ". يرجى إدخال بريد إلكتروني صحيح",
                    msgErr: ". يرجى كتابة تفاصيل رسالتك",
                    sending: "... جاري إرسال الرسالة الآن",
                    success: ". تم إرسال رسالتك بنجاح! سأتواصل معك قريباً",
                    error: "❌ حدث خطأ أثناء الإرسال، يرجى المحاولة لاحقاً."
                },
                en: {
                    nameErr: "Please enter your full name.",
                    emailErr: "Please enter a valid email address.",
                    msgErr: "Please enter your message details.",
                    sending: "Sending message...",
                    success: "Message sent successfully! I will contact you soon.",
                    error: "❌ Something went wrong, please try again later."
                }
            };

            const langMsgs = messages[currentLang];

            // التحقق من الاسم
            if (nameInput.value.trim() === "") {
                document.getElementById("name-error").textContent = langMsgs.nameErr;
                isValid = false;
            } else {
                document.getElementById("name-error").textContent = "";
            }

            // التحقق من البريد الإلكتروني
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(emailInput.value.trim())) {
                document.getElementById("email-error").textContent = langMsgs.emailErr;
                isValid = false;
            } else {
                document.getElementById("email-error").textContent = "";
            }

            // التحقق من محتوى الرسالة
            if (messageInput.value.trim() === "") {
                document.getElementById("message-error").textContent = langMsgs.msgErr;
                isValid = false;
            } else {
                document.getElementById("message-error").textContent = "";
            }

            // إرسال البيانات فوراً إلى Formspree عبر AJAX عند صحة المدخلات
            if (isValid) {
                formStatus.textContent = langMsgs.sending;
                formStatus.className = "status-success";

                const formData = new FormData(contactForm);

                try {
                    const response = await fetch(contactForm.action, {
                        method: contactForm.method,
                        body: formData,
                        headers: {
                            'Accept': 'application/json'
                        }
                    });

                    if (response.ok) {
                        formStatus.textContent = langMsgs.success;
                        formStatus.className = "status-success";
                        contactForm.reset();
                    } else {
                        formStatus.textContent = langMsgs.error;
                        formStatus.className = "status-error";
                    }
                } catch (error) {
                    formStatus.textContent = langMsgs.error;
                    formStatus.className = "status-error";
                }

                setTimeout(() => { formStatus.textContent = ""; }, 5000);
            }
        });
    }

    // 4. ميزة تبديل اللغة المدمجة (Dual-Language Support)
    const langToggleBtn = document.getElementById("lang-toggle");
    
    if (langToggleBtn) {
        langToggleBtn.addEventListener("click", () => {
            const currentLang = document.documentElement.getAttribute("lang");
            const newLang = currentLang === "ar" ? "en" : "ar";
            
            document.documentElement.setAttribute("lang", newLang);
            document.documentElement.setAttribute("dir", newLang === "ar" ? "rtl" : "ltr");
            langToggleBtn.textContent = newLang === "ar" ? "EN" : "AR";

            const translatableElements = document.querySelectorAll("[data-ar][data-en]");
            translatableElements.forEach(el => {
                el.textContent = el.getAttribute(`data-${newLang}`);
            });

            document.querySelectorAll(".error-message").forEach(el => el.textContent = "");
            if (formStatus) formStatus.textContent = "";
        });
    }
});
