// Dashboard Module
const DashboardModule = {
    init: () => {
        console.log('Dashboard Module Loaded');
        DashboardModule.render();
    },

    render: () => {
        const container = document.getElementById('dashboard-container');
        if (!container) return;

        const students = Store.data.students || [];
        const groups = Store.data.settings.groups || [];
        const finance = Store.data.finance || [];

        const totalStudents = students.length;
        const activeGroups = groups.length;

        const totalIncome = finance
            .filter(t => t.type === 'payment')
            .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

        // Outstanding dues aren't shown here - computing them requires running
        // FinanceModule.calculateDues() for every student, which doesn't scale
        // for a dashboard-load calculation. This card shows collected income only.

        container.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card blue">
                    <div class="icon">👥</div>
                    <div class="info">
                        <h3 data-i18n="total_students">Total Students</h3>
                        <p>${totalStudents}</p>
                    </div>
                </div>
                <div class="stat-card green">
                    <div class="icon">💰</div>
                    <div class="info">
                        <h3 data-i18n="total_income">Total Income</h3>
                        <p>${totalIncome.toFixed(2)}</p>
                    </div>
                </div>
                <div class="stat-card orange">
                    <div class="icon">📚</div>
                    <div class="info">
                        <h3 data-i18n="active_groups">Active Groups</h3>
                        <p>${activeGroups}</p>
                    </div>
                </div>
            </div>

            <div class="card" style="margin-top:20px;">
                <h3 data-i18n="recent_activities">Recent Activities</h3>
                <ul id="dashboard-activities">
                    ${DashboardModule.getRecentActivities(finance)}
                </ul>
            </div>
        `;

        if (typeof updateUI === 'function') updateUI();
    },

    getRecentActivities: (finance) => {
        // Show last 5 transactions
        const recent = [...finance].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
        if (recent.length === 0) return `<li style="color:#777">${t('no_recent_activities')}</li>`;

        const students = Store.data.students || [];
        const teachers = Store.data.teachers || [];

        return recent.map(t_obj => {
            let name = t('unknown');
            let label = t('student_payment');
            let amountColor = 'green';
            let sign = '+';

            if (t_obj.type === 'teacher_payment') {
                const tch = teachers.find(tc => tc.id === t_obj.teacherId);
                name = tch ? tch.name : t('unknown');
                label = t('teacher_payment_trx');
                amountColor = 'red';
                sign = '-';
            } else {
                const st = students.find(s => s.id === t_obj.studentId);
                name = st ? st.name : t('unknown');
                label = t('student_payment');
                amountColor = 'green';
                sign = '+';
            }

            return `<li style="display:flex; justify-content:space-between; padding:10px; border-bottom:1px solid #eee;">
                <span>${UI.esc(name)} - ${UI.esc(t_obj.note || label)}</span>
                <span style="font-weight:bold; color:${amountColor};">${sign}${t_obj.amount}</span>
            </li>`;
        }).join('');
    }
};
