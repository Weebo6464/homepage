const themeToggle = document.getElementById('theme-toggle');
const themeMenu = document.getElementById('theme-menu');
const themeOptions = document.querySelectorAll('.theme-option');
const themeIcon = document.querySelector('.theme-icon');
let currentTheme = localStorage.getItem('theme') || 'auto';

function applyTheme(theme) {
    if (theme === 'auto') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.body.classList.toggle('light-mode', !prefersDark);
        themeIcon.textContent = '💻';
    } else if (theme === 'light') {
        document.body.classList.add('light-mode');
        themeIcon.textContent = '☀️';
    } else {
        document.body.classList.remove('light-mode');
        themeIcon.textContent = '🌙';
    }
    themeOptions.forEach(option => {
        option.classList.toggle('active', option.dataset.theme === theme);
    });
    currentTheme = theme;
    localStorage.setItem('theme', theme);
}

applyTheme(currentTheme);

themeToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    themeMenu.classList.toggle('active');
});

document.addEventListener('click', () => {
    themeMenu.classList.remove('active');
});

themeOptions.forEach(option => {
    option.addEventListener('click', (e) => {
        e.stopPropagation();
        applyTheme(option.dataset.theme);
        themeMenu.classList.remove('active');
    });
});

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (currentTheme === 'auto') {
        applyTheme('auto');
    }
});

if (typeof initStars === 'function') {
    initStars();
}

window.addEventListener('load', () => {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 300);
    }
});

// Google Forms direct submission is blocked by CORS
// Using iframe submission method instead
const GOOGLE_FORM_CONFIG = {
    formId: '1FAIpQLSdbeSF11OsYsYACJfnhB9-gXwF56FE79L8kPbPLD2VVye-bZQ',
    fields: {
        name: 'entry.2005620554',
        email: 'entry.1045781291',
        category: 'entry.1065046570',
        title: 'entry.1166974658',
        description: 'entry.839337160'
    }
};

const ideaForm = document.getElementById('idea-form');
if (ideaForm) {
    ideaForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const honeypot = document.querySelector('input[name="honeypot"]');
        if (honeypot && honeypot.value) {
            return;
        }

        const submitBtn = ideaForm.querySelector('.submit-btn');
        const originalBtnText = submitBtn.innerHTML;
        
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="submit-icon">⏳</span><span>Submitting...</span>';

        try {
            const nameValue = document.getElementById('name')?.value?.trim() || '';
            const emailValue = document.getElementById('email/discord')?.value?.trim() || '';
            const categoryValue = document.getElementById('category')?.value?.trim() || '';
            const titleValue = document.getElementById('title')?.value?.trim() || '';
            const descriptionValue = document.getElementById('description')?.value?.trim() || '';
            
            // Create hidden iframe for submission
            const iframe = document.createElement('iframe');
            iframe.name = 'hidden_iframe';
            iframe.style.display = 'none';
            document.body.appendChild(iframe);
            
            // Build form URL with parameters
            const params = new URLSearchParams();
            params.append(GOOGLE_FORM_CONFIG.fields.name, nameValue);
            params.append(GOOGLE_FORM_CONFIG.fields.email, emailValue);
            params.append(GOOGLE_FORM_CONFIG.fields.category, categoryValue);
            params.append(GOOGLE_FORM_CONFIG.fields.title, titleValue);
            params.append(GOOGLE_FORM_CONFIG.fields.description, descriptionValue);
            
            const submitUrl = `https://docs.google.com/forms/d/e/${GOOGLE_FORM_CONFIG.formId}/formResponse?${params.toString()}`;
            
            // Submit via iframe
            iframe.onload = () => {
                setTimeout(() => {
                    document.body.removeChild(iframe);
                    ideaForm.style.display = 'none';
                    document.getElementById('success-message').style.display = 'block';
                }, 500);
            };
            
            iframe.src = submitUrl;
            
        } catch (error) {
            console.error('Submission error:', error);
            alert('There was an error submitting your idea. Please try again or contact us directly.');
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        }
    });
}

function resetForm() {
    const ideaForm = document.getElementById('idea-form');
    const successMessage = document.getElementById('success-message');
    
    ideaForm.reset();
    ideaForm.style.display = 'flex';
    successMessage.style.display = 'none';
    
    ideaForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
