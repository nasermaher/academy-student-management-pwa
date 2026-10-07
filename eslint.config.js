import globals from 'globals';

// Mechanical hygiene for the tests and scripts: dead code and obvious mistakes. Style stays a judgement call.
export default [
  { ignores: ['dist/**', 'node_modules/**', 'js/**', 'css/**', 'mobile_index.html', 'sw.js'] },
  {
    files: ['tests/**/*.js', 'scripts/**/*.mjs'],
    languageOptions: { ecmaVersion: 2023, sourceType: 'module', globals: { ...globals.browser, ...globals.node } },
    rules: {
      'no-unused-vars': ['error', { args: 'after-used', argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'none', ignoreRestSiblings: true }],
      'no-undef': 'error', 'no-unreachable': 'error', 'no-empty': ['error', { allowEmptyCatch: false }], 'no-dupe-keys': 'error', eqeqeq: ['error', 'always', { null: 'ignore' }]
    }
  }
];
