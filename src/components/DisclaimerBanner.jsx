import { useState } from 'react';

export default function DisclaimerBanner() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <div className="text-red-500 text-xl">⚠️</div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-red-800 mb-1">Important Security Disclaimer</h3>
          
          {!isExpanded ? (
            <div>
              <p className="text-xs text-red-700">
                BharatPIN stores data locally in your browser. Read full disclaimer for important limitations.
              </p>
              <button
                onClick={() => setIsExpanded(true)}
                className="text-xs text-red-600 hover:text-red-800 underline mt-1"
              >
                Read Full Disclaimer
              </button>
            </div>
          ) : (
            <div className="text-xs text-red-700 space-y-2">
              <p>
                <strong>Data Storage:</strong> All PINs and passwords are stored locally in your browser's storage. 
                Clearing browser data, cache, cookies, or using incognito/private mode will permanently delete all saved data.
              </p>
              
              <p>
                <strong>Backup Responsibility:</strong> It is your responsibility to export and backup your data regularly. 
                We cannot recover lost data under any circumstances.
              </p>
              
              <p>
                <strong>Security Limitations:</strong> While we use encryption for master password protection, 
                browser-based storage has inherent security limitations. Do not use for highly sensitive accounts.
              </p>
              
              <p>
                <strong>No Liability:</strong> BharatPIN is provided "as-is" without any warranties. 
                We are not liable for any data loss, security breaches, or damages arising from use of this application.
              </p>
              
              <p>
                <strong>Personal Project:</strong> This is a personal project not affiliated with any organization. 
                Use at your own risk for non-critical accounts only.
              </p>
              
              <p>
                <strong>Recommendation:</strong> Export your data regularly and use this tool only for non-critical passwords and PINs.
              </p>
              
              <button
                onClick={() => setIsExpanded(false)}
                className="text-red-600 hover:text-red-800 underline mt-2"
              >
                Collapse
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}