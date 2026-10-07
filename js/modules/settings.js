// Settings Module
const SettingsModule = {
    editingStageId: null,
    editingSubjectId: null,
    editingGroupId: null,

    init: () => {
        SettingsModule.render();
    },

    render: () => {
        const container = document.getElementById('settings-container');
        if (!container) return;

        container.innerHTML = `
            <div class="card" style="border-left: 5px solid #3498db;">
                <h2 data-i18n="data_management">Data Management</h2>
                <div style="display:flex; gap:10px; align-items:center;">
                    <button class="btn" onclick="Store.exportData()" data-i18n="export_data">Export Data (JSON)</button>
                    
                    <label for="import-file" class="btn" style="background:#2ecc71; cursor:pointer;" data-i18n="import_data">Import Data</label>
                    <input type="file" id="import-file" style="display:none" onchange="SettingsModule.handleImport(this)">
                </div>
                <p style="margin-top:10px; color:#666; font-size:0.9em;" data-i18n="backup_warning">
                    Warning: Importing data will overwrite current data. Please export a backup first.
                </p>
            </div>

            <div class="card">
                <h2 data-i18n="stages">Educational Stages</h2>
                <div class="form-group">
                    <label data-i18n="stage_name">Stage Name</label>
                    <input type="text" id="stage-name" data-placeholder="stage_name">
                    <button class="btn" id="btn-save-stage" onclick="SettingsModule.saveStage()" data-i18n="add_stage">Add Stage</button>
                    <button class="btn" id="btn-cancel-stage" onclick="SettingsModule.cancelEditStage()" style="display:none; background:#7f8c8d;" data-i18n="cancel">Cancel</button>
                </div>
                <ul id="stages-list"></ul>
            </div>

            <div class="card">
                <h2 data-i18n="subjects">Subjects</h2>
                <div class="form-group">
                    <label data-i18n="stage">Stage</label>
                    <select id="subject-stage"></select>
                    <label data-i18n="subject_name">Subject Name</label>
                    <input type="text" id="subject-name" data-placeholder="subject_name">
                    <button class="btn" id="btn-save-subject" onclick="SettingsModule.saveSubject()" data-i18n="add_subject">Add Subject</button>
                    <button class="btn" id="btn-cancel-subject" onclick="SettingsModule.cancelEditSubject()" style="display:none; background:#7f8c8d;" data-i18n="cancel">Cancel</button>
                </div>
                <ul id="subjects-list"></ul>
            </div>

            <div class="card">
                <h2 data-i18n="groups">Groups</h2>
                <div class="form-group" style="padding:15px; border:1px solid #eee; margin-top:10px;">
                    <h3 data-i18n="add_group" id="header-add-group">Add Group</h3>
                    <label data-i18n="subject_name">Subject</label>
                    <select id="group-subject" onchange="SettingsModule.updateNav()"></select>
                    
                    <label data-i18n="teacher">Teacher</label>
                    <select id="group-teacher"></select>

                    <label data-i18n="group_name">Group Name</label>
                    <input type="text" id="group-name" data-placeholder="group_name">
                    
                    <div style="display:flex; gap:10px;">
                        <div style="flex:1;">
                            <label data-i18n="group_price">Group Price</label>
                            <input type="number" id="group-price" placeholder="0">
                        </div>
                        <div style="flex:1;">
                            <label data-i18n="teacher_percentage">Teacher Percentage (%)</label>
                            <input type="number" id="group-teacher-percentage" value="100">
                        </div>
                    </div>
                    
                    <div style="display:flex; gap:10px;">
                        <div style="flex:1;">
                            <label data-i18n="billing_type">Billing Type</label>
                            <select id="group-billing-type">
                                <option value="monthly" data-i18n="monthly">Monthly</option>
                                <option value="perSession" data-i18n="per_session">Per Session</option>
                            </select>
                        </div>
                        <div style="flex:1;">
                            <label data-i18n="sessions_cap">Sessions Cap (Month)</label>
                            <input type="number" id="group-sessions-cap" value="8" style="width:100%;">
                        </div>
                    </div>

                    <label data-i18n="group_days">Days</label>
                    <input type="text" id="group-days" data-placeholder="group_days">
                    <label data-i18n="group_time">Time</label>
                    <input type="time" id="group-time">
                    <label data-i18n="start_date">Start Date</label>
                    <input type="date" id="group-start-date">
                    <label data-i18n="max_capacity">Max Capacity</label>
                    <input type="number" id="group-capacity" value="20" style="width:100px;">
                    <br><br>
                    <button class="btn" id="btn-save-group" onclick="SettingsModule.saveGroup()" data-i18n="add_group">Add Group</button>
                    <button class="btn" id="btn-cancel-group" onclick="SettingsModule.cancelEditGroup()" style="display:none; background:#7f8c8d;" data-i18n="cancel">Cancel</button>
                </div>
                <ul id="groups-list"></ul>
            </div>
        `;

        SettingsModule.renderStagesList();
        SettingsModule.updateNav();
        SettingsModule.renderSubjectsList();
        SettingsModule.renderGroupsList();

        if (typeof updateUI === 'function') updateUI();
    },

    // --- STAGES ---
    saveStage: () => {
        const nameInput = document.getElementById('stage-name');
        const name = nameInput.value;
        if (!name) return UI.showToast(t('name_required'), 'error');

        if (SettingsModule.editingStageId) {
            const stage = Store.data.settings.stages.find(s => s.id === SettingsModule.editingStageId);
            if (stage) stage.name = name;
            SettingsModule.editingStageId = null;
            document.getElementById('btn-save-stage').setAttribute('data-i18n', 'add_stage');
            document.getElementById('btn-cancel-stage').style.display = 'none';
            if (typeof updateUI === 'function') updateUI();
        } else {
            const newStage = { id: Date.now(), name };
            Store.data.settings.stages.push(newStage);
        }

        Store.save();
        SettingsModule.renderStagesList();
        SettingsModule.updateNav();
        nameInput.value = '';
    },

    editStage: (id) => {
        const stage = Store.data.settings.stages.find(s => s.id === id);
        if (!stage) return;
        document.getElementById('stage-name').value = stage.name;
        SettingsModule.editingStageId = id;

        document.getElementById('btn-save-stage').setAttribute('data-i18n', 'save');

        document.getElementById('btn-cancel-stage').style.display = 'inline-block';
        if (typeof updateUI === 'function') updateUI();
    },

    cancelEditStage: () => {
        SettingsModule.editingStageId = null;
        document.getElementById('stage-name').value = '';
        document.getElementById('btn-save-stage').setAttribute('data-i18n', 'add_stage');
        document.getElementById('btn-cancel-stage').style.display = 'none';
        if (typeof updateUI === 'function') updateUI();
    },

    deleteStage: (id) => {
        if (!UI.confirm(t('confirm_delete_stage'))) return;
        Store.data.settings.stages = Store.data.settings.stages.filter(s => s.id !== id);
        Store.data.settings.subjects = Store.data.settings.subjects.filter(s => s.stageId !== id);
        Store.save();
        SettingsModule.renderStagesList();
        SettingsModule.updateNav();
    },

    renderStagesList: () => {
        const list = document.getElementById('stages-list');
        if (!list) return;
        list.innerHTML = (Store.data.settings.stages || []).map(s => `
            <li>
                <span>${UI.esc(s.name)}</span>
                <div>
                    <button style="background:#f39c12;" onclick="SettingsModule.editStage(${s.id})">✎</button>
                    <button onclick="SettingsModule.deleteStage(${s.id})">❌</button>
                </div>
            </li>
        `).join('');
    },

    // --- SUBJECTS ---
    saveSubject: () => {
        const stageId = document.getElementById('subject-stage').value;
        const name = document.getElementById('subject-name').value;

        if (!stageId || !name) return UI.showToast(t('all_fields_required'), 'error');

        if (SettingsModule.editingSubjectId) {
            const sub = Store.data.settings.subjects.find(s => s.id === SettingsModule.editingSubjectId);
            if (sub) {
                sub.stageId = parseInt(stageId);
                sub.name = name;
            }
            SettingsModule.editingSubjectId = null;
            document.getElementById('btn-save-subject').setAttribute('data-i18n', 'add_subject');
            document.getElementById('btn-cancel-subject').style.display = 'none';
        } else {
            const newSubject = {
                id: Date.now(),
                stageId: parseInt(stageId),
                name
            };
            Store.data.settings.subjects.push(newSubject);
        }

        Store.save();
        SettingsModule.renderSubjectsList();
        SettingsModule.updateNav();

        document.getElementById('subject-name').value = '';
        if (typeof updateUI === 'function') updateUI();
    },

    editSubject: (id) => {
        const sub = Store.data.settings.subjects.find(s => s.id === id);
        if (!sub) return;

        document.getElementById('subject-stage').value = sub.stageId;
        document.getElementById('subject-name').value = sub.name;

        SettingsModule.editingSubjectId = id;
        document.getElementById('btn-save-subject').setAttribute('data-i18n', 'save');
        document.getElementById('btn-cancel-subject').style.display = 'inline-block';
        if (typeof updateUI === 'function') updateUI();
    },

    cancelEditSubject: () => {
        SettingsModule.editingSubjectId = null;
        document.getElementById('subject-name').value = '';
        document.getElementById('btn-save-subject').setAttribute('data-i18n', 'add_subject');
        document.getElementById('btn-cancel-subject').style.display = 'none';
        if (typeof updateUI === 'function') updateUI();
    },

    deleteSubject: (id) => {
        if (!UI.confirm(t('confirm_delete_subject'))) return;
        Store.data.settings.subjects = Store.data.settings.subjects.filter(s => s.id !== id);
        Store.save();
        SettingsModule.renderSubjectsList();
        SettingsModule.updateNav();
    },

    renderSubjectsList: () => {
        const list = document.getElementById('subjects-list');
        if (!list) return;
        const stages = Store.data.settings.stages || [];

        list.innerHTML = (Store.data.settings.subjects || []).map(s => {
            const stage = stages.find(st => st.id === s.stageId);
            return `
            <li>
                <span><strong>${UI.esc(s.name)}</strong> <small style="color:#7f8c8d">(${stage ? UI.esc(stage.name) : t('unknown')})</small></span>
                <div>
                    <button style="background:#f39c12;" onclick="SettingsModule.editSubject(${s.id})">✎</button>
                    <button onclick="SettingsModule.deleteSubject(${s.id})">❌</button>
                </div>
            </li>
        `}).join('');
    },

    // --- GROUPS ---
    saveGroup: () => {
        const subjectId = document.getElementById('group-subject').value;
        const teacherId = document.getElementById('group-teacher').value;
        const name = document.getElementById('group-name').value;
        const price = document.getElementById('group-price').value;
        const teacherPercentage = document.getElementById('group-teacher-percentage').value;
        const days = document.getElementById('group-days').value;
        const time = document.getElementById('group-time').value;
        const startDate = document.getElementById('group-start-date').value;
        const maxCapacity = document.getElementById('group-capacity').value;
        const billingType = document.getElementById('group-billing-type').value;
        const sessionsCap = document.getElementById('group-sessions-cap').value;

        if (!subjectId || !name || !startDate) return UI.showToast(t('fill_required_fields'), 'error');

        if (SettingsModule.editingGroupId) {
            const grp = Store.data.settings.groups.find(g => g.id === SettingsModule.editingGroupId);
            if (grp) {
                grp.subjectId = parseInt(subjectId);
                grp.teacherId = teacherId;
                grp.name = name;
                grp.price = parseFloat(price) || 0;
                grp.teacherPercentage = parseFloat(teacherPercentage) || 100;
                grp.days = days;
                grp.time = time;
                grp.startDate = startDate;
                grp.maxCapacity = parseInt(maxCapacity);
                grp.billingType = billingType;
                grp.sessionsPerMonth = parseInt(sessionsCap);
            }
            SettingsModule.editingGroupId = null;
            document.getElementById('btn-save-group').setAttribute('data-i18n', 'add_group');
            document.getElementById('btn-cancel-group').style.display = 'none';
            document.getElementById('header-add-group').setAttribute('data-i18n', 'add_group');
        } else {
            Store.data.counters = Store.data.counters || { groups: 0 };
            Store.data.counters.groups++;

            const newGroup = {
                id: Store.data.counters.groups,
                code: `GRP${Store.data.counters.groups}`,
                subjectId: parseInt(subjectId),
                teacherId: teacherId,
                name,
                price: parseFloat(price) || 0,
                teacherPercentage: parseFloat(teacherPercentage) || 100,
                days,
                time,
                startDate,
                maxCapacity: parseInt(maxCapacity) || 20,
                billingType: billingType || 'monthly',
                sessionsPerMonth: parseInt(sessionsCap) || 8
            };
            Store.data.settings.groups.push(newGroup);
        }

        Store.save();
        SettingsModule.renderGroupsList();

        document.getElementById('group-name').value = '';
        document.getElementById('group-price').value = '';
        document.getElementById('group-teacher-percentage').value = '100';
        document.getElementById('group-days').value = '';
        document.getElementById('group-time').value = '';
        UI.showToast(t('group_saved'), 'success');
        if (typeof updateUI === 'function') updateUI();
    },

    editGroup: (id) => {
        const grp = Store.data.settings.groups.find(g => g.id === id);
        if (!grp) return;

        document.getElementById('group-subject').value = grp.subjectId;
        document.getElementById('group-teacher').value = grp.teacherId || '';
        document.getElementById('group-name').value = grp.name;
        document.getElementById('group-price').value = grp.price || 0;
        document.getElementById('group-teacher-percentage').value = grp.teacherPercentage || 100;
        document.getElementById('group-days').value = grp.days || '';
        document.getElementById('group-time').value = grp.time || '';
        document.getElementById('group-start-date').value = grp.startDate;
        document.getElementById('group-capacity').value = grp.maxCapacity || 20;
        document.getElementById('group-billing-type').value = grp.billingType || 'monthly';
        document.getElementById('group-sessions-cap').value = grp.sessionsPerMonth || 8;

        SettingsModule.editingGroupId = id;
        document.getElementById('btn-save-group').setAttribute('data-i18n', 'save');
        document.getElementById('header-add-group').setAttribute('data-i18n', 'edit_group');
        document.getElementById('btn-cancel-group').style.display = 'inline-block';

        document.getElementById('group-subject').scrollIntoView({ behavior: 'smooth' });

        if (typeof updateUI === 'function') updateUI();
    },

    cancelEditGroup: () => {
        SettingsModule.editingGroupId = null;
        document.getElementById('group-name').value = '';
        document.getElementById('group-price').value = '';
        document.getElementById('group-teacher-percentage').value = '100';
        document.getElementById('group-days').value = '';
        document.getElementById('group-time').value = '';
        document.getElementById('group-billing-type').value = 'monthly'; // Reset to default
        document.getElementById('group-sessions-cap').value = 8; // Reset to default
        document.getElementById('btn-save-group').setAttribute('data-i18n', 'add_group');
        document.getElementById('header-add-group').setAttribute('data-i18n', 'add_group');
        document.getElementById('btn-cancel-group').style.display = 'none';
        if (typeof updateUI === 'function') updateUI();
    },

    deleteGroup: (id) => {
        if (!UI.confirm(t('confirm_delete_group'))) return;
        Store.data.settings.groups = Store.data.settings.groups.filter(g => g.id !== id);
        Store.save();
        SettingsModule.renderGroupsList();
    },

    renderGroupsList: () => {
        const list = document.getElementById('groups-list');
        if (!list) return;

        const groups = Store.data.settings.groups || [];
        const subjects = Store.data.settings.subjects || [];
        const stages = Store.data.settings.stages || [];
        const students = Store.data.students || [];

        list.innerHTML = groups.map(g => {
            const subject = subjects.find(s => s.id === g.subjectId);
            const enrolledCount = students.filter(s =>
                s.enrollments && s.enrollments.some(e => e.groupId === g.id)
            ).length;

            return `
            <li>
                <span>
                    <strong>[${UI.esc(g.code || g.id)}] ${UI.esc(g.name)}</strong>
                    <small style="color:#7f8c8d">(${subject ? UI.esc(subject.name) : t('unknown')}${subject && stages.find(s => s.id === subject.stageId) ? ' - ' + UI.esc(stages.find(s => s.id === subject.stageId).name) : ''})</small>
                    <br>
                    <small>💰 ${t('group_price')}: ${g.price || 0} | 👩‍🏫 ${t('teacher_percentage')}: ${g.teacherPercentage || 100}%</small>
                    <br>
                    <small>📅 ${UI.esc(g.days || '-')} ⏰ ${UI.esc(g.time || '-')} | 🎬 ${UI.esc(g.startDate || t('no_date'))}</small>
                    <br>
                    <small>👥 ${t('enrolled_label')}: ${enrolledCount} / ${g.maxCapacity || '∞'}</small>
                </span>
                <div>
                    <button style="background:#f39c12;" onclick="SettingsModule.editGroup(${g.id})">✎</button>
                    <button onclick="SettingsModule.deleteGroup(${g.id})">❌</button>
                </div>
            </li>
        `}).join('');
    },

    updateNav: () => {
        const stageSelect = document.getElementById('subject-stage');
        const stages = Store.data.settings.stages || [];
        if (stageSelect) {
            const current = stageSelect.value;
            stageSelect.innerHTML = `<option value="">${t('select_stage')}</option>` +
                stages.map(s => `<option value="${s.id}">${UI.esc(s.name)}</option>`).join('');
            if (current) stageSelect.value = current;
        }

        const groupSubjectSelect = document.getElementById('group-subject');
        if (groupSubjectSelect) {
            const subjects = Store.data.settings.subjects || [];
            const current = groupSubjectSelect.value;
            groupSubjectSelect.innerHTML = `<option value="">${t('select_subject')}</option>` +
                subjects.map(s => {
                    const st = stages.find(stage => stage.id === s.stageId);
                    const stageName = st ? st.name : t('no_stage');
                    return `<option value="${s.id}">${UI.esc(s.name)} (${UI.esc(stageName)})</option>`;
                }).join('');
            if (current) groupSubjectSelect.value = current;
        }

        const groupTeacherSelect = document.getElementById('group-teacher');
        if (groupTeacherSelect) {
            const teachers = Store.data.teachers || [];
            const currentT = groupTeacherSelect.value;
            groupTeacherSelect.innerHTML = `<option value="">${t('select_teacher')}</option>` +
                teachers.map(tc => `<option value="${tc.id}">${UI.esc(tc.name)}</option>`).join('');
            if (currentT) groupTeacherSelect.value = currentT;
        }
    },

    handleImport: (input) => {
        const file = input.files[0];
        if (!file) return;

        if (!UI.confirm(t('confirm_replace_data'))) {
            input.value = '';
            return;
        }

        Store.importData(file)
            .then(() => {
                UI.showToast(t('import_success'), 'success');
                // Reload needs the real (imported) data on next load, but give the
                // toast a moment to actually be seen before the page navigates away.
                setTimeout(() => location.reload(), 1200);
            })
            .catch(err => {
                UI.showToast(t('import_error') + err.message, 'error');
            });
    }
};
