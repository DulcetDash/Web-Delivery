module.exports = {
  apps: [
    {
      name: "Delivery",
      script: "npm start",
      autorestart: true,
      watch: false,
      max_memory_restart: "2G",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
