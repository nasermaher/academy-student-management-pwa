document.addEventListener('DOMContentLoaded', async () => {
    const navItems = document.querySelectorAll('nav li');
    const sections = document.querySelectorAll('main > section');

    const langBtn = document.getElementById('lang-toggle');
    if (langBtn) {
        langBtn.addEventListener('click', toggleLanguage);
    }

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            const sectionName = item.dataset.section;

            sections.forEach(section => section.classList.add('hidden'));

            const targetSection = document.getElementById(sectionName);
            if (targetSection) {
                targetSection.classList.remove('hidden');
            }

            if (sectionName === 'dashboard') DashboardModule.init();
            if (sectionName === 'settings') SettingsModule.init();
            if (sectionName === 'students') StudentsModule.init();
            if (sectionName === 'teachers') TeachersModule.init();
            if (sectionName === 'attendance') AttendanceModule.init();
            if (sectionName === 'finance') FinanceModule.init();
        });
    });

    await Store.load();

    DashboardModule.init();
    console.log('App Initialized');
});
