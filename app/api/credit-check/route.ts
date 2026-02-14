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

    // Exchange for access token
    const exchangeRes = await plaidClient.itemPublicTokenExchange({ public_token });
    const accessToken = exchangeRes.data.access_token;

    // Fetch liabilities (credit cards, student loans, mortgages)
    const liabilitiesRes = await plaidClient.liabilitiesGet({ access_token: accessToken });
    const liabilities = liabilitiesRes.data.liabilities;
    const accounts = liabilitiesRes.data.accounts;

    // Build a unified debt list for form pre-fill
    const debts: Array<{
      creditor: string;
      type: string;
      balance: number;
      last4: string;
      monthlyPayment?: number;
    }> = [];

    // Credit cards
    liabilities.credit?.forEach((card) => {
      const acct = accounts.find(a => a.account_id === card.account_id);
      debts.push({
        creditor: acct?.name ?? 'Credit Card',
        type: 'Credit Card',
        balance: card.last_statement_balance ?? acct?.balances.current ?? 0,
        last4: acct?.mask ?? '****',
        monthlyPayment: card.minimum_payment_amount ?? undefined,
      });
    });

    // Student loans
    liabilities.student?.forEach((loan) => {
      const acct = accounts.find(a => a.account_id === loan.account_id);
      debts.push({
        creditor: loan.servicer_address?.city ? `${acct?.name ?? 'Student Loan'} (${loan.servicer_address.city})` : acct?.name ?? 'Student Loan',
        type: 'Student Loan',
        balance: loan.outstanding_interest_amount
          ? (acct?.balances.current ?? 0) + loan.outstanding_interest_amount
          : acct?.balances.current ?? 0,
        last4: acct?.mask ?? '****',
        monthlyPayment: loan.minimum_payment_amount ?? undefined,
      });
    });

    // Mortgages
    liabilities.mortgage?.forEach((mortgage) => {
      const acct = accounts.find(a => a.account_id === mortgage.account_id);
      debts.push({
        creditor: acct?.name ?? 'Mortgage',
        type: 'Mortgage',
        balance: mortgage.current_late_fee ?? acct?.balances.current ?? 0,
        last4: acct?.mask ?? '****',
        monthlyPayment: mortgage.next_monthly_payment ?? undefined,
      });
    });

    // Map first 3 debts to P1 form fields (caller specifies who — p1 or p2)
    const formFields: Record<string, string> = {};
    if (debts.length > 0) formFields['has_debts'] = 'Yes';

    return NextResponse.json({
      success: true,
      debts,
      totalDebt: debts.reduce((sum, d) => sum + d.balance, 0),
      formFields,
      summary: {
        creditCards: liabilities.credit?.length ?? 0,
        studentLoans: liabilities.student?.length ?? 0,
        mortgages: liabilities.mortgage?.length ?? 0,
        total: debts.length,
      },
    });
  } catch (err: unknown) {
    console.error('Credit check error:', err);
    return NextResponse.json({ error: 'Credit check failed' }, { status: 500 });
  }
}
