import { encryptPINData, decryptPINData } from './encryption';

const STORAGE_KEY = 'bharatpin_saved_pins';
const ENCRYPTED_STORAGE_KEY = 'bharatpin_encrypted_pins';

/**
 * Get all saved PINs from localStorage (with decryption if master password is provided)
 * @param {string} masterPassword - Master password for decryption (optional)
 * @returns {Array} Array of saved PIN objects
 */
export async function getSavedPINs(masterPassword = null) {
  try {
    // Check if we have encrypted data
    const encryptedData = localStorage.getItem(ENCRYPTED_STORAGE_KEY);
    
    if (encryptedData && masterPassword) {
      // Decrypt the data
      const decryptedPINs = await decryptPINData(encryptedData, masterPassword);
      return Array.isArray(decryptedPINs) ? decryptedPINs : [];
    } else if (encryptedData && !masterPassword) {
      // Data is encrypted but no password provided
      return [];
    } else {
      // Check for legacy unencrypted data
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    }
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return [];
  }
}

/**
 * Save a new PIN to localStorage (with encryption if master password is provided)
 * @param {object} pinData - PIN data object {input, fourDigit, sixDigit, label?, timestamp}
 * @param {string} masterPassword - Master password for encryption (optional)
 * @returns {boolean} Success status
 */
export async function savePIN(pinData, masterPassword = null) {
  try {
    const savedPINs = await getSavedPINs(masterPassword);
    
    // Check if PIN already exists (same input)
    const existingIndex = savedPINs.findIndex(pin => pin.input === pinData.input);
    
    const newPin = {
      id: existingIndex >= 0 ? savedPINs[existingIndex].id : generateId(),
      input: pinData.input,
      fourDigit: pinData.fourDigit,
      sixDigit: pinData.sixDigit,
      password: pinData.password,
      passwordWithSymbol: pinData.passwordWithSymbol,
      label: pinData.label || pinData.input,
      timestamp: existingIndex >= 0 ? savedPINs[existingIndex].timestamp : Date.now(),
      updatedAt: Date.now()
    };

    if (existingIndex >= 0) {
      // Update existing PIN
      savedPINs[existingIndex] = newPin;
    } else {
      // Add new PIN
      savedPINs.unshift(newPin);
    }

    if (masterPassword) {
      // Encrypt and save
      const encryptedData = await encryptPINData(savedPINs, masterPassword);
      localStorage.setItem(ENCRYPTED_STORAGE_KEY, encryptedData);
      // Remove legacy unencrypted data
      localStorage.removeItem(STORAGE_KEY);
    } else {
      // Save unencrypted (for backward compatibility)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedPINs));
    }
    
    return true;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    return false;
  }
}

/**
 * Delete a PIN from localStorage
 * @param {string} id - PIN ID to delete
 * @returns {boolean} Success status
 */
export function deletePIN(id) {
  try {
    const savedPINs = getSavedPINs();
    const filteredPINs = savedPINs.filter(pin => pin.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredPINs));
    return true;
  } catch (error) {
    console.error('Error deleting from localStorage:', error);
    return false;
  }
}

/**
 * Update PIN label
 * @param {string} id - PIN ID
 * @param {string} newLabel - New label
 * @returns {boolean} Success status
 */
export function updatePINLabel(id, newLabel) {
  try {
    const savedPINs = getSavedPINs();
    const pinIndex = savedPINs.findIndex(pin => pin.id === id);
    
    if (pinIndex >= 0) {
      savedPINs[pinIndex].label = newLabel;
      savedPINs[pinIndex].updatedAt = Date.now();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedPINs));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error updating PIN label:', error);
    return false;
  }
}

/**
 * Export saved PINs as JSON
 * @returns {string} JSON string of all saved PINs
 */
export function exportPINs() {
  const savedPINs = getSavedPINs();
  return JSON.stringify(savedPINs, null, 2);
}

/**
 * Import PINs from JSON string
 * @param {string} jsonString - JSON string containing PIN data
 * @returns {object} Result with success status and message
 */
export function importPINs(jsonString) {
  try {
    const importedPINs = JSON.parse(jsonString);
    
    if (!Array.isArray(importedPINs)) {
      return { success: false, message: 'Invalid format: expected array of PINs' };
    }

    // Validate imported data structure
    const validPINs = importedPINs.filter(pin => 
      pin.input && pin.fourDigit && pin.sixDigit
    ).map(pin => ({
      ...pin,
      // Ensure new fields exist for backward compatibility
      password: pin.password || '',
      passwordWithSymbol: pin.passwordWithSymbol || ''
    }));

    if (validPINs.length === 0) {
      return { success: false, message: 'No valid PINs found in import data' };
    }

    // Merge with existing PINs (avoid duplicates)
    const existingPINs = getSavedPINs();
    const existingInputs = new Set(existingPINs.map(pin => pin.input));
    
    const newPINs = validPINs.filter(pin => !existingInputs.has(pin.input))
      .map(pin => ({
        ...pin,
        id: pin.id || generateId(),
        timestamp: pin.timestamp || Date.now(),
        updatedAt: Date.now()
      }));

    const mergedPINs = [...newPINs, ...existingPINs];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedPINs));

    return { 
      success: true, 
      message: `Successfully imported ${newPINs.length} new PINs` 
    };
  } catch (error) {
    return { success: false, message: 'Invalid JSON format' };
  }
}

/**
 * Clear all saved PINs
 * @returns {boolean} Success status
 */
export function clearAllPINs() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
}

/**
 * Generate unique ID for PINs
 * @returns {string} Unique ID
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Check if we have encrypted data that requires master password
 * @returns {boolean}
 */
export function hasEncryptedData() {
  return localStorage.getItem(ENCRYPTED_STORAGE_KEY) !== null;
}

/**
 * Check if we have any saved PINs (encrypted or unencrypted)
 * @returns {boolean}
 */
export function hasSavedPINs() {
  return localStorage.getItem(ENCRYPTED_STORAGE_KEY) !== null || 
         localStorage.getItem(STORAGE_KEY) !== null;
}

/**
 * Migrate unencrypted data to encrypted storage
 * @param {string} masterPassword - Master password for encryption
 * @returns {boolean} Success status
 */
export async function migrateToEncrypted(masterPassword) {
  try {
    const unencryptedData = localStorage.getItem(STORAGE_KEY);
    if (!unencryptedData) return true;
    
    const pins = JSON.parse(unencryptedData);
    const encryptedData = await encryptPINData(pins, masterPassword);
    
    localStorage.setItem(ENCRYPTED_STORAGE_KEY, encryptedData);
    localStorage.removeItem(STORAGE_KEY);
    
    return true;
  } catch (error) {
    console.error('Error migrating to encrypted storage:', error);
    return false;
  }
}

/**
 * Get storage usage statistics
 * @returns {object} Storage stats
 */
export function getStorageStats() {
  const savedPINs = getSavedPINs();
  const storageData = localStorage.getItem(STORAGE_KEY) || '';
  
  return {
    totalPINs: savedPINs.length,
    storageSize: new Blob([storageData]).size,
    lastUpdated: savedPINs.length > 0 ? Math.max(...savedPINs.map(pin => pin.updatedAt || pin.timestamp)) : null
  };
}