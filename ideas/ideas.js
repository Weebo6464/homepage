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
            
            const formData = new FormData();
            formData.append(GOOGLE_FORM_CONFIG.fields.name, nameValue);
            formData.append(GOOGLE_FORM_CONFIG.fields.email, emailValue);
            formData.append(GOOGLE_FORM_CONFIG.fields.category, categoryValue);
            formData.append(GOOGLE_FORM_CONFIG.fields.title, titleValue);
            formData.append(GOOGLE_FORM_CONFIG.fields.description, descriptionValue);
            formData.append('entry.1065046570_sentinel', '');
            formData.append('fvv', '1');
            formData.append('pageHistory', '0');
            
            const baseUrl = `https://docs.google.com/forms/d/e/${GOOGLE_FORM_CONFIG.formId}/formResponse`;
            
            fetch(baseUrl, {
                method: 'POST',
                body: formData,
                mode: 'no-cors'
            });
            
            await new Promise(resolve => setTimeout(resolve, 1000));

            ideaForm.style.display = 'none';
            document.getElementById('success-message').style.display = 'block';
            
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
