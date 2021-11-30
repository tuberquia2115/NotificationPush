module.exports = {
  root: true,
  extends: '@react-native-community',
  rules:{
    'max-len': ['error', { code: 100 }],
    'import/no-named-as-default': 0,
    'no-console': 'off',
    'react/prop-types': 'off',
    'object-curly-newline': ['error', { ObjectPattern: { multiline: true, minProperties: 8 } }],
    'react/require-default-props': 'off',
  }
};
