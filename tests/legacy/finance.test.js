import { describe, it, expect } from 'vitest';
import { loadLegacy, present } from './harness.js';

// Characterisation tests: they pin the CURRENT (v0) billing behaviour so the
// v2 rewrite can be checked against it. Documented quirks are marked.

const subjects = [{ id: 1, name: 'English' }];
const base = (groups, students, extra = {}) => ({
  settings: { stages: [], subjects, groups },
  students,
  teachers: [],
  finance: [],
  ...extra
});

describe('calculateDues (student)', () => {
  it('charges a flat monthly fee once per month with at least one attendance', () => {
    const g = { id: 10, subjectId: 1, name: 'G1', price: 200, billingType: 'monthly' };
    const s = { id: 's1', attendance: [present('2026-01-03', 10), present('2026-01-10', 10), present('2026-02-01', 10)] };
    const r = loadLegacy(base([g], [s])).calculateDues(s);
    expect(r.total).toBe(400);
    expect(r.breakdown.map((b) => b.month)).toEqual(['2026-01', '2026-02']);
  });

  it('charges per attended session', () => {
    const g = { id: 10, subjectId: 1, name: 'G1', price: 50, billingType: 'perSession', sessionsPerMonth: 8 };
    const s = { id: 's1', attendance: [present('2026-01-03', 10), present('2026-01-10', 10), present('2026-01-17', 10)] };
    expect(loadLegacy(base([g], [s])).calculateDues(s).total).toBe(150);
  });

  it('caps per-session billing at sessionsPerMonth', () => {
    const g = { id: 10, subjectId: 1, name: 'G1', price: 50, billingType: 'perSession', sessionsPerMonth: 2 };
    const s = { id: 's1', attendance: ['01', '08', '15', '22'].map((d) => present(`2026-01-${d}`, 10)) };
    expect(loadLegacy(base([g], [s])).calculateDues(s).total).toBe(100);
  });

  it('ignores absences', () => {
    const g = { id: 10, subjectId: 1, name: 'G1', price: 200, billingType: 'monthly' };
    const s = { id: 's1', attendance: [{ date: '2026-01-03', groupId: 10, status: 'absent' }] };
    expect(loadLegacy(base([g], [s])).calculateDues(s).total).toBe(0);
  });

  it('bills each group separately in the same month', () => {
    const g1 = { id: 10, subjectId: 1, name: 'A', price: 100, billingType: 'monthly' };
    const g2 = { id: 11, subjectId: 1, name: 'B', price: 70, billingType: 'monthly' };
    const s = { id: 's1', attendance: [present('2026-01-03', 10), present('2026-01-04', 11)] };
    expect(loadLegacy(base([g1, g2], [s])).calculateDues(s).total).toBe(170);
  });

  it('skips attendance for deleted groups (documented v0 quirk)', () => {
    const s = { id: 's1', attendance: [present('2026-01-03', 99)] };
    expect(loadLegacy(base([], [s])).calculateDues(s).total).toBe(0);
  });

  it('is retroactive: changing a group price changes past dues (v0 quirk, fixed in v2 via snapshots)', () => {
    const s = { id: 's1', attendance: [present('2026-01-03', 10)] };
    const before = { id: 10, subjectId: 1, name: 'G', price: 100, billingType: 'monthly' };
    const after = { ...before, price: 300 };
    expect(loadLegacy(base([before], [s])).calculateDues(s).total).toBe(100);
    expect(loadLegacy(base([after], [s])).calculateDues(s).total).toBe(300);
  });
});

describe('calculateTeacherDues', () => {
  const group = (over = {}) => ({
    id: 10, subjectId: 1, name: 'G1', code: 'E1', teacherId: 't1',
    price: 200, billingType: 'monthly', teacherPercentage: 50, ...over
  });

  it('pays the teacher percentage of monthly revenue across students', () => {
    const students = [
      { id: 'a', attendance: [present('2026-01-03', 10)] },
      { id: 'b', attendance: [present('2026-01-05', 10)] }
    ];
    const r = loadLegacy(base([group()], students)).calculateTeacherDues('t1');
    expect(r.total).toBe(200); // 2 x 200 x 50%
    expect(r.breakdown).toHaveLength(1);
  });

  it('ignores groups of other teachers', () => {
    const students = [{ id: 'a', attendance: [present('2026-01-03', 10)] }];
    expect(loadLegacy(base([group({ teacherId: 'other' })], students)).calculateTeacherDues('t1').total).toBe(0);
  });

  it('applies the per-session cap before the percentage', () => {
    const g = group({ billingType: 'perSession', price: 40, sessionsPerMonth: 2, teacherPercentage: 100 });
    const students = [{ id: 'a', attendance: ['01', '08', '15'].map((d) => present(`2026-01-${d}`, 10)) }];
    expect(loadLegacy(base([g], students)).calculateTeacherDues('t1').total).toBe(80);
  });

  it('treats a 0% share as 100% (documented v0 quirk: parseFloat(0) || 100)', () => {
    const students = [{ id: 'a', attendance: [present('2026-01-03', 10)] }];
    expect(loadLegacy(base([group({ teacherPercentage: 0 })], students)).calculateTeacherDues('t1').total).toBe(200);
  });
});
