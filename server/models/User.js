const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6, select: false },
  role: { type: String, enum: ['student', 'client', 'admin'], default: 'student' },
  status: { type: String, enum: ['active', 'suspended'], default: 'active' },
  bio: { type: String, maxlength: 500 },
skills: [String],
profilePic: {
  url: String,
  public_id: String
},
socialLinks: {
  linkedin: String,
  github: String
},
averageStudentRating: { type: Number, default: 0 },
averageClientRating: { type: Number, default: 0 },
// Password reset fields
otp: { type: String, select: false },
otpExpires: { type: Date, select: false }
}, { timestamps: true });

userSchema.pre('save', async function(next){
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.methods.comparePassword = function(candidate){
  return bcrypt.compare(candidate, this.password);
};

// Custom toJSON method to exclude sensitive fields
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.otp;
  delete user.otpExpires;
  delete user.__v;
  return user;
};

module.exports = mongoose.model('User', userSchema);
