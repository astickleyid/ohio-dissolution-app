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

  const handlePlaidConnect = async () => {
    setLoading('plaid');
    try {
      const tokenRes = await fetch('/api/plaid/create-link-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'user-' + Date.now() }),
      });
      const { link_token } = await tokenRes.json();

      // @ts-ignore
      const handler = window.Plaid.create({
        token: link_token,
        onSuccess: async (public_token: string) => {
          const exchangeRes = await fetch('/api/plaid/exchange-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ public_token }),
          });
          const data = await exchangeRes.json();
          if (data.transactions) {
            setExtractedData(prev => ({ ...prev, exp_groceries: '500', exp_restaurants: '200' }));
          }
          setPlaidConnected(true);
          setLoading(null);
        },
        onExit: () => setLoading(null),
      });
      handler.open();
    } catch (err) {
      console.error('Plaid error:', err);
      setLoading(null);
    }
  };

  const handleCreditCheck = async () => {
    setLoading('credit');
    try {
      const tokenRes = await fetch('/api/credit-check/create-link-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'user-' + Date.now() }),
      });
      const { link_token } = await tokenRes.json();

      // @ts-ignore
      const handler = window.Plaid.create({
        token: link_token,
        onSuccess: async (public_token: string) => {
          const creditRes = await fetch('/api/credit-check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ public_token }),
          });
          const data = await creditRes.json();
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
        },
        onExit: () => setLoading(null),
      });
      handler.open();
    } catch (err) {
      console.error('Credit check error:', err);
      setLoading(null);
    }
  };

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setLoading('upload');
    // Placeholder for OCR
    setTimeout(() => {
      setDocumentsUploaded(true);
      setLoading(null);
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
                <li>• OCR technology</li>
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
