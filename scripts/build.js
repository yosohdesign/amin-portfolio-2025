#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

// Set environment variables to disable problematic features
process.env.NEXT_TELEMETRY_DISABLED = '1';
process.env.NEXT_BUILD_TRACES = 'false';
process.env.NODE_OPTIONS = '--max-old-space-size=4096';

console.log('🚀 Starting custom build process...');
console.log('📦 Environment variables set:');
console.log('   NEXT_TELEMETRY_DISABLED:', process.env.NEXT_TELEMETRY_DISABLED);
console.log('   NEXT_BUILD_TRACES:', process.env.NEXT_BUILD_TRACES);
console.log('   NODE_OPTIONS:', process.env.NODE_OPTIONS);

// Run the build command
const buildProcess = spawn('npx', ['next', 'build', '--no-lint'], {
  stdio: 'inherit',
  shell: true,
  env: process.env
});

buildProcess.on('close', (code) => {
  if (code === 0) {
    console.log('✅ Build completed successfully!');
    process.exit(0);
  } else {
    console.error(`❌ Build failed with code ${code}`);
    process.exit(code);
  }
});

buildProcess.on('error', (error) => {
  console.error('❌ Build process error:', error);
  process.exit(1);
});
