import { useState } from 'react';

export default function HowItWorks({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Learn How this Works</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* Step 1 */}
          <div className="flex gap-4">
            <div className="w-8 h-8 bg-saffron text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
              1
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Input Your Word or Phrase</h3>
              <p className="text-gray-600 text-sm">
                Enter any word, slogan, or phrase (e.g., "Bharat," "Jai Hind"). You can also choose from our preloaded patriotic quotes.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-4">
            <div className="w-8 h-8 bg-saffron text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
              2
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Processing Your Input</h3>
              <p className="text-gray-600 text-sm">
                We clean your input by removing extra spaces and converting it to lowercase for consistency.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-4">
            <div className="w-8 h-8 bg-saffron text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
              3
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Secure Hashing</h3>
              <p className="text-gray-600 text-sm">
                Your input is transformed into a unique, secure SHA-256 hash using advanced cryptographic methods. This ensures the same input always produces the same result.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex gap-4">
            <div className="w-8 h-8 bg-saffron text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
              4
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Generating the PIN</h3>
              <p className="text-gray-600 text-sm">
                The hash is converted into a large number, from which we extract:
              </p>
              <ul className="text-gray-600 text-sm mt-2 ml-4 space-y-1">
                <li>• A 4-digit PIN for quick use</li>
                <li>• A 6-digit PIN for added security</li>
                <li>• An 8-character alphanumeric password</li>
                <li>• A 12-character password with symbols</li>
              </ul>
            </div>
          </div>

          {/* Step 5 */}
          <div className="flex gap-4">
            <div className="w-8 h-8 bg-saffron text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
              5
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Powered by Technology</h3>
              <div className="text-gray-600 text-sm space-y-2">
                <p>• <strong>React Frontend</strong> for smooth user experience</p>
                <p>• <strong>Client-side Processing</strong> for maximum privacy</p>
                <p>• <strong>Local Storage</strong> with optional master password encryption</p>
                <p>• <strong>PWA Support</strong> for offline usage</p>
              </div>
            </div>
          </div>

          {/* Security Note */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800">
              <strong>Privacy First:</strong> No data is stored on our servers—your inputs remain private and secure. 
              All processing happens locally on your device. Celebrate Republic Day with your unique, meaningful PIN!
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-saffron hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}