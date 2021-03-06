module.exports = {
  "env": {
    "browser": true,
    "commonjs": true,
    "es6": true,
    "node": true,
    "jquery": true
  },
  "extends": "naver",
  "parserOptions": {
    "ecmaVersion": 8, // Eslint that support async
    "sourceType": "module"
  },
  "rules": {
    "indent": [
      "error",
      4
    ],
    "quotes": [
      "error",
      "double"
    ],
    "semi": [
      "error",
      "always"
    ],
    "no-unused-vars": ["off", {
      "varsIgnorePattern": "^h$"
    }],
    "linebreak-style": ["error", "windows"],
    "consistent-return": "off",
    "array-callback-return": "off",
    "array-element-newline": "off",
    "max-len": "off",
    "no-console": "off"
  },
  "globals": {
    "NProgress": false,
    "PNotify": false,
    "Chart": false
  }
};
