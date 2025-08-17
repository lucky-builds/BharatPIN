import { useState, useEffect } from 'react';
import PINGenerator from './PINGenerator';
import MyPINsSidebar from './MyPINsSidebar';
import MasterPasswordModal from './MasterPasswordModal';
import DisclaimerBanner from './DisclaimerBanner';
import { 
  isMasterPasswordSet, 
  setupMasterPassword, 
  verifyMasterPassword, 
  resetMasterPassword 
} from '../utils/encryption';
import { hasEncryptedData, hasSavedPINs, migrateToEncrypted } from '../utils/localStorage';

export default function HomePage() {
  const [sidebarKey, setSidebarKey] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [masterPassword, setMasterPassword] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordModalMode, setPasswordModalMode] = useState('setup');
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    // Check if we need master password authentication
    if (hasEncryptedData() && !isAuthenticated) {
      setIsLocked(true);
    } else if (!isMasterPasswordSet() && hasSavedPINs()) {
      // Has legacy data, no master password set - allow access but suggest migration
      setIsAuthenticated(true);
    } else if (!isMasterPasswordSet()) {
      // No data, no master password - normal flow
      setIsAuthenticated(true);
    }
  }, [isAuthenticated]);

  // Function to refresh sidebar when new PIN is saved
  const refreshSidebar = () => {
    setSidebarKey(prev => prev + 1);
  };

  // Handle master password setup
  const handlePasswordSetup = async (password) => {
    try {
      const success = await setupMasterPassword(password);
      if (success) {
        setMasterPassword(password);
        setIsAuthenticated(true);
        setShowPasswordModal(false);
        
        // Migrate existing data if any
        if (hasSavedPINs()) {
          await migrateToEncrypted(password);
          refreshSidebar();
        }
      } else {
        throw new Error('Failed to set up master password');
      }
    } catch (error) {
      throw error;
    }
  };

  // Handle master password verification
  const handlePasswordVerify = async (password) => {
    try {
      const isValid = await verifyMasterPassword(password);
      if (isValid) {
        setMasterPassword(password);
        setIsAuthenticated(true);
        setIsLocked(false);
        setShowPasswordModal(false);
        refreshSidebar();
      } else {
        throw new Error('Incorrect password');
      }
    } catch (error) {
      throw error;
    }
  };

  // Handle password reset
  const handlePasswordReset = () => {
    if (resetMasterPassword()) {
      setMasterPassword('');
      setIsAuthenticated(true);
      setIsLocked(false);
      setShowPasswordModal(false);
      refreshSidebar();
    }
  };

  // Handle save PIN request (show setup modal if needed)
  const handleSavePINRequest = () => {
    if (!isMasterPasswordSet()) {
      setPasswordModalMode('setup');
      setShowPasswordModal(true);
      return false; // Prevent save until password is set
    }
    return true; // Allow save
  };

  // Handle lock/unlock
  const handleLock = () => {
    setIsAuthenticated(false);
    setIsLocked(true);
    setMasterPassword('');
    setSidebarKey(prev => prev + 1); // Clear sidebar
  };

  const handleUnlock = () => {
    setPasswordModalMode('verify');
    setShowPasswordModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🇮🇳</span>
              <span className="text-xl font-bold text-gray-900">BharatPIN</span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                🔒 100% Private • Zero Data Retention
              </div>
              
              {isMasterPasswordSet() && (
                <div className="flex items-center gap-2">
                  {isAuthenticated ? (
                    <button
                      onClick={handleLock}
                      className="text-sm text-red-600 hover:text-red-800 font-medium"
                      title="Lock PINs"
                    >
                      🔒 Lock
                    </button>
                  ) : (
                    <button
                      onClick={handleUnlock}
                      className="text-sm text-green-600 hover:text-green-800 font-medium"
                      title="Unlock PINs"
                    >
                      🔓 Unlock
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Disclaimer Banner */}
        <DisclaimerBanner />
        
        <div className="flex flex-col lg:flex-row gap-8 h-full">
          {/* PIN Generator - 70% on desktop, full width on mobile */}
          <div className="flex-1 lg:flex-none lg:w-[70%]">
            <PINGenerator 
              onPINSaved={refreshSidebar} 
              onSavePINRequest={handleSavePINRequest}
              masterPassword={masterPassword}
              isAuthenticated={isAuthenticated}
            />
          </div>
          
          {/* My PINs Sidebar - 30% on desktop, full width on mobile */}
          <div className="w-full lg:w-80 h-96 lg:h-[calc(100vh-180px)]">
            <MyPINsSidebar 
              key={sidebarKey} 
              masterPassword={masterPassword}
              isAuthenticated={isAuthenticated}
              isLocked={isLocked}
              onUnlock={handleUnlock}
            />
          </div>
        </div>
      </main>

      {/* Master Password Modal */}
      <MasterPasswordModal
        isOpen={showPasswordModal}
        mode={passwordModalMode}
        onSuccess={passwordModalMode === 'setup' ? handlePasswordSetup : handlePasswordVerify}
        onCancel={(action) => {
          if (action === 'reset') {
            handlePasswordReset();
          } else {
            setShowPasswordModal(false);
          }
        }}
        title={passwordModalMode === 'setup' ? 'Secure Your PINs' : 'Unlock Your PINs'}
        message={passwordModalMode === 'setup' ? 'Set a master password to protect your saved PINs' : 'Enter your master password to access saved PINs'}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <span className="text-saffron">🟧</span>
            <span className="text-white bg-gray-800 px-1">⬜</span>
            <span className="text-green">🟩</span>
          </div>
          <p className="text-sm text-gray-600">
            Built with ❤️ for Republic Day • Celebrating India's Heritage
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Personal project • Not affiliated with any organization
          </p>
        </div>
      </footer>
    </div>
  );
}