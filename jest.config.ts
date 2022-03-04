module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  setupFiles: ["dotenv/config"],
  verbose: true,
  // coverageThreshold: {
  //   global: {
  //     branches: 80,
  //     functions: 85,
  //     lines: 80,
  //     statements: -15,
  //   },
  // },
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.ts$",
  testPathIgnorePatterns: [
    "/lib/",
    "/node_modules/",
    "<rootDir>/dist",
    "<rootDir>/app.ts",
    "<rootDir>/server.ts",
    "model.ts",
  ],
};
