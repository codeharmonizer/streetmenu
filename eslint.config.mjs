import nextVitals from 'eslint-config-next/core-web-vitals'

const config = [
  ...nextVitals,
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'out/**',
      'build/**',
      'coverage/**',
    ],
  },
  {
    rules: {
      // React Compiler lint rules are too strict for this existing app and are
      // handled separately from launch-blocking security/build checks.
      'react-hooks/immutability': 'off',
      'react-hooks/purity': 'off',
      'react-hooks/set-state-in-effect': 'off',
      '@next/next/no-html-link-for-pages': 'off',
    },
  },
]

export default config
