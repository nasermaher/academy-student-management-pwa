// Attendance Module
const AttendanceModule = {
    init: () => {
        console.log('Attendance Module Loaded');
        AttendanceModule.render();
    },

    state: {
        selectedGroupId: null,
        selectedDate: new Date().toISOString().split('T')[0]
    },

    render: () => {
        const container = document.getElementById('attendance-container');
        if (!container) return;

        const groups = Store.data.settings.groups || [];

        container.innerHTML = `
            <div class="card">
                <h2 data-i18n="daily_attendance">Daily Attendance</h2>
                <div class="form-group" style="display:flex; gap:10px; flex-wrap:wrap; align-items:flex-end;">
                    <div style="flex:1; min-width:200px;">
                        <label data-i18n="select_group">Select Group</label>
                        <select id="attendance-group-select" onchange="AttendanceModule.onGroupChange()">
                            <option value="">-- Choose Group --</option>
                            ${groups.map(g => `<option value="${g.id}">[${UI.esc(g.code)}] ${UI.esc(g.name)}</option>`).join('')}
                        </select>
                    </div>
                    
                    <div style="flex:1; min-width:200px;">
                        <label data-i18n="date">Date</label>
                        <input type="date" id="attendance-date" value="${AttendanceModule.state.selectedDate}" onchange="AttendanceModule.onDateChange()">
                    </div>

                    <button class="btn" onclick="AttendanceModule.saveAttendance()" style="height:40px;" data-i18n="save_attendance">Save Attendance</button>
                    <button class="btn" onclick="AttendanceModule.markAll(true)" style="height:40px; background:#2ecc71;" data-i18n="mark_all">Select All</button>
                </div>
            </div>

            <div id="attendance-list-container" class="card hidden">
                <h3 id="attendance-group-title"></h3>
                <ul id="attendance-student-list" style="list-style:none; padding:0;"></ul>
            </div>
        `;

        if (AttendanceModule.state.selectedGroupId) {
            document.getElementById('attendance-group-select').value = AttendanceModule.state.selectedGroupId;
            AttendanceModule.loadStudents();
        }

        if (typeof updateUI === 'function') updateUI();
    },

    onGroupChange: () => {
        AttendanceModule.state.selectedGroupId = document.getElementById('attendance-group-select').value;
        AttendanceModule.loadStudents();
    },

    onDateChange: () => {
        AttendanceModule.state.selectedDate = document.getElementById('attendance-date').value;
        AttendanceModule.loadStudents(); // Reload status for new date
    },

    loadStudents: () => {
        const groupId = AttendanceModule.state.selectedGroupId;
        const date = AttendanceModule.state.selectedDate;
        const container = document.getElementById('attendance-list-container');
        const list = document.getElementById('attendance-student-list');
        const title = document.getElementById('attendance-group-title');

        if (!groupId) {
            container.classList.add('hidden');
            return;
        }

        const group = Store.data.settings.groups.find(g => g.id == groupId);
        if (group) title.innerText = `${group.name} - ${date}`;

        // Find students enrolled in this group
        const students = (Store.data.students || []).filter(s =>
            s.enrollments && s.enrollments.some(e => e.groupId == groupId)
        );

        if (students.length === 0) {
            list.innerHTML = `<li style="padding:10px; color:#7f8c8d;">${t('no_students_in_group')}</li>`;
        } else {
            list.innerHTML = students.map(s => {
                // Check if already attended on this date
                const isPresent = s.attendance && s.attendance.some(a => a.groupId == groupId && a.date === date && a.status === 'present');

                return `
                <li style="display:flex; align-items:center; justify-content:space-between; padding:10px; border-bottom:1px solid #eee; background:${isPresent ? '#e8f8f5' : 'white'};">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <input type="checkbox" class="attendance-check" data-id="${s.id}" ${isPresent ? 'checked' : ''} style="width:20px; height:20px; cursor:pointer;">
                        <span style="font-size:1.1em; ${isPresent ? 'font-weight:bold; color:#27ae60;' : ''}">${UI.esc(s.name)}</span>
                        <small style="color:#95a5a6;">(${UI.esc(s.phone)})</small>
                    </div>
                </li>
            `}).join('');
        }

        container.classList.remove('hidden');
    },

    markAll: (checked) => {
        const checkboxes = document.querySelectorAll('.attendance-check');
        checkboxes.forEach(cb => cb.checked = checked);
    },

    saveAttendance: () => {
        const groupId = AttendanceModule.state.selectedGroupId;
        const date = AttendanceModule.state.selectedDate;

        if (!groupId || !date) return UI.showToast(t('select_group_and_date'), 'error');

        const checkboxes = document.querySelectorAll('.attendance-check');
        let count = 0;

        checkboxes.forEach(cb => {
            const studentId = cb.dataset.id;
            const isPresent = cb.checked;

            const student = Store.data.students.find(s => s.id == studentId);
            if (student) {
                if (!student.attendance) student.attendance = [];

                // Remove existing record for this day/group if any
                student.attendance = student.attendance.filter(a => !(a.groupId == groupId && a.date === date));

                // Add new record if present
                if (isPresent) {
                    student.attendance.push({
                        groupId: parseInt(groupId),
                        date: date,
                        status: 'present'
                    });
                    count++;
                }
            }
        });

        Store.save();
        UI.showToast(t('attendance_saved').replace('%s', count), 'success');
        AttendanceModule.loadStudents(); // Re-render to show visual feedback
    }
};
