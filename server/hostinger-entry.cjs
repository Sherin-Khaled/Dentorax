import("./src/server.js").catch((error) => {
  console.error("Hostinger backend bootstrap failed:", error);
  process.exitCode = 1;
});
