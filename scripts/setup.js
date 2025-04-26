const { exec } = require('child_process');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: '.env.local' });

// Execute the setup script with environment variables
const child = exec('node scripts/setup-superadmin.js', {
  env: {
    ...process.env,
    SETUP_KEY: 'superadmin_setup_123'
  }
});

child.stdout.pipe(process.stdout);
child.stderr.pipe(process.stderr);