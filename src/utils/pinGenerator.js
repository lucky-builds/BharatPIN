/**
 * Generate PIN using SHA-256 hash of input text (matching Python backend logic)
 * @param {string} input - The input text to generate PIN from
 * @returns {object} - Object containing 4-digit, 6-digit PINs and passwords
 */
export async function generatePIN(input) {
  if (!input || typeof input !== 'string') {
    throw new Error('Input must be a non-empty string');
  }

  // Normalize input: trim spaces and convert to lowercase (matching Python logic)
  const normalizedInput = input.trim().toLowerCase();
  
  if (normalizedInput.length === 0) {
    throw new Error('Input cannot be empty');
  }

  // Convert string to ArrayBuffer for hashing
  const encoder = new TextEncoder();
  const data = encoder.encode(normalizedInput);

  // Generate SHA-256 hash
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  
  // Convert hash to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  // Convert hash to numeric PIN (matching Python: int(sha256_hash, 16))
  // JavaScript BigInt can handle large hex numbers
  const numericPin = BigInt('0x' + hashHex);
  const numericPinStr = numericPin.toString();

  // Extract the first 4 and 6 digits (matching Python logic)
  const fourDigitPIN = numericPinStr.substring(0, 4);
  const sixDigitPIN = numericPinStr.substring(0, 6);
  
  // Generate password (first 8 characters of hex hash)
  const password = hashHex.substring(0, 8);
  
  // Generate password with symbol (password + "@" + first 3 digits of numeric pin)
  const passwordWithSymbol = password + "@" + numericPinStr.substring(0, 3);

  return {
    fourDigit: fourDigitPIN,
    sixDigit: sixDigitPIN,
    password: password,
    passwordWithSymbol: passwordWithSymbol,
    input: normalizedInput
  };
}

/**
 * Validate if input is suitable for PIN generation
 * @param {string} input - The input to validate
 * @returns {object} - Validation result with isValid and message
 */
export function validateInput(input) {
  if (!input || typeof input !== 'string') {
    return { isValid: false, message: 'Please enter a valid word or phrase' };
  }

  const trimmed = input.trim();
  if (trimmed.length === 0) {
    return { isValid: false, message: 'Input cannot be empty' };
  }

  if (trimmed.length > 100) {
    return { isValid: false, message: 'Input is too long (max 100 characters)' };
  }

  // Check for basic English/Hinglish characters and common symbols
  const validPattern = /^[a-zA-Z0-9\s\-_.,!?]+$/;
  if (!validPattern.test(trimmed)) {
    return { isValid: false, message: 'Please use English letters, numbers, and basic symbols only' };
  }

  return { isValid: true, message: '' };
}