module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  collectCoverage: true,
  modulePathIgnorePatterns: ["dist/"],
  // Source uses explicit ".js" extensions on relative imports (needed so the
  // ESM tsc build emits Node-resolvable specifiers). Map them back to the
  // TypeScript sources so jest can resolve them.
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
};
