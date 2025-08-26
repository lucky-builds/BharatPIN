import { useState } from 'react';
import { generatePIN, validateInput } from '../utils/pinGenerator';
import { savePIN } from '../utils/localStorage';
import { isMasterPasswordSet } from '../utils/encryption';
import HowItWorks from './HowItWorks';
import QuotesTemplate from './QuotesTemplate';

const SERVICE_SUGGESTIONS = [
  { name: 'LinkedIn', icon: '💼' },
  { name: 'Facebook', icon: '📘' },
  { name: 'Gmail', icon: '📧' },
  { name: 'Instagram', icon: '📸' },
  { name: 'Twitter', icon: '🐦' },
  { name: 'WhatsApp', icon: '💬' },
  { name: 'Netflix', icon: '🎬' },
  { name: 'Spotify', icon: '🎵' },
  { name: 'Amazon', icon: '📦' },
  { name: 'PayPal', icon: '💳' },
  { name: 'Bank Account', icon: '🏦' },
  { name: 'Credit Card', icon: '💳' },
  { name: 'ATM PIN', icon: '🏧' },
  { name: 'Phone Lock', icon: '📱' },
  { name: 'Laptop', icon: '💻' },
  { name: 'WiFi', icon: '📶' }
];

export default function PINGenerator({ onPINSaved, onSavePINRequest, masterPassword, isAuthenticated }) {
  const [input, setInput] = useState('');
  const [generatedPIN, setGeneratedPIN] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [saveLabel, setSaveLabel] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [showQuotes, setShowQuotes] = useState(false);
  const [isAwaitingAuth, setIsAwaitingAuth] = useState(false);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);
    setError('');
    setSaveSuccess(false);
    
    // Clear generated PIN if input is empty
    if (!value.trim()) {
      setGeneratedPIN(null);
    }
  };

  const handleManualGenerate = () => {
    handleGenerate();
  };

  const handleGenerate = async () => {
    const validation = validateInput(input);
    if (!validation.isValid) {
      setError(validation.message);
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const result = await generatePIN(input);
      setGeneratedPIN(result);
      setSaveLabel(result.input);
    } catch (err) {
      setError('Failed to generate PIN. Please try again.');
      console.error('PIN generation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Direct save function that bypasses authentication checks
  const performSave = async (passwordToUse) => {
    if (!generatedPIN) return;

    const pinDataToSave = {
      ...generatedPIN,
      label: saveLabel || generatedPIN.input
    };

    setIsSaving(true);
    setError('');
    setIsAwaitingAuth(false);
    
    try {
      const saved = await savePIN(pinDataToSave, passwordToUse);

      if (saved) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        // Clear the form
        setSaveLabel('');
        // Notify parent component to refresh sidebar
        if (onPINSaved) {
          onPINSaved();
        }
      } else {
        setError('Failed to save PIN. Please try again.');
      }
    } catch (error) {
      setError('Failed to save PIN. Please try again.');
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async (providedMasterPassword = null) => {
    if (!generatedPIN) return;

    const pinDataToSave = {
      ...generatedPIN,
      label: saveLabel || generatedPIN.input
    };

    const passwordToUse = providedMasterPassword || masterPassword;

    // Check if master password setup is required or authentication is needed
    if (onSavePINRequest && (!isMasterPasswordSet() || !isAuthenticated)) {
      const canSave = onSavePINRequest(pinDataToSave, performSave);
      if (!canSave) {
        setIsAwaitingAuth(true);
        setError('');
        return; // Master password setup modal will be shown
      }
    }

    // If we reach here, we're authenticated and can save directly
    await performSave(passwordToUse);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleManualGenerate();
    }
  };

  const handleQuoteSelect = (quote) => {
    setInput(quote);
    setError(''); // Clear any existing errors
    setSaveSuccess(false);
    
    // Auto-generate PIN for selected quote bypassing validation
    const generateQuotePIN = async () => {
      setIsLoading(true);
      try {
        const result = await generatePIN(quote);
        setGeneratedPIN(result);
        setSaveLabel(result.input);
      } catch (err) {
        setError('Failed to generate PIN. Please try again.');
        console.error('PIN generation error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Generate immediately without validation since quotes are pre-validated
    generateQuotePIN();
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 bg-white rounded-xl shadow-lg">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Generate Your PIN</h1>
        <p className="text-gray-600">Transform meaningful words into secure PINs & passwords</p>
      </div>

      <div className="space-y-6">
        <div>
          <label htmlFor="word-input" className="block text-sm font-medium text-gray-700 mb-2">
            Enter a word or phrase
          </label>
          <div className="relative">
            <input
              id="word-input"
              type="text"
              value={input}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="e.g., Bharat, Jai Hind, Victory"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron focus:border-transparent outline-none text-lg"
              disabled={isLoading}
            />
          </div>
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
        </div>

        <div className="space-y-3">
          <button
            onClick={handleManualGenerate}
            disabled={!input.trim() || isLoading}
            className="w-full bg-saffron hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
          >
            {isLoading ? 'Generating...' : 'Generate PIN'}
          </button>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => setShowQuotes(true)}
              className="flex items-center justify-center gap-2 py-3 px-4 border border-saffron text-saffron hover:bg-orange-50 rounded-lg transition-colors text-sm font-medium"
            >
              📝 Try Quotes
            </button>
            <button
              onClick={() => setShowHowItWorks(true)}
              className="flex items-center justify-center gap-2 py-3 px-4 border border-green text-green hover:bg-green-50 rounded-lg transition-colors text-sm font-medium"
            >
              ❓ How it Works
            </button>
          </div>
        </div>

        {generatedPIN && (
          <div className="bg-gray-50 p-6 rounded-lg border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Generated PINs & Passwords</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-white rounded border">
                <span className="text-sm font-medium text-gray-600">4-Digit PIN:</span>
                <span className="text-xl font-mono font-bold text-gray-900">{generatedPIN.fourDigit}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-white rounded border">
                <span className="text-sm font-medium text-gray-600">6-Digit PIN:</span>
                <span className="text-xl font-mono font-bold text-gray-900">{generatedPIN.sixDigit}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-white rounded border">
                <span className="text-sm font-medium text-gray-600">8-Char Password:</span>
                <span className="text-lg font-mono font-bold text-gray-900">{generatedPIN.password}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-white rounded border">
                <span className="text-sm font-medium text-gray-600">12-Char Password:</span>
                <span className="text-lg font-mono font-bold text-gray-900">{generatedPIN.passwordWithSymbol}</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t">
              <label htmlFor="save-label" className="block text-sm font-medium text-gray-700 mb-2">
                Save for which service?
              </label>
              
              {/* Service Suggestions */}
              <div className="grid grid-cols-4 gap-2 mb-3">
                {SERVICE_SUGGESTIONS.map((service) => (
                  <button
                    key={service.name}
                    onClick={() => setSaveLabel(service.name)}
                    className={`p-2 text-xs border rounded-lg hover:bg-gray-50 transition-colors ${
                      saveLabel === service.name ? 'border-saffron bg-orange-50' : 'border-gray-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-lg mb-1">{service.icon}</div>
                      <div className="truncate">{service.name}</div>
                    </div>
                  </button>
                ))}
              </div>
              
              <input
                id="save-label"
                type="text"
                value={saveLabel}
                onChange={(e) => setSaveLabel(e.target.value)}
                placeholder="Or enter custom label..."
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-saffron focus:border-transparent outline-none mb-3"
              />
              
              <button
                onClick={handleSave}
                disabled={isSaving || isAwaitingAuth}
                className="w-full bg-green hover:bg-green-700 disabled:bg-gray-300 text-white font-medium py-2 px-4 rounded transition-colors duration-200"
              >
                {isAwaitingAuth ? 'Waiting for authentication...' : 
                 isSaving ? 'Saving...' : 'Save PIN'}
              </button>
              
              {saveSuccess && (
                <p className="mt-2 text-sm text-green-600 text-center">✓ PIN saved successfully!</p>
              )}
              
              {isAwaitingAuth && (
                <p className="mt-2 text-sm text-blue-600 text-center bg-blue-50 border border-blue-200 rounded p-2">
                  Please set up or enter your master password to save this PIN securely.
                </p>
              )}
            </div>
          </div>
        )}

        <div className="text-xs text-gray-500 text-center">
          <p>Supports English and Hinglish words • Inspired by India's heritage</p>
        </div>
      </div>

      {/* Modals */}
      <HowItWorks 
        isOpen={showHowItWorks} 
        onClose={() => setShowHowItWorks(false)} 
      />
      
      <QuotesTemplate 
        isOpen={showQuotes} 
        onClose={() => setShowQuotes(false)}
        onSelectQuote={handleQuoteSelect}
      />
    </div>
  );
}