import { User, IUserDocument } from '../models/user.model.js';
import { IUserSanitized } from '../types/auth.types.js';
import { signToken } from '../utils/jwt.js';

export class AuthService {
  /**
   * Authenticate user credentials and return sanitized user + JWT token
   */
  static async login(
    email: string,
    password: string
  ): Promise<{ user: IUserSanitized; token: string }> {
    // Standardize email to lowercase and trim
    const normalizedEmail = email.trim().toLowerCase();

    // Query user and explicitly select passwordHash
    const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');

    if (!user) {
      throw new Error('Invalid email or password');
    }

    if (!user.isActive) {
      throw new Error('Account is deactivated. Please contact your organization administrator.');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    // Generate JWT token
    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    });

    return {
      user: user.toSanitized(),
      token,
    };
  }

  /**
   * Fetch current authenticated user by userId
   */
  static async getMe(userId: string): Promise<IUserSanitized> {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    if (!user.isActive) {
      throw new Error('User account is deactivated');
    }

    return user.toSanitized();
  }

  /**
   * Create an initial user (used in seeding or admin provisioning)
   */
  static async createUser(data: {
    fullName: string;
    email: string;
    passwordHash: string;
    role: 'ADMIN' | 'SUPERVISOR' | 'INSPECTOR';
    organizationId?: string;
  }): Promise<IUserDocument> {
    const user = new User({
      ...data,
      email: data.email.trim().toLowerCase(),
    });
    return user.save();
  }
}
