// First, define the hamburger menu initialization function
function initializeHamburgerMenu() {
    const hamburger = document.querySelector('.hamburger-menu');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }
}

// Next, define the analysis panel initialization function
function initializeAnalysisPanel() {
    const trigger = document.getElementById('analysis-trigger');
    const panel = document.getElementById('analysis-panel');
    const backdrop = document.querySelector('.panel-backdrop');
    const closeBtn = panel?.querySelector('.close-panel');
    const content = document.querySelector('.panel-body');

    function openPanel() {
        panel.classList.add('active');
        backdrop.classList.add('active');
    }

    function closePanel() {
        panel.classList.remove('active');
        backdrop.classList.remove('active');
    }

    if (trigger && panel && backdrop && closeBtn) {
        trigger.addEventListener('click', openPanel);
        closeBtn.addEventListener('click', closePanel);
        // Handle double-click on backdrop
        backdrop.addEventListener('dblclick', (e) => {
            if (e.target === backdrop) {
                closePanel();
            }
        });
        // Prevent single clicks from passing through to verses
        backdrop.addEventListener('click', (e) => {
            if (e.target === backdrop) {
                e.stopPropagation();
            }
        });
    }

    // Watch for changes in the main analysis container
    const observer = new MutationObserver(updateMobilePanel);
    const mainContent = document.querySelector('.analysis-container');
    if (mainContent) {
        observer.observe(mainContent, { childList: true, subtree: true });
    }

    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && panel.classList.contains('active')) {
            panel.classList.remove('active');
        }
    });
}

// Keep your existing updateMobilePanel function
function updateMobilePanel() {
    const mainContent = document.querySelector('.analysis-container');
    const mobileContent = document.querySelector('.analysis-panel .analysis-content');
    if (mainContent && mobileContent) {
        mobileContent.innerHTML = mainContent.innerHTML;
    }
}

// Finally, initialize everything when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeHamburgerMenu();
    initializeAnalysisPanel();
});

/*document.addEventListener('DOMContentLoaded', () => {
    const trigger = document.getElementById('analysis-trigger');
    const panel = document.getElementById('analysis-panel');
    const backdrop = document.querySelector('.panel-backdrop');
    const closeBtn = panel.querySelector('.close-panel');
    const content = document.querySelector('.panel-body');
    const hamburger = document.querySelector('.hamburger-menu');
    const navLinks = document.querySelector('.nav-links');

    function openPanel() {
        panel.classList.add('active');
        backdrop.classList.add('active');
    }

    function closePanel() {
        panel.classList.remove('active');
        backdrop.classList.remove('active');
    }

    if (trigger && panel && backdrop && closeBtn) {
        trigger.addEventListener('click', openPanel);
        closeBtn.addEventListener('click', closePanel);
        // Handle double-click on backdrop
        backdrop.addEventListener('dblclick', (e) => {
            if (e.target === backdrop) {
                closePanel();
            }
        });
        // Prevent single clicks from passing through to verses
        backdrop.addEventListener('click', (e) => {
            if (e.target === backdrop) {
                e.stopPropagation();
            }
        });
    }

    // Watch for changes in the main analysis container
    const observer = new MutationObserver(updateMobilePanel);
    const mainContent = document.querySelector('.analysis-container');
    if (mainContent) {
        observer.observe(mainContent, { childList: true, subtree: true });
    }

    window.addEventListener('resize', () => {
        const panel = document.getElementById('analysis-panel');
        if (window.innerWidth > 768 && panel.classList.contains('active')) {
            panel.classList.remove('active');
        }
    });

    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
    
});

function updateMobilePanel() {
    const mainContent = document.querySelector('.analysis-container');
    const mobileContent = document.querySelector('.analysis-panel .analysis-content');
    if (mainContent && mobileContent) {
        mobileContent.innerHTML = mainContent.innerHTML;
    }
}*/



