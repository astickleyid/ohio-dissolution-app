This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

# Ohio Dissolution App

A Next.js application for Ohio dissolution of marriage document preparation with integrated bank account and credit check features via Plaid API.

## Features

- Multi-step dissolution form with 16 sections
- Plaid integration for bank account connections
- Credit check integration for debt information
- Auto-fill functionality from connected accounts
- Form submission via email (Resend)
- Auto-save functionality
- Admin panel for viewing submissions

## Getting Started

### Prerequisites

1. Node.js 18+ installed
2. (Optional) Plaid account for bank/credit features - [Sign up here](https://dashboard.plaid.com/signup)
3. (Optional) Resend account for email notifications - [Sign up here](https://resend.com)

### Environment Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Configure your environment variables in `.env.local`:

   **For Plaid Integration (Optional):**
   - Get credentials from [Plaid Dashboard](https://dashboard.plaid.com)
   - Set `PLAID_CLIENT_ID`, `PLAID_SECRET`, and `PLAID_ENV`
   - Use `sandbox` environment for testing

   **For Email Notifications (Optional):**
   - Get API key from [Resend](https://resend.com)
   - Set `RESEND_API_KEY`, `NOTIFY_EMAIL`, and `FROM_EMAIL`

   **For Admin Panel (Optional):**
   - Set `NEXT_PUBLIC_ADMIN_PASSWORD` to secure the admin panel

### Running the Development Server

First, install dependencies and run the development server:

```bash
npm install
npm run dev
# or
yarn install
yarn dev
# or
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

### Testing Plaid Integration (Sandbox Mode)

If you've configured Plaid credentials with `PLAID_ENV=sandbox`, you can test the integration:

1. Open the application
2. Click "Connect Your Bank Account" or "Run Credit Check"
3. Use Plaid's sandbox test credentials:
   - Username: `user_good`
   - Password: `pass_good`
   - MFA: `1234` (if prompted)

## Documentation

- **[PLAID_API_STATUS.md](./PLAID_API_STATUS.md)** - Detailed Plaid API backend wiring status and setup guide
- **[SUBMISSION_TROUBLESHOOTING.md](./SUBMISSION_TROUBLESHOOTING.md)** - Email submission setup and troubleshooting
- **[ADMIN_PANEL_VERIFICATION.md](./ADMIN_PANEL_VERIFICATION.md)** - Admin panel usage and features
- **[UI_IMPROVEMENTS.md](./UI_IMPROVEMENTS.md)** - UI/UX enhancements documentation

## Project Structure

```
app/
├── api/
│   ├── plaid/              # Plaid API routes (bank connections)
│   ├── credit-check/       # Credit check API routes
│   ├── submit/             # Form submission handler
│   ├── admin/              # Admin panel API
│   └── autosave/           # Auto-save functionality
├── components/
│   └── Onboarding.tsx      # Plaid integration component
├── page.tsx                # Main dissolution form
├── admin/                  # Admin panel page
└── layout.tsx              # Root layout with Plaid SDK
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

### Deployment Checklist

1. Push your code to GitHub
2. Import project in Vercel
3. Configure environment variables in Vercel dashboard:
   - Plaid credentials (if using bank/credit features)
   - Resend API key (if using email notifications)
   - Admin password (if using admin panel)
4. Deploy!

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
