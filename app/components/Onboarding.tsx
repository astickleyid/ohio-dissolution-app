'use client';

import { useState } from 'react';

type OnboardingProps = {
  onComplete: (data: Record<string, string>) => void;
};

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [plaidConnected, setPlaidConnected] = useState(false);
  const [creditCheckDone, setCreditCheckDone] = useState(false);
  const [documentsUploaded, setDocumentsUploaded] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const handlePlaidConnect = async () => {
    setLoading('plaid');
    setError(null);
    try {
      console.log('🏦 Starting Plaid connection...');
      const tokenRes = await fetch('/api/plaid/create-link-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'user-' + Date.now() }),
      });
      
      if (!tokenRes.ok) {
        const errorData = await tokenRes.json();
        throw new Error(errorData.error || 'Failed to create Plaid link token');
      }
      
      const { link_token } = await tokenRes.json();
      console.log('✅ Plaid link token created');

      // Check if Plaid SDK is loaded
      // @ts-ignore
      if (typeof window.Plaid === 'undefined') {
        throw new Error('Plaid SDK not loaded. Please refresh the page.');
      }

      // @ts-ignore
      const handler = window.Plaid.create({
        token: link_token,
        onSuccess: async (public_token: string) => {
          console.log('✅ Plaid auth successful, exchanging token...');
          try {
            const exchangeRes = await fetch('/api/plaid/exchange-token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ public_token }),
            });
            
            if (!exchangeRes.ok) {
              const errorData = await exchangeRes.json();
              throw new Error(errorData.error || 'Failed to exchange token');
            }
            
            const data = await exchangeRes.json();
            console.log('✅ Plaid data received:', data);
            
            if (data.formFields) {
              setExtractedData(prev => ({ ...prev, ...data.formFields }));
            }
            setPlaidConnected(true);
            setLoading(null);
          } catch (err) {
            console.error('❌ Plaid exchange error:', err);
            setError(err instanceof Error ? err.message : 'Failed to exchange Plaid token');
            setLoading(null);
          }
        },
        onExit: (err: any) => {
          if (err != null) {
            console.error('❌ Plaid Link exited with error:', err);
            setError(`Plaid connection cancelled: ${err.error_message || 'Unknown error'}`);
          }
          setLoading(null);
        },
      });
      handler.open();
    } catch (err) {
      console.error('❌ Plaid error:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect to Plaid');
      setLoading(null);
    }
  };

  const handleCreditCheck = async () => {
    setLoading('credit');
    setError(null);
    try {
      console.log('💳 Starting credit check...');
      const tokenRes = await fetch('/api/credit-check/create-link-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'user-' + Date.now() }),
      });
      
      if (!tokenRes.ok) {
        const errorData = await tokenRes.json();
        throw new Error(errorData.error || 'Failed to create credit check link token');
      }
      
      const { link_token } = await tokenRes.json();
      console.log('✅ Credit check link token created');

      // Check if Plaid SDK is loaded
      // @ts-ignore
      if (typeof window.Plaid === 'undefined') {
        throw new Error('Plaid SDK not loaded. Please refresh the page.');
      }

      // @ts-ignore
      const handler = window.Plaid.create({
        token: link_token,
        onSuccess: async (public_token: string) => {
          console.log('✅ Credit auth successful, fetching credit data...');
          try {
            const creditRes = await fetch('/api/credit-check', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ public_token }),
            });
            
            if (!creditRes.ok) {
              const errorData = await creditRes.json();
              throw new Error(errorData.error || 'Failed to fetch credit data');
            }
            
            const data = await creditRes.json();
            console.log('✅ Credit data received:', data);
            
            if (data.debts) {
              const fields: Record<string, string> = { has_debts: 'Yes' };
              data.debts.slice(0, 3).forEach((debt: any, idx: number) => {
                const num = idx + 1;
                fields[`debt_p1_${num}_creditor`] = debt.creditor;
                fields[`debt_p1_${num}_balance`] = debt.balance.toString();
                fields[`debt_p1_${num}_acct4`] = debt.last4;
              });
              setExtractedData(prev => ({ ...prev, ...fields }));
            }
            setCreditCheckDone(true);
            setLoading(null);
          } catch (err) {
            console.error('❌ Credit check error:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch credit data');
            setLoading(null);
          }
        },
        onExit: (err: any) => {
          if (err != null) {
            console.error('❌ Credit check exited with error:', err);
            setError(`Credit check cancelled: ${err.error_message || 'Unknown error'}`);
          }
          setLoading(null);
        },
      });
      handler.open();
    } catch (err) {
      console.error('❌ Credit check error:', err);
      setError(err instanceof Error ? err.message : 'Failed to start credit check');
      setLoading(null);
    }
  };

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setLoading('upload');
    setError(null);
    
    console.log('📄 Document uploaded:', e.target.files[0].name);
    
    // TODO: Implement actual OCR - for now this is just a placeholder
    // Recommend using AWS Textract, Google Vision API, or similar service
    setTimeout(() => {
      setDocumentsUploaded(true);
      setLoading(null);
      // Once OCR is implemented, extracted data would be added here:
      // setExtractedData(prev => ({ ...prev, ...ocrData }));
      console.warn('⚠️ Document upload UI only - OCR not yet implemented. Document marked as uploaded but no data extracted.');
    }, 1500);
  };

  return (
    <div className="animate-fadeIn">
      <div className="text-center mb-8">
        <div className="inline-block p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full mb-4 shadow-lg">
          <svg className="w-14 h-14 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-blue-900 mb-4">Speed Up Your Form</h2>
        <p className="text-gray-600 text-lg leading-relaxed max-w-2xl mx-auto">
          Connect your accounts and upload documents to auto-fill information. Optional but highly recommended!
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-2 border-red-300 rounded-xl text-red-800 animate-fadeIn">
          <div className="flex items-start">
            <svg className="w-5 h-5 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-semibold">Error:</p>
              <p className="text-sm">{error}</p>
              <p className="text-xs mt-2">Check browser console (F12) for more details.</p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4 mb-8">
        <div className={`border-2 rounded-xl p-6 transition-all duration-300 ${plaidConnected ? 'border-green-400 bg-green-50' : 'border-blue-300 bg-gradient-to-r from-blue-50 to-indigo-50'}`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-bold text-lg text-blue-900 mb-2">{plaidConnected ? '✅ ' : '🏦 '}Connect Your Bank</h3>
              <p className="text-sm text-gray-700 mb-3">Securely connect your bank to automatically calculate monthly expenses.</p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Auto-fills groceries, utilities, gas, and more</li>
                <li>• Powered by Plaid - bank-level security</li>
                <li>• Takes less than 2 minutes</li>
              </ul>
            </div>
            <button onClick={handlePlaidConnect} disabled={plaidConnected || loading !== null} className="ml-4 px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg">
              {plaidConnected ? 'Connected' : loading === 'plaid' ? 'Connecting...' : 'Connect Bank'}
            </button>
          </div>
        </div>

        <div className={`border-2 rounded-xl p-6 transition-all duration-300 ${creditCheckDone ? 'border-green-400 bg-green-50' : 'border-purple-300 bg-gradient-to-r from-purple-50 to-pink-50'}`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-bold text-lg text-purple-900 mb-2">{creditCheckDone ? '✅ ' : '💳 '}Run Credit Check</h3>
              <p className="text-sm text-gray-700 mb-3">Pull your credit report to automatically list all your debts.</p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Auto-fills all debt information</li>
                <li>• Provides proof for your records</li>
                <li>• Secure and private</li>
              </ul>
            </div>
            <button onClick={handleCreditCheck} disabled={creditCheckDone || loading !== null} className="ml-4 px-6 py-3 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg">
              {creditCheckDone ? 'Completed' : loading === 'credit' ? 'Checking...' : 'Check Credit'}
            </button>
          </div>
        </div>

        <div className={`border-2 rounded-xl p-6 transition-all duration-300 ${documentsUploaded ? 'border-green-400 bg-green-50' : 'border-amber-300 bg-gradient-to-r from-amber-50 to-yellow-50'}`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-bold text-lg text-amber-900 mb-2">{documentsUploaded ? '✅ ' : '📄 '}Upload ID/License</h3>
              <p className="text-sm text-gray-700 mb-3">Upload your ID to automatically extract your personal information.</p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Auto-fills name, address, date of birth</li>
                <li>• Reduces typing and errors</li>
                <li>• <span className="text-amber-700 font-semibold">Note: OCR extraction coming soon</span></li>
              </ul>
            </div>
            <label className="ml-4">
              <input type="file" accept="image/*,.pdf" onChange={handleDocumentUpload} disabled={documentsUploaded || loading !== null} className="hidden" />
              <div className="px-6 py-3 rounded-lg bg-amber-600 text-white font-semibold hover:bg-amber-700 cursor-pointer transition-all duration-200 shadow-md hover:shadow-lg inline-block">
                {documentsUploaded ? 'Uploaded' : loading === 'upload' ? 'Processing...' : 'Upload Document'}
              </div>
            </label>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 text-center mb-6">
        <p className="text-sm text-gray-700 mb-3"><strong>Skip these steps?</strong> You can fill everything out manually.</p>
        <button onClick={() => onComplete(extractedData)} className="px-8 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg">
          {(plaidConnected || creditCheckDone || documentsUploaded) ? 'Continue with Extracted Data →' : 'Skip & Fill Manually →'}
        </button>
      </div>

      <p className="text-xs text-center text-gray-400">🔒 All connections are secure and encrypted.</p>
    </div>
  );
}
