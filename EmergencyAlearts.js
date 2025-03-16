document.addEventListener("DOMContentLoaded", function () {
    // Menu Toggle
    const menuToggle = document.getElementById("menuToggle");
    const closeMenu = document.getElementById("closeMenu");
    const sidebar = document.getElementById("sidebar");
    const contentWrapper = document.querySelector(".content-wrapper");
    const menuItems = document.querySelectorAll(".menu-items li");
    const pageContainer = document.getElementById("page-container"); // Main content area

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
            else if (pageId === "location") {
                // Redirect to external page (Live Monitoring)
                window.location.href = "LiveLocation.html";
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


const emergencyCallBtn = document.querySelector(".emergency-buttons button:first-child");
const alertAuthoritiesBtn = document.querySelector(".emergency-buttons button:last-child");

// Function to fetch location from Raspberry Pi
async function getLocation() {
    try {
        const response = await fetch("http://raspberry-pi-ip/location"); // Replace with actual endpoint
        const data = await response.json();
        return { lat: data.latitude, lng: data.longitude };
    } catch (error) {
        console.error("Error fetching location:", error);
        return null;
    }
}

// Function to fetch nearby places using Google Maps API
async function fetchNearbyPlaces(type, location) {
    const apiKey = "YOUR_GOOGLE_MAPS_API_KEY";
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.lat},${location.lng}&radius=5000&type=${type}&key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error("Error fetching nearby places:", error);
        return [];
    }
}

// Function to display nearby places in a modal
function displayPlaces(places, type) {
    const modalContent = document.querySelector(".modal-content");
    modalContent.innerHTML = `<h2>Select ${type}</h2><ul>`;
    
    places.forEach((place, index) => {
        modalContent.innerHTML += `<li>
            <strong>${place.name}</strong> - ${place.vicinity}
            <button onclick="assignTask('${place.place_id}', '${place.name}')">Assign</button>
        </li>`;
    });

    modalContent.innerHTML += "</ul><button class='close-modal' onclick='closeModal()'>Close</button>";
    document.querySelector(".modal").style.display = "block";
}



// Function to assign task and send location + video
async function assignTask(placeId, placeName) {
    const location = await getLocation();
    const videoData = "http://raspberry-pi-ip/video_feed"; // Placeholder for video stream URL

    const alertData = {
        policeStation: placeName,
        location: location,
        video: videoData
    };

    await fetch("https://your-backend-server.com/send_alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(alertData)
    });

    alert(`Alert sent to ${placeName}`);
    closeModal();
}

// Close Modal
function closeModal() {
    document.querySelector(".modal").style.display = "none";
}

// Click event for Emergency Call
emergencyCallBtn.addEventListener("click", async () => {
    const location = await getLocation();
    if (location) {
        const hospitals = await fetchNearbyPlaces("hospital", location);
        displayPlaces(hospitals, "Hospital");
    }
});

// Click event for Alert Authorities
alertAuthoritiesBtn.addEventListener("click", async () => {
    const location = await getLocation();
    if (location) {
        const policeStations = await fetchNearbyPlaces("police", location);
        displayPlaces(policeStations, "Police Station");
    }
});

