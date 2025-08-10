const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Aegis Backend Server...');

// Kill any existing node processes on port 3001
const killExisting = spawn('npx', ['kill-port', '3001'], {
  stdio: 'inherit',
  shell: true,
  cwd: __dirname
});

killExisting.on('close', (code) => {
  console.log('🧹 Cleaned up existing processes');
  
  // Start the server
  const serverProcess = spawn('node', ['simple-server.js'], {
    stdio: 'inherit',
    shell: true,
    cwd: __dirname,
    detached: false
  });

  serverProcess.on('error', (err) => {
    console.error('❌ Server error:', err);
  });

  serverProcess.on('close', (code) => {
    console.log(`🔴 Server process exited with code ${code}`);
    if (code !== 0) {
      console.log('🔄 Restarting server in 2 seconds...');
      setTimeout(() => {
        // Restart the server
        const restartProcess = spawn('node', ['simple-server.js'], {
          stdio: 'inherit',
          shell: true,
          cwd: __dirname
        });
      }, 2000);
    }
  });

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    serverProcess.kill('SIGTERM');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down server...');
    serverProcess.kill('SIGTERM');
    process.exit(0);
  });
});
