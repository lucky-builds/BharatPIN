import { useState, useEffect } from 'react';

export default function MasterPasswordModal({ 
  isOpen, 
  mode, // 'setup', 'verify', 'change'
  onSuccess, 
  onCancel,
  title,
  message 
}) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setConfirmPassword('');
      setOldPassword('');
      setError('');
      setShowPassword(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (mode === 'setup') {
        if (password.length < 4) {
          throw new Error('Password must be at least 4 characters long');
        }
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        await onSuccess(password);
      } else if (mode === 'verify') {
        if (!password) {
          throw new Error('Please enter your master password');
        }
        await onSuccess(password);
      } else if (mode === 'change') {
        if (!oldPassword) {
          throw new Error('Please enter your current password');
        }
        if (password.length < 4) {
          throw new Error('New password must be at least 4 characters long');
        }
        if (password !== confirmPassword) {
          throw new Error('New passwords do not match');
        }
        await onSuccess(oldPassword, password);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onKeyDown={handleKeyPress}>
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🔒</div>
          <h2 className="text-xl font-bold text-gray-900">
            {title || (mode === 'setup' ? 'Set Master Password' : 
                      mode === 'change' ? 'Change Master Password' : 'Enter Master Password')}
          </h2>
          {message && (
            <p className="text-sm text-gray-600 mt-2">{message}</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'change' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron focus:border-transparent outline-none"
                  placeholder="Enter current password"
                  autoFocus
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {mode === 'change' ? 'New Password' : 'Master Password'}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron focus:border-transparent outline-none pr-10"
                placeholder={mode === 'setup' || mode === 'change' ? 'Create a strong password' : 'Enter your master password'}
                autoFocus={mode !== 'change'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {(mode === 'setup' || mode === 'change') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-saffron focus:border-transparent outline-none"
                placeholder="Confirm your password"
              />
            </div>
          )}

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
              {error}
            </div>
          )}

          {mode === 'setup' && (
            <div className="text-xs text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <strong>Important:</strong> This master password will be required to access your saved PINs. 
              Choose something you'll remember but others can't guess.
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-saffron hover:bg-orange-600 text-white rounded-lg transition-colors disabled:bg-gray-300"
              disabled={isLoading || !password}
            >
              {isLoading ? 'Processing...' : 
               mode === 'setup' ? 'Set Password' :
               mode === 'change' ? 'Change Password' : 'Unlock'}
            </button>
          </div>
        </form>

        {mode === 'verify' && (
          <div className="mt-4 pt-4 border-t text-center">
            <button
              onClick={() => onCancel('reset')}
              className="text-xs text-red-600 hover:text-red-800 underline"
            >
              Forgot password? Reset (deletes all data)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}