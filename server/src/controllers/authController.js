import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { signToken } from '../utils/jwt.js';

/**
 * Register a new Citizen user
 * Required fields: Name, Username, Phone, Email, Password, Confirm Password
 * Password must contain at least 6 characters.
 * Role is strictly assigned as 'citizen'.
 */
export async function signup(req, res, next) {
  try {
    const { name, username, phone, email, password, confirmPassword } = req.body;

    if (!name || !username || !phone || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'All fields (Name, Username, Phone, Email, Password, Confirm Password) are required.'
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
    const cleanUsername = username.toLowerCase().trim();

    // Prevent registering with the predefined admin credentials
    if (cleanEmail === 'rajesh@gmail.com' || cleanUsername === 'rajesh') {
      return res.status(400).json({
        success: false,
        message: 'This account identifier is reserved for municipal administration.'
      });
    }

    // Check if user already exists with this email or username
    const existing = await User.findOne({
      $or: [{ email: cleanEmail }, { username: cleanUsername }]
    });

    if (existing) {
      const field = existing.email === cleanEmail ? 'email address' : 'username';
      return res.status(409).json({
        success: false,
        message: `An account with this ${field} is already registered.`
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Statically force role to 'citizen' (cannot register as admin)
    const user = await User.create({
      name: name.trim(),
      username: cleanUsername,
      phone: phone.trim(),
      email: cleanEmail,
      password: hashedPassword,
      role: 'citizen'
    });

    const token = signToken({
      id: user._id,
      name: user.name,
      username: user.username,
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
        username: user.username,
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
 * Accepts either Email or Username + Password
 * Returns token and user profile
 */
export async function login(req, res, next) {
  try {
    const { email, username, identifier, password } = req.body;
    if (typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Password must be a valid string.'
      });
    }

    const rawId = (typeof email === 'string' && email) || 
                  (typeof username === 'string' && username) || 
                  (typeof identifier === 'string' && identifier) || '';
    const loginId = rawId.toLowerCase().trim();

    if (!loginId || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email or Username and password are required.'
      });
    }

    // Lookup user by either email or username
    const user = await User.findOne({
      $or: [{ email: loginId }, { username: loginId }]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email/username or password.'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email/username or password.'
      });
    }

    const token = signToken({
      id: user._id,
      name: user.name,
      username: user.username,
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
        username: user.username,
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
      username: req.user.username,
      phone: req.user.phone,
      email: req.user.email,
      role: req.user.role
    }
  });
}
