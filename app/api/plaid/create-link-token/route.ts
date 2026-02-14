import { NextRequest, NextResponse } from 'next/server';
import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from 'plaid';

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
    const { userId } = await req.json();

    const response = await plaidClient.linkTokenCreate({
      user: { client_user_id: userId ?? 'becca-nicole-case' },
      client_name: 'Ohio Dissolution App',
      products: [Products.Assets, Products.Identity],
      country_codes: [CountryCode.Us],
      language: 'en',
    });

    return NextResponse.json({ link_token: response.data.link_token });
  } catch (err: unknown) {
    console.error('Plaid link token error:', err);
    return NextResponse.json({ error: 'Failed to create link token' }, { status: 500 });
  }
}
