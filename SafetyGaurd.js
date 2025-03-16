document.addEventListener("DOMContentLoaded", function () {
    // Elements
    const menuToggle = document.getElementById("menuToggle");
    const closeMenu = document.getElementById("closeMenu");
    const sidebar = document.getElementById("sidebar");
    const contentWrapper = document.querySelector(".content-wrapper");
    const menuItems = document.querySelectorAll(".menu-items li");
    const exploreBtn = document.querySelector(".explore-btn");
    const faqBtn = document.querySelector(".faq-btn");
    const productModal = document.getElementById("productModal");
    const faqModal = document.getElementById("faqModal");
    const closeModalBtns = document.querySelectorAll(".close-modal");

    // Toggle Sidebar
    menuToggle.addEventListener("click", () => {
        sidebar.classList.toggle("active");
        contentWrapper.classList.toggle("shifted");
    });

    // Close Sidebar
    closeMenu.addEventListener("click", (e) => {
        e.stopPropagation();
        sidebar.classList.remove("active");
        contentWrapper.classList.remove("shifted");
    });

    // Close Sidebar when clicking outside
    document.addEventListener("click", (e) => {
        if (!sidebar.contains(e.target) && 
            !menuToggle.contains(e.target) && 
            sidebar.classList.contains("active")) {
            sidebar.classList.remove("active");
            contentWrapper.classList.remove("shifted");
        }
    });

    // Modal Functions
    function openModal(modal) {
        modal.style.display = "block";
        document.body.style.overflow = "hidden";
    }

    function closeModal(modal) {
        modal.style.display = "none";
        document.body.style.overflow = "auto";
    }

    // Explore Button Click
    exploreBtn.addEventListener("click", () => {
        openModal(productModal);
    });

    // FAQ Button Click
    faqBtn.addEventListener("click", () => {
        openModal(faqModal);
    });

    // Close Modal Buttons
    closeModalBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const modal = btn.closest(".modal");
            closeModal(modal);
        });
    });

    // Close Modal when clicking outside
    window.addEventListener("click", (e) => {
        if (e.target.classList.contains("modal")) {
            closeModal(e.target);
        }
    });

    // Page Navigation
    menuItems.forEach((item) => {
        item.addEventListener("click", function () {
            menuItems.forEach(i => i.classList.remove("active"));
            item.classList.add("active");

            const pageId = item.getAttribute("data-page");
            
            // External page navigation
            const externalPages = {
                "monitoring": "LiveMonitor.html",
                "location": "LiveLocation.html",
                "emergency": "EmergencyAlearts.html",
                "profile": "Profile.html",
                "settings": "Settings.html"
            };

            if (externalPages[pageId]) {
                window.location.href = externalPages[pageId];
                return;
            }

            // Internal page navigation
            const targetPage = document.getElementById(pageId);
            if (targetPage) {
                document.querySelectorAll(".page").forEach(page => {
                    page.classList.remove("active");
                });
                targetPage.classList.add("active");
            }

            // Close sidebar on mobile
            if (window.innerWidth <= 768) {
                sidebar.classList.remove("active");
                contentWrapper.classList.remove("shifted");
            }
        });
    });

    // Feature Cards Animation
    const observerOptions = { threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = "1";
                entry.target.style.transform = "translateY(0)";
            }
        });
    }, observerOptions);

    document.querySelectorAll(".feature-card").forEach((card) => {
        card.style.opacity = "0";
        card.style.transform = "translateY(30px)";
        observer.observe(card);
    });
});