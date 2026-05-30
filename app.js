document.addEventListener("DOMContentLoaded", () => {

    // ==========================================
    // 1. إعدادات تفعيل السيرفر وقاعدة بيانات Firebase
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

    // ==========================================
    // 2. فك سحر الاختفاء وإظهار المحتوى فوراً 🚀
    // ==========================================
    // إجبار البودي والصفحة على فتح السكرول والظهور
    document.body.style.setProperty("overflow", "auto", "important");
    document.documentElement.style.setProperty("overflow", "auto", "important");
    document.body.style.setProperty("visibility", "visible", "important");
    document.body.style.setProperty("opacity", "1", "important");

    // السطور السحرية: جلب كل الـ sections والكلاسات المخفية وإجبارها على الظهور بنسبة 100%
    const allSections = document.querySelectorAll("section, main, .hero-section-reveal, div");
    allSections.forEach(section => {
        // لو القسم شفاف أو مخفي، بنرجعه يظهر فوراً ويلغي تأثير الـ Scroll Reveal القديم
        if (window.getComputedStyle(section).opacity === "0" || section.classList.contains("hero-section-reveal")) {
            section.style.setProperty("opacity", "1", "important");
            section.style.setProperty("visibility", "visible", "important");
            section.style.setProperty("transform", "none", "important");
        }
    });

    // إخفاء الـ Loader القديم تماماً
    const loader = document.getElementById("system-loader");
    if (loader) {
        loader.style.display = "none";
    }

    // ==========================================
    // 3. نظام الإعجابات والتقييم الحي (Firebase Realtime)
    // ==========================================
    const likeButton = document.getElementById("like-btn");
    const likeIcon = document.getElementById("like-icon");
    const likeText = document.getElementById("like-text");
    const likesDisplay = document.getElementById("likes-count");
    const ratingDisplay = document.getElementById("rating-score");

    let userHasLiked = localStorage.getItem("portfolio_user_liked") === "true";

    // الاستماع للتغييرات في السيرفر وتحديث الشاشة فوراً
    database.ref("likes_system").on("value", (snapshot) => {
        const data = snapshot.val() || { totalLikes: 0, totalRating: 0.0 };
        if (likesDisplay) likesDisplay.innerText = data.totalLikes;
        if (ratingDisplay) ratingDisplay.innerText = parseFloat(data.totalRating).toFixed(1);
    });

    // تحديث شكل الزرار للمستخدم لو كان ضغط لايك قبل كده
    if (userHasLiked && likeIcon && likeText) {
        likeIcon.className = "fas fa-heart text-danger";
        likeText.innerText = "تم الإعجاب";
    }

    // عند الضغط على زرار الإعجاب
    if (likeButton) {
        likeButton.addEventListener("click", () => {
            if (userHasLiked) {
                alert("لقد قمت بالإعجاب بالمعرض مسبقاً! شكراً لك لدعمك ✨");
                return;
            }

            database.ref("likes_system").transaction((currentData) => {
                if (currentData === null) {
                    return { totalLikes: 1, totalRating: 5.0 };
                } else {
                    let newLikes = currentData.totalLikes + 1;
                    let newRating = Math.min(5.0, 4.0 + (newLikes * 0.1));
                    return { totalLikes: newLikes, totalRating: newRating };
                }
            }, (error, committed) => {
                if (committed) {
                    userHasLiked = true;
                    localStorage.setItem("portfolio_user_liked", "true");
                    if (likeIcon) likeIcon.className = "fas fa-heart text-danger";
                    if (likeText) likeText.innerText = "تم الإعجاب";
                }
            });
        });
    }
    // =====================
    // نظام التعليقات
    // =====================

    const form = document.getElementById("submission-form");
    const commentsContainer = document.getElementById("comments-vertical-stack");

    if (form && commentsContainer) {

        database.ref("comments").on("value", (snapshot) => {

            commentsContainer.innerHTML = "";

            const comments = snapshot.val();

            if (!comments) {
                commentsContainer.innerHTML =
                    "<p>لا توجد تعليقات حتى الآن.</p>";
                return;
            }

            Object.values(comments).reverse().forEach(comment => {

                const commentBox = document.createElement("div");

                commentBox.className = "glass";
                commentBox.style.padding = "15px";
                commentBox.style.marginBottom = "15px";

                commentBox.innerHTML = `
                <h4>${comment.name}</h4>
                <p>${comment.message}</p>
            `;

                commentsContainer.appendChild(commentBox);
            });
        });

        form.addEventListener("submit", (e) => {

            e.preventDefault();

            const name = document.getElementById("visitor-name").value.trim();
            const message = document.getElementById("visitor-message").value.trim();

            if (!name || !message) return;

            database.ref("comments").push({
                name: name,
                message: message,
                timestamp: Date.now()
            });

            form.reset();
        });
    }
});