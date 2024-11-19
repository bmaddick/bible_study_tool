document.addEventListener('DOMContentLoaded', () => {
    const trigger = document.getElementById('analysis-trigger');
    const panel = document.getElementById('analysis-panel');
    const backdrop = document.querySelector('.panel-backdrop');
    const closeBtn = panel.querySelector('.close-panel');

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
});

window.addEventListener('resize', () => {
    const panel = document.getElementById('analysis-panel');
    if (window.innerWidth > 768 && panel.classList.contains('active')) {
        panel.classList.remove('active');
    }
});

function updateMobilePanel() {
    const mainContent = document.querySelector('.analysis-container');
    const mobileContent = document.querySelector('.analysis-panel .analysis-content');
    if (mainContent && mobileContent) {
        mobileContent.innerHTML = mainContent.innerHTML;
    }
}



