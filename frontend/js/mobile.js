document.addEventListener('DOMContentLoaded', () => {
    console.log('Mobile.js loaded');  // Add this line here
    const trigger = document.getElementById('analysis-trigger');
    const panel = document.getElementById('analysis-panel');
    console.log('got element');  // Add this line here
    const closeBtn = panel.querySelector('.close-panel');

    if (trigger && panel && closeBtn) {
        trigger.addEventListener('click', () => {
            console.log('execute check open one');  
            panel.classList.add('active');
            console.log('execute check open two');  
        });

        closeBtn.addEventListener('click', () => {
            panel.classList.remove('active');
        });
    }
    // Watch for changes in the main analysis container
    const observer = new MutationObserver(updateMobilePanel);
    const mainContent = document.querySelector('.analysis-container');
    if (mainContent) {
        observer.observe(mainContent, { childList: true, subtree: true });
    }
});

function updateMobilePanel() {
    const mainContent = document.querySelector('.analysis-container');
    const mobileContent = document.querySelector('.analysis-panel .analysis-content');
    if (mainContent && mobileContent) {
        mobileContent.innerHTML = mainContent.innerHTML;
    }
}



