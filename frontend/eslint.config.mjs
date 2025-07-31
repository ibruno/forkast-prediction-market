import antfu from '@antfu/eslint-config'
import eslintPluginBetterTailwindcss from 'eslint-plugin-better-tailwindcss'

export default antfu({
  react: true,
  nextjs: true,
}, {
  plugins: {
    'better-tailwindcss': eslintPluginBetterTailwindcss,
  },
  rules: {
    ...eslintPluginBetterTailwindcss.configs['recommended-error'].rules,
    'better-tailwindcss/no-conflicting-classes': 'off',
    'better-tailwindcss/no-unregistered-classes': 'off',
    'node/prefer-global/process': 'off',
    'no-console': 'off',
    'react-dom/no-dangerously-set-innerhtml': 'off',
    'react-refresh/only-export-components': 'off',
    'func-style': ['error', 'declaration', { allowArrowFunctions: false }],
    'better-tailwindcss/enforce-consistent-line-wrapping': ['error', {
      group: 'newLine',
      preferSingleLine: true,
      printWidth: 120,
    }],
  },
  settings: {
    'better-tailwindcss': {
      tailwindConfig: './tailwind.config.js',
    },
  },
})
