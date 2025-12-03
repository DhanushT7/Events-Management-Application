#!/usr/bin/env node

/**
 * HOD Status Checker Script
 * 
 * This script checks the current HOD status in the database
 * and helps diagnose certificate generation issues.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import models
import User from '../src/shared/models/userModel.js';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://event:event123@recruiterprofile.lyuu6mz.mongodb.net/');
    log('✅ Connected to MongoDB', 'green');
  } catch (error) {
    log(`❌ Failed to connect to MongoDB: ${error.message}`, 'red');
    process.exit(1);
  }
}

async function checkHODUsers() {
  try {
    log('\n🔍 Checking HOD users in the database...', 'blue');
    
    // Find all users with HOD role
    const hodUsers = await User.find({ role: 'hod' }).select('name email role isActive signature department createdAt');
    
    if (hodUsers.length === 0) {
      log('❌ No HOD users found in the database!', 'red');
      log('\n💡 To create an HOD user:', 'yellow');
      log('1. Register a new user with role "hod"', 'yellow');
      log('2. Or update an existing user\'s role to "hod"', 'yellow');
      return;
    }
    
    log(`\n📊 Found ${hodUsers.length} HOD user(s):`, 'green');
    
    hodUsers.forEach((hod, index) => {
      log(`\n${index + 1}. HOD User Details:`, 'cyan');
      log(`   Name: ${hod.name}`, 'white');
      log(`   Email: ${hod.email}`, 'white');
      log(`   Department: ${hod.department || 'Not set'}`, 'white');
      log(`   Active: ${hod.isActive ? '✅ Yes' : '❌ No'}`, hod.isActive ? 'green' : 'red');
      log(`   Created: ${hod.createdAt.toLocaleDateString()}`, 'white');
      
      if (hod.signature) {
        log(`   Signature:`, 'white');
        log(`     - Has Image: ${hod.signature.imageData ? '✅ Yes' : '❌ No'}`, hod.signature.imageData ? 'green' : 'red');
        log(`     - Active: ${hod.signature.isActive ? '✅ Yes' : '❌ No'}`, hod.signature.isActive ? 'green' : 'red');
        log(`     - Type: ${hod.signature.signatureType || 'Not set'}`, 'white');
        log(`     - Uploaded: ${hod.signature.uploadedAt ? new Date(hod.signature.uploadedAt).toLocaleDateString() : 'Never'}`, 'white');
      } else {
        log(`   Signature: ❌ No signature uploaded`, 'red');
      }
    });
    
    // Check for active HOD with signature
    const activeHodWithSignature = hodUsers.find(hod => 
      hod.isActive && hod.signature?.imageData && hod.signature?.isActive
    );
    
    const activeHod = hodUsers.find(hod => hod.isActive);
    
    log('\n🎯 Certificate Generation Status:', 'blue');
    
    if (activeHodWithSignature) {
      log(`✅ Ready for certificate generation with signature!`, 'green');
      log(`   Using: ${activeHodWithSignature.name}`, 'green');
      log(`   Signature: Active and available`, 'green');
    } else if (activeHod) {
      log(`⚠️  Ready for certificate generation WITHOUT signature`, 'yellow');
      log(`   Using: ${activeHod.name}`, 'yellow');
      log(`   Signature: ${activeHod.signature?.imageData ? 'Available but inactive' : 'Not uploaded'}`, 'yellow');
    } else {
      log(`❌ No active HOD found!`, 'red');
      log(`   Certificate generation will use fallback name`, 'red');
    }
    
  } catch (error) {
    log(`❌ Error checking HOD users: ${error.message}`, 'red');
  }
}

async function checkEnvironmentVariables() {
  log('\n🔧 Environment Variables:', 'blue');
  log(`   DEPARTMENT_HEAD: ${process.env.DEPARTMENT_HEAD || 'Not set'}`, 'white');
  log(`   MONGO_URI: ${process.env.MONGO_URI ? 'Set' : 'Not set'}`, 'white');
  log(`   FRONTEND_URL: ${process.env.FRONTEND_URL || 'Not set'}`, 'white');
}

async function suggestFixes() {
  log('\n💡 Suggestions to fix certificate generation:', 'yellow');
  log('1. Ensure at least one HOD user exists with isActive: true', 'white');
  log('2. HOD should upload and activate their signature', 'white');
  log('3. Check that HOD name is properly set in the database', 'white');
  log('4. Regenerate certificates after fixing HOD information', 'white');
  
  log('\n🔧 Quick fixes:', 'cyan');
  log('• To create HOD user: Register with role "hod"', 'white');
  log('• To activate HOD: Update isActive field to true', 'white');
  log('• To upload signature: Use HOD Dashboard > Signature Management', 'white');
  log('• To regenerate certificates: Use the regeneration endpoints', 'white');
}

async function main() {
  log(`${colors.bright}🔍 HOD Status Checker${colors.reset}`);
  log('This script checks HOD configuration for certificate generation\n');
  
  // Connect to database
  await connectToDatabase();
  
  // Check HOD users
  await checkHODUsers();
  
  // Check environment variables
  await checkEnvironmentVariables();
  
  // Suggest fixes
  await suggestFixes();
  
  // Close database connection
  await mongoose.connection.close();
  log('\n✅ Database connection closed', 'green');
}

// Handle errors
process.on('unhandledRejection', (error) => {
  log(`❌ Unhandled rejection: ${error.message}`, 'red');
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  log(`❌ Uncaught exception: ${error.message}`, 'red');
  process.exit(1);
});

// Run the script
main().catch((error) => {
  log(`❌ Script failed: ${error.message}`, 'red');
  process.exit(1);
});