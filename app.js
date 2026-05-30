document.addEventListener("DOMContentLoaded", () => {
    
    // ==========================================
    // 🔥 إعدادات تشغيل السيرفر وقاعدة بيانات Firebase الخاصة بأبانوب
    // ==========================================
    const firebaseConfig = {
        apiKey: "AIzaSyCCiw64plS7KZLLjQCg7L4zo7bXY4568Rk",
        authDomain: "abanoub-portfolio.firebaseapp.com",
        databaseURL: "https://abanoub-portfolio-default-rtdb.firebaseio.com",
        projectId: "abanoub-portfolio",
        storageBucket: "abanoub-portfolio.firebasestorage.app",
        messagingSenderId: "859350701200",
        appId: "1:859350701200:web:1bfdb745229423d7b87415",
        measurementId: "G-5EKWEXOXBE"
    };

    // بدء الاتصال بالسيرفر
    firebase.initializeApp(firebaseConfig);
    const database = firebase.database();


    // 1. ⏳ إدارة شاشة التحميل الذكية (تختفي بعد 3 ثوانٍ)
    const loader = document.getElementById("system-loader");
    if (loader) {
        setTimeout(() => {
            loader.style.opacity = "0";
            loader.style.visibility = "hidden";
            handleScrollReveal();
        }, 3000); 
    }

    // 2. 🎬 نظام تحريك وظهور المحتويات تدريجياً أثناء النزول (Scroll Reveal)
    const revealElements = document.querySelectorAll(".reveal");

    function handleScrollReveal() {
        const triggerBottom = window.innerHeight * 0.85;

        revealElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            if (elementTop < triggerBottom) {
                element.classList.add("active");
            }
        });
    }

    window.addEventListener("scroll", handleScrollReveal);


    // 3. 🔥 نظام الإعجابات السحابي والتقييم المشترك الحي
    const likeButton = document.getElementById("like-btn");
    const likeIcon = document.getElementById("like-icon");
    const likeText = document.getElementById("like-text");
    const likesDisplay = document.getElementById("likes-count");
    const ratingDisplay = document.getElementById("rating-score");

    // التحقق من حالة الإعجاب محلياً بجهاز الزائر (لمنع السبام)
    let userHasLiked = localStorage.getItem("portfolio_user_liked") === "true";

    if (userHasLiked && likeIcon && likeText) {
        likeIcon.className = "fas fa-heart pulse-heart";
        likeText.innerText = "تم الإعجاب";
    }

    // 📥 استماع حي دائم من السيرفر لعدد اللايكات وعرضها للجميع في نفس اللحظة
    database.ref("likes_count").on("value", (snapshot) => {
        let totalLikes = snapshot.val() || 0;
        if (likesDisplay) likesDisplay.innerText = totalLikes;
        
        // حساب التقييم من 5 نجوم بناءً على مجموع اللايكات العامة
        let calculatedRating = (totalLikes * 0.2);
        if (calculatedRating > 5.0) calculatedRating = 5.0;
        if (ratingDisplay) ratingDisplay.innerText = calculatedRating.toFixed(1);
    });

    // 🔴 عند الضغط على زر اللايك (يعدل على القيمة المشتركة بالسيرفر)
    if (likeButton) {
        likeButton.addEventListener("click", () => {
            database.ref("likes_count").transaction((currentLikes) => {
                currentLikes = currentLikes || 0;
                if (!userHasLiked) {
                    userHasLiked = true;
                    localStorage.setItem("portfolio_user_liked", "true");
                    likeIcon.className = "fas fa-heart pulse-heart";
                    likeText.innerText = "تم الإعجاب";
                    return currentLikes + 1;
                } else {
                    userHasLiked = false;
                    localStorage.setItem("portfolio_user_liked", "false");
                    likeIcon.className = "far fa-heart";
                    likeIcon.classList.remove("pulse-heart");
                    likeText.innerText = "إعجاب";
                    return currentLikes - 1 > 0 ? currentLikes - 1 : 0;
                }
            });
        });
    }


    // 4. 💬 إدارة صندوق التعليقات السحابية اللايف للزوار
    const submissionForm = document.getElementById("submission-form");
    const commentsVerticalStack = document.getElementById("comments-vertical-stack");

    // 📥 استماع حي دائم للتعليقات: أي تعليق يتكتب يظهر فوراً عند كل اللي فاتحين الموقع
    database.ref("comments").on("value", (snapshot) => {
        if (commentsVerticalStack) {
            commentsVerticalStack.innerHTML = ""; // تنظيف القائمة لعرض البيانات الحديثة والجديدة
            const data = snapshot.val();
            if (data) {
                // عرض التعليقات من الأحدث إلى الأقدم
                Object.keys(data).reverse().forEach(key => {
                    const comment = data[key];
                    const bubble = document.createElement("div");
                    bubble.className = "comment-bubble glass";
                    bubble.style.opacity = "1";
                    bubble.style.transform = "translateY(0)";
                    bubble.style.marginBottom = "15px";

                    bubble.innerHTML = `
                        <strong style="color: var(--neon-blue); display: block; margin-bottom: 6px; font-size: 15px;">
                            <i class="fas fa-user-tag"></i> ${comment.name}
                        </strong>
                        <p style="color: var(--text-muted); font-size: 13px; line-height: 1.6;">${comment.message}</p>
                    `;
                    commentsVerticalStack.appendChild(bubble);
                });
            }
        }
    });

    // 📤 دفع وإرسال تعليق جديد إلى السيرفر الرئيسي للـ Firebase
    if (submissionForm) {
        submissionForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const inputName = document.getElementById("visitor-name").value;
            const inputMessage = document.getElementById("visitor-message").value;

            // إرسال البيانات للفايربيز
            database.ref("comments").push({
                name: inputName,
                message: inputMessage,
                timestamp: Date.now()
            });

            submissionForm.reset();
        });
    }
});