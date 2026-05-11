/** @type {import('jest').Config} */
const config = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  testMatch: [
    "**/__tests__/**/*.test.ts",
  ],
  transform: {
    "^.+\\.ts$": ["ts-jest", {
      tsconfig: {
        module:           "commonjs",
        moduleResolution: "node",
        esModuleInterop:  true,
        allowSyntheticDefaultImports: true,
      },
    }],
  },
  // Penting: abaikan Next.js specific modules
  modulePathIgnorePatterns: [
    "<rootDir>/.next/",
  ],
  transformIgnorePatterns: [
    "node_modules/(?!(.*\\.mjs$))",
  ],
}

module.exports = config