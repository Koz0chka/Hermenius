document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('registerForm');
    if (!form) return;

    const patterns = {
        fullname: /^[а-яёА-ЯЁa-zA-Z\s\-]+$/,
        phone: /^(\+7|8)[\s\-]?\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}$/,
        email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        company: /^[а-яёА-ЯЁa-zA-Z0-9\s\-.,&]+$/
    };

    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function () {
            let value = this.value.replace(/\D/g, '');
            if (value.length > 11) value = value.slice(0, 11);

            let formatted = '';
            if (value.length > 0) {
                formatted = value[0] === '8' ? '+7' : '+' + value[0];
                if (value.length > 1) formatted += ' (' + value.slice(1, 4);
                if (value.length > 4) formatted += ') ' + value.slice(4, 7);
                if (value.length > 7) formatted += '-' + value.slice(7, 9);
                if (value.length > 9) formatted += '-' + value.slice(9, 11);
            }
            this.value = formatted;
        });
    }

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        clearErrors();

        let isValid = true;
        const errors = [];

        const fullnameInput = document.getElementById('fullname');
        const fullnameValue = fullnameInput.value.trim();
        const fullnameWords = fullnameValue.split(/\s+/).filter(w => w.length > 0);

        if (fullnameValue === '') {
            showError(fullnameInput, 'Введите ФИО');
            isValid = false;
        } else if (!patterns.fullname.test(fullnameValue)) {
            showError(fullnameInput, 'ФИО должно содержать только буквы');
            isValid = false;
        } else if (fullnameWords.length < 2) {
            showError(fullnameInput, 'Введите минимум фамилию и имя');
            isValid = false;
        } else if (fullnameWords.length > 3) {
            showError(fullnameInput, 'Максимум 3 слова');
            isValid = false;
        }

        const emailInput = document.getElementById('email');
        const emailValue = emailInput.value.trim();
        if (emailValue === '') {
            showError(emailInput, 'Введите email');
            isValid = false;
        } else if (!patterns.email.test(emailValue)) {
            showError(emailInput, 'Введите корректный email');
            isValid = false;
        }

        const phoneValue = phoneInput.value.trim();
        const phoneDigits = phoneValue.replace(/\D/g, '');
        if (phoneValue === '') {
            showError(phoneInput, 'Введите номер телефона');
            isValid = false;
        } else if (!patterns.phone.test(phoneValue)) {
            showError(phoneInput, 'Формат: +7 (XXX) XXX-XX-XX');
            isValid = false;
        } else if (phoneDigits.length !== 11) {
            showError(phoneInput, 'Номер должен содержать 11 цифр');
            isValid = false;
        }

        const companyInput = document.getElementById('company');
        const companyValue = companyInput.value.trim();
        if (companyValue !== '' && !patterns.company.test(companyValue)) {
            showError(companyInput, 'Недопустимые символы');
            isValid = false;
        }

        const agreement = document.getElementById('agreement');
        if (!agreement.checked) {
            const wrapper = agreement.closest('.form-checkbox-field') || agreement.parentElement;
            const help = document.createElement('p');
            help.classList.add('form-help', 'is-danger');
            help.textContent = 'Необходимо согласие на обработку данных';
            wrapper.appendChild(help);
            isValid = false;
        }

        if (isValid) {
            const userData = {
                fullname: fullnameValue,
                email: emailValue,
                phone: phoneValue,
                company: companyValue || '',
                registeredAt: new Date().toISOString()
            };

            localStorage.setItem('dpo_user', JSON.stringify(userData));
            localStorage.setItem('dpo_registered', 'true');

            setTimeout(() => {
                window.location.href = 'profile.html';
            }, 300);
        }
    });

    function showError(input, message) {
        input.classList.add('is-danger');
        const help = document.createElement('p');
        help.classList.add('form-help', 'is-danger');
        help.textContent = message;
        const container = input.closest('.form-field');
        if (container) container.appendChild(help);
    }

    function clearErrors() {
        document.querySelectorAll('.form-input.is-danger').forEach(el => el.classList.remove('is-danger'));
        document.querySelectorAll('.form-help.is-danger').forEach(el => el.remove());
    }

    document.querySelectorAll('.form-input').forEach(input => {
        input.addEventListener('input', function () {
            this.classList.remove('is-danger');
            const container = this.closest('.form-field');
            if (container) {
                container.querySelectorAll('.form-help.is-danger').forEach(el => el.remove());
            }
        });
    });

    const agreementCheckbox = document.getElementById('agreement');
    if (agreementCheckbox) {
        agreementCheckbox.addEventListener('change', function () {
            const container = this.closest('.form-checkbox-field');
            if (container) container.querySelectorAll('.form-help.is-danger').forEach(el => el.remove());
        });
    }
});
