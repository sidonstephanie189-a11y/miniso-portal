// ==========================================
// MINISO Member Portal — DEMO VERSION
// WITH PAPER BAG WELCOME POP-UP
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    // Show welcome pop-up
    const welcomePopup = document.getElementById('welcomePopup');
    const mainContent = document.getElementById('mainContent');
    const enterBtn = document.getElementById('enterBtn');

    // Check if already visited this session
    const visitedThisSession = sessionStorage.getItem('minisoVisited');
    
    if (visitedThisSession) {
        welcomePopup.style.display = 'none';
        mainContent.classList.remove('main-hidden');
    } else {
        // Show pop-up — hide main content first
        mainContent.classList.add('main-hidden');
        
        enterBtn.addEventListener('click', () => {
            welcomePopup.style.opacity = '0';
            welcomePopup.style.transition = 'opacity 0.4s ease';
            setTimeout(() => {
                welcomePopup.style.display = 'none';
                mainContent.classList.remove('main-hidden');
                sessionStorage.setItem('minisoVisited', 'true');
                // Initialize everything after pop-up closes
                initApp();
            }, 400);
        });
    }

    // Initialize if already visited
    if (visitedThisSession) {
        initApp();
    }
});

// Main app initialization
function initApp() {
    updateUI();
    checkClaimStatus();
    renderPlans();
    loadSupportSettings();
}

// Rest of your script functions here...
