require('dotenv').config({ path: '.env.local' });
const fetch = require('node-fetch');

async function checkServer() {
  try {
    const response = await fetch('http://localhost:3000/api/health');
    return response.ok;
  } catch (error) {
    return false;
  }
}

async function createSuperAdmin() {
  try {
    // Check if server is running
    console.log('🔄 Checking server status...');
    const isServerRunning = await checkServer();
    if (!isServerRunning) {
      throw new Error('Next.js server is not running. Please start it with npm run dev');
    }
    console.log('✅ Server is running');

    console.log('🔄 Creating superadmin account...');
    const response = await fetch('http://localhost:3000/api/setup/create-superadmin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Server response:', data);
      throw new Error(data.message || data.error || 'Failed to create superadmin');
    }

    if (data.message === 'Superadmin already exists') {
      console.log('ℹ️ Superadmin account already exists');
      console.log('Email:', data.user.email);
      console.log('Username:', data.user.username);
    } else {
      console.log('✅ Setup completed successfully!');
      console.log('\nLogin credentials:');
      console.log('Email: sr4jan@almalink.com');
      console.log('Password: SuperAdmin@123');
      console.log('\n⚠️ Please change your password after first login');
    }

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.log('\nDebug information:');
    console.log('Node version:', process.version);
    console.log('\nTroubleshooting steps:');
    console.log('1. Make sure Next.js server is running (npm run dev)');
    console.log('2. Check server console for detailed error messages');
    console.log('3. Verify MongoDB connection is working');
    console.log('4. Check if models are properly defined');
    process.exit(1);
  }
}

createSuperAdmin();