'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePlaidLink } from 'react-plaid-link';

type AccountSummary = {
  name: string; type: string; subtype: string | null;
  balance: number | null; mask: string | null;
};

export type PlaidResult = {
  formFields: Record<string, string>;
  accountSummaries: AccountSummary[];
  breakdown: { checking: number; savings: number; retirement: number; total: number };
};

type Props = { userId?: string; onSuccess: (result: PlaidResult) => void };

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
    </svg>
  );
}

export default function PlaidLinkButton({ userId = 'becca-nicole-case', onSuccess }: Props) {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [exchanging, setExchanging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState<PlaidResult | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch('/api/plaid/create-link-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
      .then(r => r.json())
      .then(d => { if (d.link_token) setLinkToken(d.link_token); else throw new Error(d.error); })
      .catch(() => setError('Could not initialize bank connection. Check your network and try again.'))
      .finally(() => setLoading(false));
  }, [userId]);

  const handleSuccess = useCallback(async (publicToken: string) => {
    setExchanging(true); setError(null);
    try {
      const res = await fetch('/api/plaid/exchange-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ public_token: publicToken }),
      });
      if (!res.ok) throw new Error('Exchange failed');
      const data: PlaidResult = await res.json();
      setConnected(data);
      onSuccess(data);
    } catch {
      setError('Failed to retrieve account data. Please try again.');
    } finally { setExchanging(false); }
  }, [onSuccess]);

  const { open, ready } = usePlaidLink({
    token: linkToken ?? '',
    onSuccess: (pub) => handleSuccess(pub),
    onExit: (err) => { if (err) setError('Connection cancelled or unavailable for this institution.'); },
  });

  if (connected) {
    const { breakdown } = connected;
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-4 space-y-2">
        <div className="flex items-center gap-2 text-green-700 font-semibold text-sm">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
          </svg>
          Bank account connected
        </div>
        <p className="text-xs text-green-600">
          Found {breakdown.total} account{breakdown.total !== 1 ? 's' : ''}
          {breakdown.checking > 0 ? ` · ${breakdown.checking} checking` : ''}
          {breakdown.savings > 0 ? ` · ${breakdown.savings} savings` : ''}
          {breakdown.retirement > 0 ? ` · ${breakdown.retirement} retirement` : ''}
        </p>
        <button onClick={() => { setConnected(null); setLinkToken(null); setError(null); }}
          className="text-xs text-green-600 underline hover:text-green-800">
          Connect a different account
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button type="button" onClick={() => open()}
        disabled={!ready || loading || exchanging}
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
      >
        {(loading || exchanging) ? <Spinner /> : (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
          </svg>
        )}
        {loading ? 'Initializing…' : exchanging ? 'Connecting…' : 'Connect Bank Account'}
      </button>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <p className="text-xs text-gray-400">
        Secured by Plaid · Read-only access · No charges made
      </p>
    </div>
  );
}
