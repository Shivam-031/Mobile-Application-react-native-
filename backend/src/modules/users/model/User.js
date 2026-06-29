const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
  },
  phone: {
    type: String,
    match: [/^[6-9]\d{9}$/, 'Please provide a valid Indian mobile number'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false,
  },
  role: {
    type: String,
    enum: ['USER', 'EMPLOYEE', 'MASTER_ADMIN'],
    default: 'USER',
  },
  state: { type: String },
  district: { type: String },
  avatar: {
    url: String,
    publicId: String,
  },
  greenScore: { type: Number, default: 0 },
  badges: [{
    name: String,
    earnedAt: { type: Date, default: Date.now },
  }],
  fcmToken: String,
  refreshToken: { type: String, select: false },
  passwordResetToken: { type: String, select: false },
  passwordResetExpires: { type: Date, select: false },
  isActive: { type: Boolean, default: true },
  lastLogin: Date,
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.addGreenScore = async function (points) {
  this.greenScore += points;
  await this.save();
};

module.exports = mongoose.model('User', userSchema);
