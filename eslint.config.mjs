import eslint from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig(
  {
    ignores: ["dist/**", "coverage/**", "schemas/**"],
  },
  eslint.configs.recommended,
  tseslint.configs.recommended,
  eslintConfigPrettier,
  {
    rules: {
      // Off, not warned. `any` is load-bearing here rather than lazy: the
      // params-map interpreter in core/GenericAggregateComponent takes a
      // classRef it cannot name and content it cannot describe, and the
      // datatypes/xsd validators exist precisely to accept an unknown value and
      // decide whether it is legal. Twenty-six warnings that will never be
      // acted on train the eye to skip lint output, which is worse than the
      // rule being absent.
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" },
      ],
    },
  },
);
