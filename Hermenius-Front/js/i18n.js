const HermeniusI18n = (() => {

    const LOCALES = {
        ru: {"app_name":"Hermenius","app_tagline":"Анализ данных с ИИ","start_work":"Начать работу","documentation":"Документация","documentation_desc":"SDK для Python, JavaScript и R. Примеры кода, API Reference и руководства по интеграции.","open_docs":"Открыть документацию","about":"О проекте","about_desc":"Автоматический анализ данных, предиктивная аналитика и дашборды в реальном времени.","learn_more":"Узнать больше","back_main":"На главную","back_projects":"К датасетам","new_project":"Новый проект","new_project_desc":"Загрузите CSV-файл и создайте новый дашборд с ИИ-аналитикой","create":"Создать","search":"Поиск","search_placeholder":"Найти датасет...","select_dataset":"Выберите датасет","upload_title":"Загрузка датасета","upload_drag":"Перетащите CSV-файл сюда","upload_click":"или нажмите для выбора файла","upload_model":"Модель ИИ:","analyze":"Анализировать","cancel":"Отмена","analyzing":"Анализирую \"{name}\"...","sending_api":"Отправка данных в API","register_title":"Создание аккаунта","register_subtitle":"Зарегистрируйтесь для доступа к аналитике","fullname":"ФИО","email":"Email","phone":"Телефон","company":"Компания","agree":"Я согласен на обработку персональных данных","register_btn":"Зарегистрироваться","clear_btn":"Очистить","have_account":"Уже есть аккаунт?","login":"Войти","faq_title":"Частые вопросы","faq_subtitle":"Всё, что нужно знать о Hermenius","getting_started":"Начало работы","security":"Безопасность и интеграции","pricing":"Тарифы и оплата","contacts":"Контакты","ai_insights":"ИИ-инсайты","file":"Файл","rows":"Строк","time":"Время","sec":"сек","export":"Экспорт","save":"Сохранить","export_current":"Текущий график","export_png":"Скачать PNG","export_svg":"Скачать SVG","export_all":"Весь дашборд","export_html":"Экспорт HTML","export_pdf":"Экспорт PDF","refresh":"Обновить данные","fullscreen":"Полный экран","themes":"Темы оформления","add_chart":"Добавить график","no_data":"Нет данных для визуализации","no_data_desc":"Данные для анализа не найдены","go_back":"Вернуться к выбору датасета","error_404":"Страница не найдена","maybe_deleted":"Возможно, она была удалена","need_help":"Нужна помощь?","contact_us":"Связаться с нами","generating_pdf":"Генерация PDF...","drag_hint":"Перетаскивайте карточки для изменения порядка. Потяните за угол для изменения размера."},
        en: {"app_name":"Hermenius","app_tagline":"AI-Powered Data Analysis","start_work":"Get Started","documentation":"Documentation","documentation_desc":"SDK for Python, JavaScript and R. Code examples, API Reference, and integration guides.","open_docs":"Open Documentation","about":"About","about_desc":"Automated data analysis, predictive analytics, and real-time dashboards.","learn_more":"Learn More","back_main":"Back to Main","back_projects":"Back to Datasets","new_project":"New Project","new_project_desc":"Upload a CSV file and create a new dashboard with AI analytics","create":"Create","search":"Search","search_placeholder":"Find dataset...","select_dataset":"Select Dataset","upload_title":"Upload Dataset","upload_drag":"Drag & drop CSV file here","upload_click":"or click to select file","upload_model":"AI Model:","analyze":"Analyze","cancel":"Cancel","analyzing":"Analyzing \"{name}\"...","sending_api":"Sending data to API","register_title":"Create Account","register_subtitle":"Sign up to access analytics","fullname":"Full Name","email":"Email","phone":"Phone","company":"Company","agree":"I agree to the processing of personal data","register_btn":"Register","clear_btn":"Clear","have_account":"Already have an account?","login":"Sign In","faq_title":"FAQ","faq_subtitle":"Everything you need to know about Hermenius","getting_started":"Getting Started","security":"Security & Integrations","pricing":"Pricing & Billing","contacts":"Contacts","ai_insights":"AI Insights","file":"File","rows":"Rows","time":"Time","sec":"sec","export":"Export","save":"Save","export_current":"Current Chart","export_png":"Download PNG","export_svg":"Download SVG","export_all":"Entire Dashboard","export_html":"Export HTML","export_pdf":"Export PDF","refresh":"Refresh Data","fullscreen":"Fullscreen","themes":"Theme Settings","add_chart":"Add Chart","no_data":"No data to visualize","no_data_desc":"No analysis data found","go_back":"Return to dataset selection","error_404":"Page Not Found","maybe_deleted":"It may have been removed","need_help":"Need Help?","contact_us":"Contact Us","generating_pdf":"Generating PDF...","drag_hint":"Drag cards to reorder. Pull the corner handle to resize."}
    };

    let _currentLang = 'ru';

    function init() {
        const saved = localStorage.getItem('hermenius_lang');
        _currentLang = (saved && LOCALES[saved]) ? saved : 'ru';
        apply();
    }

    function getLang() {
        return _currentLang;
    }

    function setLang(lang) {
        if (!LOCALES[lang]) return;
        _currentLang = lang;
        localStorage.setItem('hermenius_lang', lang);
        apply();
        document.dispatchEvent(new CustomEvent('langChanged', { detail: { lang } }));
    }

    function t(key, replacements) {
        const dict = LOCALES[_currentLang] || LOCALES.ru;
        let text = dict[key] || LOCALES.ru[key] || key;
        if (replacements && typeof replacements === 'object') {
            Object.entries(replacements).forEach(([k, v]) => {
                text = text.replace(`{${k}}`, v);
            });
        }
        return text;
    }

    function apply() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const text = t(key);
            if (text) {
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    el.placeholder = text;
                } else {
                    el.textContent = text;
                }
            }
        });
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            el.title = t(el.getAttribute('data-i18n-title'));
        });
    }

    function getAvailableLangs() {
        return Object.keys(LOCALES);
    }

    return { init, getLang, setLang, t, apply, getAvailableLangs };
})();
