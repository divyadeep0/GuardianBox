document.addEventListener("DOMContentLoaded", function () {
    const menuToggle = document.getElementById("menuToggle");
    const closeMenu = document.getElementById("closeMenu");
    const sidebar = document.getElementById("sidebar");
    const contentWrapper = document.querySelector(".content-wrapper");
    const menuItems = document.querySelectorAll(".menu-items li");
    const pageContainer = document.getElementById("page-container"); // Main content area



    // Toggle Sidebar
    // Toggle Sidebar
    menuToggle.addEventListener("click", () => {
        sidebar.classList.toggle("active");
        contentWrapper.classList.toggle("shifted");
    });

    // Close Sidebar when clicking the close button
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

    // Smooth Scroll for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener("click", function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute("href"));
            if (target) {
                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
        });
    });

    // Page Navigation (Internal & External)
    menuItems.forEach((item) => {
        item.addEventListener("click", function () {
            // Remove active class from all menu items
            menuItems.forEach(i => i.classList.remove("active"));
            item.classList.add("active");

            // Get the selected page ID
            const pageId = item.getAttribute("data-page");

            if (pageId === "dashboard") {
                // Redirect to external page (Live Monitoring)
                window.location.href = "SafetyGaurd.html";
                return; // Stop further execution
            }
            else if (pageId === "monitoring") {
                // Redirect to external page (Location)
                window.location.href = "LiveMonitor.html";
                return; // Stop further execution
            }
            else if (pageId === "emergency") {
                // Redirect to external page (Live Monitoring)
                window.location.href = "EmergencyAlearts.html";
                return; // Stop further execution
            }
            else if (pageId === "profile") {
                // Redirect to external page (Live Monitoring)
                window.location.href = "Profile.html";
                return; // Stop further execution
            }
            else if (pageId === "settings") {
                // Redirect to external page (Live Monitoring)
                window.location.href = "Settings.html";
                return; // Stop further execution
            }


            // Show internal pages dynamically
            const targetPage = document.getElementById(pageId);
            if (targetPage) {
                // Hide all pages
                document.querySelectorAll(".page").forEach(page => {
                    page.classList.remove("active");
                });

                // Show the selected page
                targetPage.classList.add("active");
            }

            // Close sidebar on mobile after clicking a menu item
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

    let map, marker, userLocation;
    const socket = new WebSocket("ws://your-raspberrypi-ip:port"); // Replace with actual IP & port

    function initMap() {
        map = new google.maps.Map(document.getElementById("map"), {
            center: { lat: 0, lng: 0 },
            zoom: 15,
        });

        marker = new google.maps.Marker({
            position: { lat: 0, lng: 0 },
            map: map,
            title: "Vehicle Location",
        });
    }

    socket.onmessage = function (event) {
        const data = JSON.parse(event.data);
        if (data.latitude && data.longitude) {
            updateLocation(parseFloat(data.latitude), parseFloat(data.longitude));
        }
    };

    function updateLocation(latitude, longitude) {
        const newPosition = { lat: latitude, lng: longitude };
        marker.setPosition(newPosition);
        map.setCenter(newPosition);
        userLocation = newPosition;
    }

    document.getElementById("emergencyCall").addEventListener("click", () => fetchNearbyPlaces("hospital"));
    document.getElementById("alertAuthorities").addEventListener("click", () => fetchNearbyPlaces("police"));

    function fetchNearbyPlaces(type) {
        if (!userLocation) {
            alert("Location not available yet!");
            return;
        }

        const service = new google.maps.places.PlacesService(map);
        service.nearbySearch(
            { location: userLocation, radius: 5000, type: type },
            (results, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    displayAuthorityOptions(results, type);
                } else {
                    console.error("No results found.");
                }
            }
        );
    }

    function displayAuthorityOptions(results, type) {
        const container = document.createElement("div");
        container.innerHTML = "<h3>Select an authority:</h3>";
        results.forEach(place => {
            const btn = document.createElement("button");
            btn.textContent = place.name;
            btn.className = "activate-btn";
            btn.onclick = () => sendAlert(place.name, type);
            container.appendChild(btn);
        });
        document.body.appendChild(container);
    }

    function sendAlert(authority, type) {
        alert(`Sending location and video data to ${authority} (${type})`);
    }

    window.initMap = initMap;
