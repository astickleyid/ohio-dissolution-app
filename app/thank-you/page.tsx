export default function ThankYou() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-10">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-blue-900 mb-3">Form Received</h1>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Thank you for completing the intake form. Your information has been submitted securely and
            will be reviewed to assist in preparing your dissolution documents.
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800 text-left mb-6">
            <strong>What happens next:</strong>
            <ul className="mt-2 space-y-1 list-disc list-inside">
              <li>Your responses will be used to pre-fill your Ohio dissolution forms</li>
              <li>You will be contacted with next steps</li>
              <li>Do not sign any documents until instructed</li>
              <li>This process is not complete until both parties appear at the hearing</li>
            </ul>
          </div>

          <p className="text-xs text-gray-400">
            All submitted information is kept strictly confidential.
            This service provides document preparation assistance only — not legal advice.
          </p>
        </div>
      </div>
    </main>
  );
}
