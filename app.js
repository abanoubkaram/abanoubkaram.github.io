document.addEventListener("DOMContentLoaded", () => {

    // ==========================================
    // إعدادات تفعيل السيرفر وقاعدة بيانات Firebase الخاصة بأبانوب
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

    // إدارة شاشة التحميل الذكية (تختفي بعد 3 ثوانٍ)
    const loader = document.getElementById("system-loader");
    if (loader) {
        setTimeout(() => {
            loader.style.opacity = "0";
            setTimeout(() => {
                loader.style.display = "none";
            }, 500);
        }, 3000);
    }

    // ==========================================
    // نظام الإعجابات والتقييم الحي (Firebase Realtime)
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

            // جلب البيانات الحالية من السيرفر وزيادتها
            database.ref("likes_system").transaction((currentData) => {
                if (currentData === null) {
                    return { totalLikes: 1, totalRating: 5.0 };
                } else {
                    let newLikes = currentData.totalLikes + 1;
                    // حساب التقييم بشكل ديناميكي (كل ما اللايكات تزيد، التقييم يقرب من 5.0)
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
});