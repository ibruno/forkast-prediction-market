import antfu from '@antfu/eslint-config'
import eslintPluginBetterTailwindcss from 'eslint-plugin-better-tailwindcss'

export default antfu({
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
