module.exports = {
  apps: [
    {
      name: "kcbuddy-server",
      cwd: "./server",
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
