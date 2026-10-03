import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

export default defineConfig([
    ...nextVitals,
    ...nextTypescript,
    {
        rules: {
            '@typescript-eslint/consistent-type-imports': ['error', { fixStyle: 'inline-type-imports' }],
            '@typescript-eslint/no-unused-vars': [
                'error',
                { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
            ],
            'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
            eqeqeq: ['error', 'always'],
            semi: ['error', 'always'],
        },
    },
    globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts', 'public/**']),
]);
