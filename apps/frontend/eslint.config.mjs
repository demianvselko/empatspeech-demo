import next from "eslint-config-next";
import tseslint from "typescript-eslint";
import eslint from "@eslint/js";

export default tseslint.config(
  { ignores: ["**/.next/**", "**/node_modules/**"] },
  next,

  {
    files: ["**/*.{ts,tsx}"],
    extends: [eslint.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: { parserOptions: { project: false } },
    rules: {}
  },

  {
    files: ["src/components/ui/**/*.{ts,tsx}"],
    rules: { "@typescript-eslint/no-explicit-any": "off" }
  },

  {
    files: ["tailwind.config.js", "postcss.config.js"],
    rules: { "@typescript-eslint/no-require-imports": "off" }
  }
);
