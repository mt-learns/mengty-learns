import js from '@eslint/js';

export default [
  {
    ignores: ['out/**', '.next/**', '.open-next/**', '.wrangler/**', '.source/**', 'node_modules/**', 'public/cards.json'],
  },
  js.configs.recommended,
  {
    languageOptions: {
      globals: {
        process: 'readonly',
        console: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
      },
    },
  },
];
