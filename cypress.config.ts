import { defineConfig } from "cypress";

export default defineConfig({
  projectId: "foo-bar",
  e2e: {
    experimentalStudio: true,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
