import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    ignores: ['out/**', '.next/**', '.source/**', 'node_modules/**'],
    languageOptions: {
      globals: {
        process: 'readonly',
        console: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
      },
    },
  }
];
