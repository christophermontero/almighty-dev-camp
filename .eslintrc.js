module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {
    'no-unused-vars': 0,
    'no-undef': 0,
    'no-console': 0,
    'no-underscore-dangle': 0,
    'global-require': 0,
    'no-shadow': 0,
    'no-use-before-define': 0,
    'consistent-return': 0,
    'no-useless-escape': 0,
    'no-return-await': 0,
    'func-names': 0,
    'max-len': [
      'error',
      {
        code: 80,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
        ignoreRegExpLiterals: true,
      },

    ],
  },
};
