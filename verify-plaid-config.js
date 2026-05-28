#!/usr/bin/env node

/**
 * Plaid Configuration Verification Script
 * 
 * This script verifies that the Plaid API is properly configured
 * by checking the environment variables.
 */

// Next.js automatically loads .env.local, but for standalone testing
// we need to explicitly check the file
const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Plaid API Configuration...\n');

const envPath = path.join(__dirname, '.env.local');

if (!fs.existsSync(envPath)) {
  console.error('❌ .env.local file not found!');
  console.log('\n📝 Next steps:');
  console.log('   1. Copy .env.example to .env.local');
  console.log('   2. Add your Plaid credentials');
  console.log('   3. Run this script again\n');
  process.exit(1);
}

// Read and parse .env.local
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...valueParts] = trimmed.split('=');
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  }
});

// Check required Plaid variables
const requiredVars = {
  PLAID_CLIENT_ID: 'Plaid Client ID',
  PLAID_SECRET: 'Plaid Secret',
  PLAID_ENV: 'Plaid Environment'
};

let allConfigured = true;
const results = [];

for (const [key, description] of Object.entries(requiredVars)) {
  const value = envVars[key];
  
  // Special handling for PLAID_ENV - valid values are sandbox, development, production
  if (key === 'PLAID_ENV') {
    if (!value) {
      results.push(`❌ ${description} (${key}): NOT SET`);
      allConfigured = false;
    } else if (['sandbox', 'development', 'production'].includes(value)) {
      results.push(`✅ ${description} (${key}): ${value}`);
    } else {
      results.push(`⚠️  ${description} (${key}): Invalid value "${value}"`);
      allConfigured = false;
    }
    continue;
  }
  
  const isPlaceholder = !value || 
                        value.includes('your_') || 
                        value.includes('_here') ||
                        value.length < 10;
  
  if (!value) {
    results.push(`❌ ${description} (${key}): NOT SET`);
    allConfigured = false;
  } else if (isPlaceholder) {
    results.push(`⚠️  ${description} (${key}): Still using placeholder value`);
    allConfigured = false;
  } else {
    // Mask the value for security
    const masked = value.length > 10 
      ? value.substring(0, 6) + '...' + value.substring(value.length - 4)
      : '***';
    results.push(`✅ ${description} (${key}): ${masked}`);
  }
}

results.forEach(r => console.log(r));

console.log('\n' + '='.repeat(60) + '\n');

if (allConfigured) {
  console.log('✅ Plaid API is properly configured!');
  console.log('\n📝 Next steps:');
  console.log('   1. Start the dev server: npm run dev');
  console.log('   2. Open http://localhost:3000');
  console.log('   3. Click "Connect Your Bank Account"');
  console.log('   4. Test with Plaid sandbox credentials:');
  console.log('      - Username: user_good');
  console.log('      - Password: pass_good');
  console.log('      - MFA: 1234 (if prompted)\n');
  process.exit(0);
} else {
  console.log('⚠️  Plaid API configuration incomplete!');
  console.log('\n📝 Please update .env.local with your Plaid credentials.');
  console.log('   Get them from: https://dashboard.plaid.com\n');
  process.exit(1);
}
