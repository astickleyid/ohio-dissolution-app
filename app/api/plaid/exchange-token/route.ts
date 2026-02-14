import { NextRequest, NextResponse } from 'next/server';
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';

const plaidClient = new PlaidApi(
  new Configuration({
    basePath: PlaidEnvironments[process.env.PLAID_ENV as 'sandbox' | 'development' | 'production' ?? 'sandbox'],
    baseOptions: {
      headers: {
        'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID ?? '',
        'PLAID-SECRET': process.env.PLAID_SECRET ?? '',
      },
    },
  })
);

export async function POST(req: NextRequest) {
  try {
    const { public_token } = await req.json();

    // Exchange public token for access token
    const exchangeRes = await plaidClient.itemPublicTokenExchange({ public_token });
    const accessToken = exchangeRes.data.access_token;

    // Fetch accounts
    const accountsRes = await plaidClient.accountsGet({ access_token: accessToken });
    const accounts = accountsRes.data.accounts;

    // Fetch identity (name, address)
    let identity = null;
    try {
      const identityRes = await plaidClient.identityGet({ access_token: accessToken });
      identity = identityRes.data.accounts[0]?.owners?.[0] ?? null;
    } catch {
      // Identity product may not be available for all institutions
    }

    // Map to form fields
    const formFields: Record<string, string> = {};

    // Identity fields
    if (identity) {
      if (identity.names?.[0]) formFields['_plaid_name'] = identity.names[0];
      if (identity.addresses?.[0]) {
        const addr = identity.addresses[0].data;
        if (addr.street) formFields['_plaid_address'] = addr.street;
        if (addr.city && addr.region && addr.postal_code) {
          formFields['_plaid_csz'] = `${addr.city}, ${addr.region} ${addr.postal_code}`;
        }
      }
      if (identity.emails?.[0]) formFields['_plaid_email'] = identity.emails[0].data;
      if (identity.phone_numbers?.[0]) formFields['_plaid_phone'] = identity.phone_numbers[0].data;
    }

    // Account summaries
    const accountSummaries = accounts.map((acct) => ({
      name: acct.name,
      type: acct.type,
      subtype: acct.subtype,
      balance: acct.balances.current,
      mask: acct.mask, // last 4 digits
    }));

    // Separate by type for form pre-fill
    const checking = accounts.filter(a => a.subtype === 'checking');
    const savings = accounts.filter(a => a.subtype === 'savings');
    const retirement = accounts.filter(a =>
      ['401k', 'ira', 'roth', 'pension', '403b', '457b'].includes(a.subtype ?? '')
    );

    if (checking.length > 0) formFields['has_accounts'] = 'Yes';
    if (retirement.length > 0) formFields['has_retirement'] = 'Yes';

    return NextResponse.json({
      success: true,
      formFields,
      accountSummaries,
      breakdown: {
        checking: checking.length,
        savings: savings.length,
        retirement: retirement.length,
        total: accounts.length,
      },
    });
  } catch (err: unknown) {
    console.error('Plaid exchange error:', err);
    return NextResponse.json({ error: 'Failed to fetch financial data' }, { status: 500 });
  }
}
