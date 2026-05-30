document.addEventListener("DOMContentLoaded", () => {
    
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


    // 3. 💾 نظام الإعجابات والتقييم الثابت (LocalStorage)
    const likeButton = document.getElementById("like-btn");
    const likeIcon = document.getElementById("like-icon");
    const likeText = document.getElementById("like-text");
    const likesDisplay = document.getElementById("likes-count");
    const ratingDisplay = document.getElementById("rating-score");
    
    // استعادة البيانات المحفوظة أو بدء قيم جديدة
    let currentLikes = parseInt(localStorage.getItem("portfolio_likes")) || 0;
    let currentRating = parseFloat(localStorage.getItem("portfolio_rating")) || 0.0;
    let userHasLiked = localStorage.getItem("portfolio_user_liked") === "true";

    // عرض البيانات المحفوظة فور تحميل الصفحة
    if (likesDisplay) likesDisplay.innerText = currentLikes;
    if (ratingDisplay) ratingDisplay.innerText = currentRating.toFixed(1);
    
    if (userHasLiked && likeIcon && likeText) {
        likeIcon.className = "fas fa-heart text-danger";
        likeText.innerText = "تم الإعجاب";
    }

    if (likeButton && likesDisplay && ratingDisplay) {
        likeButton.addEventListener("click", () => {
            if (!userHasLiked) {
                currentLikes++;
                currentRating = (currentLikes * 0.2);
                if (currentRating > 5.0) currentRating = 5.0;

                likeIcon.className = "fas fa-heart pulse-heart";
                likeText.innerText = "تم الإعجاب";
                userHasLiked = true;
            } else {
                currentLikes--;
                currentRating = (currentLikes * 0.2);
                if (currentRating < 0.0) currentRating = 0.0;

                likeIcon.className = "far fa-heart";
                likeIcon.classList.remove("pulse-heart");
                likeText.innerText = "إعجاب";
                userHasLiked = false;
            }

            // تحديث الشاشة
            likesDisplay.innerText = currentLikes;
            ratingDisplay.innerText = currentRating.toFixed(1);

            // حفظ التعديلات في المتصفح بشكل دائم
            localStorage.setItem("portfolio_likes", currentLikes);
            localStorage.setItem("portfolio_rating", currentRating);
            localStorage.setItem("portfolio_user_liked", userHasLiked);
        });
    }


    // 4. 💬 إدارة وحفظ صندوق التعليقات المتتالية
    const submissionForm = document.getElementById("submission-form");
    const commentsVerticalStack = document.getElementById("comments-vertical-stack");

    // دالة مخصصة لإنشاء شكل كارت التعليق على الشاشة
    function createCommentBubble(name, message) {
        const bubble = document.createElement("div");
        bubble.className = "comment-bubble glass";
        bubble.innerHTML = `
            <strong style="color: var(--neon-blue); display: block; margin-bottom: 6px; font-size: 15px;">
                <i class="fas fa-user-tag"></i> ${name}
            </strong>
            <p style="color: var(--text-muted); font-size: 13px; line-height: 1.6;">${message}</p>
        `;
        return bubble;
    }

    // استعادة التعليقات القديمة المحفوظة وعرضها
    let savedComments = JSON.parse(localStorage.getItem("portfolio_comments")) || [];
    if (commentsVerticalStack) {
        savedComments.forEach(comment => {
            const oldBubble = createCommentBubble(comment.name, comment.message);
            commentsVerticalStack.appendChild(oldBubble); // إضافة التعليقات السابقة بالترتيب
        });
    }

    if (submissionForm && commentsVerticalStack) {
        submissionForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const inputName = document.getElementById("visitor-name").value;
            const inputMessage = document.getElementById("visitor-message").value;

            // إنشاء التعليق الجديد وضخه في أول القائمة بحركة سلسة
            const newBubble = createCommentBubble(inputName, inputMessage);
            newBubble.style.opacity = "0";
            newBubble.style.transform = "translateY(12px)";
            newBubble.style.transition = "all 0.4s ease";

            commentsVerticalStack.insertBefore(newBubble, commentsVerticalStack.firstChild);

            setTimeout(() => {
                newBubble.style.opacity = "1";
                newBubble.style.transform = "translateY(0)";
            }, 50);

            // إضافة التعليق الجديد للمصفوفة وحفظها في الـ LocalStorage
            savedComments.unshift({ name: inputName, message: inputMessage });
            localStorage.setItem("portfolio_comments", JSON.stringify(savedComments));

            // زيادة العدادات تلقائياً مع التعليق الجديد إذا لم يكن قد ضغط إعجاب من قبل
            if (!userHasLiked) {
                currentLikes++;
                currentRating = (currentLikes * 0.2);
                if (currentRating > 5.0) currentRating = 5.0;
                
                if (likesDisplay) likesDisplay.innerText = currentLikes;
                if (ratingDisplay) ratingDisplay.innerText = currentRating.toFixed(1);

                localStorage.setItem("portfolio_likes", currentLikes);
                localStorage.setItem("portfolio_rating", currentRating);
            }

            submissionForm.reset();
        });
    }
});