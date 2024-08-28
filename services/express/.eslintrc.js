module.exports = {
  extends: [
      'airbnb-base'
  ],

  rules: {
      'import/first': 2,
      'max-len': ["error", 150, {
          "ignoreRegExpLiterals": true,
          "ignoreStrings": true
      }],
      'no-underscore-dangle': 0,
      'no-console': 0,
      'consistent-return': 0,
      'no-param-reassign': 0,
      'no-restricted-syntax': 0,
      'no-await-in-loop': 0,
  },
  env: {
      node: true,
      jasmine: true,
      mocha: true,
  },

  overrides: [{
      files: "*.test.js",
      rules: {
          "no-unused-vars": "off",
      }
  }]
};