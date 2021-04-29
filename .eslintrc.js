module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  parserOptions: {
    parser: 'babel-eslint'
  },
  extends: [
  ],
  plugins: [
  ],
  // add your custom rules here
  rules: {
    camelcase: 'off',
    'no-console': 'off',
    'arrow-parens': 'off',
    'comma-dangle': ['warn', 'only-multiline'],
    curly: ['error', 'multi-line'],
    quotes: ['warn', 'single', {
      avoidEscape: true
    }],
    'space-before-function-paren': 'off',
    'vue/html-indent': ['warn', 2, {
      baseIndent: 0,
    }],
    'vue/max-attributes-per-line': 'off',
    'quote-props': ['error', 'as-needed'],
    // 'vue/component-tags-order': 'off',
    'vue/component-definition-name-casing': 'off',
    'vue/no-v-html': 'off',
  }
}
