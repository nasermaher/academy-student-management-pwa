import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../..');
const PAYLOAD = '<img src=x onerror="window.__pwned=1">';
const QUOTE = `O'Brien "x"`;

function boot(data) {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8').replace(/<script src="[^"]+"><\/script>/g, '');
  const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true, url: 'http://localhost/' });
  const { window } = dom;
  const files = ['js/i18n.js', 'js/ui.js', 'js/state.js', 'js/modules/settings.js', 'js/modules/teachers.js',
    'js/modules/students.js', 'js/modules/attendance.js', 'js/modules/finance.js', 'js/modules/dashboard.js'];
  // One eval so the scripts' top-level consts share a scope; then expose what the tests need.
  const src = files.map((f) => fs.readFileSync(path.join(root, f), 'utf8')).join('\n') +
    '\nObject.assign(window, { Store, UI, SettingsModule, TeachersModule, StudentsModule, AttendanceModule, FinanceModule });' +
    '\nStore.data = ' + JSON.stringify(data);
  window.eval(src);
  return window;
}

const data = {
  settings: {
    stages: [{ id: 1, name: PAYLOAD }],
    subjects: [{ id: 1, stageId: 1, name: PAYLOAD, price: 10 }],
    groups: [{ id: 1, subjectId: 1, teacherId: 't1', name: PAYLOAD, code: PAYLOAD, days: PAYLOAD, time: PAYLOAD,
      price: 10, billingType: 'monthly', teacherPercentage: 50 }]
  },
  students: [{ id: 's1', name: PAYLOAD, phone: PAYLOAD, stageId: 1, enrollments: [], attendance: [] },
             { id: 's2', name: QUOTE, phone: '1', stageId: 1, enrollments: [], attendance: [] }],
  teachers: [{ id: 't1', name: PAYLOAD, phone: PAYLOAD }],
  finance: [{ id: 'x', studentId: 's1', amount: 5, date: '2026-01-01', note: PAYLOAD, type: 'payment' }]
};

describe('UI.esc', () => {
  it('escapes HTML-significant characters and tolerates nullish values', () => {
    const w = boot(data);
    expect(w.UI.esc(`<a href="x">&'`)).toBe('&lt;a href=&quot;x&quot;&gt;&amp;&#39;');
    expect(w.UI.esc(undefined)).toBe('');
    expect(w.UI.esc(0)).toBe('0');
  });
});

describe('legacy rendering does not inject markup from user data', () => {
  const renderAll = (w) => {
    w.SettingsModule.init(); w.TeachersModule.init(); w.StudentsModule.init();
    w.AttendanceModule.state.selectedGroupId = '1'; w.AttendanceModule.init();
    w.FinanceModule.init();
    w.FinanceModule.state.currentStudentId = 's1';
    w.document.getElementById('finance-student-search').value = 'x';
  };

  it('creates no <img> elements from stage/subject/group/student/teacher fields', () => {
    const w = boot(data);
    renderAll(w);
    w.FinanceModule.searchStudent?.();
    w.FinanceModule.loadStudentFinance('s1');
    expect(w.document.querySelectorAll('img').length).toBe(0);
    expect(w.__pwned).toBeUndefined();
  });

  it('search results carry the student name via data-name, not an inline JS string', () => {
    const w = boot(data);
    renderAll(w);
    w.document.getElementById('finance-student-search').value = "o'brien";
    w.FinanceModule.searchStudent();
    const row = w.document.querySelector('#finance-student-results div');
    expect(row.dataset.name).toBe(QUOTE);
    expect(row.getAttribute('onclick')).not.toContain("O'Brien");
  });
});
