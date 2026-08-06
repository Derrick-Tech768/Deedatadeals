const fs = require('fs');
const path = require('path');

const workspaceRoot = path.resolve(__dirname, '..');
const envPath = path.join(workspaceRoot, '.env');
const outputPath = path.join(workspaceRoot, 'config.js');

if (!fs.existsSync(envPath)) {
  console.error('Missing .env file. Create one before generating config.js.');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const envValues = {};

for (const line of envContent.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;

  const separatorIndex = trimmed.indexOf('=');
  if (separatorIndex === -1) continue;

  const key = trimmed.slice(0, separatorIndex).trim();
  const value = trimmed.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, '');
  envValues[key] = value;
}

const output = `window.__ENV__ = ${JSON.stringify(envValues, null, 2)};\n`;
fs.writeFileSync(outputPath, output, 'utf8');
console.log(`Generated ${path.relative(workspaceRoot, outputPath)}`);
