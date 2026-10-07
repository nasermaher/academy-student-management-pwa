// Finance Module
const FinanceModule = {
    init: () => {
        console.log('Finance Module Loaded');
        FinanceModule.render();
    },

    state: {
        activeTab: 'student_transaction', // or 'general_reports'
        currentStudentId: null
    },

    render: () => {
        const container = document.getElementById('finance-container');
        if (!container) return;

        container.innerHTML = `
            <div class="tabs">
                <button class="tab-btn ${FinanceModule.state.activeTab === 'student_transaction' ? 'active' : ''}" 
                    onclick="FinanceModule.switchTab('student_transaction')" data-i18n="student_transaction">Student Transaction</button>
                <button class="tab-btn ${FinanceModule.state.activeTab === 'teacher_transaction' ? 'active' : ''}" 
                    onclick="FinanceModule.switchTab('teacher_transaction')" data-i18n="teacher_transaction">Teacher Transaction</button>
                <button class="tab-btn ${FinanceModule.state.activeTab === 'general_reports' ? 'active' : ''}" 
                    onclick="FinanceModule.switchTab('general_reports')" data-i18n="general_reports">General Reports</button>
            </div>

            <!-- TAB 1: Student Transactions -->
            <div id="tab-student_transaction" class="${FinanceModule.state.activeTab === 'student_transaction' ? '' : 'hidden'}">
                <div class="card">
                    <h2 data-i18n="financial_reports">Financial Reports</h2>
                    <div class="form-group">
                        <label data-i18n="select_student">Select Student</label>
                        <input type="text" id="finance-student-search" data-placeholder="search_student_name" onkeyup="FinanceModule.searchStudent()">
                        <div id="finance-student-results" style="border:1px solid #ddd; display:none; max-height:150px; overflow-y:auto;"></div>
                    </div>
                </div>

                <div id="finance-details" class="hidden">
                    <!-- Summary Card -->
                    <div class="card" style="background:#e8f8f5;">
                        <h3 id="finance-student-name"></h3>
                        <div style="display:flex; gap:20px; margin-top:10px;">
                            <div><strong data-i18n="total_due">Total Due:</strong> <span id="total-due">0</span></div>
                            <div><strong data-i18n="total_paid">Total Paid:</strong> <span id="total-paid">0</span></div>
                            <div><strong data-i18n="arrears">Arrears:</strong> <span id="arrears" style="color:red; font-weight:bold;">0</span></div>
                        </div>
                    </div>

                    <!-- Payment Form -->
                    <div class="card">
                        <h3 data-i18n="add_payment">Add Payment</h3>
                        <div class="form-group">
                            <select id="payment-group-select">
                                <option value="" data-i18n="general_payment">General Payment</option>
                            </select>
                            <input type="number" id="payment-amount" data-placeholder="amount">
                            <input type="date" id="payment-date" value="${new Date().toISOString().split('T')[0]}">
                            <input type="text" id="payment-note" data-placeholder="note_optional">
                            <button class="btn" onclick="FinanceModule.addPayment()" data-i18n="save_payment">Save Payment</button>
                        </div>
                    </div>

                    <!-- Transaction History -->
                    <div class="card">
                        <h3 data-i18n="transaction_history">Transaction History</h3>
                        <ul id="transaction-list"></ul>
                    </div>

                    <!-- Detailed Fee Breakdown -->
                    <div class="card">
                        <h3 data-i18n="fee_breakdown">Fee Breakdown (Monthly Dues)</h3>
                        <ul id="fee-breakdown-list" style="font-size:0.9em; color:#555;"></ul>
                    </div>
                </div>
            </div>

            <!-- TAB: Teacher Transactions -->
            <div id="tab-teacher_transaction" class="${FinanceModule.state.activeTab === 'teacher_transaction' ? '' : 'hidden'}">
                <div class="card">
                    <h2 data-i18n="teacher_transaction">Teacher Transaction</h2>
                    <div class="form-group">
                        <label data-i18n="teacher">Select Teacher</label>
                        <input type="text" id="finance-teacher-search" data-placeholder="search_teacher_name" onkeyup="FinanceModule.searchTeacher()">
                        <div id="finance-teacher-results" style="border:1px solid #ddd; display:none; max-height:150px; overflow-y:auto;"></div>
                    </div>
                </div>

                <div id="finance-teacher-details" class="hidden">
                    <div class="card" style="background:#f9f3e8;">
                        <h3 id="finance-teacher-name"></h3>
                        <div style="display:flex; gap:20px; margin-top:10px;">
                            <div><strong data-i18n="total_due">Total Due:</strong> <span id="teacher-total-due">0</span></div>
                            <div><strong data-i18n="total_paid">Total Paid:</strong> <span id="teacher-total-paid">0</span></div>
                            <div><strong data-i18n="arrears">Balance (Arrears):</strong> <span id="teacher-arrears" style="color:red; font-weight:bold;">0</span></div>
                        </div>
                    </div>

                    <div class="card">
                        <h3 data-i18n="add_payment">Add Payment</h3>
                        <div class="form-group">
                            <input type="number" id="teacher-payment-amount" data-placeholder="amount">
                            <input type="date" id="teacher-payment-date" value="${new Date().toISOString().split('T')[0]}">
                            <input type="text" id="teacher-payment-note" data-placeholder="note_optional">
                            <button class="btn" onclick="FinanceModule.addTeacherPayment()" data-i18n="save_payment">Save Payment</button>
                        </div>
                    </div>

                    <div class="card">
                        <h3 data-i18n="transaction_history">Transaction History</h3>
                        <ul id="teacher-transaction-list"></ul>
                    </div>

                    <div class="card">
                        <h3 data-i18n="fee_breakdown">Fee Breakdown</h3>
                        <ul id="teacher-fee-breakdown-list" style="font-size:0.9em; color:#555;"></ul>
                    </div>
                </div>
            </div>

            <!-- TAB 2: General Reports -->
            <div id="tab-general_reports" class="${FinanceModule.state.activeTab === 'general_reports' ? '' : 'hidden'}">
                <div class="card">
                    <h2 data-i18n="general_reports">General Reports</h2>
                    <div class="form-group" style="display:flex; gap:10px; flex-wrap:wrap;">
                        <select id="report-filter-stage" onchange="FinanceModule.updateReportFilters()"></select>
                        <select id="report-filter-subject" onchange="FinanceModule.updateReportFilters()"></select>
                        <select id="report-filter-group"></select>
                        <button class="btn" onclick="FinanceModule.generateReport()" data-i18n="generate_report">Generate Report</button>
                    </div>
                </div>

                <div id="report-results" class="card hidden">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <h3 data-i18n="report_results">Report Results</h3>
                        <button class="btn" onclick="window.print()" data-i18n="print_report">Print Report</button>
                    </div>
                    <table style="width:100%; border-collapse:collapse; margin-top:10px;" border="1">
                        <thead>
                            <tr style="background:#f2f2f2;">
                                <th data-i18n="student_name">Name</th>
                                <th data-i18n="phone">Phone</th>
                                <th data-i18n="total_due">Due</th>
                                <th data-i18n="total_paid">Paid</th>
                                <th data-i18n="arrears">Arrears</th>
                            </tr>
                        </thead>
                        <tbody id="report-table-body"></tbody>
                        <tfoot id="report-table-foot" style="font-weight:bold; background:#eee;"></tfoot>
                    </table>
                </div>
            </div>
        `;

        if (FinanceModule.state.activeTab === 'student_transaction' && FinanceModule.state.currentStudentId) {
            FinanceModule.selectStudent(FinanceModule.state.currentStudentId, document.getElementById('finance-student-search').value);
        } else if (FinanceModule.state.activeTab === 'teacher_transaction' && FinanceModule.state.currentTeacherId) {
            FinanceModule.selectTeacher(FinanceModule.state.currentTeacherId, document.getElementById('finance-teacher-search').value);
        } else if (FinanceModule.state.activeTab === 'general_reports') {
            FinanceModule.initReportFilters();
        }

        if (typeof updateUI === 'function') updateUI();
    },

    switchTab: (tabName) => {
        FinanceModule.state.activeTab = tabName;
        FinanceModule.render();
    },

    // --- Student Transaction Logic ---

    searchStudent: () => {
        const query = document.getElementById('finance-student-search').value.toLowerCase();
        const resultsDiv = document.getElementById('finance-student-results');

        if (query.length < 2) {
            resultsDiv.style.display = 'none';
            return;
        }

        const students = Store.data.students || [];
        const matches = students.filter(s => s.name.toLowerCase().includes(query));

        resultsDiv.innerHTML = matches.map(s => `
            <div style="padding:8px; cursor:pointer; border-bottom:1px solid #eee; background:white;" 
                 data-name="${UI.esc(s.name)}"
                 onclick="FinanceModule.selectStudent('${s.id}', this.dataset.name)">
                ${UI.esc(s.name)} (${UI.esc(s.phone)})
            </div>
        `).join('');
        resultsDiv.style.display = 'block';
    },

    selectStudent: (id, name) => {
        FinanceModule.state.currentStudentId = id;
        const searchInput = document.getElementById('finance-student-search');
        if (searchInput) searchInput.value = name; // Restore name if re-rendering

        const resultsDiv = document.getElementById('finance-student-results');
        if (resultsDiv) resultsDiv.style.display = 'none';

        const detailsDiv = document.getElementById('finance-details');
        if (detailsDiv) detailsDiv.classList.remove('hidden');

        const nameHeader = document.getElementById('finance-student-name');
        if (nameHeader) nameHeader.textContent = name;

        FinanceModule.loadStudentFinance(id);
    },

    loadStudentFinance: (studentId) => {
        const student = Store.data.students.find(s => s.id === studentId);
        if (!student) return;

        const dues = FinanceModule.calculateDues(student);

        const payments = (Store.data.finance || []).filter(t => t.studentId === studentId);
        const totalPaid = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
        const totalDue = dues.total;

        document.getElementById('total-due').textContent = totalDue.toFixed(2);
        document.getElementById('total-paid').textContent = totalPaid.toFixed(2);
        const arrears = totalDue - totalPaid;
        const arrearsEl = document.getElementById('arrears');
        arrearsEl.textContent = arrears.toFixed(2);
        arrearsEl.style.color = arrears > 0 ? 'red' : 'green';

        const transList = document.getElementById('transaction-list');
        transList.innerHTML = payments.map(p => `
            <li>
                <span>${UI.esc(p.date)}: ${UI.esc(p.note || t('payment_label'))}</span>
                <span style="color:green; font-weight:bold;">+${p.amount}</span>
            </li>
        `).join('');

        const breakdownList = document.getElementById('fee-breakdown-list');
        breakdownList.innerHTML = dues.breakdown.map(item => `
            <li>
                <span>${item.month} (${UI.esc(item.groupName)})</span>
                <span>${item.amount}</span>
            </li>
        `).join('');

        const groupSelect = document.getElementById('payment-group-select');
        const groups = Store.data.settings.groups || [];
        const subjects = Store.data.settings.subjects || [];

        const studentGroups = student.enrollments.map(enr => {
            const grp = groups.find(g => g.id === enr.groupId);
            const sub = subjects.find(s => s.id === enr.subjectId);
            return { id: grp?.id, name: `${sub?.name} - ${grp?.name}` };
        });

        groupSelect.innerHTML = `<option value="">${t('general_payment')}</option>` +
            studentGroups.map(g => `<option value="${g.id}">${UI.esc(g.name)}</option>`).join('');
    },

    calculateDues: (student) => {
        let total = 0;
        const breakdown = [];
        const groups = Store.data.settings.groups || [];
        const subjects = Store.data.settings.subjects || [];

        // Attendance grouped by month and group: { "2023-10": { groupId: count } }
        const attendanceMap = {};

        const attendance = student.attendance || [];

        attendance.forEach(record => {
            if (record.status !== 'present') return;

            const month = record.date.substring(0, 7); // YYYY-MM-DD -> YYYY-MM

            if (!attendanceMap[month]) attendanceMap[month] = {};
            if (!attendanceMap[month][record.groupId]) attendanceMap[month][record.groupId] = 0;

            attendanceMap[month][record.groupId]++;
        });

        Object.keys(attendanceMap).sort().forEach(month => {
            const groupCounts = attendanceMap[month];

            Object.keys(groupCounts).forEach(groupId => {
                const count = groupCounts[groupId];
                const group = groups.find(g => g.id == groupId);
                if (!group) return; // Group may have been deleted since this attendance was recorded

                const subject = subjects.find(s => s.id == group.subjectId);
                if (!subject) return;

                const price = parseFloat(group.price) || 0;
                const billingType = group.billingType || 'monthly';
                const cap = group.sessionsPerMonth || 8; // Default cap

                let amount = 0;
                let note = '';

                if (billingType === 'monthly') {
                    // Flat monthly fee once the student has attended at least one session.
                    if (count > 0) {
                        amount = price;
                        note = t('monthly_fee');
                    }
                } else if (billingType === 'perSession') {
                    // Per-session billing: price x sessions attended, capped at
                    // group.sessionsPerMonth (attending more than the cap in a
                    // month doesn't cost extra).
                    const effectiveCount = (group.sessionsPerMonth && count > group.sessionsPerMonth)
                        ? group.sessionsPerMonth
                        : count;

                    amount = effectiveCount * price;
                    note = `${count} ${t('sessions_label')} (${effectiveCount} ${t('charged_label')})`;
                }

                if (amount > 0) {
                    breakdown.push({
                        month: month,
                        groupName: `${group.name} (${note})`,
                        amount: amount
                    });
                    total += amount;
                }
            });
        });

        return { total, breakdown };
    },

    addPayment: () => {
        if (!FinanceModule.state.currentStudentId) return;

        const amount = parseFloat(document.getElementById('payment-amount').value);
        const date = document.getElementById('payment-date').value;
        const note = document.getElementById('payment-note').value;
        const groupId = document.getElementById('payment-group-select').value;

        if (!amount || amount <= 0) return UI.showToast(t('invalid_amount'), 'error');

        const transaction = {
            id: 'TRX-' + Date.now(),
            studentId: FinanceModule.state.currentStudentId,
            amount: amount,
            date: date,
            note: note,
            type: 'payment',
            groupId: groupId ? parseInt(groupId) : null
        };

        Store.data.finance = Store.data.finance || [];
        Store.data.finance.push(transaction);
        Store.save();

        document.getElementById('payment-amount').value = '';
        document.getElementById('payment-note').value = '';
        FinanceModule.loadStudentFinance(FinanceModule.state.currentStudentId);
    },

    // --- Teacher Transaction Logic ---

    searchTeacher: () => {
        const query = document.getElementById('finance-teacher-search').value.toLowerCase();
        const resultsDiv = document.getElementById('finance-teacher-results');

        if (query.length < 2) {
            resultsDiv.style.display = 'none';
            return;
        }

        const teachers = Store.data.teachers || [];
        const matches = teachers.filter(t => t.name.toLowerCase().includes(query));

        resultsDiv.innerHTML = matches.map(t => `
            <div style="padding:8px; cursor:pointer; border-bottom:1px solid #eee; background:white;" 
                 data-name="${UI.esc(t.name)}"
                 onclick="FinanceModule.selectTeacher('${t.id}', this.dataset.name)">
                ${UI.esc(t.name)} (${UI.esc(t.phone)})
            </div>
        `).join('');
        resultsDiv.style.display = 'block';
    },

    selectTeacher: (id, name) => {
        FinanceModule.state.currentTeacherId = id;
        const searchInput = document.getElementById('finance-teacher-search');
        if (searchInput) searchInput.value = name;

        const resultsDiv = document.getElementById('finance-teacher-results');
        if (resultsDiv) resultsDiv.style.display = 'none';

        const detailsDiv = document.getElementById('finance-teacher-details');
        if (detailsDiv) detailsDiv.classList.remove('hidden');

        const nameHeader = document.getElementById('finance-teacher-name');
        if (nameHeader) nameHeader.textContent = name;

        FinanceModule.loadTeacherFinance(id);
    },

    loadTeacherFinance: (teacherId) => {
        const teacher = Store.data.teachers.find(t => t.id === teacherId);
        if (!teacher) return;

        const dues = FinanceModule.calculateTeacherDues(teacherId);

        const payments = (Store.data.finance || []).filter(t => t.teacherId === teacherId && t.type === 'teacher_payment');
        const totalPaid = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
        const totalDue = dues.total;

        document.getElementById('teacher-total-due').textContent = totalDue.toFixed(2);
        document.getElementById('teacher-total-paid').textContent = totalPaid.toFixed(2);
        const arrears = totalDue - totalPaid;
        const arrearsEl = document.getElementById('teacher-arrears');
        arrearsEl.textContent = arrears.toFixed(2);
        arrearsEl.style.color = arrears > 0 ? 'red' : 'green';

        const transList = document.getElementById('teacher-transaction-list');
        transList.innerHTML = payments.map(p => `
            <li>
                <span>${UI.esc(p.date)}: ${UI.esc(p.note || t('payment_label'))}</span>
                <span style="color:red; font-weight:bold;">-${p.amount}</span>
            </li>
        `).join('');

        const breakdownList = document.getElementById('teacher-fee-breakdown-list');
        breakdownList.innerHTML = dues.breakdown.map(item => `
            <li>
                <span>${item.month} (${UI.esc(item.groupName)})</span>
                <span>${item.amount.toFixed(2)}</span>
            </li>
        `).join('');
    },

    calculateTeacherDues: (teacherId) => {
        let total = 0;
        const breakdown = [];
        const groups = (Store.data.settings.groups || []).filter(g => g.teacherId === teacherId);
        const students = Store.data.students || [];

        // Track attendance per month per group
        const groupMonthAttendance = {}; // { groupId: { month: uniqueStudentsCount } }

        students.forEach(student => {
            const attendance = student.attendance || [];
            
            // Map structure: { "2023-10": { groupId: count } } for this specific student
            const studentAttMap = {};
            
            attendance.forEach(record => {
                if (record.status !== 'present') return;
                const month = record.date.substring(0, 7);
                if (!studentAttMap[month]) studentAttMap[month] = {};
                if (!studentAttMap[month][record.groupId]) studentAttMap[month][record.groupId] = 0;
                studentAttMap[month][record.groupId]++;
            });

            // For each group this student attended, add to global group counts
            Object.keys(studentAttMap).forEach(month => {
                const groupsAttended = studentAttMap[month];
                Object.keys(groupsAttended).forEach(groupId => {
                    const count = groupsAttended[groupId];
                    const group = groups.find(g => g.id == groupId);
                    if (!group) return;

                    if (!groupMonthAttendance[groupId]) groupMonthAttendance[groupId] = {};
                    if (!groupMonthAttendance[groupId][month]) groupMonthAttendance[groupId][month] = { revenue: 0, students: 0 };
                    
                    const price = parseFloat(group.price) || 0;
                    const billingType = group.billingType || 'monthly';
                    
                    let studentRevenue = 0;
                    if (billingType === 'monthly') {
                        if (count > 0) studentRevenue = price;
                    } else if (billingType === 'perSession') {
                        const effectiveCount = (group.sessionsPerMonth && count > group.sessionsPerMonth)
                            ? group.sessionsPerMonth
                            : count;
                        studentRevenue = effectiveCount * price;
                    }
                    
                    groupMonthAttendance[groupId][month].revenue += studentRevenue;
                    groupMonthAttendance[groupId][month].students++;
                });
            });
        });

        // Calculate final teacher dues based on percentage
        groups.forEach(group => {
            const months = groupMonthAttendance[group.id];
            if (!months) return;

            const percentage = parseFloat(group.teacherPercentage) || 100;

            Object.keys(months).sort().forEach(month => {
                const data = months[month];
                const teacherDue = data.revenue * (percentage / 100);

                if (teacherDue > 0) {
                    breakdown.push({
                        month: month,
                        groupName: `[${group.code || group.id}] ${group.name} (${data.students} students) - ${percentage}%`,
                        amount: teacherDue
                    });
                    total += teacherDue;
                }
            });
        });

        return { total, breakdown };
    },

    addTeacherPayment: () => {
        if (!FinanceModule.state.currentTeacherId) return;

        const amount = parseFloat(document.getElementById('teacher-payment-amount').value);
        const date = document.getElementById('teacher-payment-date').value;
        const note = document.getElementById('teacher-payment-note').value;

        if (!amount || amount <= 0) return UI.showToast(t('invalid_amount'), 'error');

        const transaction = {
            id: 'TRX-TCH-' + Date.now(),
            teacherId: FinanceModule.state.currentTeacherId,
            amount: amount,
            date: date,
            note: note,
            type: 'teacher_payment'
        };

        Store.data.finance = Store.data.finance || [];
        Store.data.finance.push(transaction);
        Store.save();

        document.getElementById('teacher-payment-amount').value = '';
        document.getElementById('teacher-payment-note').value = '';
        FinanceModule.loadTeacherFinance(FinanceModule.state.currentTeacherId);
    },

    // --- General Reports Logic ---

    initReportFilters: () => {
        const stageSelect = document.getElementById('report-filter-stage');
        const stages = Store.data.settings.stages || [];
        if (stageSelect) {
            stageSelect.innerHTML = '<option value="" data-i18n="filter_stage">Filter by Stage</option>' +
                stages.map(s => `<option value="${s.id}">${UI.esc(s.name)}</option>`).join('');
            FinanceModule.updateReportFilters();
        }
    },

    updateReportFilters: () => {
        const stageId = document.getElementById('report-filter-stage').value;
        const subjectSelect = document.getElementById('report-filter-subject');

        // Update Subjects based on Stage
        const subjects = Store.data.settings.subjects || [];
        const filteredSubjects = stageId ? subjects.filter(s => s.stageId == stageId) : subjects;

        if (subjectSelect) {
            subjectSelect.innerHTML = '<option value="" data-i18n="filter_subject">Filter by Subject</option>' +
                filteredSubjects.map(s => {
                    const stages = Store.data.settings.stages || [];
                    const st = stages.find(stage => stage.id === s.stageId);
                    const stageName = st ? st.name : '';
                    return `<option value="${s.id}">${UI.esc(s.name)} (${UI.esc(stageName)})</option>`;
                }).join('');
        }

        // Update Groups
        const groups = Store.data.settings.groups || [];
        const groupSelect = document.getElementById('report-filter-group');
        const subjectId = document.getElementById('report-filter-subject').value;

        // Filter groups by subject if selected
        const filteredGroups = subjectId ? groups.filter(g => g.subjectId == subjectId) : groups;

        if (groupSelect) {
            groupSelect.innerHTML = '<option value="" data-i18n="filter_group">Filter by Group</option>' +
                filteredGroups.map(g => {
                    const subjects = Store.data.settings.subjects || [];
                    const sub = subjects.find(s => s.id === g.subjectId);
                    const subName = sub ? sub.name : '';
                    return `<option value="${g.id}">[${UI.esc(g.code || g.id)}] ${UI.esc(g.name)} (${UI.esc(subName)})</option>`;
                }).join('');
        }

        if (typeof updateUI === 'function') updateUI();
    },

    generateReport: () => {
        const stageId = document.getElementById('report-filter-stage').value;
        const subjectId = document.getElementById('report-filter-subject').value;
        const groupId = document.getElementById('report-filter-group').value;

        // Filter Students
        let students = Store.data.students || [];

        if (groupId) {
            students = students.filter(s => s.enrollments && s.enrollments.some(e => e.groupId == groupId));
        } else if (subjectId) {
            students = students.filter(s => s.enrollments && s.enrollments.some(e => e.subjectId == subjectId));
        } else if (stageId) {
            const stageSubjects = (Store.data.settings.subjects || []).filter(sub => sub.stageId == stageId).map(s => s.id);
            students = students.filter(s => s.enrollments && s.enrollments.some(e => stageSubjects.includes(e.subjectId)));
        }

        // Generate Data
        const reportData = students.map(s => {
            const dues = FinanceModule.calculateDues(s);
            const totalDue = dues.total;
            const payments = (Store.data.finance || []).filter(t => t.studentId === s.id);
            const totalPaid = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
            const arrears = totalDue - totalPaid;

            return {
                name: s.name,
                phone: s.phone,
                totalDue,
                totalPaid,
                arrears
            };
        });

        // Render Table
        const tbody = document.getElementById('report-table-body');
        tbody.innerHTML = reportData.map(d => `
            <tr>
                <td style="padding:8px">${UI.esc(d.name)}</td>
                <td style="padding:8px">${UI.esc(d.phone)}</td>
                <td style="padding:8px">${d.totalDue.toFixed(2)}</td>
                <td style="padding:8px">${d.totalPaid.toFixed(2)}</td>
                <td style="padding:8px; font-weight:bold; color:${d.arrears > 0 ? 'red' : 'green'}">
                    ${d.arrears.toFixed(2)}
                </td>
            </tr>
        `).join('');

        // Render Totals
        const totalDue = reportData.reduce((sum, d) => sum + d.totalDue, 0);
        const totalPaid = reportData.reduce((sum, d) => sum + d.totalPaid, 0);
        const totalArrears = reportData.reduce((sum, d) => sum + d.arrears, 0);

        const tfoot = document.getElementById('report-table-foot');
        tfoot.innerHTML = `
            <tr>
                <td colspan="2" style="padding:8px; text-align:right">${t('totals')}</td>
                <td style="padding:8px">${totalDue.toFixed(2)}</td>
                <td style="padding:8px">${totalPaid.toFixed(2)}</td>
                <td style="padding:8px; color:${totalArrears > 0 ? 'red' : 'green'}">${totalArrears.toFixed(2)}</td>
            </tr>
        `;

        document.getElementById('report-results').classList.remove('hidden');
    }
};
