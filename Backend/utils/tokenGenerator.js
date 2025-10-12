import crypto from 'crypto';

/**
 * Generate a secure random token for email verification, password reset, etc.
 * @param {number} length - Length of the token (default: 32)
 * @returns {string} - Hex encoded token
 */
export const generateVerificationToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Generate a numeric OTP (One-Time Password)
 * @param {number} length - Length of OTP (default: 6)
 * @returns {string} - Numeric OTP
 */
export const generateOTP = (length = 6) => {
  const digits = '0123456789';
  let otp = '';
  
  for (let i = 0; i < length; i++) {
    otp += digits[crypto.randomInt(0, digits.length)];
  }
  
  return otp;
};

/**
 * Generate a secure random password
 * @param {number} length - Length of password (default: 12)
 * @returns {string} - Random password
 */
export const generatePassword = (length = 12) => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    password += charset[crypto.randomInt(0, charset.length)];
  }
  
  return password;
};

/**
 * Generate a unique identifier (like UUID v4)
 * @returns {string} - Unique identifier
 */
export const generateUniqueId = () => {
  return crypto.randomUUID();
};

/**
 * Generate a session token
 * @returns {string} - Session token
 */
export const generateSessionToken = () => {
  return generateVerificationToken(64);
};

/**
 * Generate an API key
 * @returns {string} - API key
 */
export const generateApiKey = () => {
  const prefix = 'bd_'; // Blood donation prefix
  const key = generateVerificationToken(24);
  return `${prefix}${key}`;
};

/**
 * Hash a token or password with salt
 * @param {string} data - Data to hash
 * @param {string} salt - Salt (optional, will generate if not provided)
 * @returns {object} - Object containing hash and salt
 */
export const hashWithSalt = (data, salt = null) => {
  if (!salt) {
    salt = crypto.randomBytes(16).toString('hex');
  }
  
  const hash = crypto.pbkdf2Sync(data, salt, 10000, 64, 'sha512').toString('hex');
  
  return { hash, salt };
};

/**
 * Verify hashed data
 * @param {string} data - Original data
 * @param {string} hash - Stored hash
 * @param {string} salt - Stored salt
 * @returns {boolean} - True if data matches
 */
export const verifyHash = (data, hash, salt) => {
  const verifyHash = crypto.pbkdf2Sync(data, salt, 10000, 64, 'sha512').toString('hex');
  return hash === verifyHash;
};

/**
 * Generate a confirmation code (alphanumeric)
 * @param {number} length - Length of code (default: 8)
 * @returns {string} - Confirmation code
 */
export const generateConfirmationCode = (length = 8) => {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  
  for (let i = 0; i < length; i++) {
    code += charset[crypto.randomInt(0, charset.length)];
  }
  
  return code;
};

/**
 * Generate a reference number for donations, appointments, etc.
 * @param {string} prefix - Prefix for the reference (default: 'REF')
 * @returns {string} - Reference number
 */
export const generateReferenceNumber = (prefix = 'REF') => {
  const timestamp = Date.now().toString().slice(-8); // Last 8 digits of timestamp
  const random = crypto.randomInt(1000, 9999); // 4-digit random number
  return `${prefix}${timestamp}${random}`;
};

/**
 * Generate blood bag number
 * @returns {string} - Blood bag number
 */
export const generateBloodBagNumber = () => {
  const prefix = 'BB';
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = crypto.randomInt(10000, 99999);
  
  return `${prefix}${year}${month}${day}${random}`;
};

/**
 * Generate appointment reference
 * @returns {string} - Appointment reference
 */
export const generateAppointmentReference = () => {
  return generateReferenceNumber('APT');
};

/**
 * Generate donation reference
 * @returns {string} - Donation reference
 */
export const generateDonationReference = () => {
  return generateReferenceNumber('DON');
};