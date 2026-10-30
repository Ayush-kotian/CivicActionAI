import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';

export async function ensureDemoAdmin() {
  try {
    const existingAdmin = await User.findOne({ email: 'rajesh@gmail.com' });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('123456', 10);
      await User.create({
        name: 'Rajesh',
        email: 'rajesh@gmail.com',
        phone: '9876543210',
        password: hashedPassword,
        role: 'admin'
      });
      console.log('[Auth] Predefined single demo admin account verified (Rajesh - rajesh@gmail.com)');
    }
  } catch (err) {
    console.error('[Auth] Failed to initialize demo admin account:', err.message);
  }
}
