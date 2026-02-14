'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { usePlaidLink } from 'react-plaid-link';

const CASE_ID = 'becca-nicole-2026';

// ─────────────────────────────────────────────
//  PRE-FILLED DATA — update these values as we
//  collect info from Becca & Nicole's case.
//  Leave blank ("") for anything still unknown.
// ─────────────────────────────────────────────
const CASE_DATA: Record<string, string> = {
  // Court — confirmed from documents
  court_county: 'Lucas',
  court_division: 'Domestic Relations',
  court_case_no: '',
  court_judge: '',
  court_magistrate: '',

  // Petitioner 1 (Becca) — confirmed from documents
  p1_name: 'Rebekah Lee Dickey',
  p1_dob: '',
  p1_address: '2017 Eileen Rd',
  p1_csz: 'Toledo, OH 43615',
  p1_phone: '',
  p1_email: '',
  p1_ssn4: '',
  p1_health: 'Good',
  p1_interpreter: 'No',
  p1_military: 'No',
  p1_employed: 'Yes',
  p1_employer: "Hamernik's Snow Removal and Lawn Care Ltd",
  p1_employer_addr: '1797 Parkway Dr N',
  p1_employer_csz: 'Maumee, OH 43537',
  p1_employ_start: '',
  p1_pay_freq: '',
  p1_income_2023: '',
  p1_income_2024: '',
  p1_income_2025: '27528.59',
  p1_income_2026: '',
  p1_bonus_2023: '',
  p1_bonus_2024: '',
  p1_bonus_2025: '',
  p1_bonus_2026: '',

  // Petitioner 2 (Nicole) — confirmed
  p2_name: 'Nicole Marie Dickey',
  p2_maiden: 'Woyton',
  p2_dob: '1989-03-09',
  p2_address: '',
  p2_csz: '',
  p2_phone: '',
  p2_email: '',
  p2_ssn4: '',
  p2_health: 'Good',
  p2_interpreter: 'No',
  p2_military: 'No',
  p2_employed: '',
  p2_employer: '',
  p2_employer_addr: '',
  p2_employer_csz: '',
  p2_employ_start: '',
  p2_pay_freq: '',
  p2_income_2023: '',
  p2_income_2024: '',
  p2_income_2025: '',
  p2_income_2026: '',
  p2_bonus_2023: '',
  p2_bonus_2024: '',
  p2_bonus_2025: '',
  p2_bonus_2026: '',

  // Marriage — date & place still needed
  marriage_date: '',
  marriage_place: '',
  separation_date: '',
  pregnant: 'No',
  ohio_resident: 'Both',
  termination_pref: 'Date of Final Hearing',

  // Assets — still need to confirm from both parties
  has_real_estate: 'No',
  has_vehicles: '',
  has_accounts: '',
  has_retirement: '',
  has_other_property: 'No',
  has_business: 'No',
  has_stocks: 'No',
  household_divided: 'Yes',

  // Debts & Support — still need from both parties
  has_debts: '',
  spousal_support: 'No',

  // Name change — Nicole confirmed restoring to maiden name
  has_name_change: 'Yes',
  name_change_who: 'Petitioner 2',
  name_change_current: 'Nicole Marie Dickey',
  name_change_restore: 'Nicole Marie Woyton',
};

type FormData = Record<string, string>;

const SECTIONS = [
  'Court Info',
  'Petitioner 1 (Becca)',
  'Petitioner 2 (Nicole)',
  'Marriage Info',
  'Assets & Property',
  'Debts',
  'Spousal Support',
  'Name Change',
  'Review & Submit',
];

const FILING_INFO = {
  court: 'Lucas County Court of Common Pleas — Domestic Relations Division',
  address: '429 Michigan St, Toledo, OH 43604',
};

// Fields that have been confirmed vs still need input
const NEEDS_INFO: Record<string, boolean> = {};
Object.entries(CASE_DATA).forEach(([k, v]) => {
  if (v === '') NEEDS_INFO[k] = true;
});

export default function BeccaPage() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormData>(CASE_DATA);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved' | 'loading'>('loading');
  const [plaidTarget, setPlaidTarget] = useState<'p1' | 'p2' | null>(null);
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [plaidStatus, setPlaidStatus] = useState<string | null>(null);
  const [creditStatus, setCreditStatus] = useState<string | null>(null);
  const [creditLinkToken, setCreditLinkToken] = useState<string | null>(null);
  const [creditTarget, setCreditTarget] = useState<'p1' | 'p2' | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load saved state on mount
  useEffect(() => {
    fetch(`/api/autosave?caseId=${CASE_ID}`)
      .then(r => r.json())
      .then(res => {
        if (res.found && res.data) {
          // Merge saved data over defaults, preserving pre-fills for any empty saved fields
          setData(prev => ({ ...prev, ...res.data }));
          setSaveStatus('saved');
        } else {
          setSaveStatus('unsaved');
        }
      })
      .catch(() => setSaveStatus('unsaved'));
  }, []);

  // Debounced autosave — fires 1.5s after last change
  const triggerSave = useCallback((newData: FormData) => {
    setSaveStatus('unsaved');
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaveStatus('saving');
      try {
        await fetch('/api/autosave', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ caseId: CASE_ID, data: newData }),
        });
        setSaveStatus('saved');
      } catch {
        setSaveStatus('unsaved');
      }
    }, 1500);
  }, []);

  const set = (key: string, val: string) => {
    setData((d) => {
      const updated = { ...d, [key]: val };
      triggerSave(updated);
      return updated;
    });
  };
  const get = (key: string) => data[key] ?? '';
  const isEmpty = (key: string) => get(key) === '';

  // Plaid link token fetch
  const openPlaid = async (target: 'p1' | 'p2') => {
    setPlaidTarget(target);
    setPlaidStatus('Connecting to bank...');
    try {
      const res = await fetch('/api/plaid/create-link-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: `${CASE_ID}-${target}` }),
      });
      const { link_token } = await res.json();
      setLinkToken(link_token);
    } catch {
      setPlaidStatus('Could not connect to Plaid. Check API keys.');
    }
  };

  // Plaid Link hook
  const { open: openPlaidLink, ready: plaidReady } = usePlaidLink({
    token: linkToken ?? '',
    onSuccess: async (public_token) => {
      setPlaidStatus('Fetching financial data...');
      try {
        const res = await fetch('/api/plaid/exchange-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ public_token }),
        });
        const result = await res.json();
        if (result.success) {
          // Map Plaid identity fields to the correct petitioner prefix
          const pfx = plaidTarget ?? 'p1';
          const updates: FormData = { ...data };
          if (result.formFields._plaid_name) updates[`${pfx}_name`] = result.formFields._plaid_name;
          if (result.formFields._plaid_address) updates[`${pfx}_address`] = result.formFields._plaid_address;
          if (result.formFields._plaid_csz) updates[`${pfx}_csz`] = result.formFields._plaid_csz;
          if (result.formFields._plaid_email) updates[`${pfx}_email`] = result.formFields._plaid_email;
          if (result.formFields._plaid_phone) updates[`${pfx}_phone`] = result.formFields._plaid_phone;
          if (result.formFields.has_accounts) updates['has_accounts'] = 'Yes';
          if (result.formFields.has_retirement) updates['has_retirement'] = 'Yes';
          setData(updates);
          triggerSave(updates);
          setPlaidStatus(`✅ Imported ${result.breakdown.total} account(s) — ${result.breakdown.checking} checking, ${result.breakdown.savings} savings, ${result.breakdown.retirement} retirement`);
        }
      } catch {
        setPlaidStatus('Failed to import data from bank.');
      }
      setLinkToken(null);
      setPlaidTarget(null);
    },
    onExit: () => {
      setLinkToken(null);
      setPlaidTarget(null);
      setPlaidStatus(null);
    },
  });

  // Auto-open Plaid once token is ready
  useEffect(() => {
    if (linkToken && plaidReady) openPlaidLink();
  }, [linkToken, plaidReady, openPlaidLink]);

  // Credit check — fetch liabilities link token
  const runCreditCheck = async (target: 'p1' | 'p2') => {
    setCreditTarget(target);
    setCreditStatus('Connecting for credit check...');
    try {
      const res = await fetch('/api/credit-check/create-link-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: `${CASE_ID}-${target}-credit` }),
      });
      const { link_token } = await res.json();
      setCreditLinkToken(link_token);
    } catch {
      setCreditStatus('Could not start credit check. Check Plaid API keys.');
    }
  };

  const { open: openCreditLink, ready: creditReady } = usePlaidLink({
    token: creditLinkToken ?? '',
    onSuccess: async (public_token) => {
      setCreditStatus('Pulling credit data...');
      try {
        const res = await fetch('/api/credit-check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ public_token }),
        });
        const result = await res.json();
        if (result.success) {
          const pfx = creditTarget ?? 'p1';
          const updates: FormData = { ...data };
          if (result.debts.length > 0) updates['has_debts'] = 'Yes';
          // Auto-fill up to 3 debt slots for the petitioner
          result.debts.slice(0, 3).forEach((debt: { creditor: string; balance: number; last4: string }, i: number) => {
            const n = i + 1;
            updates[`${pfx}_debt${n}_creditor`] = debt.creditor;
            updates[`${pfx}_debt${n}_balance`] = `$${debt.balance.toFixed(2)}`;
            updates[`${pfx}_debt${n}_acct`] = debt.last4;
          });
          setData(updates);
          triggerSave(updates);
          const name = pfx === 'p1' ? 'Becca' : 'Nicole';
          setCreditStatus(`✅ ${name}: Found ${result.summary.total} debt(s) — ${result.summary.creditCards} credit cards, ${result.summary.studentLoans} student loans, ${result.summary.mortgages} mortgages. Total: $${result.totalDebt.toFixed(2)}`);
        }
      } catch {
        setCreditStatus('Failed to retrieve credit data.');
      }
      setCreditLinkToken(null);
      setCreditTarget(null);
    },
    onExit: () => {
      setCreditLinkToken(null);
      setCreditTarget(null);
      setCreditStatus(null);
    },
  });

  useEffect(() => {
    if (creditLinkToken && creditReady) openCreditLink();
  }, [creditLinkToken, creditReady, openCreditLink]);

  const fieldCls = (name: string) =>
    `w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      isEmpty(name)
        ? 'border-amber-400 bg-amber-50 focus:ring-amber-400'
        : 'border-gray-300 bg-white'
    }`;

  const Field = ({
    label, name, type = 'text', placeholder,
  }: { label: string; name: string; type?: string; placeholder?: string }) => (
    <div className="mb-4">
      <label className="block text-xs font-medium text-gray-600 mb-1">
        {label}
        {isEmpty(name) && (
          <span className="ml-2 text-amber-600 font-normal">⚠ needs info</span>
        )}
      </label>
      <input
        type={type}
        value={get(name)}
        onChange={(e) => set(name, e.target.value)}
        placeholder={placeholder ?? (isEmpty(name) ? 'Fill in…' : '')}
        className={fieldCls(name)}
      />
    </div>
  );

  const Sel = ({
    label, name, options,
  }: { label: string; name: string; options: string[] }) => (
    <div className="mb-4">
      <label className="block text-xs font-medium text-gray-600 mb-1">
        {label}
        {isEmpty(name) && (
          <span className="ml-2 text-amber-600 font-normal">⚠ needs info</span>
        )}
      </label>
      <select
        value={get(name)}
        onChange={(e) => set(name, e.target.value)}
        className={fieldCls(name)}
      >
        <option value="">— Select —</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  const SH = ({ title }: { title: string }) => (
    <h2 className="text-base font-semibold text-blue-900 border-b border-blue-100 pb-2 mb-4">{title}</h2>
  );

  const SubH = ({ title }: { title: string }) => (
    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-5 mb-3">{title}</h3>
  );

  // Count blanks in current step
  const countBlanks = () => {
    const stepKeys: Record<number, string[]> = {
      0: ['court_county','court_division','court_case_no','court_judge','court_magistrate'],
      1: ['p1_name','p1_dob','p1_address','p1_csz','p1_phone','p1_email','p1_ssn4','p1_employed','p1_employer'],
      2: ['p2_name','p2_dob','p2_address','p2_csz','p2_phone','p2_email','p2_ssn4','p2_employed','p2_employer'],
      3: ['marriage_date','marriage_place','separation_date'],
    };
    const keys = stepKeys[step] ?? [];
    return keys.filter(k => get(k) === '').length;
  };

  const PersonStep = (pfx: 'p1' | 'p2', label: string) => (
    <div>
      <SH title={label} />
      {/* Plaid autofill button */}
      <div className="mb-5 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-green-800">🏦 Connect bank to autofill</p>
          <p className="text-xs text-green-600 mt-0.5">Imports name, address, account info automatically</p>
        </div>
        <button
          onClick={() => openPlaid(pfx)}
          className="px-4 py-2 bg-green-700 text-white text-sm font-medium rounded-md hover:bg-green-800 transition-colors shrink-0 ml-4"
        >
          Connect Bank
        </button>
      </div>
      {plaidStatus && plaidTarget === pfx && (
        <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">{plaidStatus}</div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5">
        <Field label="Full Legal Name" name={`${pfx}_name`} />
        <Field label="Date of Birth" name={`${pfx}_dob`} type="date" />
        <Field label="Street Address" name={`${pfx}_address`} />
        <Field label="City, State, Zip" name={`${pfx}_csz`} />
        <Field label="Phone" name={`${pfx}_phone`} type="tel" />
        <Field label="Email" name={`${pfx}_email`} type="email" />
        <Field label="Last 4 of SSN" name={`${pfx}_ssn4`} placeholder="1234" />
        <Sel label="Health Status" name={`${pfx}_health`} options={['Good','Fair','Poor']} />
        <Sel label="Interpreter Needed?" name={`${pfx}_interpreter`} options={['No','Yes']} />
        <Sel label="Active-Duty Military?" name={`${pfx}_military`} options={['No','Yes']} />
      </div>
      <SubH title="Employment" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5">
        <Sel label="Currently Employed?" name={`${pfx}_employed`} options={['Yes','No']} />
        <Field label="Employer Name" name={`${pfx}_employer`} />
        <Field label="Employer Address" name={`${pfx}_employer_addr`} />
        <Field label="Employer City, State, Zip" name={`${pfx}_employer_csz`} />
        <Field label="Employment Start Date" name={`${pfx}_employ_start`} type="date" />
        <Sel label="Pay Frequency" name={`${pfx}_pay_freq`} options={['Weekly','Biweekly','Semimonthly','Monthly']} />
      </div>
      <SubH title="Income History (annual)" />
      {['2023','2024','2025','2026'].map((yr) => (
        <div key={yr} className="grid grid-cols-2 gap-x-4">
          <Field label={`${yr} Base Income`} name={`${pfx}_income_${yr}`} placeholder="$0" />
          <Field label={`${yr} OT / Bonuses`} name={`${pfx}_bonus_${yr}`} placeholder="$0" />
        </div>
      ))}
    </div>
  );

  const steps = [
    // 0 Court
    <div key="court">
      <SH title="Court Information" />
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
        <strong>📍 Filing location:</strong> {FILING_INFO.court}<br />
        <span className="text-blue-600">{FILING_INFO.address}</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5">
        <Field label="County" name="court_county" placeholder="e.g. Franklin" />
        <Field label="Division" name="court_division" placeholder="Domestic Relations" />
        <Field label="Case No. (if assigned)" name="court_case_no" />
        <Field label="Judge" name="court_judge" />
        <Field label="Magistrate" name="court_magistrate" />
      </div>
    </div>,

    // 1 P1
    <div key="p1">{PersonStep('p1', 'Petitioner 1 — Becca (Rebekah Lee Dickey)')}</div>,

    // 2 P2
    <div key="p2">{PersonStep('p2', 'Petitioner 2 — Nicole Dickey')}</div>,

    // 3 Marriage
    <div key="marriage">
      <SH title="Marriage Information" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5">
        <Field label="Date of Marriage" name="marriage_date" type="date" />
        <Field label="City / County & State of Marriage" name="marriage_place" />
        <Field label="Date of Separation" name="separation_date" type="date" />
        <Sel label="Is Either Party Pregnant?" name="pregnant" options={['No','Yes']} />
        <Sel label="Ohio Resident 6+ Months" name="ohio_resident" options={['Petitioner 1','Petitioner 2','Both']} />
        <Sel label="Termination Date Preference" name="termination_pref" options={['Date of Final Hearing','Specific Date']} />
      </div>
    </div>,

    // 4 Assets
    <div key="assets">
      <SH title="Assets & Property" />
      <div className="space-y-4">
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <Sel label="Do either of you own real estate?" name="has_real_estate" options={['No','Yes']} />
          {get('has_real_estate') === 'Yes' && (
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-x-5">
              <Field label="Property Address" name="re1_address" />
              <Field label="Fair Market Value" name="re1_fmv" placeholder="$" />
              <Field label="Mortgage Balance" name="re1_mortgage" placeholder="$" />
              <Sel label="Who Gets It?" name="re1_gets" options={['Petitioner 1','Petitioner 2','Sell & Split']} />
            </div>
          )}
        </div>
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <Sel label="Do either of you own titled vehicles?" name="has_vehicles" options={['No','Yes']} />
          {get('has_vehicles') === 'Yes' && (
            <div className="mt-3 space-y-3">
              {['1','2'].map(n => (
                <div key={n} className="grid grid-cols-2 md:grid-cols-3 gap-x-4 border-t border-gray-200 pt-3">
                  <Field label={`Vehicle ${n} — Year`} name={`v${n}_year`} />
                  <Field label="Make" name={`v${n}_make`} />
                  <Field label="Model" name={`v${n}_model`} />
                  <Field label="VIN" name={`v${n}_vin`} />
                  <Field label="Value" name={`v${n}_value`} placeholder="$" />
                  <Sel label="Who Gets It?" name={`v${n}_gets`} options={['Petitioner 1','Petitioner 2']} />
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <Sel label="Do either of you have bank accounts?" name="has_accounts" options={['No','Yes']} />
          {get('has_accounts') === 'Yes' && (
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-x-5">
              <Field label="P1 — Bank & Account Type" name="acct_p1_bank" placeholder="e.g. Chase Checking" />
              <Field label="P2 — Bank & Account Type" name="acct_p2_bank" placeholder="e.g. Chase Checking" />
            </div>
          )}
        </div>
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <Sel label="Do either of you have retirement accounts?" name="has_retirement" options={['No','Yes']} />
          {get('has_retirement') === 'Yes' && (
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-x-5">
              <Field label="P1 — Retirement Institution" name="ret_p1_inst" />
              <Field label="P1 — Amount / Share" name="ret_p1_amt" placeholder="$" />
              <Field label="P2 — Retirement Institution" name="ret_p2_inst" />
              <Field label="P2 — Amount / Share" name="ret_p2_amt" placeholder="$" />
            </div>
          )}
        </div>
      </div>
    </div>,

    // 5 Debts
    <div key="debts">
      <SH title="Debts" />
      {/* Credit check buttons */}
      <div className="mb-5 grid grid-cols-1 md:grid-cols-2 gap-3">
        {(['p1','p2'] as const).map((pfx) => (
          <div key={pfx} className="p-3 bg-purple-50 border border-purple-200 rounded-lg flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-800">🔍 {pfx === 'p1' ? 'Becca' : 'Nicole'}&apos;s credit check</p>
              <p className="text-xs text-purple-600 mt-0.5">Auto-imports credit cards &amp; loans</p>
            </div>
            <button
              onClick={() => runCreditCheck(pfx)}
              className="px-3 py-1.5 bg-purple-700 text-white text-xs font-medium rounded-md hover:bg-purple-800 transition-colors shrink-0 ml-3"
            >
              Run Check
            </button>
          </div>
        ))}
      </div>
      {creditStatus && (
        <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded text-sm text-purple-800">{creditStatus}</div>
      )}
      <Sel label="Do either of you owe debts?" name="has_debts" options={['No','Yes']} />
      {get('has_debts') === 'Yes' && (
        <div className="mt-4 space-y-3">
          <SubH title="Petitioner 1 (Becca) pays:" />
          {['1','2','3'].map(n => (
            <div key={n} className="grid grid-cols-3 gap-x-4">
              <Field label={`Creditor ${n}`} name={`p1_debt${n}_creditor`} />
              <Field label="Balance" name={`p1_debt${n}_balance`} placeholder="$" />
              <Field label="Acct last 4" name={`p1_debt${n}_acct`} placeholder="1234" />
            </div>
          ))}
          <SubH title="Petitioner 2 (Nicole) pays:" />
          {['1','2','3'].map(n => (
            <div key={n} className="grid grid-cols-3 gap-x-4">
              <Field label={`Creditor ${n}`} name={`p2_debt${n}_creditor`} />
              <Field label="Balance" name={`p2_debt${n}_balance`} placeholder="$" />
              <Field label="Acct last 4" name={`p2_debt${n}_acct`} placeholder="1234" />
            </div>
          ))}
        </div>
      )}
    </div>,

    // 6 Spousal Support
    <div key="spousal">
      <SH title="Spousal Support" />
      <Sel label="Will either party pay spousal support?" name="spousal_support" options={['No','Yes']} />
      {get('spousal_support') === 'Yes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 mt-4">
          <Sel label="Who Pays?" name="spousal_payer" options={['Petitioner 1 pays Petitioner 2','Petitioner 2 pays Petitioner 1']} />
          <Field label="Amount per Month" name="spousal_amount" placeholder="$" />
          <Field label="Commencing Date" name="spousal_start" type="date" />
          <Field label="Duration (months or 'indefinite')" name="spousal_duration" />
        </div>
      )}
    </div>,

    // 7 Name Change
    <div key="names">
      <SH title="Name Change" />
      <Sel label="Does either party want a name restored?" name="has_name_change" options={['No','Yes']} />
      {get('has_name_change') === 'Yes' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-5 mt-4">
          <Sel label="Who?" name="name_change_who" options={['Petitioner 1','Petitioner 2']} />
          <Field label="Current Name" name="name_change_current" />
          <Field label="Restore to Former Name" name="name_change_restore" />
        </div>
      )}
    </div>,

    // 8 Review
    <div key="review">
      <SH title="Review Your Information" />
      <p className="text-sm text-gray-600 mb-6">
        Review what's been filled in. Fields marked <span className="text-amber-600 font-medium">⚠ needs info</span> are still blank — you can go back and fill them in, or submit now and we'll follow up.
      </p>
      <div className="space-y-3">
        {Object.entries(data).filter(([, v]) => v !== '').map(([k, v]) => (
          <div key={k} className="flex gap-x-3 text-sm border-b border-gray-100 pb-2">
            <span className="text-gray-400 font-mono text-xs w-48 shrink-0">{k}</span>
            <span className="text-gray-800">{v}</span>
          </div>
        ))}
      </div>
      {Object.values(data).some(v => v === '') && (
        <div className="mt-6 p-3 bg-amber-50 border border-amber-200 rounded text-sm text-amber-800">
          <strong>⚠ Still missing:</strong> {Object.entries(data).filter(([,v]) => v === '').map(([k]) => k).join(', ')}
        </div>
      )}
    </div>,
  ];

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, _case: 'becca-nicole' }),
      });
      setSubmitted(true);
    } catch {
      alert('Submission failed — please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 max-w-md text-center">
          <div className="text-4xl mb-4">✅</div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">Information Submitted</h1>
          <p className="text-gray-600 text-sm">We've received the case details. The next step is PDF generation.</p>
        </div>
      </main>
    );
  }

  const blanks = countBlanks();
  const isLast = step === steps.length - 1;

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-900 text-white py-5 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">Ohio Dissolution of Marriage</h1>
              <p className="text-blue-300 text-xs mt-0.5">Becca & Nicole — Private Case File</p>
            </div>
            <div className="text-right">
              <div className="text-xs text-blue-300">Step {step + 1} of {steps.length}</div>
              <div className="text-sm font-medium">{SECTIONS[step]}</div>
              <div className="text-xs mt-0.5">
                {saveStatus === 'loading' && <span className="text-blue-400">Loading...</span>}
                {saveStatus === 'saving' && <span className="text-yellow-300">⟳ Saving...</span>}
                {saveStatus === 'saved' && <span className="text-green-300">✓ Saved</span>}
                {saveStatus === 'unsaved' && <span className="text-orange-300">● Unsaved</span>}
              </div>
            </div>
          </div>
          {/* Progress */}
          <div className="mt-4">
            <div className="w-full bg-blue-800 rounded-full h-1.5">
              <div
                className="bg-blue-300 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${((step + 1) / steps.length) * 100}%` }}
              />
            </div>
            <div className="flex justify-between mt-1.5">
              {SECTIONS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setStep(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    i < step ? 'bg-blue-400' : i === step ? 'bg-white' : 'bg-blue-700'
                  }`}
                  title={SECTIONS[i]}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Blank count badge */}
      {blanks > 0 && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center">
          <span className="text-amber-700 text-xs">
            ⚠ {blanks} field{blanks !== 1 ? 's' : ''} on this page still need{blanks === 1 ? 's' : ''} to be filled in
          </span>
        </div>
      )}

      {/* Form */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
          {steps[step]}

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
                {submitting ? 'Submitting…' : 'Submit & Generate PDFs →'}
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
        <p className="text-center text-xs text-gray-400 mt-4">
          🔒 This page is private and confidential. All data is transmitted securely.
        </p>
      </div>
    </main>
  );
}
