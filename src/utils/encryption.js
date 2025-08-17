/**
 * Client-side encryption utilities for master password protection
 */

const MASTER_PASSWORD_KEY = 'bharatpin_master_hash';
const SALT_KEY = 'bharatpin_salt';

/**
 * Generate a random salt for password hashing
 */
function generateSalt() {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Hash the master password with salt
 */
async function hashPassword(password, salt) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Set up master password for the first time
 */
export async function setupMasterPassword(password) {
  try {
    if (!password || password.length < 4) {
      throw new Error('Master password must be at least 4 characters long');
    }

    const salt = generateSalt();
    const hashedPassword = await hashPassword(password, salt);
    
    localStorage.setItem(MASTER_PASSWORD_KEY, hashedPassword);
    localStorage.setItem(SALT_KEY, salt);
    
    return true;
  } catch (error) {
    console.error('Error setting up master password:', error);
    return false;
  }
}

/**
 * Verify master password
 */
export async function verifyMasterPassword(password) {
  try {
    const storedHash = localStorage.getItem(MASTER_PASSWORD_KEY);
    const salt = localStorage.getItem(SALT_KEY);
    
    if (!storedHash || !salt) {
      return false;
    }
    
    const hashedPassword = await hashPassword(password, salt);
    return hashedPassword === storedHash;
  } catch (error) {
    console.error('Error verifying master password:', error);
    return false;
  }
}

/**
 * Check if master password is set
 */
export function isMasterPasswordSet() {
  return localStorage.getItem(MASTER_PASSWORD_KEY) !== null;
}

/**
 * Simple encryption using XOR with master password hash
 * Note: This is basic encryption for demo purposes
 */
async function simpleEncrypt(text, password) {
  const salt = localStorage.getItem(SALT_KEY);
  const key = await hashPassword(password, salt);
  
  let encrypted = '';
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    const keyChar = key.charCodeAt(i % key.length);
    encrypted += String.fromCharCode(charCode ^ keyChar);
  }
  
  // Base64 encode to make it safe for storage
  return btoa(encrypted);
}

/**
 * Simple decryption using XOR with master password hash
 */
async function simpleDecrypt(encryptedText, password) {
  try {
    const salt = localStorage.getItem(SALT_KEY);
    const key = await hashPassword(password, salt);
    
    // Base64 decode first
    const encrypted = atob(encryptedText);
    
    let decrypted = '';
    for (let i = 0; i < encrypted.length; i++) {
      const charCode = encrypted.charCodeAt(i);
      const keyChar = key.charCodeAt(i % key.length);
      decrypted += String.fromCharCode(charCode ^ keyChar);
    }
    
    return decrypted;
  } catch (error) {
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Encrypt PIN data for storage
 */
export async function encryptPINData(pinData, masterPassword) {
  try {
    const jsonString = JSON.stringify(pinData);
    return await simpleEncrypt(jsonString, masterPassword);
  } catch (error) {
    console.error('Error encrypting PIN data:', error);
    throw error;
  }
}

/**
 * Decrypt PIN data from storage
 */
export async function decryptPINData(encryptedData, masterPassword) {
  try {
    const decryptedString = await simpleDecrypt(encryptedData, masterPassword);
    return JSON.parse(decryptedString);
  } catch (error) {
    console.error('Error decrypting PIN data:', error);
    throw error;
  }
}

/**
 * Change master password
 */
export async function changeMasterPassword(oldPassword, newPassword) {
  try {
    // Verify old password first
    const isValid = await verifyMasterPassword(oldPassword);
    if (!isValid) {
      throw new Error('Current password is incorrect');
    }
    
    if (!newPassword || newPassword.length < 4) {
      throw new Error('New password must be at least 4 characters long');
    }
    
    // Set up new password
    return await setupMasterPassword(newPassword);
  } catch (error) {
    console.error('Error changing master password:', error);
    throw error;
  }
}

/**
 * Reset master password (clears all data)
 */
export function resetMasterPassword() {
  if (window.confirm('This will delete all saved PINs. Are you sure?')) {
    localStorage.removeItem(MASTER_PASSWORD_KEY);
    localStorage.removeItem(SALT_KEY);
    localStorage.removeItem('bharatpin_saved_pins');
    return true;
  }
  return false;
}