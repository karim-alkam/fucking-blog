#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Load configuration
function loadConfig() {
  const configPath = path.join(process.cwd(), 'config.json');
  if (!fs.existsSync(configPath)) {
    console.error('config.json not found. Please create it based on config.example.json');
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

// Get path with environment variable override
function getPath(configKey, envVar) {
  const config = loadConfig();
  return process.env[envVar] || config.paths[configKey];
}

module.exports = {
  loadConfig,
  getPath
};