#!/usr/bin/env node

/**
 * Activate HOD Script
 * 
 * This script activates the HOD user in the database
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

async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://event:event123@recruiterprofile.lyuu6mz.mongodb.net/');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.log(`❌ Failed to connect to MongoDB: ${error.message}`);
    process.exit(1);
  }
}

async function activateHOD() {
  try {
    console.log('🔧 Activating HOD user...');
    
    // Find the HOD user
    const hod = await User.findOne({ role: 'hod', name: 'Rajan' });
    
    if (!hod) {
      console.log('❌ HOD user "Rajan" not found!');
      return;
    }
    
    console.log(`📋 Current HOD status: ${hod.name} - Active: ${hod.isActive}`);
    
    // Update the HOD to be active
    const result = await User.updateOne(
      { role: 'hod', name: 'Rajan' },
      { $set: { isActive: true } }
    );
    
    console.log('✅ HOD activation result:', result);
    
    // Verify the update
    const updatedHod = await User.findOne({ role: 'hod', name: 'Rajan' });
    console.log('✅ Updated HOD status:', {
      name: updatedHod.name,
      isActive: updatedHod.isActive,
      hasSignature: !!updatedHod.signature?.imageData,
      signatureActive: updatedHod.signature?.isActive
    });
    
    if (updatedHod.isActive) {
      console.log('🎉 HOD successfully activated! Certificates will now use "Dr. Rajan" instead of the fallback name.');
    }
    
  } catch (error) {
    console.log(`❌ Error activating HOD: ${error.message}`);
  }
}

async function main() {
  console.log('🔧 HOD Activation Script');
  console.log('This script activates the HOD user for certificate generation\n');
  
  // Connect to database
  await connectToDatabase();
  
  // Activate HOD
  await activateHOD();
  
  // Close database connection
  await mongoose.connection.close();
  console.log('\n✅ Database connection closed');
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.log(`❌ Unhandled rejection: ${error.message}`);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.log(`❌ Uncaught exception: ${error.message}`);
  process.exit(1);
});

// Run the script
main().catch((error) => {
  console.log(`❌ Script failed: ${error.message}`);
  process.exit(1);
});