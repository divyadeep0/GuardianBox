// Initialize the map using Leaflet.js
let map = L.map('map').setView([31.3562747, 75.4395526], 15); // Default to Kapurthala

// Load and display the OpenStreetMap layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Add a marker for initial position
let marker = L.marker([31.3562747, 75.4395526]).addTo(map)
    .bindPopup("Vehicle Location")
    .openPopup();

// WebSocket connection (Update with your Raspberry Pi IP & Port)
const socket = new WebSocket("ws://your-raspberrypi-ip:port");

// Handle WebSocket messages
socket.onmessage = function (event) {
    const data = JSON.parse(event.data);
    if (data.latitude && data.longitude) {
        updateLocation(parseFloat(data.latitude), parseFloat(data.longitude));
    }
};

// Update the map marker and center
function updateLocation(latitude, longitude) {
    const newPosition = [latitude, longitude];

    // Move the marker to the new position
    marker.setLatLng(newPosition)
        .bindPopup("Updated Vehicle Location")
        .openPopup();

    // Center the map on the new position
    map.setView(newPosition, 15);
}
