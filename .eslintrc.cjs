module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2021: true,
  },
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: "module",
  },
  extends: ["eslint:recommended"],
  plugins: ["header"],
  rules: {
"header/header": [2, "block", [
  "!",
  " * Berlin Wastewater Dashboard",
  " * Copyright (c) 2025 Alexandra von Criegern",
  " * Licensed under the ISC License.",
  " "
]]
  },
};