module.exports = {
  apps: [{
    name: 'bookwise-admin',
    script: 'npm',
    args: 'start',
    cwd: '/home/neil/bookwise-admin',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3005
    }
  }]
}
