import js from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";
import eslintConfigPrettier from "eslint-config-prettier";

export default [
    {
        ignores: [
            "dist/**",
            "node_modules/**",
        ],
    },

    js.configs.recommended,

    ...tseslint.configs.recommended,

    {
        files: ["**/*.ts"],

        languageOptions: {
            parser: tseslint.parser,

            parserOptions: {
                project: "./tsconfig.json",
            },

            globals: {
                ...globals.node,
            },
        },

        rules: {
            /**
             * Best Practices
             */
            "no-console": "off",
            "no-debugger": "error",

            /**
             * TypeScript
             */
            "@typescript-eslint/no-unused-vars": [
                "warn",
                {
                    argsIgnorePattern: "^_",
                    varsIgnorePattern: "^_",
                },
            ],

            "@typescript-eslint/no-explicit-any": "warn",

            "@typescript-eslint/consistent-type-imports": "error",

            "@typescript-eslint/no-floating-promises": "error",

            "@typescript-eslint/await-thenable": "error",
        },
    },
    eslintConfigPrettier,
];