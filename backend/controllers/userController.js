const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { pool } = require('../config/mysql');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '3d', // Change to shorter time like '7d' if needed
  });
};

// @desc    Register new user
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Please add all fields' });
  }

  try {
    // Check if user exists
    const [userExists] = await pool.execute(
      'SELECT * FROM users WHERE email = ? OR username = ?',
      [email, username]
    );

    if (userExists.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const [result] = await pool.execute(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );

    if (result.insertId) {
      res.status(201).json({
        id: result.insertId,
        username,
        email,
        token: generateToken(result.insertId),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Authenticate a user
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check for user email
    const [user] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (user.length > 0 && (await bcrypt.compare(password, user[0].password))) {
      res.json({
        id: user[0].id,
        username: user[0].username,
        email: user[0].email,
        token: generateToken(user[0].id),
      });
    } else {
      res.status(400).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user data
// @route   GET /api/users/me
// @access  Private
const getMe = async (req, res) => {
  res.status(200).json(req.user);
};

// @desc    Forgot password
// @route   POST /api/users/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Please provide an email address' });
  }

  try {
    // Check if user exists
    const [user] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (user.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    try {
      // Try to store reset token in database
      await pool.execute(
        'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE email = ?',
        [resetToken, resetTokenExpiry, email]
      );
    } catch (dbError) {
      console.error('Database error updating reset token:', dbError);
      
      // If we get an error about missing columns, suggest running migration
      if (dbError.code === 'ER_BAD_FIELD_ERROR') {
        return res.status(500).json({ 
          message: 'Database schema needs to be updated. Please run: npm run migrate' 
        });
      }
      
      return res.status(500).json({ message: 'Server error' });
    }

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
    
    // Send email with reset link
    try {
      // Use direct SMTP configuration for Mailtrap
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Password Reset Request',
        html: `
          <h1>You requested a password reset</h1>
          <p>Please use the following link to reset your password:</p>
          <a href="${resetUrl}" clicktracking="off">${resetUrl}</a>
          <p>This link will expire in 1 hour.</p>
        `,
      };

      await transporter.sendMail(mailOptions);
      
      console.log('Password reset email sent to:', email);
      res.status(200).json({ success: true, message: 'Email sent' });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      
      // Log more details about the error for debugging
      console.error('Email config:', {
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        username: process.env.EMAIL_USERNAME ? 'Set' : 'Not set',
        password: process.env.EMAIL_PASSWORD ? 'Set' : 'Not set'
      });
      
      res.status(500).json({ 
        message: 'Failed to send password reset email. Please try again later.'
      });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Reset password
// @route   PUT /api/users/reset-password/:resetToken
// @access  Public
const resetPassword = async (req, res) => {
  const { resetToken } = req.params;
  const { password } = req.body;

  if (!resetToken || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // Find user with valid reset token
    const [user] = await pool.execute(
      'SELECT * FROM users WHERE reset_token = ? AND reset_token_expiry > ?',
      [resetToken, new Date()]
    );

    if (user.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update user password and clear reset token
    await pool.execute(
      'UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?',
      [hashedPassword, user[0].id]
    );

    res.status(200).json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  forgotPassword,
  resetPassword,
};
