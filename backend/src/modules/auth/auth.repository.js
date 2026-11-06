import { Admin } from './auth.model.js';

export class AuthRepository {
  /**
   * Finds an admin by lowercase email address.
   * @param {string} email
   */
  async findByEmail(email) {
    return Admin.findOne({ email: email.toLowerCase().trim() });
  }

  /**
   * Creates an admin account.
   * @param {{ email: string, passwordHash: string }} data
   */
  async create(data) {
    return Admin.create({
      email: data.email.toLowerCase().trim(),
      passwordHash: data.passwordHash,
    });
  }

  /**
   * Finds an admin by ID.
   * @param {string} id
   */
  async findById(id) {
    return Admin.findById(id).select('-passwordHash');
  }

  /**
   * Counts existing admin accounts.
   */
  async count() {
    return Admin.countDocuments();
  }
}

export const authRepository = new AuthRepository();

