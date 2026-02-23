import tseslint from 'typescript-eslint';
import prettier from 'eslint-plugin-prettier';

export default [
  // Base TypeScript recommended rules
  ...tseslint.configs.recommended,

  // Prettier integration
  {
    plugins: {
      prettier,
    },
    rules: {
      'prettier/prettier': 'error',
    },
  },

  //  Relax rules ONLY for test files
  {
    files: ['**/__tests__/**', '**/*.test.ts', '**/*.test.tsx'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
    },
  },
];
