const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../../users/model/User');

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  });
  return { accessToken, refreshToken };
};

// Resolve role from optional signup keys. The client never sets `role` directly;
// the only ways to become MASTER_ADMIN or EMPLOYEE on signup are to present the
// matching secret. Returns { role, state, district } or throws a 403-tagged
// error if a key was supplied but didn't match. Missing-state errors for
// employee signup surface as 400 (validation) rather than 403 (auth).
const resolveSignupRole = ({ adminKey, employeeKey, state, district }) => {
  // Admin takes precedence over employee if both keys are provided — admin
  // signups are the more privileged path.
  if (adminKey) {
    const expected = process.env.ADMIN_SIGNUP_KEY;
    if (!expected) {
      const err = new Error('Admin signup is currently disabled');
      err.statusCode = 403;
      throw err;
    }
    const a = Buffer.from(adminKey);
    const b = Buffer.from(expected);
    const match = a.length === b.length && crypto.timingSafeEqual(a, b);
    if (!match) {
      const err = new Error('Invalid admin key');
      err.statusCode = 403;
      throw err;
    }
    return { role: 'MASTER_ADMIN', state, district };
  }

  if (employeeKey) {
    const expected = process.env.EMPLOYEE_SIGNUP_KEY;
    if (!expected) {
      const err = new Error('Employee signup is currently disabled');
      err.statusCode = 403;
      throw err;
    }
    const a = Buffer.from(employeeKey);
    const b = Buffer.from(expected);
    const match = a.length === b.length && crypto.timingSafeEqual(a, b);
    if (!match) {
      const err = new Error('Invalid employee key');
      err.statusCode = 403;
      throw err;
    }
    // Employee role requires a state+district at signup time — we don't want
    // employees with no region attached to the system.
    if (!state || !district) {
      throw new Error('State and district are required for employee signup');
    }
    return { role: 'EMPLOYEE', state, district };
  }

  // No key supplied → always USER. Don't reveal whether signup keys are set.
  return { role: 'USER', state, district };
};

const registerUser = async ({ name, email, phone, password, adminKey, employeeKey, state, district }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) throw new Error('User with this email already exists');

  const { role, state: resolvedState, district: resolvedDistrict } = resolveSignupRole({ adminKey, employeeKey, state, district });

  const user = await User.create({
    name, email, phone, password, role,
    state: resolvedState || undefined,
    district: resolvedDistrict || undefined,
  });
  const { accessToken, refreshToken } = generateTokens(user._id);

  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  return { user: sanitizeUser(user), accessToken, refreshToken };
};

const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password +refreshToken');
  if (!user || !user.isActive) throw new Error('Invalid email or password');

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new Error('Invalid email or password');

  const { accessToken, refreshToken } = generateTokens(user._id);
  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  return { user: sanitizeUser(user), accessToken, refreshToken };
};

const refreshAccessToken = async (token) => {
  const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  const user = await User.findById(decoded.id).select('+refreshToken');
  if (!user || user.refreshToken !== token) throw new Error('Invalid refresh token');

  const { accessToken, refreshToken } = generateTokens(user._id);
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

const forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error('No user found with that email');

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  await user.save({ validateBeforeSave: false });

  return resetToken; // Caller sends this via email
};

const resetPassword = async (token, newPassword) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) throw new Error('Token is invalid or has expired');

  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  const { accessToken, refreshToken } = generateTokens(user._id);
  return { user: sanitizeUser(user), accessToken, refreshToken };
};

const logoutUser = async (userId) => {
  await User.findByIdAndUpdate(userId, { refreshToken: null });
};

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  state: user.state,
  district: user.district,
  greenScore: user.greenScore,
  badges: user.badges,
  avatar: user.avatar,
});

module.exports = { registerUser, loginUser, refreshAccessToken, forgotPassword, resetPassword, logoutUser };
