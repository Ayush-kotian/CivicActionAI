import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { signToken } from '../utils/jwt.js';

/**
 * Register a new Citizen user
 * Required fields: Name, Phone Number, Email, Password, Confirm Password
 * Password must contain at least 6 characters.
 * Role is strictly assigned as 'citizen'.
 */
export async function signup(req, res, next) {
  try {
    const { name, phone, email, password, confirmPassword } = req.body;

    if (!name || !phone || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'All fields (Name, Phone Number, Email, Password, Confirm Password) are required.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least 6 characters.'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match. Please verify both entries.'
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Prevent registering with the predefined admin email
    if (cleanEmail === 'rajesh@gmail.com') {
      return res.status(400).json({
        success: false,
        message: 'This email is reserved for the municipal administration system.'
      });
    }

    // Check if user already exists
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address is already registered.'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Statically force role to 'citizen' (cannot register as admin)
    const user = await User.create({
      name: name.trim(),
      phone: phone.trim(),
      email: cleanEmail,
      password: hashedPassword,
      role: 'citizen'
    });

    const token = signToken({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });

    return res.status(201).json({
      success: true,
      message: 'Citizen registration successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Universal Sign In (Citizen & Authority)
 * Returns token and user profile
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const token = signToken({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });

    return res.json({
      success: true,
      message: 'Signed in successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get currently authenticated user
 */
export async function getMe(req, res) {
  return res.json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      phone: req.user.phone,
      email: req.user.email,
      role: req.user.role
    }
  });
}
