// Loads the legacy (v0) browser scripts into an isolated vm context so their
// business logic can be characterised by tests without a DOM.
import vm from 'node:vm';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '../..');

export function loadLegacy(data) {
  const storage = new Map();
  const noop = () => {};
  const sandbox = {
    console: { log: noop, warn: noop, error: noop },
    localStorage: {
      getItem: (k) => (storage.has(k) ? storage.get(k) : null),
      setItem: (k, v) => storage.set(k, String(v)),
      removeItem: (k) => storage.delete(k)
    },
    document: {
      addEventListener: noop,
      getElementById: () => null,
      querySelectorAll: () => [],
      documentElement: {}
    },
    UI: { showToast: noop }
  };
  vm.createContext(sandbox);
  for (const f of ['js/i18n.js', 'js/state.js', 'js/modules/finance.js']) {
    vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), sandbox, { filename: f });
  }
  vm.runInContext('currentLang = "en"; Store.data = ' + JSON.stringify(data), sandbox);
  return {
    calculateDues: (student) =>
      vm.runInContext(`FinanceModule.calculateDues(${JSON.stringify(student)})`, sandbox),
    calculateTeacherDues: (id) =>
      vm.runInContext(`FinanceModule.calculateTeacherDues(${JSON.stringify(id)})`, sandbox)
  };
}

export const present = (date, groupId) => ({ date, groupId, status: 'present' });
