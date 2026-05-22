const { spawn } = require("node:child_process");

const npm = process.platform === "win32" ? "npm.cmd" : "npm";

const services = [
  { name: "backend", args: ["run", "dev", "--prefix", "src/backend"] },
  { name: "frontend", args: ["run", "dev", "--prefix", "src/frontend"] },
];

const children = services.map(({ name, args }) => {
  const child = spawn(npm, args, {
    stdio: "inherit",
    shell: false,
  });

  child.on("exit", (code) => {
    if (code && code !== 0) {
      console.error(`${name} exited with code ${code}`);
      process.exitCode = code;
    }
  });

  return child;
});

const shutdown = () => {
  for (const child of children) {
    if (!child.killed) child.kill();
  }
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
