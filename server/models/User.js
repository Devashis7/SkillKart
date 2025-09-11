const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6, select: false },
  role: { type: String, enum: ['student', 'client', 'admin'], default: 'student' },
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
averageStudentRating: { type: Number, default: 0 }
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

module.exports = mongoose.model('User', userSchema);
