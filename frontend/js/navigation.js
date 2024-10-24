export function initializeNavigation() {
    const buttons = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.section');

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and sections
            buttons.forEach(btn => btn.classList.remove('active'));
            sections.forEach(section => section.classList.remove('active'));

            // Add active class to clicked button and corresponding section
            button.classList.add('active');
            const sectionId = button.id.replace('Btn', 'Section');
            document.getElementById(sectionId).classList.add('active');
        });
    });
}
