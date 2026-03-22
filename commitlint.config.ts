import type { UserConfig } from "@commitlint/types";

const config: UserConfig = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // Type must be one of these
    "type-enum": [
      2,
      "always",
      [
        "feat", // New feature
        "fix", // Bug fix
        "docs", // Documentation only
        "style", // Formatting, missing semicolons, etc.
        "refactor", // Code change that neither fixes a bug nor adds a feature
        "perf", // Performance improvement
        "test", // Adding missing tests
        "build", // Build system or external dependencies
        "ci", // CI configuration
        "chore", // Other changes that don't modify src or test
        "revert", // Reverts a previous commit
      ],
    ],
    // Type must be lowercase
    "type-case": [2, "always", "lower-case"],
    // Type cannot be empty
    "type-empty": [2, "never"],
    // Subject cannot be empty
    "subject-empty": [2, "never"],
    // Subject max length
    "subject-max-length": [2, "always", 72],
    // Subject must be lowercase
    "subject-case": [2, "always", "lower-case"],
    // No period at the end of subject
    "subject-full-stop": [2, "never", "."],
    // Body max line length
    "body-max-line-length": [2, "always", 100],
  },
};

export default config;
