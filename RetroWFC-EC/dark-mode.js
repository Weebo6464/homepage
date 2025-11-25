document.addEventListener('DOMContentLoaded', () => {
    const themeToggleButton = document.getElementById('theme-toggle-button');
    const body = document.body;
    const tooltipText = document.querySelector('.dark-mode-toggle .tooltip-text');

    const updateTooltip = () => {
        if (body.classList.contains('dark-mode')) {
            tooltipText.textContent = 'Disable Dark Mode (Your Eyes will explode btw :3)';
        } else {
            tooltipText.textContent = 'Enable Dark Mode';
        }
    };

    // Function to apply the saved theme on page load
    const applySavedTheme = () => {
        const isDarkMode = localStorage.getItem('darkMode') === 'enabled';
        if (isDarkMode) {
            body.classList.add('dark-mode');
        } else {
            body.classList.remove('dark-mode');
        }
        updateTooltip();
    };

    // Function to toggle the theme and save the preference
    const toggleTheme = () => {
        body.classList.toggle('dark-mode');
        if (body.classList.contains('dark-mode')) {
            localStorage.setItem('darkMode', 'enabled');
        } else {
            localStorage.setItem('darkMode', 'disabled');
        }
        updateTooltip();
    };

    // Apply theme on initial load
    applySavedTheme();

    // Add event listener for the toggle button
    themeToggleButton.addEventListener('click', toggleTheme);
});
