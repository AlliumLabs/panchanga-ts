module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[tj]s?(x)"],
  // Ignore declaration files
  testPathIgnorePatterns: ["\\.d\\.ts$"],
  moduleFileExtensions: ["js", "jsx", "ts", "tsx", "json", "node"],
};
