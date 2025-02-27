document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.querySelector('.sidebar .collapse-btn');
    const closeButton = document.querySelector('.popup .close-popup-btn');

    if (toggleButton) {
        toggleButton.addEventListener('click', toggleSidebar);
        toggleButton.setAttribute('aria-expanded', 'true');
        toggleButton.setAttribute('aria-controls', 'sidebar');
    }

    if (closeButton) {
        closeButton.addEventListener('click', closePopup);
        closeButton.setAttribute('aria-label', 'Close Popup');
    }

    // Show tooltip on hover for collapsed sidebar items
    const sidebarItems = document.querySelectorAll('.sidebar nav.menu ul li');
    sidebarItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            item.classList.add('hover');
        });
        item.addEventListener('mouseleave', () => {
            item.classList.remove('hover');
        });
    });

    // Add focus state for keyboard navigation
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Tab') {
            document.body.classList.add('keyboard-navigation');
        }
    });

    document.addEventListener('mousedown', () => {
        document.body.classList.remove('keyboard-navigation');
    });
});

const STATUS_COLORS = {
    PENDING: '#3498db', // Blue color
    DANGER: '#e74c3c'   // Red color
};

const STATUS_MESSAGES = {
    PENDING: 'PENDING',
    DANGER: 'DANGER'
};

function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    if (sidebar && mainContent) {
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('collapsed');
        const isCollapsed = sidebar.classList.contains('collapsed');
        const toggleButton = document.querySelector('.sidebar .collapse-btn');
        if (toggleButton) {
            toggleButton.setAttribute('aria-expanded', isCollapsed ? 'false' : 'true');
        }
    }
}

function closePopup() {
    const popup = document.getElementById('popup');
    if (popup) {
        popup.style.display = 'none';
        popup.setAttribute('aria-hidden', 'true');
        updateStatus(STATUS_MESSAGES.PENDING, STATUS_COLORS.PENDING);
    }
}

function updateStatus(status, color) {
    const statusElement = document.querySelector('.status');
    if (statusElement) {
        statusElement.textContent = `Status: ${status}`;
        statusElement.style.backgroundColor = color;
    }
}

// Simulate status change to "DANGER"
setTimeout(() => {
    updateStatus(STATUS_MESSAGES.DANGER, STATUS_COLORS.DANGER);
    const popup = document.getElementById('popup');
    if (popup) {
        popup.style.display = 'flex';
        popup.setAttribute('aria-hidden', 'false');
    }
}, 5000);
