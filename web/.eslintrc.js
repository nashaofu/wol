module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.json",
  },
  env: {
    es6: true,
    node: true,
    commonjs: true,
  },
  extends: ["airbnb", "airbnb/hooks", "airbnb-typescript"],
  rules: {
    "max-len": ["error", { code: 120 }],
    "import/extensions": "off",
    "react/react-in-jsx-scope": "off",
    "react/require-default-props": "off",
    "jsx-a11y/click-events-have-key-events": "off",
  },
};
