import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    ignores: ['out/**', '.next/**', '.source/**', 'node_modules/**'],
  }
];
