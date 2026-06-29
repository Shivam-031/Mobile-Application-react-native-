const authService = require('../service/authService');

const register = async (req, res) => {
  try {
    const { name, email, phone, password, adminKey, employeeKey, state, district } = req.body;
    const result = await authService.registerUser({ name, email, phone, password, adminKey, employeeKey, state, district });
    res.status(201).json({ success: true, message: 'Registration successful', data: result });
  } catch (error) {
    // Auth/admin-key errors should surface as 403, not 400 — distinguishes
    // "you typed a wrong key" from "your email is malformed".
    if (error.statusCode === 403) {
      return res.status(403).json({ success: false, message: error.message });
    }
    res.status(400).json({ success: false, message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser({ email, password });
    res.status(200).json({ success: true, message: 'Login successful', data: result });
  } catch (error) {
    res.status(401).json({ success: false, message: error.message });
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ success: false, message: 'Refresh token required' });
    const result = await authService.refreshAccessToken(refreshToken);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(401).json({ success: false, message: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const resetToken = await authService.forgotPassword(email);
    // TODO: Send email with resetToken
    res.status(200).json({ success: true, message: 'Password reset email sent (check logs in dev)', resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    const result = await authService.resetPassword(token, password);
    res.status(200).json({ success: true, message: 'Password reset successful', data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const logout = async (req, res) => {
  try {
    await authService.logoutUser(req.user._id);
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMe = async (req, res) => {
  res.status(200).json({ success: true, data: { user: req.user } });
};

module.exports = { register, login, refreshToken, forgotPassword, resetPassword, logout, getMe };
