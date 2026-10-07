// Teachers Module
const TeachersModule = {
    init: () => {
        console.log('Teachers Module Loaded');
        TeachersModule.render();
    },

    render: () => {
        const container = document.getElementById('teachers-container');
        if (!container) return;

        container.innerHTML = `
            <div class="card">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <h2 data-i18n="teachers">Teachers List</h2>
                    <button class="btn" onclick="TeachersModule.showAddForm()" data-i18n="add_teacher">Add Teacher</button>
                </div>
                <div class="form-group">
                    <input type="text" id="teacher-search" data-placeholder="search" onkeyup="TeachersModule.filterTeachers()">
                </div>
                <ul id="teachers-list"></ul>
            </div>

            <!-- Form for Adding/Editing -->
            <div id="teacher-form-container" class="card hidden">
                <h2 id="teacher-form-title" data-i18n="add_teacher">Add Teacher</h2>
                <input type="hidden" id="teacher-id">
                
                <div class="form-group">
                    <label data-i18n="teacher_name">Teacher Name</label>
                    <input type="text" id="teacher-name">
                </div>

                <div class="form-group">
                    <label data-i18n="phone">Phone</label>
                    <input type="text" id="teacher-phone">
                </div>

                <div style="margin-top:20px;">
                    <button class="btn" onclick="TeachersModule.saveTeacher()" data-i18n="save">Save</button>
                    <button class="btn" style="background:#95a5a6;" onclick="TeachersModule.cancelForm()" data-i18n="cancel">Cancel</button>
                </div>
            </div>
        `;

        if (typeof updateUI === 'function') updateUI();
        TeachersModule.loadTeachers();
    },

    loadTeachers: () => {
        const list = document.getElementById('teachers-list');
        const teachers = Store.data.teachers || [];

        if (teachers.length === 0) {
            list.innerHTML = `<li style="text-align:center; color:#888;">${t('no_teachers')}</li>`;
            return;
        }

        list.innerHTML = teachers.map(t => {
            return `
            <li>
                <div>
                    <strong>${UI.esc(t.name)}</strong><br>
                    <small>${UI.esc(t.phone)}</small>
                </div>
                <div>
                    <button style="background:#f39c12;" onclick="TeachersModule.editTeacher('${t.id}')" data-i18n="edit">Edit</button>
                    <button onclick="TeachersModule.deleteTeacher('${t.id}')" data-i18n="delete" style="background:#c0392b;">Delete</button>
                </div>
            </li>
        `}).join('');

        if (typeof updateUI === 'function') updateUI();
    },

    showAddForm: () => {
        document.getElementById('teacher-form-container').classList.remove('hidden');
        document.getElementById('teacher-id').value = '';
        document.getElementById('teacher-name').value = '';
        document.getElementById('teacher-phone').value = '';
        document.getElementById('teacher-form-title').setAttribute('data-i18n', 'add_teacher');
        if (typeof updateUI === 'function') updateUI();
    },

    cancelForm: () => {
        document.getElementById('teacher-form-container').classList.add('hidden');
    },

    saveTeacher: () => {
        const id = document.getElementById('teacher-id').value;
        const name = document.getElementById('teacher-name').value.trim();
        const phone = document.getElementById('teacher-phone').value.trim();

        if (!name) return UI.showToast(t('name_required'), 'error');

        const teacher = {
            id: id || 'TCH-' + Date.now(),
            name,
            phone
        };

        Store.data.teachers = Store.data.teachers || [];

        if (id) {
            const index = Store.data.teachers.findIndex(t => t.id === id);
            if (index !== -1) Store.data.teachers[index] = teacher;
        } else {
            Store.data.teachers.push(teacher);
        }

        Store.save();
        TeachersModule.cancelForm();
        TeachersModule.loadTeachers();
        
        // Update nav if Settings is open to reflect new teacher in select dropdown
        if (typeof SettingsModule !== 'undefined' && SettingsModule.updateNav) {
             SettingsModule.updateNav();
             SettingsModule.renderGroupsList();
        }
    },

    editTeacher: (id) => {
        TeachersModule.showAddForm();
        const teacher = Store.data.teachers.find(t => t.id === id);
        if (!teacher) return;

        document.getElementById('teacher-id').value = teacher.id;
        document.getElementById('teacher-name').value = teacher.name;
        document.getElementById('teacher-phone').value = teacher.phone || '';
        document.getElementById('teacher-form-title').setAttribute('data-i18n', 'edit_teacher');

        if (typeof updateUI === 'function') updateUI();
    },

    deleteTeacher: (id) => {
        if (!UI.confirm(t('confirm_delete_teacher'))) return;
        Store.data.teachers = Store.data.teachers.filter(t => t.id !== id);
        Store.save();
        TeachersModule.loadTeachers();
    },

    filterTeachers: () => {
        const query = document.getElementById('teacher-search').value.toLowerCase();
        const listItems = document.querySelectorAll('#teachers-list li');
        
        listItems.forEach(li => {
            let text = li.innerText.toLowerCase();
            let match = text.includes(query);
            li.style.display = match ? '' : 'none';
        });
    }
};
