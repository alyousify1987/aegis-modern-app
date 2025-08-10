import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting Aegis Backend Server...');

// Navigate to server directory and start simple-server.js
const serverPath = path.join(__dirname, 'server');
const serverFile = path.join(serverPath, 'simple-server.js');

console.log(`📁 Server path: ${serverPath}`);
console.log(`📄 Server file: ${serverFile}`);

// Check if simple-server.js exists
if (!fs.existsSync(serverFile)) {
  console.error(`❌ ERROR: Server file not found at ${serverFile}`);
  process.exit(1);
}

// Enhanced server spawning with better monitoring
const server = spawn('node', ['simple-server.js'], {
  cwd: serverPath,
  stdio: ['inherit', 'pipe', 'pipe'],
  shell: true,
  env: { ...process.env, NODE_ENV: 'development' }
});

// Monitor server output
server.stdout.on('data', (data) => {
  const message = data.toString().trim();
  if (message) {
    console.log(`[SERVER] ${message}`);
  }
});

server.stderr.on('data', (data) => {
  const error = data.toString().trim();
  if (error && !error.includes('ExperimentalWarning')) {
    console.error(`[SERVER ERROR] ${error}`);
  }
});

server.on('error', (error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

server.on('close', (code) => {
  if (code !== 0) {
    console.log(`❌ Server process exited with code ${code}`);
    // Auto-restart on unexpected exit
    setTimeout(() => {
      console.log('🔄 Attempting to restart server...');
      // Recursively restart
      import('./start-server.js');
    }, 2000);
  } else {
    console.log('✅ Server shut down gracefully');
  }
});

// Enhanced shutdown handlers
const shutdown = (signal) => {
  console.log(`\n🛑 Received ${signal}, shutting down server...`);
  server.kill(signal);
  
  // Force kill after timeout
  setTimeout(() => {
    console.log('⚠️  Force killing server process...');
    server.kill('SIGKILL');
    process.exit(1);
  }, 5000);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception in start-server:', error);
  shutdown('SIGTERM');
});

// Keep alive and health monitoring
let lastHealthCheck = Date.now();
const healthCheckInterval = setInterval(async () => {
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch('http://localhost:3001/health', { timeout: 5000 });
    if (response.ok) {
      lastHealthCheck = Date.now();
      const health = await response.json();
      console.log(`💚 Server healthy - Uptime: ${Math.floor(health.uptime)}s`);
    } else {
      console.log('⚠️  Server health check failed');
    }
  } catch (error) {
    console.log('⚠️  Server health check error:', error.message);
    
    // If health check fails for more than 30 seconds, restart
    if (Date.now() - lastHealthCheck > 30000) {
      console.log('🔄 Restarting unresponsive server...');
      shutdown('SIGTERM');
    }
  }
}, 15000); // Check every 15 seconds

// Cleanup on exit
process.on('exit', () => {
  clearInterval(healthCheckInterval);
});
