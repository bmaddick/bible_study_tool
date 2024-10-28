// Navigation handler for hash-based routing
export function initializeNavigation() {
    const sections = {
        'questioning': document.getElementById('questioning'),
        'theological': document.getElementById('theological'),
        'debate': document.getElementById('debate')
    };

    // Handle hash changes
    function handleHashChange() {
        const hash = window.location.hash.slice(1) || '';

        // Hide all sections
        Object.values(sections).forEach(section => {
            if (section) section.style.display = 'none';
        });

        // Show the selected section
        const currentSection = sections[hash];
        if (currentSection) {
            currentSection.style.display = 'block';
        }

        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${hash}` ||
                (!hash && link.getAttribute('href') === 'index.html')) {
                link.classList.add('active');
            }
        });
    }

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);

    // Handle initial load
    handleHashChange();

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
