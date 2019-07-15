module.exports = {
  "env": {
    "browser": true,
    "commonjs": true,
    "node": true
  },
  "extends": "eslint:recommended",
  "parserOptions": {
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
    "no-console": "off"
  },
  "globals": {
    "NProgress": false,
    "PNotify": false,
    "Chart": false
  }
};
