// State Management
const Store = {
    data: null,
    load: () => {
        // Load from localStorage
        const saved = localStorage.getItem('academy_data');
        const parsed = saved ? JSON.parse(saved) : {};
        // Merge with defaults to ensure structure exists
        Store.data = { ...Store.defaults, ...parsed };
        // Deep merge for settings so a saved blob missing individual arrays still gets them
        Store.data.settings = { ...Store.defaults.settings, ...Store.data.settings };

        // MIGRATION: Ensure new schema fields exist
        Store.migrate();
    },
    migrate: () => {
        if (Store.data.settings.groups) {
            Store.data.settings.groups.forEach(g => {
                if (!g.billingType) g.billingType = 'monthly';
                if (!g.sessionsPerMonth) g.sessionsPerMonth = 8;
                
                // MIGRATION: Move price from subject to group if missing
                if (g.price === undefined) {
                    const subject = (Store.data.settings.subjects || []).find(s => s.id === g.subjectId);
                    g.price = subject ? (parseFloat(subject.price) || 0) : 0;
                }
                
                // MIGRATION: Default teacher percentage to 100%
                if (g.teacherPercentage === undefined) {
                    g.teacherPercentage = 100;
                }
            });
        }
        if (Store.data.students) {
            Store.data.students.forEach(s => {
                if (!s.attendance) s.attendance = [];
            });
        }
        if (!Store.data.teachers) {
            Store.data.teachers = [];
        }
        Store.save();
    },
    defaults: {
        settings: { stages: [], subjects: [], groups: [] },
        students: [],
        teachers: [],
        finance: []
    },
    save: () => {
        localStorage.setItem('academy_data', JSON.stringify(Store.data));
    },

    exportData: () => {
        const dataStr = JSON.stringify(Store.data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `academy_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    importData: (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    if (!data.settings || !data.students) {
                        throw new Error('Invalid Data Structure');
                    }
                    Store.data = data;
                    Store.save();
                    resolve(true);
                } catch (err) {
                    reject(err);
                }
            };
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }
};
