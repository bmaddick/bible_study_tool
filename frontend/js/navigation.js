// Navigation handler for hash-based routing
export function initializeNavigation() {
    const sections = {
        'questioning': document.getElementById('questioning'),
        'theological': document.getElementById('theological'),
        'debate': document.getElementById('debate')
    };

    // Handle both page and hash-based navigation
    function updateNavigation() {
        const currentPath = window.location.pathname.split('/').pop() || 'index.html';
        const currentHash = window.location.hash.slice(1);

        // Hide all sections first
        Object.values(sections).forEach(section => {
            if (section) section.style.display = 'none';
        });

        // Show section if hash matches
        const currentSection = sections[currentHash];
        if (currentSection) {
            currentSection.style.display = 'block';
        }

        // Update active nav link
        document.querySelectorAll('nav a').forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');

            // Handle main navigation (index.html and study.html)
            if (!href.includes('#')) {
                const linkPath = href || 'index.html';
                if (linkPath === currentPath) {
                    link.classList.add('active');
                }
            }
            // Handle hash-based navigation
            else {
                const [linkPath, linkHash] = href.split('#');
                if (linkPath === currentPath && linkHash === currentHash) {
                    link.classList.add('active');
                }
            }
        });
    }

    // Listen for hash changes
    window.addEventListener('hashchange', updateNavigation);

    // Listen for page load
    window.addEventListener('load', updateNavigation);

    // Handle initial state
    updateNavigation();

    // Initialize AI response handlers
    document.getElementById('ask-faith')?.addEventListener('click', handleFaithQuestion);
    document.getElementById('ask-theological')?.addEventListener('click', handleTheologicalQuestion);
    document.getElementById('start-debate')?.addEventListener('click', handleDebate);
}

function handleFaithQuestion() {
    const question = document.getElementById('faith-question').value;
    const responseContainer = document.getElementById('faith-response');
    responseContainer.innerHTML = `<div class="ai-response">Processing your question about faith...</div>`;
    // AI response handling would go here
}

function handleTheologicalQuestion() {
    const question = document.getElementById('theological-question').value;
    const responseContainer = document.getElementById('theological-response');
    responseContainer.innerHTML = `<div class="ai-response">Processing your theological question...</div>`;
    // AI response handling would go here
}

function handleDebate() {
    const topic = document.getElementById('debate-topic').value;
    const responseContainer = document.getElementById('debate-response');
    responseContainer.innerHTML = `<div class="ai-response">Setting up debate simulation...</div>`;
    // Debate simulation handling would go here
}
