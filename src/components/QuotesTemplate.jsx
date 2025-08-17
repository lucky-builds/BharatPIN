import { useState } from 'react';
import { QUOTE_CATEGORIES } from '../data/quotes';

export default function QuotesTemplate({ isOpen, onClose, onSelectQuote }) {
  const [selectedCategory, setSelectedCategory] = useState(null);

  if (!isOpen) return null;

  const handleQuoteSelect = (quote) => {
    onSelectQuote(quote);
    onClose();
  };

  const handleBack = () => {
    setSelectedCategory(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            {selectedCategory && (
              <button
                onClick={handleBack}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ←
              </button>
            )}
            <h2 className="text-2xl font-bold text-gray-900">
              {selectedCategory ? selectedCategory.name : 'Try Template Quotes'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!selectedCategory ? (
            // Categories View
            <div>
              <p className="text-gray-600 mb-6">
                Choose from curated quotes and slogans to generate meaningful PINs
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {QUOTE_CATEGORIES.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category)}
                    className="p-4 border border-gray-200 rounded-lg hover:border-saffron hover:bg-orange-50 transition-colors text-left group"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{category.icon}</span>
                      <h3 className="font-semibold text-gray-900 group-hover:text-saffron">
                        {category.name}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600">{category.description}</p>
                    <div className="text-xs text-gray-500 mt-2">
                      {category.quotes.length} quotes available
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            // Quotes View
            <div>
              <p className="text-gray-600 mb-6">
                Tap any quote below to generate PINs from it
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedCategory.quotes.map((quote, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuoteSelect(quote)}
                    className="p-4 border border-gray-200 rounded-lg hover:border-saffron hover:bg-orange-50 transition-colors text-left group flex items-center justify-between"
                  >
                    <span className="font-medium text-gray-900 group-hover:text-saffron">
                      {quote}
                    </span>
                    <span className="text-gray-400 group-hover:text-saffron">→</span>
                  </button>
                ))}
              </div>
              
              {/* Special Republic Day Section */}
              {selectedCategory.id === 'republic-day' && (
                <div className="mt-8 p-4 bg-gradient-to-r from-orange-50 to-green-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🎉</span>
                    <h4 className="font-semibold text-gray-900">Special Republic Day Collection</h4>
                  </div>
                  <p className="text-sm text-gray-700">
                    These slogans celebrate the spirit of Indian democracy and our constitutional values. 
                    Perfect for creating memorable PINs that honor our nation's heritage.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-4 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>💡 Each quote generates unique, consistent PINs</span>
            <span>🔒 All processing happens locally</span>
          </div>
        </div>
      </div>
    </div>
  );
}