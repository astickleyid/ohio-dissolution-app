# Form Submission Troubleshooting Guide

## Issue: Form Submissions Not Arriving

If you're not receiving email notifications when forms are submitted, follow this guide.

### Required Setup

The form uses **Resend** for email delivery. You need to configure three environment variables:

1. **RESEND_API_KEY** - Your API key from Resend.com
2. **NOTIFY_EMAIL** - The email address where you want to receive submissions
3. **FROM_EMAIL** - A verified sender email (must be verified in Resend)

### Step-by-Step Setup

#### 1. Create a Resend Account
- Go to [resend.com](https://resend.com)
- Sign up for a free account
- Verify your email address

#### 2. Get Your API Key
- Log into Resend dashboard
- Go to "API Keys" section
- Create a new API key
- Copy the key (starts with `re_`)

#### 3. Verify Your Domain (or use onboarding@resend.dev)
- **Option A (Quick Start):** Use `onboarding@resend.dev` as FROM_EMAIL (no verification needed)
- **Option B (Production):** Verify your own domain in Resend dashboard

#### 4. Set Environment Variables

**For Vercel Deployment:**
1. Go to your project settings on Vercel
2. Navigate to "Environment Variables"
3. Add these three variables:
   ```
   RESEND_API_KEY=re_your_actual_key_here
   NOTIFY_EMAIL=your-email@example.com
   FROM_EMAIL=onboarding@resend.dev
   ```
4. Redeploy your application

**For Local Development:**
1. Create a `.env.local` file in the project root
2. Add:
   ```
   RESEND_API_KEY=re_your_actual_key_here
   NOTIFY_EMAIL=your-email@example.com
   FROM_EMAIL=onboarding@resend.dev
   ```
3. Restart your dev server

### Verifying Configuration

The submission route now includes detailed logging. Check your server logs after a submission:

#### Success Indicators:
```
✅ Data parsed successfully. Fields count: XX
✅ Data saved to KV store: submission_XXXXXXXXX
✅ Email sent successfully: { id: 'xxx-xxx-xxx' }
✅ Submission completed successfully
```

#### Common Issues:

**"Resend API Key configured: No"**
- Environment variable not set or misspelled
- Solution: Check your .env.local or Vercel env vars

**"Email sending failed: Invalid API key"**
- Wrong API key or expired
- Solution: Generate a new API key in Resend dashboard

**"Email sending failed: From email not verified"**
- Using a custom email that isn't verified
- Solution: Either use `onboarding@resend.dev` or verify your domain

**"Email sending failed: Rate limit exceeded"**
- Hit Resend's free tier limits (100 emails/day)
- Solution: Upgrade plan or wait 24 hours

### Data Backup

Even if email fails, submissions are saved to Vercel KV store (if configured). Data includes:
- All form fields
- Submission timestamp
- Unique submission ID

You can retrieve this data later through the Vercel dashboard or API.

### Testing the Fix

1. Set up your environment variables
2. Submit a test form
3. Check server logs for the indicators above
4. Verify email arrives at NOTIFY_EMAIL
5. Check spam folder if not in inbox

### Need Help?

If issues persist after following this guide:
1. Check server logs for specific error messages
2. Verify all environment variables are correctly spelled
3. Ensure FROM_EMAIL is verified or use onboarding@resend.dev
4. Check Resend dashboard for any delivery errors

The enhanced logging should provide clear diagnostics about what's failing.
