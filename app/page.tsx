'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const SECTION_TITLES = [
  'Court Info',
  'Petitioner 1',
  'Petitioner 2',
  'Marriage Info',
  'Real Estate',
  'Vehicles',
  'Household Goods',
  'Financial Accounts',
  'Retirement / Pensions',
  'Debts',
  'Spousal Support',
  'Monthly Expenses',
  'Name Change',
  'Additional Matters',
];

type FormData = Record<string, string>;

export default function Home() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState<FormData>({});

  const set = (key: string, val: string) =>
    setData((d) => ({ ...d, [key]: val }));
  const get = (key: string) => data[key] ?? '';

  const Field = ({
    label, name, type = 'text', placeholder, required,
  }: { label: string; name: string; type?: string; placeholder?: string; required?: boolean }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={get(name)}
        onChange={(e) => set(name, e.target.value)}
        placeholder={placeholder}
        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );

  const Sel = ({
    label, name, options, required,
  }: { label: string; name: string; options: string[]; required?: boolean }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        value={get(name)}
        onChange={(e) => set(name, e.target.value)}
        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      >
        <option value="">— Select —</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  const TA = ({ label, name, rows = 3 }: { label: string; name: string; rows?: number }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <textarea
        rows={rows}
        value={get(name)}
        onChange={(e) => set(name, e.target.value)}
        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );

  const SH = ({ title }: { title: string }) => (
    <h2 className="text-lg font-semibold text-blue-900 border-b border-blue-200 pb-2 mb-5">{title}</h2>
  );

  const SubH = ({ title }: { title: string }) => (
    <h3 className="text-sm font-semibold text-gray-600 mt-4 mb-3 uppercase tracking-wide">{title}</h3>
  );

  const PersonSection = (pfx: string, label: string) => (
    <div>
      <SH title={label} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
        <Field label="Full Legal Name" name={`${pfx}_name`} required />
        <Field label="Date of Birth" name={`${pfx}_dob`} type="date" />
        <Field label="Street Address" name={`${pfx}_address`} />
        <Field label="City, State, Zip" name={`${pfx}_csz`} />
        <Field label="Phone" name={`${pfx}_phone`} type="tel" />
        <Field label="Email" name={`${pfx}_email`} type="email" />
        <Field label="Last 4 of SSN" name={`${pfx}_ssn4`} placeholder="e.g. 1234" />
        <Sel label="Health Status" name={`${pfx}_health`} options={['Good','Fair','Poor']} />
        <Sel label="Interpreter Needed?" name={`${pfx}_interpreter`} options={['No','Yes']} />
        <Sel label="Active-Duty Military?" name={`${pfx}_military`} options={['No','Yes']} />
      </div>
      <Field label="If health not good, explain" name={`${pfx}_health_explain`} />
      <Sel label="Highest Education Completed" name={`${pfx}_education`} options={['Grade School','High School','Associate','Bachelors','Post Graduate']} />
      <Field label="Other Certifications" name={`${pfx}_certs`} />
      <SubH title="Employment" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
        <Sel label="Currently Employed?" name={`${pfx}_employed`} options={['Yes','No']} />
        <Field label="Employer Name" name={`${pfx}_employer`} />
        <Field label="Employer Payroll Address" name={`${pfx}_employer_addr`} />
        <Field label="Employer City, State, Zip" name={`${pfx}_employer_csz`} />
        <Field label="Employment Start Date" name={`${pfx}_employ_start`} type="date" />
        <Sel label="Pay Frequency" name={`${pfx}_pay_freq`} options={['Weekly','Biweekly','Semimonthly','Monthly']} />
      </div>
      <SubH title="Income History (annual)" />
      {['2023','2024','2025','2026'].map((yr) => (
        <div key={yr} className="grid grid-cols-2 gap-x-4">
          <Field label={`${yr} Base Income`} name={`${pfx}_income_${yr}`} placeholder="$" />
          <Field label={`${yr} OT / Bonuses`} name={`${pfx}_bonus_${yr}`} placeholder="$" />
        </div>
      ))}
      <SubH title="Other Income (NONE if N/A)" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
        {[
          ['Unemployment Compensation', `${pfx}_unemp`],
          ['Workers Compensation', `${pfx}_workers_comp`],
          ['SS Disability Benefits', `${pfx}_ss_disability`],
          ['Other Disability Benefits', `${pfx}_other_disability`],
          ['SS Retirement Benefits', `${pfx}_ss_retirement`],
          ['Other Retirement Benefits', `${pfx}_other_retirement`],
          ['Spousal Support Received', `${pfx}_spousal_recv`],
          ['Interest / Dividend Income', `${pfx}_interest`],
          ['Other Income (type & source)', `${pfx}_other_income`],
        ].map(([l, n]) => <Field key={n} label={l} name={n} placeholder="NONE" />)}
      </div>
    </div>
  );

  const steps = [
    // 0 Court
    <div key="court">
      <SH title="Court Information" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
        <Field label="County" name="court_county" required placeholder="e.g. Franklin" />
        <Field label="Division" name="court_division" placeholder="Domestic Relations" />
        <Field label="Case No. (if assigned)" name="court_case_no" />
        <Field label="Judge" name="court_judge" />
        <Field label="Magistrate" name="court_magistrate" />
      </div>
    </div>,

    // 1 P1
    <div key="p1">{PersonSection('p1', 'Petitioner 1 (You)')}</div>,

    // 2 P2
    <div key="p2">{PersonSection('p2', 'Petitioner 2 (Spouse)')}</div>,

    // 3 Marriage
    <div key="marriage">
      <SH title="Marriage Information" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
        <Field label="Date of Marriage" name="marriage_date" type="date" required />
        <Field label="City / County & State of Marriage" name="marriage_place" required />
        <Field label="Date of Separation" name="separation_date" type="date" />
        <Sel label="Is Either Party Pregnant?" name="pregnant" options={['No','Yes']} />
        <Sel label="Ohio Resident 6+ Months" name="ohio_resident" options={['Petitioner 1','Petitioner 2','Both']} required />
        <Sel label="Termination Date Preference" name="termination_pref" options={['Date of Final Hearing','Specific Date']} />
        <Field label="Specific Termination Date (if above)" name="termination_specific" type="date" />
      </div>
    </div>,

    // 4 Real Estate
    <div key="realestate">
      <SH title="Real Estate" />
      <Sel label="Do either of you own real estate?" name="has_realestate" options={['No','Yes']} />
      {get('has_realestate') === 'Yes' && <>
        {[1,2].map((n) => (
          <div key={n} className="border border-gray-200 rounded-md p-4 mb-4 bg-gray-50">
            <h3 className="font-medium text-gray-700 mb-3">Property #{n}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              <Field label="Address" name={`re${n}_address`} />
              <Field label="Fair Market Value" name={`re${n}_fmv`} placeholder="$" />
              <Field label="Mortgage Balance" name={`re${n}_mortgage`} placeholder="$" />
              <Field label="Equity" name={`re${n}_equity`} placeholder="$" />
              <Field label="Titled To" name={`re${n}_titled`} />
              <Field label="Who Gets It?" name={`re${n}_gets`} />
            </div>
          </div>
        ))}
        <TA label="Other Arrangements (refinancing, sale, etc.)" name="re_other" />
      </>}
    </div>,

    // 5 Vehicles
    <div key="vehicles">
      <SH title="Vehicles" />
      <Sel label="Do either of you own titled vehicles?" name="has_vehicles" options={['No','Yes']} />
      {get('has_vehicles') === 'Yes' && <>
        {[1,2,3].map((n) => (
          <div key={n} className="border border-gray-200 rounded-md p-4 mb-4 bg-gray-50">
            <h3 className="font-medium text-gray-700 mb-3">Vehicle #{n}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4">
              <Field label="Year" name={`veh${n}_year`} />
              <Field label="Make" name={`veh${n}_make`} />
              <Field label="Model" name={`veh${n}_model`} />
              <Field label="VIN / SN" name={`veh${n}_vin`} />
              <Field label="Titled To" name={`veh${n}_titled`} />
              <Field label="Who Gets It?" name={`veh${n}_gets`} />
              <Field label="Value" name={`veh${n}_value`} placeholder="$" />
            </div>
          </div>
        ))}
        <TA label="Other Arrangements" name="veh_other" />
      </>}
    </div>,

    // 6 Household
    <div key="household">
      <SH title="Household Goods & Personal Property" />
      <Sel label="Already divided between both parties?" name="hh_divided" options={['Yes','No']} />
      <TA label="Items Petitioner 1 Gets" name="hh_p1_gets" />
      <TA label="Items Petitioner 2 Gets" name="hh_p2_gets" />
      <Field label="Delivery / Pickup Arrangements" name="hh_delivery" />
      <TA label="Other Arrangements" name="hh_other" />
    </div>,

    // 7 Financial Accounts
    <div key="financial">
      <SH title="Financial Accounts" />
      <Sel label="Do either of you have financial accounts?" name="has_accounts" options={['No','Yes']} />
      {get('has_accounts') === 'Yes' && <>
        <SubH title="Petitioner 1 Receives" />
        {[1,2,3].map((n) => (
          <div key={n} className="grid grid-cols-1 md:grid-cols-3 gap-x-4">
            <Sel label={`P1 Account #${n} Type`} name={`acct_p1_${n}_type`} options={['Checking','Savings','Other']} />
            <Field label="Institution" name={`acct_p1_${n}_inst`} />
            <Field label="Name(s) on Account" name={`acct_p1_${n}_names`} />
          </div>
        ))}
        <SubH title="Petitioner 2 Receives" />
        {[1,2,3].map((n) => (
          <div key={n} className="grid grid-cols-1 md:grid-cols-3 gap-x-4">
            <Sel label={`P2 Account #${n} Type`} name={`acct_p2_${n}_type`} options={['Checking','Savings','Other']} />
            <Field label="Institution" name={`acct_p2_${n}_inst`} />
            <Field label="Name(s) on Account" name={`acct_p2_${n}_names`} />
          </div>
        ))}
        <TA label="Other Arrangements" name="acct_other" />
      </>}
    </div>,

    // 8 Retirement
    <div key="retirement">
      <SH title="Retirement / Pensions / 401k / IRA" />
      <Sel label="Do either of you have retirement plans?" name="has_retirement" options={['No','Yes']} />
      {get('has_retirement') === 'Yes' && <>
        <SubH title="Petitioner 1 Receives" />
        {[1,2].map((n) => (
          <div key={n} className="grid grid-cols-1 md:grid-cols-3 gap-x-4">
            <Field label="Institution" name={`ret_p1_${n}_inst`} />
            <Field label="Name(s) on Plan" name={`ret_p1_${n}_names`} />
            <Field label="Amount / Share" name={`ret_p1_${n}_amount`} />
          </div>
        ))}
        <SubH title="Petitioner 2 Receives" />
        {[1,2].map((n) => (
          <div key={n} className="grid grid-cols-1 md:grid-cols-3 gap-x-4">
            <Field label="Institution" name={`ret_p2_${n}_inst`} />
            <Field label="Name(s) on Plan" name={`ret_p2_${n}_names`} />
            <Field label="Amount / Share" name={`ret_p2_${n}_amount`} />
          </div>
        ))}
        <Field label="QDRO/DOPO Prepared By" name="ret_qdro" />
        <Field label="Filing Expenses Paid By" name="ret_filing_expenses" />
        <TA label="Other Arrangements" name="ret_other" />
      </>}
    </div>,

    // 9 Debts
    <div key="debts">
      <SH title="Debts" />
      <Sel label="Do either of you owe debts?" name="has_debts" options={['No','Yes']} />
      {get('has_debts') === 'Yes' && <>
        <SubH title="Petitioner 1 Shall Pay" />
        {[1,2,3].map((n) => (
          <div key={n} className="grid grid-cols-1 md:grid-cols-3 gap-x-4">
            <Field label="Creditor" name={`debt_p1_${n}_creditor`} />
            <Field label="Balance" name={`debt_p1_${n}_balance`} placeholder="$" />
            <Field label="Account # (last 4)" name={`debt_p1_${n}_acct4`} />
          </div>
        ))}
        <SubH title="Petitioner 2 Shall Pay" />
        {[1,2,3].map((n) => (
          <div key={n} className="grid grid-cols-1 md:grid-cols-3 gap-x-4">
            <Field label="Creditor" name={`debt_p2_${n}_creditor`} />
            <Field label="Balance" name={`debt_p2_${n}_balance`} placeholder="$" />
            <Field label="Account # (last 4)" name={`debt_p2_${n}_acct4`} />
          </div>
        ))}
        <TA label="Other Arrangements" name="debts_other" />
      </>}
    </div>,

    // 10 Spousal Support
    <div key="spousal">
      <SH title="Spousal Support" />
      <Sel label="Any spousal support?" name="has_spousal" options={['No','Yes']} />
      {get('has_spousal') === 'Yes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <Sel label="Who Pays Whom?" name="spousal_direction" options={['Petitioner 1 pays Petitioner 2','Petitioner 2 pays Petitioner 1']} />
          <Field label="Amount Per Month" name="spousal_amount" placeholder="$" />
          <Field label="Commencing On" name="spousal_start" type="date" />
          <Field label="Duration (# months or description)" name="spousal_duration" />
          <Sel label="Payment Method" name="spousal_method" options={['Direct to recipient','Through Ohio CSPC']} />
          <Field label="CSEA County (if CSPC)" name="spousal_csea" />
          <Sel label="Collection Method" name="spousal_collection" options={['Income withholding','Other']} />
          <Sel label="Terminates on Death?" name="spousal_term_death" options={['Yes','No']} />
          <Sel label="Terminates on Cohabitation?" name="spousal_term_cohab" options={['Yes','No']} />
          <Sel label="Terminates on Remarriage?" name="spousal_term_remarry" options={['Yes','No']} />
          <Sel label="Court Retains Jurisdiction – Amount?" name="spousal_jx_amount" options={['Yes','No']} />
          <Sel label="Court Retains Jurisdiction – Duration?" name="spousal_jx_duration" options={['Yes','No']} />
          <div className="col-span-2"><Field label="Other Termination Conditions" name="spousal_term_other" /></div>
        </div>
      )}
    </div>,

    // 11 Monthly Expenses
    <div key="expenses">
      <SH title="Monthly Expenses (Financial Affidavit)" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
        <Sel label="Whose Expenses?" name="exp_whose" options={['Petitioner 1','Petitioner 2']} />
        <Field label="# Dependent Children in Household" name="exp_children" placeholder="0" />
        <Field label="# Adults in Household" name="exp_adults" placeholder="1" />
      </div>
      <SubH title="Housing" />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4">
        {[['Rent / 1st Mortgage','exp_mortgage'],['2nd Mortgage / Equity Line','exp_mortgage2'],
          ['Real Estate Taxes','exp_retax'],['Homeowner/Renter Insurance','exp_homeins'],
          ['HOA / Condo Fee','exp_hoa'],['Electric','exp_electric'],
          ['Gas / Fuel / Oil','exp_gas'],['Water & Sewer','exp_water'],
          ['Phone / Cell','exp_phone'],['Trash','exp_trash'],
          ['Television','exp_tv'],['Internet','exp_internet']
        ].map(([l,n]) => <Field key={n} label={l} name={n} placeholder="$" />)}
      </div>
      <SubH title="Food & Transportation" />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4">
        {[['Groceries','exp_groceries'],['Restaurants','exp_restaurants'],
          ['Vehicle Loan/Lease','exp_carloan'],['Vehicle Maintenance','exp_carmaint'],
          ['Gas (vehicle)','exp_cargas'],['Parking','exp_parking']
        ].map(([l,n]) => <Field key={n} label={l} name={n} placeholder="$" />)}
      </div>
      <SubH title="Insurance & Health" />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4">
        {[['Life Insurance','exp_life_ins'],['Auto Insurance','exp_auto_ins'],
          ['Health Insurance','exp_health_ins'],['Physicians','exp_doctors'],
          ['Dentist / Orthodontist','exp_dental'],['Prescriptions','exp_rx']
        ].map(([l,n]) => <Field key={n} label={l} name={n} placeholder="$" />)}
      </div>
      <SubH title="Miscellaneous" />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4">
        {[['Spousal Support Paid','exp_spousal_paid'],['Charitable Contributions','exp_charity'],
          ['Pets','exp_pets'],['Attorney Fees','exp_attorney'],
          ['Travel / Vacations','exp_travel'],['Other','exp_other_amt']
        ].map(([l,n]) => <Field key={n} label={l} name={n} placeholder="$" />)}
      </div>
      <TA label="Describe any 'Other' expenses" name="exp_other_desc" />
    </div>,

    // 12 Name Change
    <div key="namechange">
      <SH title="Name Change" />
      <Sel label="Does either party want a name restored?" name="has_name_change" options={['No','Yes']} />
      {get('has_name_change') === 'Yes' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6">
          <Sel label="Who?" name="name_change_who" options={['Petitioner 1','Petitioner 2']} />
          <Field label="Current Name" name="name_change_current" />
          <Field label="Restore to Former Name" name="name_change_restore" />
        </div>
      )}
    </div>,

    // 13 Additional
    <div key="additional">
      <SH title="Additional Matters & Notes" />
      <TA label="Anything else the parties agree to that isn't covered above" name="additional_matters" rows={5} />
      <TA label="Questions or anything you're unsure about" name="notes_questions" rows={4} />
      <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-md text-sm text-amber-800">
        <strong>⚠️ Reminder:</strong> This intake form is for document preparation assistance only. This is not legal advice. Please verify all information before signing any legal documents.
      </div>
    </div>,
  ];

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? 'Submission failed');
      }
      router.push('/thank-you');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const isLast = step === steps.length - 1;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-blue-900 text-white py-6 px-4 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Ohio Dissolution of Marriage</h1>
        <p className="text-blue-200 text-sm mt-1">Confidential Intake Form — {SECTION_TITLES[step]}</p>
      </div>

      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-500">Step {step + 1} of {steps.length}</span>
            <span className="text-xs text-gray-500">{Math.round(((step + 1) / steps.length) * 100)}% complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((step + 1) / steps.length) * 100}%` }}
            />
          </div>
          <div className="hidden md:flex justify-between mt-2">
            {SECTION_TITLES.map((title, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                title={title}
                className={`w-3 h-3 rounded-full transition-colors ${
                  i < step ? 'bg-blue-600' : i === step ? 'bg-blue-800 ring-2 ring-blue-300' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
          {steps[step]}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>
          )}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="px-5 py-2 rounded-md border border-gray-300 text-gray-700 text-sm font-medium disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              ← Back
            </button>
            {isLast ? (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-2 rounded-md bg-blue-700 text-white text-sm font-medium hover:bg-blue-800 disabled:opacity-60 transition-colors"
              >
                {submitting ? 'Submitting…' : 'Submit Form'}
              </button>
            ) : (
              <button
                onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}
                className="px-5 py-2 rounded-md bg-blue-700 text-white text-sm font-medium hover:bg-blue-800 transition-colors"
              >
                Next →
              </button>
            )}
          </div>
        </div>
        <p className="text-center text-xs text-gray-400 mt-6">
          All information is transmitted securely and kept strictly confidential.
        </p>
      </div>
    </main>
  );
}
