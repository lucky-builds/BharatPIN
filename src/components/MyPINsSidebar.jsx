import { useState, useEffect } from 'react';
import { getSavedPINs, deletePIN, updatePINLabel, getStorageStats } from '../utils/localStorage';

export default function MyPINsSidebar({ masterPassword, isAuthenticated, isLocked, onUnlock }) {
  const [savedPINs, setSavedPINs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [revealedPINs, setRevealedPINs] = useState(new Set());
  const [storageStats, setStorageStats] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editLabel, setEditLabel] = useState('');

  useEffect(() => {
    if (isAuthenticated && masterPassword) {
      loadPINs();
      loadStats();
    } else if (isAuthenticated && !masterPassword) {
      // For legacy unencrypted data
      loadPINs();
      loadStats();
    } else {
      setSavedPINs([]);
      setStorageStats(null);
    }
  }, [isAuthenticated, masterPassword]);

  const loadPINs = async () => {
    try {
      const pins = await getSavedPINs(masterPassword);
      setSavedPINs(pins);
    } catch (error) {
      console.error('Error loading PINs:', error);
      setSavedPINs([]);
    }
  };

  const loadStats = () => {
    const stats = getStorageStats();
    setStorageStats(stats);
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this PIN?')) {
      deletePIN(id);
      loadPINs();
      loadStats();
      // Remove from revealed set
      setRevealedPINs(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const toggleReveal = (id) => {
    setRevealedPINs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleEditStart = (pin) => {
    setEditingId(pin.id);
    setEditLabel(pin.label);
  };

  const handleEditSave = (id) => {
    updatePINLabel(id, editLabel);
    setEditingId(null);
    setEditLabel('');
    loadPINs();
    loadStats();
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditLabel('');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      // Could add a toast notification here
    });
  };

  const maskText = (text, type = 'pin') => {
    if (type === 'pin') {
      return '*'.repeat(text.length);
    } else {
      // For passwords, show first 2 and last 1 character
      if (text.length <= 3) return '*'.repeat(text.length);
      return text.substring(0, 2) + '*'.repeat(text.length - 3) + text.substring(text.length - 1);
    }
  };

  const filteredPINs = savedPINs.filter(pin =>
    pin.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pin.input.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Show locked state if not authenticated
  if (isLocked || !isAuthenticated) {
    return (
      <div className="w-full h-full bg-white rounded-xl shadow-lg overflow-hidden flex flex-col">
        <div className="p-4 border-b bg-gray-50">
          <h2 className="text-lg font-bold text-gray-900">My PINs</h2>
        </div>
        
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">PINs Locked</h3>
            <p className="text-sm text-gray-600 mb-4">
              Enter your master password to access saved PINs
            </p>
            <button
              onClick={onUnlock}
              className="px-4 py-2 bg-saffron hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
            >
              🔓 Unlock PINs
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white rounded-xl shadow-lg overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-bold text-gray-900">My PINs</h2>
          <div className="text-xs text-gray-500">
            {storageStats?.totalPINs || 0} saved
          </div>
        </div>
        
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron focus:border-transparent outline-none"
        />
      </div>

      {/* PINs List */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredPINs.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-3">🔐</div>
            <p className="text-sm text-gray-600">
              {savedPINs.length === 0 ? 'No PINs saved yet' : 'No matches found'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPINs.map((pin) => {
              const isRevealed = revealedPINs.has(pin.id);
              return (
                <div key={pin.id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors">
                  {/* PIN Label */}
                  <div className="flex items-center justify-between mb-2">
                    {editingId === pin.id ? (
                      <div className="flex-1 flex gap-1">
                        <input
                          type="text"
                          value={editLabel}
                          onChange={(e) => setEditLabel(e.target.value)}
                          className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-saffron outline-none"
                          autoFocus
                        />
                        <button
                          onClick={() => handleEditSave(pin.id)}
                          className="px-2 py-1 bg-green hover:bg-green-700 text-white rounded text-xs"
                        >
                          ✓
                        </button>
                        <button
                          onClick={handleEditCancel}
                          className="px-2 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <>
                        <h3 className="font-medium text-gray-900 text-sm truncate">{pin.label}</h3>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEditStart(pin)}
                            className="text-gray-400 hover:text-gray-600 text-xs"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => toggleReveal(pin.id)}
                            className="text-gray-400 hover:text-gray-600 text-xs"
                            title={isRevealed ? 'Hide' : 'Reveal'}
                          >
                            {isRevealed ? '🙈' : '👁️'}
                          </button>
                          <button
                            onClick={() => handleDelete(pin.id)}
                            className="text-red-400 hover:text-red-600 text-xs"
                          >
                            🗑️
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  {/* PIN Values */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">4-digit:</span>
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-sm">
                          {isRevealed ? pin.fourDigit : maskText(pin.fourDigit)}
                        </span>
                        <button
                          onClick={() => copyToClipboard(pin.fourDigit)}
                          className="text-gray-400 hover:text-gray-600 text-xs"
                          title="Copy"
                        >
                          📋
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">6-digit:</span>
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-sm">
                          {isRevealed ? pin.sixDigit : maskText(pin.sixDigit)}
                        </span>
                        <button
                          onClick={() => copyToClipboard(pin.sixDigit)}
                          className="text-gray-400 hover:text-gray-600 text-xs"
                          title="Copy"
                        >
                          📋
                        </button>
                      </div>
                    </div>

                    {pin.password && (
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">8-char:</span>
                        <div className="flex items-center gap-1">
                          <span className="font-mono text-xs">
                            {isRevealed ? pin.password : maskText(pin.password, 'password')}
                          </span>
                          <button
                            onClick={() => copyToClipboard(pin.password)}
                            className="text-gray-400 hover:text-gray-600 text-xs"
                            title="Copy"
                          >
                            📋
                          </button>
                        </div>
                      </div>
                    )}

                    {pin.passwordWithSymbol && (
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">12-char:</span>
                        <div className="flex items-center gap-1">
                          <span className="font-mono text-xs">
                            {isRevealed ? pin.passwordWithSymbol : maskText(pin.passwordWithSymbol, 'password')}
                          </span>
                          <button
                            onClick={() => copyToClipboard(pin.passwordWithSymbol)}
                            className="text-gray-400 hover:text-gray-600 text-xs"
                            title="Copy"
                          >
                            📋
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="text-xs text-gray-400 mt-2 pt-2 border-t">
                    <span>"{pin.input}" • {formatDate(pin.timestamp)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}