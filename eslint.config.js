import js from '@eslint/js';
import importX from 'eslint-plugin-import-x';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/**
 * ESLint flat config.
 *
 * - `js` + `typescript-eslint`: core and TypeScript rules (strict-ish set,
 *   no `any`-heavy footguns).
 * - `react-hooks`: rules-of-hooks and exhaustive-deps (error/warn) plus the
 *   modern React Compiler-era correctness rules.
 * - `react-refresh`: a module should export either components or nothing.
 * - `import-x`: import organisation — grouping, alphabetical order,
 *   blank lines between groups and no duplicate imports.
 */
export default tseslint.config(
  // Generated output is never linted.
  { ignores: ['dist', 'coverage', 'node_modules'] },

  // Plain JavaScript files (this config file).
  {
    files: ['**/*.{js,mjs,cjs}'],
    extends: [js.configs.recommended],
    languageOptions: {
      globals: globals.node,
    },
  },

  // Application and test sources.
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      reactHooks.configs.flat['recommended-latest'],
      reactRefresh.configs.vite,
      importX.flatConfigs.recommended,
    ],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    rules: {
      // Import organisation: grouped (builtin > external > parent > sibling >
      // index), alphabetised, with blank lines between groups.
      'import-x/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'import-x/no-duplicates': 'error',
      // Module resolution and export validation are TypeScript's job:
      // `tsc --noEmit` (npm run typecheck) resolves paths with full type
      // information, which is stricter and less error-prone than the
      // lint-time resolver (it cannot follow extensionless TS imports).
      'import-x/no-unresolved': 'off',
      'import-x/named': 'off',
      'import-x/namespace': 'off',
      'import-x/default': 'off',
      'import-x/no-named-as-default': 'off',
      'import-x/no-named-as-default-member': 'off',
    },
  },
);
