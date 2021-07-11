module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true
  },
  extends: [
    'standard'
  ],
  parserOptions: {
    ecmaVersion: 12
  },
  rules: {
    'no-undef': 0,
    'no-useless-escape': 0,
    'node/no-path-concat': 0
  }
}
