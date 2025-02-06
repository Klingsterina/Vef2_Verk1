export default {
    testEnvironment: "node",
    transform: {}, // Gæti verið nauðsynlegt fyrir ESM
    collectCoverage: true,
    coverageDirectory: "coverage",
    collectCoverageFrom: [
      "src/**/*.js",
    ]
  };
  