document.addEventListener('DOMContentLoaded', function() {

    document.addEventListener('formValid', function(event) {
        const formData = event.detail;
        
        console.clear();

        console.log('%cРегистрация успешна!', 'color: #10b981; font-size: 18px; font-weight: bold;');
        console.log('');

        console.log('%cДанные пользователя:', 'color: #0078e7; font-size: 14px; font-weight: bold;');
        console.table({
            'ФИО': formData.fullname,
            'Email': formData.email,
            'Телефон': formData.phone,
            'Компания': formData.company || '(не указана)'
        });

        console.log('%cВремя регистрации:', 'color: #8b5cf6; font-weight: bold;');
        console.log(formData.timestamp);

        console.log('');
        console.log('%cСырые данные (JSON):', 'color: #f59e0b; font-weight: bold;');
        console.log(JSON.stringify({
            fullname: formData.fullname,
            email: formData.email,
            phone: formData.phone,
            company: formData.company,
            registeredAt: formData.registeredAt
        }, null, 2));
        
        console.log('');
        console.log('%cПеренаправление в профиль...', 'color: #10b981; font-style: italic;');
    });
    
});