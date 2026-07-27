/* ==========================================================================
   script.js — المرحلة الثالثة
   1. الثيم (مع أيقونة تعرض الوجهة لا الحالة)
   2. العدّادات بـ requestAnimationFrame (مدة موحّدة + احترام تقليل الحركة)
   3. نظام اللغة المحفوظ في localStorage (+ تحديث ARIA والميتا)
   4. تحقق النموذج + حالة تحميل زر الإرسال + إعلانات ARIA الحية
   5. زر العودة للأعلى
   6. سنة حقوق النشر
   7. شريط التنقل (قائمة الجوال + تمييز القسم النشط)
   8. شريط تقدّم القراءة
   ========================================================================== */

const init = () => {

    const html = document.documentElement;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    /* ======================================================================
       1. تبديل الوضع (Dark / Light)
       الأيقونة تعرض الوجهة (ما سيحدث عند الضغط) لا الحالة الحالية.
       الثيم نفسه مُطبَّق مسبقاً بالسكربت المضمّن في <head> لمنع الوميض (FOUC).
       ====================================================================== */
    const themeToggleBtn = document.getElementById("theme-toggle");
    const themeIcon = document.getElementById("theme-icon");

    const THEME_LABELS = {
        ar: { toDark: "التبديل إلى الوضع الليلي", toLight: "التبديل إلى الوضع النهاري" },
        en: { toDark: "Switch to dark mode", toLight: "Switch to light mode" }
    };

    const applyTheme = (theme) => {
        html.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);

        // اعرض ما سيحدث عند الضغط: في الليل نعرض الشمس، وفي النهار نعرض القمر
        if (themeIcon) themeIcon.textContent = theme === "dark" ? "☀️" : "🌙";

        if (themeToggleBtn) {
            const lang = html.getAttribute("lang") === "en" ? "en" : "ar";
            const labels = THEME_LABELS[lang];
            themeToggleBtn.setAttribute("aria-label", theme === "dark" ? labels.toLight : labels.toDark);
            // زر ثنائي الحالة: يُعلن لقارئ الشاشة ما إذا كان الوضع الليلي مفعّلاً
            themeToggleBtn.setAttribute("aria-pressed", String(theme === "dark"));
        }
    };

    applyTheme(html.getAttribute("data-theme") || localStorage.getItem("theme") || "dark");

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener("click", () => {
            applyTheme(html.getAttribute("data-theme") === "dark" ? "light" : "dark");
        });
    }

    /* ======================================================================
       2. العدّاد المتحرك للإحصائيات + أشرطة تقدم المهارات (المرحلة ب - البند 1)
       المشكلة السابقة: `target / 100` مع `Math.ceil` جعل كل عدّاد ينتهي في
       وقت مختلف (8 ينتهي في 120ms بينما 200 يستغرق 1500ms).
       الحل: مدة موحّدة (1500ms) مع requestAnimationFrame و easing.
       أعيد استخدام نفس منطق الـ rAF لتحريك شرائط المهارات حتى لا نزدوج الكود.
       ====================================================================== */
    const statsSection = document.querySelector(".stats-section");
    const statNumbers = document.querySelectorAll(".stat-number");
    const skillsSection = document.querySelector(".skills-section");
    const skillBars = document.querySelectorAll(".skill-bar");
    const COUNTER_DURATION = 1500;
    let animated = false;
    let skillsAnimated = false;

    const startCounting = () => {
        statNumbers.forEach(stat => {
            const target = Number(stat.getAttribute("data-target")) || 0;

            // من يفضّل تقليل الحركة يرى القيمة النهائية فوراً بلا أي عدّ
            if (prefersReducedMotion.matches) {
                stat.textContent = String(target);
                return;
            }

            const startTime = performance.now();
            const tick = (now) => {
                const progress = Math.min((now - startTime) / COUNTER_DURATION, 1);
                const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
                stat.textContent = String(Math.round(target * eased));
                if (progress < 1) {
                    requestAnimationFrame(tick);
                } else {
                    stat.textContent = String(target); // ضمان الرقم الدقيق في النهاية
                }
            };
            requestAnimationFrame(tick);
        });
    };

    /* تحريك أشرطة المهارات: عرض النسبة الرقمية + ملء الشريط معاً بنفس الإيقاع.
       كل بطاقة (.skill-card) تشترك في شريطها ومستوى النسبة حتى نحدّثهما دفعةً واحدة. */
    const animateSkillBars = () => {
        skillBars.forEach(bar => {
            const target = Number(bar.getAttribute("data-target")) || 0;
            const card = bar.closest(".skill-card");
            const levelText = card ? card.querySelector("[data-skill-level]") : null;
            const fill = bar.querySelector(".skill-bar-fill");

            // من يفضّل تقليل الحركة: اضبط القيم النهائية فوراً بلا أي حركة
            if (prefersReducedMotion.matches) {
                if (fill) fill.style.width = `${target}%`;
                if (levelText) levelText.textContent = `${target}%`;
                bar.setAttribute("aria-valuenow", String(target));
                return;
            }

            const startTime = performance.now();
            const tick = (now) => {
                const progress = Math.min((now - startTime) / COUNTER_DURATION, 1);
                const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic يطابق العدّاد
                const value = Math.round(target * eased);
                if (fill) fill.style.width = `${value}%`;
                if (levelText) levelText.textContent = `${value}%`;
                bar.setAttribute("aria-valuenow", String(value));
                if (progress < 1) {
                    requestAnimationFrame(tick);
                } else {
                    // ضمان القيم النهائية الدقيقة
                    if (fill) fill.style.width = `${target}%`;
                    if (levelText) levelText.textContent = `${target}%`;
                    bar.setAttribute("aria-valuenow", String(target));
                }
            };
            requestAnimationFrame(tick);
        });
    };

    if (statsSection && statNumbers.length) {
        if (!("IntersectionObserver" in window)) {
            startCounting();
        } else {
            const statsObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !animated) {
                        animated = true;
                        startCounting();
                        observer.disconnect(); // لا حاجة للمراقبة بعد التشغيل
                    }
                });
            }, { threshold: 0.5 });

            statsObserver.observe(statsSection);
        }
    }

    if (skillsSection && skillBars.length) {
        if (!("IntersectionObserver" in window)) {
            animateSkillBars();
        } else {
            const skillsObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !skillsAnimated) {
                        skillsAnimated = true;
                        animateSkillBars();
                        observer.disconnect(); // مرة واحدة فقط: لا إعادة تدوير مزعجة
                    }
                });
            }, { threshold: 0.25 });

            skillsObserver.observe(skillsSection);
        }
    }

    /* ======================================================================
       3. نظام الترجمة (RTL / LTR) مع الحفظ في localStorage
       ====================================================================== */
    const langToggleBtn = document.getElementById("lang-toggle");
    const metaDescription = document.querySelector('meta[name="description"]');
    const pageTitle = document.querySelector("title");

    const LANG_LABELS = {
        ar: "التبديل إلى الإنجليزية / Switch to English",
        en: "Switch to Arabic / التبديل إلى العربية"
    };

    const getLang = () => (html.getAttribute("lang") === "en" ? "en" : "ar");

    const applyLang = (lang) => {
        const safeLang = lang === "en" ? "en" : "ar";

        html.setAttribute("lang", safeLang);
        html.setAttribute("dir", safeLang === "ar" ? "rtl" : "ltr");
        localStorage.setItem("lang", safeLang);

        // النصوص المرئية
        document.querySelectorAll("[data-ar][data-en]").forEach(el => {
            const value = el.getAttribute(`data-${safeLang}`);
            if (value !== null) el.textContent = value;
        });

        // سمات ARIA وaria-label القابلة للترجمة
        document.querySelectorAll("[data-ar-label][data-en-label]").forEach(el => {
            const value = el.getAttribute(`data-${safeLang}-label`);
            if (value !== null) el.setAttribute("aria-label", value);
        });

        // عنوان الصفحة ووصفها (لم يكونا يُترجمان سابقاً)
        if (pageTitle) {
            const t = pageTitle.getAttribute(`data-${safeLang}`);
            if (t) document.title = t;
        }
        if (metaDescription) {
            const d = metaDescription.getAttribute(`data-${safeLang}`);
            if (d) metaDescription.setAttribute("content", d);
        }

        if (langToggleBtn) {
            langToggleBtn.textContent = safeLang === "ar" ? "EN" : "AR";
            langToggleBtn.setAttribute("aria-label", LANG_LABELS[safeLang]);
        }

        // أعد ضبط تسمية زر الثيم باللغة الجديدة
        applyThemeLabelOnly();
    };

    const applyThemeLabelOnly = () => {
        if (!themeToggleBtn) return;
        const theme = html.getAttribute("data-theme") === "light" ? "light" : "dark";
        const labels = THEME_LABELS[getLang()];
        themeToggleBtn.setAttribute("aria-label", theme === "dark" ? labels.toLight : labels.toDark);
    };

    // اللغة الأولية مُطبَّقة على <html> بالسكربت المضمّن؛ نكمل هنا ترجمة المحتوى
    applyLang(html.getAttribute("lang") || localStorage.getItem("lang") || "ar");

    if (langToggleBtn) {
        langToggleBtn.addEventListener("click", () => {
            applyLang(getLang() === "ar" ? "en" : "ar");
        });
    }

    /* ======================================================================
       4. نموذج التواصل: تحقق + حالة تحميل + إعلانات ARIA
       ====================================================================== */
    const contactForm = document.getElementById("contact-form");
    const formStatus = document.getElementById("form-status");
    const submitBtn = document.getElementById("submit-btn");
    const btnText = document.getElementById("btn-text");

    const FORM_TEXT = {
        ar: {
            required: "هذا الحقل مطلوب",
            invalidEmail: "بريد إلكتروني غير صالح",
            shortMessage: "الرسالة قصيرة جداً (10 أحرف على الأقل)",
            sending: "جاري الإرسال...",
            success: "تم إرسال الرسالة بنجاح!",
            error: "حدث خطأ أثناء الإرسال. حاول مرة أخرى."
        },
        en: {
            required: "This field is required",
            invalidEmail: "Invalid email address",
            shortMessage: "Message is too short (10 characters minimum)",
            sending: "Sending...",
            success: "Message sent successfully!",
            error: "Something went wrong. Please try again."
        }
    };

    const setFieldError = (id, message) => {
        const field = document.getElementById(id);
        const errorEl = document.getElementById(`${id}-error`);
        const group = field ? field.closest(".form-group") : null;

        if (errorEl) errorEl.textContent = message || "";
        if (group) group.classList.toggle("has-error", Boolean(message));
        if (field) field.setAttribute("aria-invalid", message ? "true" : "false");
    };

    const validateForm = (lang) => {
        const t = FORM_TEXT[lang];
        let firstInvalid = null;

        ["name", "email", "message"].forEach(id => setFieldError(id, ""));

        const name = (document.getElementById("name")?.value || "").trim();
        const email = (document.getElementById("email")?.value || "").trim();
        const message = (document.getElementById("message")?.value || "").trim();

        if (!name) {
            setFieldError("name", t.required);
            firstInvalid = firstInvalid || "name";
        }

        if (!email) {
            setFieldError("email", t.required);
            firstInvalid = firstInvalid || "email";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setFieldError("email", t.invalidEmail);
            firstInvalid = firstInvalid || "email";
        }

        if (!message) {
            setFieldError("message", t.required);
            firstInvalid = firstInvalid || "message";
        } else if (message.length < 10) {
            setFieldError("message", t.shortMessage);
            firstInvalid = firstInvalid || "message";
        }

        // انقل التركيز إلى أول حقل خاطئ — مهم لمستخدمي الكيبورد وقارئات الشاشة
        if (firstInvalid) document.getElementById(firstInvalid)?.focus();

        return !firstInvalid;
    };

    const setStatus = (message, type) => {
        if (!formStatus) return;
        formStatus.textContent = message;
        formStatus.classList.remove("is-success", "is-error");
        if (type) formStatus.classList.add(`is-${type}`);
    };

    if (contactForm) {
        // امسح رسالة الخطأ فور بدء المستخدم في تصحيح الحقل
        ["name", "email", "message"].forEach(id => {
            document.getElementById(id)?.addEventListener("input", () => setFieldError(id, ""));
        });

        contactForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const lang = getLang();
            const t = FORM_TEXT[lang];

            setStatus("", null);
            if (!validateForm(lang)) return;

            const originalBtnText = btnText ? btnText.textContent : "";
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.setAttribute("aria-busy", "true");
            }
            if (btnText) btnText.textContent = t.sending;

            try {
                const response = await fetch(contactForm.action, {
                    method: contactForm.method || "POST",
                    body: new FormData(contactForm),
                    headers: { "Accept": "application/json" }
                });

                if (response.ok) {
                    setStatus(t.success, "success");
                    contactForm.reset();
                    ["name", "email", "message"].forEach(id => setFieldError(id, ""));
                } else {
                    setStatus(t.error, "error");
                }
            } catch (error) {
                setStatus(t.error, "error");
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.removeAttribute("aria-busy");
                }
                if (btnText) btnText.textContent = originalBtnText;
            }
        });
    }

    /* ======================================================================
       5. زر العودة للأعلى
       ====================================================================== */
    const backToTopBtn = document.getElementById("back-to-top");

    if (backToTopBtn) {
        const toggleBackToTop = () => {
            backToTopBtn.classList.toggle("is-visible", window.scrollY > 400);
        };

        toggleBackToTop();
        window.addEventListener("scroll", toggleBackToTop, { passive: true });

        backToTopBtn.addEventListener("click", () => {
            window.scrollTo({
                top: 0,
                behavior: prefersReducedMotion.matches ? "auto" : "smooth"
            });
            // أعد التركيز إلى بداية الصفحة لمستخدمي الكيبورد
            document.getElementById("main-content")?.focus();
        });
    }

    /* ======================================================================
       6. سنة حقوق النشر في التذييل (تتحدث تلقائياً)
       ====================================================================== */
    const yearEl = document.getElementById("current-year");
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());

    /* ======================================================================
       7. شريط التنقل: قائمة الجوال + تمييز القسم النشط
       ====================================================================== */
    const primaryNav = document.getElementById("primary-nav");
    const navToggle = document.getElementById("nav-toggle");
    const navLinks = Array.from(document.querySelectorAll(".nav-link"));

    const NAV_LABELS = {
        ar: { open: "فتح قائمة التنقل", close: "إغلاق قائمة التنقل" },
        en: { open: "Open navigation menu", close: "Close navigation menu" }
    };

    const MOBILE_NAV_QUERY = window.matchMedia("(max-width: 900px)");

    if (primaryNav && navToggle) {
        const setNavOpen = (open) => {
            primaryNav.classList.toggle("is-open", open);
            navToggle.setAttribute("aria-expanded", String(open));

            // حدّث التسمية لتصف الإجراء التالي، وخزّنها بلغتين ليتولاها مبدّل اللغة
            const labels = NAV_LABELS[getLang()];
            const label = open ? labels.close : labels.open;
            navToggle.setAttribute("aria-label", label);
            navToggle.setAttribute("data-ar-label", open ? NAV_LABELS.ar.close : NAV_LABELS.ar.open);
            navToggle.setAttribute("data-en-label", open ? NAV_LABELS.en.close : NAV_LABELS.en.open);
        };

        navToggle.addEventListener("click", () => {
            setNavOpen(navToggle.getAttribute("aria-expanded") !== "true");
        });

        // أغلق القائمة بعد اختيار وجهة
        navLinks.forEach(link => {
            link.addEventListener("click", () => {
                if (MOBILE_NAV_QUERY.matches) setNavOpen(false);
            });
        });

        // Escape يغلق القائمة ويعيد التركيز إلى الزر
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && navToggle.getAttribute("aria-expanded") === "true") {
                setNavOpen(false);
                navToggle.focus();
            }
        });

        // نقرة خارج الهيدر تغلق القائمة
        document.addEventListener("click", (e) => {
            if (navToggle.getAttribute("aria-expanded") !== "true") return;
            if (!e.target.closest("header")) setNavOpen(false);
        });

        // العودة إلى سطح المكتب: أزل حالة الفتح حتى لا تبقى عالقة
        MOBILE_NAV_QUERY.addEventListener("change", (e) => {
            if (!e.matches) setNavOpen(false);
        });
    }

    /* تمييز القسم الظاهر حالياً في شريط التنقل.
       نراقب الأقسام المرتبطة فقط، ونختار الأعلى ظهوراً في نافذة العرض. */
    if (navLinks.length && "IntersectionObserver" in window) {
        const sectionsMap = new Map();

        navLinks.forEach(link => {
            const id = link.getAttribute("href");
            if (!id || !id.startsWith("#")) return;
            const section = document.querySelector(id);
            if (section) sectionsMap.set(section, link);
        });

        if (sectionsMap.size) {
            const visible = new Set();

            const setActive = (activeLink) => {
                navLinks.forEach(link => {
                    const isActive = link === activeLink;
                    link.classList.toggle("is-active", isActive);
                    // aria-current يُعلن القسم الحالي لقارئات الشاشة
                    if (isActive) {
                        link.setAttribute("aria-current", "true");
                    } else {
                        link.removeAttribute("aria-current");
                    }
                });
            };

            const navObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        visible.add(entry.target);
                    } else {
                        visible.delete(entry.target);
                    }
                });

                if (!visible.size) return;

                // الأقرب إلى أعلى الصفحة هو القسم الذي يقرأه الزائر
                const topMost = Array.from(visible).sort(
                    (a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top
                )[0];

                setActive(sectionsMap.get(topMost));
            }, {
                // الهيدر يغطي ~80px من الأعلى؛ نستبعده من منطقة الرصد
                rootMargin: "-80px 0px -55% 0px",
                threshold: 0
            });

            sectionsMap.forEach((_link, section) => navObserver.observe(section));
        }
    }

    /* ======================================================================
       8. شريط تقدّم القراءة
       ====================================================================== */
    const progressBar = document.getElementById("reading-progress-bar");

    if (progressBar) {
        let ticking = false;

        const updateProgress = () => {
            const scrollable = document.documentElement.scrollHeight - window.innerHeight;
            // صفحة أقصر من الشاشة: لا تقدّم يُقاس (نتجنب القسمة على صفر)
            const percent = scrollable > 0
                ? Math.min((window.scrollY / scrollable) * 100, 100)
                : 0;
            progressBar.style.width = `${percent}%`;
            ticking = false;
        };

        // rAF throttling: تحديث واحد لكل إطار رسم مهما تكرر حدث التمرير
        const onScroll = () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(updateProgress);
        };

        updateProgress();
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll, { passive: true });
    }
};

/* شغّل التهيئة مرة واحدة فقط.
   إذا حُمّل السكربت بعد اكتمال تحليل الـ DOM (مثل defer أو حقن متأخر)
   فإن حدث DOMContentLoaded يكون قد مضى ولن يُطلق أبداً. */
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
} else {
    init();
}
