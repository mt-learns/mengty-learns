import { configDefaults, defineConfig } from 'vitest/config';

// labs/* are standalone projects with their own `node:test` suites and CI job
// (.github/workflows/labs.yml). Exclude them here rather than with a CLI glob:
// `--exclude labs/**` is expanded by the Linux shell before Vitest sees it.
export default defineConfig({
  test: {
    exclude: [...configDefaults.exclude, '**/labs/**', '.next/**', '.open-next/**'],
  },
});
