'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const SECTION_TITLES = [
  'Welcome',
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
    label, name, type = 'text', placeholder, required, help,
  }: { label: string; name: string; type?: string; placeholder?: string; required?: boolean; help?: string }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {help && <p className="text-xs text-gray-500 mb-1">{help}</p>}
      <input
        type={type}
        value={get(name)}
        onChange={(e) => set(name, e.target.value)}
        placeholder={placeholder}
        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 hover:border-gray-400"
      />
    </div>
  );

  const Sel = ({
    label, name, options, required, help,
  }: { label: string; name: string; options: string[]; required?: boolean; help?: string }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {help && <p className="text-xs text-gray-500 mb-1">{help}</p>}
      <select
        value={get(name)}
        onChange={(e) => set(name, e.target.value)}
        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition-all duration-200 hover:border-gray-400 cursor-pointer"
      >
        <option value="">— Select —</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  const TA = ({ label, name, rows = 3, help, placeholder }: { label: string; name: string; rows?: number; help?: string; placeholder?: string }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {help && <p className="text-xs text-gray-500 mb-1">{help}</p>}
      <textarea
        rows={rows}
        value={get(name)}
        onChange={(e) => set(name, e.target.value)}
        placeholder={placeholder}
        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 hover:border-gray-400"
      />
    </div>
  );

  const SH = ({ title }: { title: string }) => (
    <h2 className="text-lg font-semibold text-blue-900 border-b border-blue-200 pb-2 mb-5">{title}</h2>
  );

  const SubH = ({ title }: { title: string }) => (
    <h3 className="text-sm font-semibold text-gray-600 mt-4 mb-3 uppercase tracking-wide">{title}</h3>
  );

  const InfoBox = ({ children }: { children: React.ReactNode }) => (
    <div className="mb-5 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-900">
      {children}
    </div>
  );

  const PersonSection = (pfx: string, label: string) => (
    <div>
      <SH title={label} />
      <InfoBox>
        <strong>Why we need this:</strong> Ohio dissolution forms require detailed personal information for both parties. This helps prepare your official court documents accurately.
      </InfoBox>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
        <Field label="Full Legal Name" name={`${pfx}_name`} required help="Use your complete name as it appears on your ID or birth certificate" />
        <Field label="Date of Birth" name={`${pfx}_dob`} type="date" help="Required for court records and identification" />
        <Field label="Street Address" name={`${pfx}_address`} help="Your current residential address" />
        <Field label="City, State, Zip" name={`${pfx}_csz`} placeholder="e.g., Columbus, OH 43215" />
        <Field label="Phone" name={`${pfx}_phone`} type="tel" placeholder="(555) 123-4567" help="Best number to reach you" />
        <Field label="Email" name={`${pfx}_email`} type="email" help="For notifications about your documents" />
        <Field label="Last 4 of SSN" name={`${pfx}_ssn4`} placeholder="e.g. 1234" help="Only the last 4 digits for identification purposes" />
        <Sel label="Current Health Status" name={`${pfx}_health`} options={['Good','Fair','Poor']} help="Used for spousal support considerations" />
        <Sel label="Need an Interpreter?" name={`${pfx}_interpreter`} options={['No','Yes']} help="Court can provide interpreter services if needed" />
        <Sel label="Active-Duty Military?" name={`${pfx}_military`} options={['No','Yes']} help="Special protections may apply to military members" />
      </div>
      <Field label="If health not good, please explain" name={`${pfx}_health_explain`} help="Describe any health conditions that affect work or daily life" />
      <Sel label="Highest Level of Education Completed" name={`${pfx}_education`} options={['Grade School','High School','Associate Degree','Bachelor\'s Degree','Graduate Degree']} help="Education affects earning capacity in support calculations" />
      <Field label="Professional Certifications or Licenses" name={`${pfx}_certs`} placeholder="e.g., CPA, RN, CDL" help="List any licenses or certifications (leave blank if none)" />
      <SubH title="Employment Information" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
        <Sel label="Currently Employed?" name={`${pfx}_employed`} options={['Yes','No']} />
        <Field label="Employer Name" name={`${pfx}_employer`} help="Company or organization you work for" />
        <Field label="Employer Payroll Address" name={`${pfx}_employer_addr`} help="Where your employer is located" />
        <Field label="Employer City, State, Zip" name={`${pfx}_employer_csz`} placeholder="e.g., Columbus, OH 43215" />
        <Field label="Employment Start Date" name={`${pfx}_employ_start`} type="date" help="When did you start this job?" />
        <Sel label="How Often Are You Paid?" name={`${pfx}_pay_freq`} options={['Weekly','Biweekly','Semimonthly','Monthly']} help="Biweekly = every 2 weeks; Semimonthly = twice a month" />
      </div>
      <SubH title="Income History (Past 3-4 Years)" />
      <InfoBox>
        <strong>Why we ask:</strong> Ohio courts require income history to calculate support obligations fairly. Include your gross income (before taxes) from W-2s or tax returns.
      </InfoBox>
      {['2023','2024','2025','2026'].map((yr) => (
        <div key={yr} className="grid grid-cols-2 gap-x-4">
          <Field label={`${yr} Base Salary/Wages`} name={`${pfx}_income_${yr}`} placeholder="$45,000" help="Annual gross income from employment" />
          <Field label={`${yr} Overtime / Bonuses`} name={`${pfx}_bonus_${yr}`} placeholder="$5,000" help="Additional income beyond base pay" />
        </div>
      ))}
      <SubH title="Other Income Sources" />
      <InfoBox>
        <strong>Important:</strong> List ALL income sources. Write "NONE" or "0" if you don't receive that type of income. The court needs a complete picture of your financial situation.
      </InfoBox>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
        {[
          ['Unemployment Benefits', `${pfx}_unemp`, 'Monthly amount from unemployment'],
          ['Workers Compensation', `${pfx}_workers_comp`, 'If receiving workers comp payments'],
          ['Social Security Disability', `${pfx}_ss_disability`, 'SSDI monthly benefit amount'],
          ['Other Disability Benefits', `${pfx}_other_disability`, 'Private disability insurance'],
          ['Social Security Retirement', `${pfx}_ss_retirement`, 'Monthly SS retirement benefit'],
          ['Other Retirement/Pension', `${pfx}_other_retirement`, 'Pension or IRA distributions'],
          ['Spousal Support Received', `${pfx}_spousal_recv`, 'From a previous marriage'],
          ['Interest / Dividend Income', `${pfx}_interest`, 'From investments or savings'],
          ['Other Income', `${pfx}_other_income`, 'Describe type and monthly amount'],
        ].map(([l, n, h]) => <Field key={n} label={l} name={n} placeholder="NONE or $0" help={h} />)}
      </div>
    </div>
  );

  const steps = [
    // 0 Welcome
    <div key="welcome" className="animate-fadeIn">
      <div className="text-center mb-8">
        <div className="inline-block p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full mb-4 shadow-lg animate-bounce-slow">
          <svg className="w-14 h-14 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-blue-900 mb-4 animate-slideDown">Welcome to Ohio Dissolution Form Prep</h2>
        <p className="text-gray-600 text-lg leading-relaxed max-w-2xl mx-auto animate-slideUp">
          This form will help you gather all the information needed for your Ohio dissolution of marriage paperwork. 
          We'll walk you through each section step-by-step.
        </p>
      </div>
      
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-6 mb-6 shadow-sm hover:shadow-md transition-shadow duration-300">
        <h3 className="font-bold text-green-900 mb-3 flex items-center text-lg">
          <svg className="w-6 h-6 mr-2 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          What This Form Does For You
        </h3>
        <ul className="space-y-3 text-sm text-green-900">
          <li className="flex items-start hover:translate-x-1 transition-transform duration-200">
            <span className="mr-3 text-green-600 font-bold text-lg">✓</span>
            <span><strong>Collects all required information</strong> for official Ohio dissolution forms</span>
          </li>
          <li className="flex items-start hover:translate-x-1 transition-transform duration-200">
            <span className="mr-3 text-green-600 font-bold text-lg">✓</span>
            <span><strong>Explains each field</strong> so you know exactly what to provide</span>
          </li>
          <li className="flex items-start hover:translate-x-1 transition-transform duration-200">
            <span className="mr-3 text-green-600 font-bold text-lg">✓</span>
            <span><strong>Saves you money</strong> on lawyer fees for basic paperwork preparation</span>
          </li>
          <li className="flex items-start hover:translate-x-1 transition-transform duration-200">
            <span className="mr-3 text-green-600 font-bold text-lg">✓</span>
            <span><strong>Gives you everything you need</strong> to start the dissolution process</span>
          </li>
        </ul>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl p-6 mb-6 shadow-sm hover:shadow-md transition-shadow duration-300">
        <h3 className="font-bold text-blue-900 mb-3 text-lg flex items-center">
          <span className="text-2xl mr-2">📝</span>
          What You'll Need
        </h3>
        <p className="text-sm text-blue-900 mb-3 font-medium">Having these documents handy will make filling out the form easier:</p>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-blue-900">
          <li className="flex items-center hover:translate-x-1 transition-transform duration-200">
            <span className="mr-2 text-blue-600">📄</span> Marriage certificate
          </li>
          <li className="flex items-center hover:translate-x-1 transition-transform duration-200">
            <span className="mr-2 text-blue-600">💵</span> Recent pay stubs
          </li>
          <li className="flex items-center hover:translate-x-1 transition-transform duration-200">
            <span className="mr-2 text-blue-600">📊</span> Tax returns (last 2-3 years)
          </li>
          <li className="flex items-center hover:translate-x-1 transition-transform duration-200">
            <span className="mr-2 text-blue-600">🏦</span> Bank account information
          </li>
          <li className="flex items-center hover:translate-x-1 transition-transform duration-200">
            <span className="mr-2 text-blue-600">🏠</span> Property deeds/mortgage info
          </li>
          <li className="flex items-center hover:translate-x-1 transition-transform duration-200">
            <span className="mr-2 text-blue-600">🚗</span> Vehicle titles
          </li>
          <li className="flex items-center hover:translate-x-1 transition-transform duration-200">
            <span className="mr-2 text-blue-600">💰</span> Retirement account statements
          </li>
          <li className="flex items-center hover:translate-x-1 transition-transform duration-200">
            <span className="mr-2 text-blue-600">💳</span> List of debts/credit cards
          </li>
        </ul>
        <p className="text-xs text-blue-800 mt-4 italic bg-blue-100 p-2 rounded">💡 Don't worry if you don't have everything — you can estimate or come back to fill in details later.</p>
      </div>

      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-xl p-6 mb-6 shadow-sm hover:shadow-md transition-shadow duration-300">
        <h3 className="font-bold text-amber-900 mb-3 text-lg flex items-center">
          <span className="text-2xl mr-2">⚖️</span>
          Important to Know
        </h3>
        <ul className="space-y-3 text-sm text-amber-900">
          <li className="flex items-start hover:translate-x-1 transition-transform duration-200">
            <span className="mr-3 text-amber-600 font-bold">•</span>
            <span><strong>This is NOT legal advice</strong> — it's document preparation assistance</span>
          </li>
          <li className="flex items-start hover:translate-x-1 transition-transform duration-200">
            <span className="mr-3 text-amber-600 font-bold">•</span>
            <span>For legal advice about your situation, consult an Ohio attorney</span>
          </li>
          <li className="flex items-start hover:translate-x-1 transition-transform duration-200">
            <span className="mr-3 text-amber-600 font-bold">•</span>
            <span>Your information is confidential and secure 🔒</span>
          </li>
          <li className="flex items-start hover:translate-x-1 transition-transform duration-200">
            <span className="mr-3 text-amber-600 font-bold">•</span>
            <span>You can save progress and come back anytime 💾</span>
          </li>
          <li className="flex items-start hover:translate-x-1 transition-transform duration-200">
            <span className="mr-3 text-amber-600 font-bold">•</span>
            <span>It takes about 30-45 minutes to complete ⏱️</span>
          </li>
        </ul>
      </div>

      <div className="text-center p-6 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border-2 border-gray-300 shadow-sm hover:shadow-md transition-all duration-300">
        <p className="text-base text-gray-700 mb-3 font-semibold">
          <strong>Ready to get started?</strong> 🚀 Click "Next" to begin with basic court information.
        </p>
        <p className="text-sm text-gray-500">
          The form will guide you through 15 sections, explaining each step along the way.
        </p>
      </div>
    </div>,

    // 1 Court
    <div key="court">
      <SH title="Court Information" />
      <InfoBox>
        <strong>📋 What this is for:</strong> Ohio dissolution forms must be filed in a specific county court. We'll use this information to prepare your documents for the right court.
        <br /><br />
        <strong>Tip:</strong> File in the county where either you or your spouse currently live. If you don't know the judge or magistrate yet, leave those blank — they'll be assigned when you file.
      </InfoBox>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
        <Field label="County Where You'll File" name="court_county" required placeholder="e.g. Franklin" help="The Ohio county where you or your spouse live" />
        <Field label="Court Division" name="court_division" placeholder="Domestic Relations" help="Usually 'Domestic Relations' - check your county's website" />
        <Field label="Case Number (if you already have one)" name="court_case_no" help="Leave blank if this is a new filing" />
        <Field label="Judge Name (if assigned)" name="court_judge" help="Leave blank if not yet assigned" />
        <Field label="Magistrate Name (if assigned)" name="court_magistrate" help="Leave blank if not yet assigned" />
      </div>
    </div>,

    // 1 P1
    <div key="p1">{PersonSection('p1', 'Petitioner 1 (You)')}</div>,

    // 2 P2
    <div key="p2">{PersonSection('p2', 'Petitioner 2 (Spouse)')}</div>,

    // 3 Marriage
    <div key="marriage">
      <SH title="Marriage Information" />
      <InfoBox>
        <strong>Why we need this:</strong> Ohio courts require proof of marriage dates and residency to approve a dissolution. You must have lived in Ohio for at least 6 months before filing.
      </InfoBox>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
        <Field label="Date of Marriage" name="marriage_date" type="date" required help="As shown on your marriage certificate" />
        <Field label="Where You Got Married" name="marriage_place" required placeholder="e.g., Columbus, Franklin County, Ohio" help="City, County, and State" />
        <Field label="Date of Separation (if applicable)" name="separation_date" type="date" help="When did you start living separately? (Optional)" />
        <Sel label="Is Either Party Pregnant?" name="pregnant" options={['No','Yes']} help="Important for child-related orders" />
        <Sel label="Who Has Lived in Ohio 6+ Months?" name="ohio_resident" options={['Petitioner 1','Petitioner 2','Both']} required help="Required for Ohio court jurisdiction" />
        <Sel label="When Should Marriage End?" name="termination_pref" options={['Date of Final Hearing','Specific Date']} help="Most choose 'Date of Final Hearing'" />
        <Field label="Specific Date (if you chose above)" name="termination_specific" type="date" help="Only fill if you selected 'Specific Date' above" />
      </div>
    </div>,

    // 4 Real Estate
    <div key="realestate">
      <SH title="Real Estate Property" />
      <InfoBox>
        <strong>About property division:</strong> List all real estate owned by either party (homes, land, rental properties, etc.). The court needs to know what exists and how you plan to divide it.
      </InfoBox>
      <Sel label="Do either of you own any real estate?" name="has_realestate" options={['No','Yes']} help="Including houses, condos, land, or rental properties" />
      {get('has_realestate') === 'Yes' && <>
        {[1,2].map((n) => (
          <div key={n} className="border border-gray-200 rounded-md p-4 mb-4 bg-gray-50">
            <h3 className="font-medium text-gray-700 mb-3">Property #{n}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              <Field label="Property Address" name={`re${n}_address`} placeholder="123 Main St, Columbus, OH" help="Full address of the property" />
              <Field label="Current Market Value" name={`re${n}_fmv`} placeholder="$250,000" help="What could you sell it for today?" />
              <Field label="Mortgage Balance Owed" name={`re${n}_mortgage`} placeholder="$180,000" help="Total remaining on all mortgages" />
              <Field label="Equity (Value - Mortgage)" name={`re${n}_equity`} placeholder="$70,000" help="Market value minus what's owed" />
              <Field label="Whose Name is on the Title?" name={`re${n}_titled`} placeholder="Both, Petitioner 1, or Petitioner 2" help="Who legally owns it?" />
              <Field label="Who Will Keep This Property?" name={`re${n}_gets`} placeholder="Petitioner 1 or Petitioner 2" help="Or will you sell it?" />
            </div>
          </div>
        ))}
        <TA label="Other Arrangements" name="re_other" help="Will someone refinance? Planning to sell? Put details here." />
      </>}
    </div>,

    // 5 Vehicles
    <div key="vehicles">
      <SH title="Vehicles" />
      <InfoBox>
        <strong>What to include:</strong> Cars, trucks, motorcycles, boats, RVs, trailers — anything with a title. The court needs to know who keeps each titled vehicle.
      </InfoBox>
      <Sel label="Do either of you own any titled vehicles?" name="has_vehicles" options={['No','Yes']} help="Cars, trucks, motorcycles, boats, etc." />
      {get('has_vehicles') === 'Yes' && <>
        {[1,2,3].map((n) => (
          <div key={n} className="border border-gray-200 rounded-md p-4 mb-4 bg-gray-50">
            <h3 className="font-medium text-gray-700 mb-3">Vehicle #{n}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4">
              <Field label="Year" name={`veh${n}_year`} placeholder="2020" help="Model year" />
              <Field label="Make" name={`veh${n}_make`} placeholder="Honda" help="Brand/manufacturer" />
              <Field label="Model" name={`veh${n}_model`} placeholder="Accord" help="Model name" />
              <Field label="VIN or Serial #" name={`veh${n}_vin`} placeholder="Last 6 digits OK" help="Vehicle identification number" />
              <Field label="Whose Name is on Title?" name={`veh${n}_titled`} placeholder="Both, P1, or P2" help="Who legally owns it?" />
              <Field label="Who Will Keep It?" name={`veh${n}_gets`} placeholder="Petitioner 1 or 2" help="Who gets this vehicle?" />
              <Field label="Current Value" name={`veh${n}_value`} placeholder="$15,000" help="What's it worth? (Check Kelley Blue Book)" />
            </div>
          </div>
        ))}
        <TA label="Other Arrangements" name="veh_other" help="Any special agreements about vehicles? (trade, payoff loan, etc.)" />
      </>}
    </div>,

    // 6 Household
    <div key="household">
      <SH title="Household Goods & Personal Property" />
      <InfoBox>
        <strong>What this includes:</strong> Furniture, appliances, electronics, tools, jewelry, collections, etc. You don't need to list every fork and spoon — focus on valuable items or items you care about.
      </InfoBox>
      <Sel label="Have you already divided your household items?" name="hh_divided" options={['Yes','No']} help="Have you already split up your belongings?" />
      <TA label="Items Petitioner 1 Will Keep" name="hh_p1_gets" rows={4} help="List major items: 'Living room furniture, TV, laptop, wedding china, etc.'" />
      <TA label="Items Petitioner 2 Will Keep" name="hh_p2_gets" rows={4} help="List major items that spouse will keep" />
      <Field label="How Will Items Be Exchanged?" name="hh_delivery" placeholder="e.g., Will pick up by March 1st" help="When and how will items be delivered or picked up?" />
      <TA label="Other Arrangements or Notes" name="hh_other" help="Anything else about dividing household property?" />
    </div>,

    // 7 Financial Accounts
    <div key="financial">
      <SH title="Bank Accounts & Financial Accounts" />
      <InfoBox>
        <strong>List all accounts:</strong> Checking, savings, money market, CDs, brokerage accounts, etc. Even if the account is in only one name, if it was opened during the marriage, it may be considered marital property.
      </InfoBox>
      <Sel label="Do either of you have bank or financial accounts?" name="has_accounts" options={['No','Yes']} help="Checking, savings, investment accounts, etc." />
      {get('has_accounts') === 'Yes' && <>
        <SubH title="Accounts Petitioner 1 Will Keep" />
        {[1,2,3].map((n) => (
          <div key={n} className="grid grid-cols-1 md:grid-cols-3 gap-x-4">
            <Sel label={`P1 Account #${n} Type`} name={`acct_p1_${n}_type`} options={['Checking','Savings','Investment','Other']} help="What type of account?" />
            <Field label="Bank/Institution Name" name={`acct_p1_${n}_inst`} placeholder="e.g., Chase Bank" help="Where is the account?" />
            <Field label="Whose Name(s) on Account" name={`acct_p1_${n}_names`} placeholder="Both, P1 only, etc." help="Joint or individual?" />
          </div>
        ))}
        <SubH title="Accounts Petitioner 2 Will Keep" />
        {[1,2,3].map((n) => (
          <div key={n} className="grid grid-cols-1 md:grid-cols-3 gap-x-4">
            <Sel label={`P2 Account #${n} Type`} name={`acct_p2_${n}_type`} options={['Checking','Savings','Investment','Other']} help="What type of account?" />
            <Field label="Bank/Institution Name" name={`acct_p2_${n}_inst`} placeholder="e.g., Huntington Bank" help="Where is the account?" />
            <Field label="Whose Name(s) on Account" name={`acct_p2_${n}_names`} placeholder="Both, P2 only, etc." help="Joint or individual?" />
          </div>
        ))}
        <TA label="Other Arrangements or Details" name="acct_other" help="Will accounts be closed and divided? Any special agreements?" />
      </>}
    </div>,

    // 8 Retirement
    <div key="retirement">
      <SH title="Retirement Accounts & Pensions" />
      <InfoBox>
        <strong>What to include:</strong> 401(k), 403(b), IRA, pension plans, TSP, etc. Even if earned by one spouse, retirement accounts are often considered marital property and may need to be divided.
        <br /><br />
        <strong>Note:</strong> A QDRO (Qualified Domestic Relations Order) is a special court order needed to divide some retirement accounts.
      </InfoBox>
      <Sel label="Do either of you have retirement accounts or pensions?" name="has_retirement" options={['No','Yes']} help="401k, IRA, pension, etc." />
      {get('has_retirement') === 'Yes' && <>
        <SubH title="Plans Petitioner 1 Will Keep" />
        {[1,2].map((n) => (
          <div key={n} className="grid grid-cols-1 md:grid-cols-3 gap-x-4">
            <Field label="Institution/Employer" name={`ret_p1_${n}_inst`} placeholder="e.g., Fidelity, Vanguard" help="Where is the account held?" />
            <Field label="Whose Name(s) on Plan" name={`ret_p1_${n}_names`} placeholder="P1 only, or Both" help="Who owns this account?" />
            <Field label="Amount or Share" name={`ret_p1_${n}_amount`} placeholder="$50,000 or 50%" help="Value or percentage being kept" />
          </div>
        ))}
        <SubH title="Plans Petitioner 2 Will Keep" />
        {[1,2].map((n) => (
          <div key={n} className="grid grid-cols-1 md:grid-cols-3 gap-x-4">
            <Field label="Institution/Employer" name={`ret_p2_${n}_inst`} placeholder="e.g., Fidelity, Vanguard" help="Where is the account held?" />
            <Field label="Whose Name(s) on Plan" name={`ret_p2_${n}_names`} placeholder="P2 only, or Both" help="Who owns this account?" />
            <Field label="Amount or Share" name={`ret_p2_${n}_amount`} placeholder="$50,000 or 50%" help="Value or percentage being kept" />
          </div>
        ))}
        <Field label="Who Will Prepare the QDRO/DOPO?" name="ret_qdro" placeholder="Attorney name or 'To be determined'" help="Who will prepare the retirement division order?" />
        <Field label="Who Pays the QDRO Filing Fees?" name="ret_filing_expenses" placeholder="P1, P2, or Split" help="Who covers the cost?" />
        <TA label="Other Arrangements or Details" name="ret_other" help="Any special agreements about retirement accounts?" />
      </>}
    </div>,

    // 9 Debts
    <div key="debts">
      <SH title="Debts & Liabilities" />
      <InfoBox>
        <strong>List all debts:</strong> Credit cards, personal loans, student loans, medical bills, etc. The court needs to know who will pay each debt. Even if a debt is in one name, if incurred during the marriage, it may be a shared responsibility.
      </InfoBox>
      <Sel label="Do either of you owe any debts?" name="has_debts" options={['No','Yes']} help="Credit cards, loans, medical bills, etc." />
      {get('has_debts') === 'Yes' && <>
        <SubH title="Debts Petitioner 1 Will Pay" />
        {[1,2,3].map((n) => (
          <div key={n} className="grid grid-cols-1 md:grid-cols-3 gap-x-4">
            <Field label="Creditor Name" name={`debt_p1_${n}_creditor`} placeholder="e.g., Chase Bank, StudentLoan.gov" help="Who is owed?" />
            <Field label="Balance Owed" name={`debt_p1_${n}_balance`} placeholder="$5,000" help="How much is owed?" />
            <Field label="Account # (last 4 digits)" name={`debt_p1_${n}_acct4`} placeholder="1234" help="For identification" />
          </div>
        ))}
        <SubH title="Debts Petitioner 2 Will Pay" />
        {[1,2,3].map((n) => (
          <div key={n} className="grid grid-cols-1 md:grid-cols-3 gap-x-4">
            <Field label="Creditor Name" name={`debt_p2_${n}_creditor`} placeholder="e.g., Capital One, Medical Center" help="Who is owed?" />
            <Field label="Balance Owed" name={`debt_p2_${n}_balance`} placeholder="$3,000" help="How much is owed?" />
            <Field label="Account # (last 4 digits)" name={`debt_p2_${n}_acct4`} placeholder="5678" help="For identification" />
          </div>
        ))}
        <TA label="Other Arrangements or Details" name="debts_other" help="Any special payment plans or agreements about debts?" />
      </>}
    </div>,

    // 10 Spousal Support
    <div key="spousal">
      <SH title="Spousal Support (Alimony)" />
      <InfoBox>
        <strong>What is spousal support?</strong> Sometimes called "alimony," this is money one spouse pays to the other for support after divorce. It's not required in every case — it depends on income differences, length of marriage, and other factors.
        <br /><br />
        <strong>Note:</strong> If you're not sure about these details, that's OK — write "To be determined" or leave blank and discuss with the court or mediator.
      </InfoBox>
      <Sel label="Will there be any spousal support?" name="has_spousal" options={['No','Yes']} help="One spouse paying support to the other" />
      {get('has_spousal') === 'Yes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <Sel label="Who Pays Whom?" name="spousal_direction" options={['Petitioner 1 pays Petitioner 2','Petitioner 2 pays Petitioner 1']} help="Direction of payment" />
          <Field label="Amount Per Month" name="spousal_amount" placeholder="$500" help="Monthly payment amount" />
          <Field label="Payments Start On" name="spousal_start" type="date" help="When do payments begin?" />
          <Field label="How Long?" name="spousal_duration" placeholder="24 months or Until remarriage" help="Duration or condition" />
          <Sel label="How Will Payments Be Made?" name="spousal_method" options={['Direct to recipient','Through Ohio CSPC']} help="CSPC = Ohio Child Support Payment Central" />
          <Field label="CSEA County (if using CSPC)" name="spousal_csea" placeholder="Franklin" help="Which county handles payments?" />
          <Sel label="Collection Method" name="spousal_collection" options={['Income withholding','Other']} help="Income withholding = automatic deduction from paycheck" />
          <Sel label="Ends if Recipient Dies?" name="spousal_term_death" options={['Yes','No']} help="Typical answer is Yes" />
          <Sel label="Ends if Recipient Lives with New Partner?" name="spousal_term_cohab" options={['Yes','No']} help="Cohabitation termination" />
          <Sel label="Ends if Recipient Remarries?" name="spousal_term_remarry" options={['Yes','No']} help="Typical answer is Yes" />
          <Sel label="Can Court Change Amount Later?" name="spousal_jx_amount" options={['Yes','No']} help="Court retains jurisdiction over amount" />
          <Sel label="Can Court Change Duration Later?" name="spousal_jx_duration" options={['Yes','No']} help="Court retains jurisdiction over duration" />
          <div className="col-span-2"><Field label="Other Conditions for Ending Support" name="spousal_term_other" placeholder="e.g., If payor loses job" help="Any other termination conditions?" /></div>
        </div>
      )}
    </div>,

    // 11 Monthly Expenses
    <div key="expenses">
      <SH title="Monthly Living Expenses" />
      <InfoBox>
        <strong>Why we need this:</strong> Ohio courts require a Financial Affidavit showing monthly expenses. This helps determine support obligations and ensures fair financial arrangements.
        <br /><br />
        <strong>Tip:</strong> Estimate your typical monthly costs. It's OK to round to the nearest dollar. Use bank statements or bills to help remember expenses.
      </InfoBox>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
        <Sel label="Whose Monthly Expenses?" name="exp_whose" options={['Petitioner 1','Petitioner 2']} help="Which person's expenses are these?" />
        <Field label="Number of Dependent Children in Home" name="exp_children" placeholder="0" help="How many kids live with you?" />
        <Field label="Number of Adults in Home" name="exp_adults" placeholder="1" help="Including yourself" />
      </div>
      <SubH title="Housing Costs (Monthly)" />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4">
        {[['Rent / Mortgage Payment','exp_mortgage'],['2nd Mortgage / Home Equity','exp_mortgage2'],
          ['Property Taxes','exp_retax'],['Homeowner/Renter Insurance','exp_homeins'],
          ['HOA or Condo Fees','exp_hoa'],['Electric','exp_electric'],
          ['Gas / Heating Oil','exp_gas'],['Water & Sewer','exp_water'],
          ['Phone / Cell Phone','exp_phone'],['Trash Removal','exp_trash'],
          ['Cable / Streaming TV','exp_tv'],['Internet','exp_internet']
        ].map(([l,n]) => <Field key={n} label={l} name={n} placeholder="$100" help="Monthly cost" />)}
      </div>
      <SubH title="Food & Transportation (Monthly)" />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4">
        {[['Groceries','exp_groceries'],['Restaurants / Dining Out','exp_restaurants'],
          ['Car Loan or Lease','exp_carloan'],['Car Maintenance / Repairs','exp_carmaint'],
          ['Gas for Vehicle','exp_cargas'],['Parking / Tolls','exp_parking']
        ].map(([l,n]) => <Field key={n} label={l} name={n} placeholder="$100" help="Monthly cost" />)}
      </div>
      <SubH title="Insurance & Healthcare (Monthly)" />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4">
        {[['Life Insurance Premiums','exp_life_ins'],['Auto Insurance','exp_auto_ins'],
          ['Health Insurance Premiums','exp_health_ins'],['Doctor Visits / Co-pays','exp_doctors'],
          ['Dentist / Orthodontist','exp_dental'],['Prescriptions / Medications','exp_rx']
        ].map(([l,n]) => <Field key={n} label={l} name={n} placeholder="$100" help="Monthly cost" />)}
      </div>
      <SubH title="Other Monthly Expenses" />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4">
        {[['Spousal Support Paid Out','exp_spousal_paid'],['Charitable Giving','exp_charity'],
          ['Pet Care','exp_pets'],['Attorney Fees','exp_attorney'],
          ['Travel / Vacations (avg per mo)','exp_travel'],['Other Expenses','exp_other_amt']
        ].map(([l,n]) => <Field key={n} label={l} name={n} placeholder="$100" help="Monthly cost" />)}
      </div>
      <TA label="Describe 'Other' Expenses" name="exp_other_desc" placeholder="e.g., Child care, student loans, gym membership" help="What are the 'other' expenses above?" />
    </div>,

    // 12 Name Change
    <div key="namechange">
      <SH title="Restoring a Former Name" />
      <InfoBox>
        <strong>Name restoration:</strong> If either party wants to return to a name used before the marriage (often a maiden name), the dissolution decree can include this change.
      </InfoBox>
      <Sel label="Does either party want to restore a former name?" name="has_name_change" options={['No','Yes']} help="Return to maiden name or previous name?" />
      {get('has_name_change') === 'Yes' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6">
          <Sel label="Who Wants Name Restored?" name="name_change_who" options={['Petitioner 1','Petitioner 2']} help="Which party?" />
          <Field label="Current Legal Name" name="name_change_current" placeholder="Current married name" help="Name they use now" />
          <Field label="Name to Restore" name="name_change_restore" placeholder="Former or maiden name" help="Name they want to go back to" />
        </div>
      )}
    </div>,

    // 13 Additional
    <div key="additional">
      <SH title="Additional Agreements & Questions" />
      <InfoBox>
        <strong>Almost done!</strong> Use this space to tell us about anything else you've agreed on that wasn't covered, or to ask questions about things you're unsure about.
      </InfoBox>
      <TA label="Other Agreements or Arrangements" name="additional_matters" rows={5} placeholder="e.g., Pet custody arrangements, storage unit items, timeshare agreements, etc." help="Anything else you and your spouse have agreed to?" />
      <TA label="Questions or Concerns" name="notes_questions" rows={4} placeholder="e.g., Not sure how to value the house, Need help with QDRO, etc." help="What are you unsure about or need help with?" />
      <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-md text-sm text-amber-800">
        <strong>⚠️ Important Reminders:</strong>
        <ul className="mt-2 ml-4 list-disc space-y-1">
          <li><strong>This is document preparation assistance only</strong> — not legal advice.</li>
          <li>Your responses will be used to pre-fill Ohio dissolution forms that match court requirements.</li>
          <li>Review all information carefully before signing any documents.</li>
          <li>If you need legal advice about your specific situation, consult with a licensed Ohio attorney.</li>
          <li>This service helps you complete the paperwork correctly so you can proceed without overpaying for basic form preparation.</li>
        </ul>
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
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="bg-gradient-to-r from-blue-800 to-blue-900 text-white py-8 px-4 text-center shadow-lg">
        <h1 className="text-3xl font-bold tracking-tight">Ohio Dissolution of Marriage</h1>
        <p className="text-blue-200 text-base mt-2">Confidential Intake Form — {SECTION_TITLES[step]}</p>
      </div>

      <div className="bg-white border-b border-gray-200 px-4 py-4 shadow-sm">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">Step {step + 1} of {steps.length}</span>
            <span className="text-sm font-medium text-gray-600">{Math.round(((step + 1) / steps.length) * 100)}% complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out shadow-sm"
              style={{ width: `${((step + 1) / steps.length) * 100}%` }}
            />
          </div>
          <div className="hidden md:flex justify-between mt-3">
            {SECTION_TITLES.map((title, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                title={title}
                className={`w-4 h-4 rounded-full transition-all duration-300 transform hover:scale-125 ${
                  i < step ? 'bg-blue-600 shadow-md' : i === step ? 'bg-blue-800 ring-2 ring-blue-400 shadow-lg scale-110' : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 md:p-10">
          {steps[step]}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border-2 border-red-300 rounded-lg text-red-700 text-sm font-medium shadow-sm animate-fadeIn">
              ⚠️ {error}
            </div>
          )}
          <div className="flex justify-between mt-8 pt-6 border-t-2 border-gray-100">
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 text-sm font-semibold disabled:opacity-40 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
            >
              ← Back
            </button>
            {isLast ? (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-8 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-bold hover:from-blue-700 hover:to-blue-800 disabled:opacity-60 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:transform-none"
              >
                {submitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </span>
                ) : '✓ Submit Form'}
              </button>
            ) : (
              <button
                onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-bold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                Next →
              </button>
            )}
          </div>
        </div>
        <p className="text-center text-sm text-gray-500 mt-6 font-medium">
          🔒 All information is transmitted securely and kept strictly confidential.
        </p>
      </div>
    </main>
  );
}
