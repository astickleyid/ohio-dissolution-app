import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { kv } from '@vercel/kv';



// Maps raw field keys to human-readable labels
const FIELD_LABELS: Record<string, string> = {
  court_county: 'County',
  court_division: 'Division',
  court_case_no: 'Case No.',
  court_judge: 'Judge',
  court_magistrate: 'Magistrate',

  p1_name: 'P1 Full Name', p1_dob: 'P1 Date of Birth', p1_address: 'P1 Address',
  p1_csz: 'P1 City/State/Zip', p1_phone: 'P1 Phone', p1_email: 'P1 Email',
  p1_ssn4: 'P1 SSN (last 4)', p1_health: 'P1 Health', p1_interpreter: 'P1 Interpreter',
  p1_military: 'P1 Military', p1_health_explain: 'P1 Health (explain)',
  p1_education: 'P1 Education', p1_certs: 'P1 Certifications',
  p1_employed: 'P1 Employed', p1_employer: 'P1 Employer', p1_employer_addr: 'P1 Employer Address',
  p1_employer_csz: 'P1 Employer City/State/Zip', p1_employ_start: 'P1 Employment Start',
  p1_pay_freq: 'P1 Pay Frequency',
  p1_income_2023: 'P1 2023 Base Income', p1_bonus_2023: 'P1 2023 OT/Bonuses',
  p1_income_2024: 'P1 2024 Base Income', p1_bonus_2024: 'P1 2024 OT/Bonuses',
  p1_income_2025: 'P1 2025 Base Income', p1_bonus_2025: 'P1 2025 OT/Bonuses',
  p1_income_2026: 'P1 2026 Base Income', p1_bonus_2026: 'P1 2026 OT/Bonuses',
  p1_unemp: 'P1 Unemployment Comp', p1_workers_comp: 'P1 Workers Comp',
  p1_ss_disability: 'P1 SS Disability', p1_other_disability: 'P1 Other Disability',
  p1_ss_retirement: 'P1 SS Retirement', p1_other_retirement: 'P1 Other Retirement',
  p1_spousal_recv: 'P1 Spousal Support Received', p1_interest: 'P1 Interest/Dividends',
  p1_other_income: 'P1 Other Income',

  p2_name: 'P2 Full Name', p2_dob: 'P2 Date of Birth', p2_address: 'P2 Address',
  p2_csz: 'P2 City/State/Zip', p2_phone: 'P2 Phone', p2_email: 'P2 Email',
  p2_ssn4: 'P2 SSN (last 4)', p2_health: 'P2 Health', p2_interpreter: 'P2 Interpreter',
  p2_military: 'P2 Military', p2_health_explain: 'P2 Health (explain)',
  p2_education: 'P2 Education', p2_certs: 'P2 Certifications',
  p2_employed: 'P2 Employed', p2_employer: 'P2 Employer', p2_employer_addr: 'P2 Employer Address',
  p2_employer_csz: 'P2 Employer City/State/Zip', p2_employ_start: 'P2 Employment Start',
  p2_pay_freq: 'P2 Pay Frequency',
  p2_income_2023: 'P2 2023 Base Income', p2_bonus_2023: 'P2 2023 OT/Bonuses',
  p2_income_2024: 'P2 2024 Base Income', p2_bonus_2024: 'P2 2024 OT/Bonuses',
  p2_income_2025: 'P2 2025 Base Income', p2_bonus_2025: 'P2 2025 OT/Bonuses',
  p2_income_2026: 'P2 2026 Base Income', p2_bonus_2026: 'P2 2026 OT/Bonuses',
  p2_unemp: 'P2 Unemployment Comp', p2_workers_comp: 'P2 Workers Comp',
  p2_ss_disability: 'P2 SS Disability', p2_other_disability: 'P2 Other Disability',
  p2_ss_retirement: 'P2 SS Retirement', p2_other_retirement: 'P2 Other Retirement',
  p2_spousal_recv: 'P2 Spousal Support Received', p2_interest: 'P2 Interest/Dividends',
  p2_other_income: 'P2 Other Income',

  marriage_date: 'Marriage Date', marriage_place: 'Marriage Place',
  separation_date: 'Separation Date', pregnant: 'Pregnant?',
  ohio_resident: 'Ohio Resident 6+ Mo', termination_pref: 'Termination Preference',
  termination_specific: 'Specific Termination Date',

  has_realestate: 'Has Real Estate',
  re1_address: 'RE #1 Address', re1_fmv: 'RE #1 FMV', re1_mortgage: 'RE #1 Mortgage',
  re1_equity: 'RE #1 Equity', re1_titled: 'RE #1 Titled To', re1_gets: 'RE #1 Who Gets',
  re2_address: 'RE #2 Address', re2_fmv: 'RE #2 FMV', re2_mortgage: 'RE #2 Mortgage',
  re2_equity: 'RE #2 Equity', re2_titled: 'RE #2 Titled To', re2_gets: 'RE #2 Who Gets',
  re_other: 'RE Other Arrangements',

  has_vehicles: 'Has Vehicles',
  veh1_year: 'Veh #1 Year', veh1_make: 'Veh #1 Make', veh1_model: 'Veh #1 Model',
  veh1_vin: 'Veh #1 VIN', veh1_titled: 'Veh #1 Titled To', veh1_gets: 'Veh #1 Who Gets',
  veh1_value: 'Veh #1 Value',
  veh2_year: 'Veh #2 Year', veh2_make: 'Veh #2 Make', veh2_model: 'Veh #2 Model',
  veh2_vin: 'Veh #2 VIN', veh2_titled: 'Veh #2 Titled To', veh2_gets: 'Veh #2 Who Gets',
  veh2_value: 'Veh #2 Value',
  veh3_year: 'Veh #3 Year', veh3_make: 'Veh #3 Make', veh3_model: 'Veh #3 Model',
  veh3_vin: 'Veh #3 VIN', veh3_titled: 'Veh #3 Titled To', veh3_gets: 'Veh #3 Who Gets',
  veh3_value: 'Veh #3 Value', veh_other: 'Veh Other Arrangements',

  hh_divided: 'HH Already Divided', hh_p1_gets: 'HH P1 Gets',
  hh_p2_gets: 'HH P2 Gets', hh_delivery: 'HH Delivery', hh_other: 'HH Other',

  has_accounts: 'Has Financial Accounts',
  acct_p1_1_type: 'P1 Acct #1 Type', acct_p1_1_inst: 'P1 Acct #1 Institution', acct_p1_1_names: 'P1 Acct #1 Names',
  acct_p1_2_type: 'P1 Acct #2 Type', acct_p1_2_inst: 'P1 Acct #2 Institution', acct_p1_2_names: 'P1 Acct #2 Names',
  acct_p1_3_type: 'P1 Acct #3 Type', acct_p1_3_inst: 'P1 Acct #3 Institution', acct_p1_3_names: 'P1 Acct #3 Names',
  acct_p2_1_type: 'P2 Acct #1 Type', acct_p2_1_inst: 'P2 Acct #1 Institution', acct_p2_1_names: 'P2 Acct #1 Names',
  acct_p2_2_type: 'P2 Acct #2 Type', acct_p2_2_inst: 'P2 Acct #2 Institution', acct_p2_2_names: 'P2 Acct #2 Names',
  acct_p2_3_type: 'P2 Acct #3 Type', acct_p2_3_inst: 'P2 Acct #3 Institution', acct_p2_3_names: 'P2 Acct #3 Names',
  acct_other: 'Accounts Other',

  has_retirement: 'Has Retirement',
  ret_p1_1_inst: 'P1 Ret #1 Inst', ret_p1_1_names: 'P1 Ret #1 Names', ret_p1_1_amount: 'P1 Ret #1 Amount',
  ret_p1_2_inst: 'P1 Ret #2 Inst', ret_p1_2_names: 'P1 Ret #2 Names', ret_p1_2_amount: 'P1 Ret #2 Amount',
  ret_p2_1_inst: 'P2 Ret #1 Inst', ret_p2_1_names: 'P2 Ret #1 Names', ret_p2_1_amount: 'P2 Ret #1 Amount',
  ret_p2_2_inst: 'P2 Ret #2 Inst', ret_p2_2_names: 'P2 Ret #2 Names', ret_p2_2_amount: 'P2 Ret #2 Amount',
  ret_qdro: 'QDRO/DOPO By', ret_filing_expenses: 'Ret Filing Expenses', ret_other: 'Ret Other',

  has_debts: 'Has Debts',
  debt_p1_1_creditor: 'P1 Debt #1 Creditor', debt_p1_1_balance: 'P1 Debt #1 Balance', debt_p1_1_acct4: 'P1 Debt #1 Acct#',
  debt_p1_2_creditor: 'P1 Debt #2 Creditor', debt_p1_2_balance: 'P1 Debt #2 Balance', debt_p1_2_acct4: 'P1 Debt #2 Acct#',
  debt_p1_3_creditor: 'P1 Debt #3 Creditor', debt_p1_3_balance: 'P1 Debt #3 Balance', debt_p1_3_acct4: 'P1 Debt #3 Acct#',
  debt_p2_1_creditor: 'P2 Debt #1 Creditor', debt_p2_1_balance: 'P2 Debt #1 Balance', debt_p2_1_acct4: 'P2 Debt #1 Acct#',
  debt_p2_2_creditor: 'P2 Debt #2 Creditor', debt_p2_2_balance: 'P2 Debt #2 Balance', debt_p2_2_acct4: 'P2 Debt #2 Acct#',
  debt_p2_3_creditor: 'P2 Debt #3 Creditor', debt_p2_3_balance: 'P2 Debt #3 Balance', debt_p2_3_acct4: 'P2 Debt #3 Acct#',
  debts_other: 'Debts Other',

  has_spousal: 'Has Spousal Support', spousal_direction: 'Spousal Direction',
  spousal_amount: 'Spousal Amount/Mo', spousal_start: 'Spousal Start',
  spousal_duration: 'Spousal Duration', spousal_method: 'Spousal Method',
  spousal_csea: 'CSEA County', spousal_collection: 'Collection Method',
  spousal_term_death: 'Term on Death', spousal_term_cohab: 'Term on Cohabitation',
  spousal_term_remarry: 'Term on Remarriage', spousal_jx_amount: 'Jx Retain Amount',
  spousal_jx_duration: 'Jx Retain Duration', spousal_term_other: 'Other Term Conditions',

  exp_whose: 'Expenses For', exp_children: 'Dependent Children', exp_adults: 'Adults in Household',
  exp_mortgage: 'Mortgage/Rent', exp_mortgage2: '2nd Mortgage', exp_retax: 'RE Taxes',
  exp_homeins: 'Home Insurance', exp_hoa: 'HOA', exp_electric: 'Electric',
  exp_gas: 'Gas/Fuel', exp_water: 'Water', exp_phone: 'Phone',
  exp_trash: 'Trash', exp_tv: 'TV', exp_internet: 'Internet',
  exp_groceries: 'Groceries', exp_restaurants: 'Restaurants',
  exp_carloan: 'Car Loan', exp_carmaint: 'Car Maintenance',
  exp_cargas: 'Car Gas', exp_parking: 'Parking',
  exp_life_ins: 'Life Insurance', exp_auto_ins: 'Auto Insurance',
  exp_health_ins: 'Health Insurance', exp_doctors: 'Physicians',
  exp_dental: 'Dental', exp_rx: 'Prescriptions',
  exp_spousal_paid: 'Spousal Paid', exp_charity: 'Charity',
  exp_pets: 'Pets', exp_attorney: 'Attorney Fees',
  exp_travel: 'Travel', exp_other_amt: 'Other Expenses',
  exp_other_desc: 'Other Expenses (desc)',

  has_name_change: 'Name Change', name_change_who: 'Name Change Who',
  name_change_current: 'Current Name', name_change_restore: 'Restore to Name',

  additional_matters: 'Additional Matters',
  notes_questions: 'Questions / Notes',
};

function buildHtmlEmail(data: Record<string, string>): string {
  const p1Name = data.p1_name || 'Unknown';
  const p2Name = data.p2_name || 'Unknown';
  const submittedAt = new Date().toLocaleString('en-US', { timeZone: 'America/New_York' });

  const sections: Record<string, string[]> = {
    'Court': ['court_county','court_division','court_case_no','court_judge','court_magistrate'],
    'Petitioner 1': ['p1_name','p1_dob','p1_address','p1_csz','p1_phone','p1_email','p1_ssn4',
      'p1_health','p1_interpreter','p1_military','p1_education','p1_certs','p1_employed',
      'p1_employer','p1_employer_csz','p1_employ_start','p1_pay_freq',
      'p1_income_2023','p1_bonus_2023','p1_income_2024','p1_bonus_2024',
      'p1_income_2025','p1_bonus_2025','p1_income_2026','p1_bonus_2026',
      'p1_unemp','p1_workers_comp','p1_ss_disability','p1_other_disability',
      'p1_ss_retirement','p1_other_retirement','p1_spousal_recv','p1_interest','p1_other_income'],
    'Petitioner 2': ['p2_name','p2_dob','p2_address','p2_csz','p2_phone','p2_email','p2_ssn4',
      'p2_health','p2_interpreter','p2_military','p2_education','p2_certs','p2_employed',
      'p2_employer','p2_employer_csz','p2_employ_start','p2_pay_freq',
      'p2_income_2023','p2_bonus_2023','p2_income_2024','p2_bonus_2024',
      'p2_income_2025','p2_bonus_2025','p2_income_2026','p2_bonus_2026',
      'p2_unemp','p2_workers_comp','p2_ss_disability','p2_other_disability',
      'p2_ss_retirement','p2_other_retirement','p2_spousal_recv','p2_interest','p2_other_income'],
    'Marriage': ['marriage_date','marriage_place','separation_date','pregnant','ohio_resident','termination_pref','termination_specific'],
    'Real Estate': ['has_realestate','re1_address','re1_fmv','re1_mortgage','re1_equity','re1_titled','re1_gets',
      're2_address','re2_fmv','re2_mortgage','re2_equity','re2_titled','re2_gets','re_other'],
    'Vehicles': ['has_vehicles','veh1_year','veh1_make','veh1_model','veh1_vin','veh1_titled','veh1_gets','veh1_value',
      'veh2_year','veh2_make','veh2_model','veh2_vin','veh2_titled','veh2_gets','veh2_value',
      'veh3_year','veh3_make','veh3_model','veh3_vin','veh3_titled','veh3_gets','veh3_value','veh_other'],
    'Household Goods': ['hh_divided','hh_p1_gets','hh_p2_gets','hh_delivery','hh_other'],
    'Financial Accounts': ['has_accounts',
      'acct_p1_1_type','acct_p1_1_inst','acct_p1_1_names',
      'acct_p1_2_type','acct_p1_2_inst','acct_p1_2_names',
      'acct_p1_3_type','acct_p1_3_inst','acct_p1_3_names',
      'acct_p2_1_type','acct_p2_1_inst','acct_p2_1_names',
      'acct_p2_2_type','acct_p2_2_inst','acct_p2_2_names',
      'acct_p2_3_type','acct_p2_3_inst','acct_p2_3_names','acct_other'],
    'Retirement': ['has_retirement',
      'ret_p1_1_inst','ret_p1_1_names','ret_p1_1_amount','ret_p1_2_inst','ret_p1_2_names','ret_p1_2_amount',
      'ret_p2_1_inst','ret_p2_1_names','ret_p2_1_amount','ret_p2_2_inst','ret_p2_2_names','ret_p2_2_amount',
      'ret_qdro','ret_filing_expenses','ret_other'],
    'Debts': ['has_debts',
      'debt_p1_1_creditor','debt_p1_1_balance','debt_p1_1_acct4',
      'debt_p1_2_creditor','debt_p1_2_balance','debt_p1_2_acct4',
      'debt_p1_3_creditor','debt_p1_3_balance','debt_p1_3_acct4',
      'debt_p2_1_creditor','debt_p2_1_balance','debt_p2_1_acct4',
      'debt_p2_2_creditor','debt_p2_2_balance','debt_p2_2_acct4',
      'debt_p2_3_creditor','debt_p2_3_balance','debt_p2_3_acct4','debts_other'],
    'Spousal Support': ['has_spousal','spousal_direction','spousal_amount','spousal_start','spousal_duration',
      'spousal_method','spousal_csea','spousal_collection','spousal_term_death','spousal_term_cohab',
      'spousal_term_remarry','spousal_jx_amount','spousal_jx_duration','spousal_term_other'],
    'Monthly Expenses': ['exp_whose','exp_children','exp_adults',
      'exp_mortgage','exp_mortgage2','exp_retax','exp_homeins','exp_hoa','exp_electric',
      'exp_gas','exp_water','exp_phone','exp_trash','exp_tv','exp_internet',
      'exp_groceries','exp_restaurants','exp_carloan','exp_carmaint','exp_cargas','exp_parking',
      'exp_life_ins','exp_auto_ins','exp_health_ins','exp_doctors','exp_dental','exp_rx',
      'exp_spousal_paid','exp_charity','exp_pets','exp_attorney','exp_travel','exp_other_amt','exp_other_desc'],
    'Name Change': ['has_name_change','name_change_who','name_change_current','name_change_restore'],
    'Additional': ['additional_matters','notes_questions'],
  };

  let sectionHtml = '';
  for (const [sectionName, fields] of Object.entries(sections)) {
    const rows = fields
      .filter((f) => data[f] && data[f].trim() !== '')
      .map((f) => `
        <tr>
          <td style="padding:6px 12px;border-bottom:1px solid #f0f0f0;color:#555;font-size:13px;width:40%;white-space:nowrap">
            ${FIELD_LABELS[f] ?? f}
          </td>
          <td style="padding:6px 12px;border-bottom:1px solid #f0f0f0;font-size:13px;word-break:break-word">
            ${data[f]}
          </td>
        </tr>`)
      .join('');

    if (rows) {
      sectionHtml += `
        <h3 style="margin:24px 0 8px;font-size:14px;color:#1e3a5f;border-bottom:2px solid #1e3a5f;padding-bottom:6px">${sectionName}</h3>
        <table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #e5e7eb;border-radius:6px;overflow:hidden">
          ${rows}
        </table>`;
    }
  }

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>New Intake Submission</title></head>
<body style="font-family:Arial,sans-serif;max-width:800px;margin:0 auto;padding:20px;background:#f9fafb;color:#333">
  <div style="background:#1e3a5f;color:#fff;padding:20px 24px;border-radius:8px 8px 0 0">
    <h1 style="margin:0;font-size:20px">📋 New Ohio Dissolution Intake</h1>
    <p style="margin:4px 0 0;opacity:.85;font-size:14px">
      ${p1Name} &amp; ${p2Name} — Submitted ${submittedAt} (ET)
    </p>
  </div>
  <div style="background:#fff;padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px">
    ${sectionHtml}
    <p style="margin-top:32px;font-size:12px;color:#9ca3af;border-top:1px solid #f0f0f0;padding-top:16px">
      This submission was received via the Ohio Dissolution Intake Form. All information is confidential.
    </p>
  </div>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  console.log('📥 Submission received at', new Date().toISOString());
  
  try {
    const data: Record<string, string> = await req.json();
    console.log('✅ Data parsed successfully. Fields count:', Object.keys(data).length);

    const submissionId = `submission_${Date.now()}`;
    const submittedAt = new Date().toISOString();

    // 1. Save to KV store as backup
    try {
      await kv.set(submissionId, { ...data, _submittedAt: submittedAt });
      // Track list of submission IDs
      const ids: string[] = (await kv.get('submission_ids')) ?? [];
      ids.push(submissionId);
      await kv.set('submission_ids', ids);
      console.log('✅ Data saved to KV store:', submissionId);
    } catch (kvErr) {
      console.warn('⚠️ KV save failed (non-fatal):', kvErr);
    }

    // 2. Send email via Resend
    const toEmail = process.env.NOTIFY_EMAIL ?? 'astickley@example.com';
    const fromEmail = process.env.FROM_EMAIL ?? 'onboarding@resend.dev';

    console.log('📧 Attempting to send email...');
    console.log('  From:', fromEmail);
    console.log('  To:', toEmail);
    console.log('  Resend API Key configured:', process.env.RESEND_API_KEY ? 'Yes' : 'No');

    const p1Name = data.p1_name || 'Unknown';
    const p2Name = data.p2_name || 'Unknown';

    const resend = new Resend(process.env.RESEND_API_KEY);
    
    try {
      const emailResult = await resend.emails.send({
        from: fromEmail,
        to: toEmail,
        subject: `[Dissolution Intake] ${p1Name} & ${p2Name} — ${new Date().toLocaleDateString('en-US')}`,
        html: buildHtmlEmail(data),
      });
      console.log('✅ Email sent successfully:', emailResult);
    } catch (emailErr) {
      console.error('❌ Email sending failed:', emailErr);
      // Don't throw - we still want to return success if KV save worked
      if (emailErr instanceof Error) {
        console.error('Error details:', emailErr.message);
      }
    }

    console.log('✅ Submission completed successfully');
    return NextResponse.json({ ok: true, id: submissionId });
  } catch (err: unknown) {
    console.error('❌ Submit error:', err);
    const msg = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
