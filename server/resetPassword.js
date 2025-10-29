require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function resetPassword() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    const email = 'testadmin@example.com';
    const newPassword = '123456';
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update the user's password
    const result = await User.updateOne(
      { email: email },
      { password: hashedPassword }
    );
    
    if (result.matchedCount > 0) {
      console.log(`✅ Password reset successful for ${email}`);
      console.log(`🔑 New password: ${newPassword}`);
    } else {
      console.log(`❌ User with email ${email} not found`);
    }
    
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

resetPassword();