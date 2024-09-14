import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";


export default [
    {
        files: ["**/*.{js,mjs,cjs,ts}"]
    },
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    {
        rules: {
            semi: "error",
            quotes: ["warn", "double"],
            "array-callback-return": "error",
            "brace-style": ["warn", "stroustrup"],
            curly: ["error", "multi-or-nest", "consistent"],
            "default-case": "error",
            "dot-notation": ["error", { allowKeywords: false }],
            eqeqeq: "error",
            "no-var": "error",
            "require-await": "error"
        }
    }
];
