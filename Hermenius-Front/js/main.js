document.addEventListener('DOMContentLoaded', function () {
    initFadeIn();
    checkAuth();
    console.log('Hermenius: Main module loaded');
});

function initFadeIn() {
    const elements = document.querySelectorAll('.monolith, .profile-monolith, .error-monolith, .register-card');

    elements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';

        setTimeout(() => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, 100 + index * 150);
    });
}

function checkAuth() {
    const heroCircle = document.querySelector('.hero-circle');

    if (heroCircle) {
        heroCircle.addEventListener('click', function (e) {
            e.preventDefault();
            const isRegistered = localStorage.getItem('dpo_registered');
            if (isRegistered === 'true') {
                window.location.href = 'profile.html';
            } else {
                window.location.href = 'register.html';
            }
        });
    }
}

function loadUserData() {
    const userAvatar = document.querySelector('.user-avatar');
    const userName = document.querySelector('.user-name');

    const userData = localStorage.getItem('dpo_user');
    if (userData && userAvatar && userName) {
        try {
            const user = JSON.parse(userData);
            userName.textContent = user.fullname || 'User';
            const initials = getInitials(user.fullname || '');
            userAvatar.textContent = initials || 'U';
        } catch (e) {
            console.error('Ошибка загрузки данных пользователя:', e);
        }
    }
}

function getInitials(fullname) {
    const words = fullname.split(/\s+/).filter(w => w.length > 0);
    if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
    return 'U';
}
