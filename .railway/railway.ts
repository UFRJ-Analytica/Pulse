import { defineRailway, github, project, service } from "railway/iac";

export default defineRailway(() => {
  // Keep the existing GitHub source connected to the Railway service.
  const web = service("Pulse", {
    source: github("UFRJ-Analytica/Pulse", {
      branch: "main",
      rootDirectory: "/",
    }),
    build: "npm ci && npm run build",
    start: "npm run preview -- --host 0.0.0.0 --port $PORT",
    healthcheck: "/",
    healthcheckTimeout: 60,
  });

  return project("Pulse", {
    resources: [web],
  });
});
