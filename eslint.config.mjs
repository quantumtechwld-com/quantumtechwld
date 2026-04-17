import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import security from "eslint-plugin-security";
import noSecrets from "eslint-plugin-no-secrets";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Camada 1 — detecção de vulnerabilidades e segredos em cleartext
  security.configs.recommended,
  {
    rules: {
      // Falso-positivo excessivo: qualquer obj[key] é flagged (Prisma, Next.js, etc.)
      "security/detect-object-injection": "off",
      // Mantemos os restantes como warn
    },
  },
  {
    plugins: { "no-secrets": noSecrets },
    rules: {
      // tolerance: 4.5 = entropia média; ajustar para 3.5 conforme base amadurece
      "no-secrets/no-secrets": ["warn", { tolerance: 4.5 }],
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "prisma/**",
    "scripts/**",
    "infra/**",
  ]),
]);

export default eslintConfig;
