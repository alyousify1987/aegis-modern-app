#!/usr/bin/env node

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Starting Aegis Development Environment...');
console.log('📊 This will start both backend and frontend automatically');

// Function to spawn a process with proper cleanup
function spawnProcess(command, args, options, label) {
  const proc = spawn(command, args, {
    stdio: ['inherit', 'pipe', 'pipe'],
    shell: true,
    ...options
  });

  proc.stdout.on('data', (data) => {
    const message = data.toString().trim();
    if (message) {
      console.log(`[${label}] ${message}`);
    }
  });

  proc.stderr.on('data', (data) => {
    const error = data.toString().trim();
    if (error && !error.includes('ExperimentalWarning')) {
      console.error(`[${label} ERROR] ${error}`);
    }
  });

  proc.on('error', (error) => {
    console.error(`❌ Failed to start ${label}:`, error);
  });

  return proc;
}

// Start backend server
console.log('📡 Starting backend server...');
const backendProcess = spawnProcess('node', ['start-server.js'], {}, 'BACKEND');

// Wait for backend to be ready, then start frontend
setTimeout(() => {
  console.log('🌐 Starting frontend development server...');
  const frontendProcess = spawnProcess('npm', ['run', 'dev:client'], {}, 'FRONTEND');
  
  // Handle shutdown
  const shutdown = (signal) => {
    console.log(`\n🛑 Received ${signal}, shutting down all processes...`);
    
    if (backendProcess) {
      backendProcess.kill(signal);
    }
    
    if (frontendProcess) {
      frontendProcess.kill(signal);
    }
    
    setTimeout(() => {
      process.exit(0);
    }, 2000);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  
}, 3000); // Give backend 3 seconds to start

// Handle early shutdown for backend
process.on('SIGINT', () => {
  if (backendProcess) {
    backendProcess.kill('SIGINT');
  }
  process.exit(0);
});

process.on('SIGTERM', () => {
  if (backendProcess) {
    backendProcess.kill('SIGTERM');
  }
  process.exit(0);
});

console.log('✅ Development environment starting...');
console.log('📱 Frontend will be available at: http://localhost:1420');
console.log('🔌 Backend will be available at: http://localhost:3001');
console.log('💚 Health check at: http://localhost:3001/health');
console.log('');
console.log('Press Ctrl+C to stop all processes');
