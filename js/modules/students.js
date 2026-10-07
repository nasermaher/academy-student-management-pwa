// Students Module
const StudentsModule = {
    init: () => {
        console.log('Students Module Loaded');
        StudentsModule.render();
    },

    render: () => {
        const container = document.getElementById('students-container');
        if (!container) return;

        container.innerHTML = `
            <div class="card">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <h2 data-i18n="student_list">Student List</h2>
                    <button class="btn" onclick="StudentsModule.showAddForm()" data-i18n="add_student">Add Student</button>
                </div>
                <div class="form-group">
                    <input type="text" id="student-search" data-placeholder="search" onkeyup="StudentsModule.filterStudents()">
                </div>
                <ul id="students-list"></ul>
            </div>

            <!-- Modal or Hidden Form for Adding/Editing -->
            <div id="student-form-container" class="card hidden">
                <h2 id="form-title" data-i18n="add_student">Add Student</h2>
                <input type="hidden" id="student-id">
                
                <div class="form-group">
                    <label data-i18n="student_name">Student Name</label>
                    <input type="text" id="student-name">
                </div>

                <div class="form-group">
                    <label data-i18n="phone">Phone</label>
                    <input type="text" id="student-phone">
                </div>

                <div class="form-group">
                    <label data-i18n="stage">Stage</label>
                    <select id="student-stage" onchange="StudentsModule.onStageChange()"></select>
                </div>

                <div id="enrollment-section" class="form-group hidden">
                    <label data-i18n="enrollments">Enrollments</label>
                    <div id="subjects-container" style="display:flex; flex-direction:column; gap:10px;"></div>
                </div>

                <div style="margin-top:20px;">
                    <button class="btn" onclick="StudentsModule.saveStudent()" data-i18n="save">Save</button>
                    <button class="btn" style="background:#95a5a6;" onclick="StudentsModule.cancelForm()" data-i18n="cancel">Cancel</button>
                </div>
            </div>
        `;

        if (typeof updateUI === 'function') updateUI();
        StudentsModule.loadStudents();
    },

    loadStudents: () => {
        const list = document.getElementById('students-list');
        const students = Store.data.students || [];
        const stages = Store.data.settings.stages || [];

        if (students.length === 0) {
            list.innerHTML = '<li style="text-align:center; color:#888;" data-i18n="no_students">No students found</li>';
            if (typeof updateUI === 'function') updateUI(); // to translate no_students
            return;
        }

        list.innerHTML = students.map(s => {
            const stage = stages.find(st => st.id === s.stageId);
            return `
            <li>
                <div>
                    <strong>${UI.esc(s.name)}</strong> (${stage ? UI.esc(stage.name) : t('unknown')})<br>
                    <small>${UI.esc(s.phone)}</small>
                </div>
                <div>
                    <button onclick="StudentsModule.editStudent('${s.id}')" data-i18n="edit">Edit</button>
                    <button onclick="StudentsModule.deleteStudent('${s.id}')" data-i18n="delete" style="background:#c0392b;">Delete</button>
                </div>
            </li>
        `}).join('');

        if (typeof updateUI === 'function') updateUI();
    },

    showAddForm: () => {
        document.getElementById('student-form-container').classList.remove('hidden');
        document.getElementById('student-id').value = '';
        document.getElementById('student-name').value = '';
        document.getElementById('student-phone').value = '';
        document.getElementById('form-title').setAttribute('data-i18n', 'add_student');

        // Assigning .onblur (not addEventListener) so repeated showAddForm() calls
        // replace the handler instead of stacking duplicate listeners.
        const phoneInput = document.getElementById('student-phone');
        phoneInput.onblur = (e) => StudentsModule.checkSibling(e.target.value);

        // Populate stages
        const stageSelect = document.getElementById('student-stage');
        const stages = Store.data.settings.stages || [];
        stageSelect.innerHTML = `<option value="">${t('select_stage')}</option>` +
            stages.map(s => `<option value="${s.id}">${UI.esc(s.name)}</option>`).join('');

        document.getElementById('enrollment-section').classList.add('hidden');
        if (typeof updateUI === 'function') updateUI();
    },

    cancelForm: () => {
        document.getElementById('student-form-container').classList.add('hidden');
    },

    onStageChange: () => {
        const stageId = document.getElementById('student-stage').value;
        const container = document.getElementById('subjects-container');
        const section = document.getElementById('enrollment-section');

        if (!stageId) {
            section.classList.add('hidden');
            return;
        }

        section.classList.remove('hidden');

        // Get subjects for this stage
        const subjects = (Store.data.settings.subjects || []).filter(s => s.stageId == stageId);
        const groups = Store.data.settings.groups || [];

        container.innerHTML = subjects.map(sub => {
            // Find groups for this subject
            const subGroups = groups.filter(g => g.subjectId == sub.id);
            const options = subGroups.map(g => `<option value="${g.id}">${UI.esc(g.name)} (${UI.esc(g.days)} ${UI.esc(g.time)})</option>`).join('');

            return `
            <div class="card" style="padding:10px; background:#f0f3f4; margin:0;">
                <div style="font-weight:bold; margin-bottom:5px;">${UI.esc(sub.name)} (${sub.price})</div>
                <div style="display:flex; gap:10px; align-items:center;">
                    <select id="enroll-group-${sub.id}" class="group-select" style="flex:1;">
                        <option value="">${t('not_enrolled')}</option>
                        ${options}
                    </select>
                    <input type="date" id="enroll-date-${sub.id}" value="${new Date().toISOString().split('T')[0]}" style="width:140px;">
                </div>
            </div>
            `;
        }).join('');
    },

    saveStudent: () => {
        const id = document.getElementById('student-id').value;
        const name = document.getElementById('student-name').value.trim();
        const phone = document.getElementById('student-phone').value.trim();
        const stageId = document.getElementById('student-stage').value;

        if (!name || !stageId) return UI.showToast(t('name_and_stage_required'), 'error');

        // Gather Enrollments
        const enrollments = [];
        const subjects = (Store.data.settings.subjects || []).filter(s => s.stageId == stageId);

        subjects.forEach(sub => {
            const groupId = document.getElementById(`enroll-group-${sub.id}`).value;
            const enrollDate = document.getElementById(`enroll-date-${sub.id}`).value;

            if (groupId) {
                enrollments.push({
                    subjectId: sub.id,
                    groupId: parseInt(groupId),
                    enrollmentDate: enrollDate
                });
            }
        });

        const student = {
            id: id || 'ST-' + Date.now(),
            name,
            phone,
            stageId: parseInt(stageId),
            enrollments
        };

        Store.data.students = Store.data.students || [];

        if (id) {
            const index = Store.data.students.findIndex(s => s.id === id);
            if (index !== -1) Store.data.students[index] = student;
        } else {
            Store.data.students.push(student);
        }

        Store.save();
        StudentsModule.cancelForm();
        StudentsModule.loadStudents();
    },

    editStudent: (id) => {
        StudentsModule.showAddForm();
        const student = Store.data.students.find(s => s.id === id);
        if (!student) return;

        document.getElementById('student-id').value = student.id;
        document.getElementById('student-name').value = student.name;
        document.getElementById('student-phone').value = student.phone || '';
        document.getElementById('student-stage').value = student.stageId;
        document.getElementById('form-title').setAttribute('data-i18n', 'edit_student');

        // Trigger stage change to render enrollments
        StudentsModule.onStageChange();

        // Restore enrollments
        student.enrollments.forEach(enr => {
            const groupSelect = document.getElementById(`enroll-group-${enr.subjectId}`);
            const dateInput = document.getElementById(`enroll-date-${enr.subjectId}`);

            if (groupSelect) groupSelect.value = enr.groupId;
            if (dateInput) dateInput.value = enr.enrollmentDate;
        });

        if (typeof updateUI === 'function') updateUI();
    },

    deleteStudent: (id) => {
        if (!UI.confirm(t('confirm_delete_student'))) return;
        Store.data.students = Store.data.students.filter(s => s.id !== id);
        Store.save();
        StudentsModule.loadStudents();
    },

    checkSibling: (phone) => {
        if (!phone || phone.length < 5) return;

        // Find existing student with this phone
        const existing = Store.data.students.find(s => s.phone === phone && s.id !== document.getElementById('student-id').value);

        if (existing) {
            const message = t('confirm_sibling').replace('%s', existing.name);
            if (UI.confirm(message)) {
                UI.showToast(t('phone_matches_family'), 'info');
            }
        }
    },

    filterStudents: () => {
        const query = document.getElementById('student-search').value.toLowerCase();
        const listItems = document.querySelectorAll('#students-list li');

        // Each list item's text includes the student's phone, so filtering by a
        // phone number also surfaces siblings registered under the same number.
        listItems.forEach(li => {
            const match = li.innerText.toLowerCase().includes(query);
            li.style.display = match ? '' : 'none';
        });
    }
};
