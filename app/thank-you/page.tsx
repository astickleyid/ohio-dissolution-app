export default function ThankYou() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-2xl w-full text-center animate-fadeIn">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-10 md:p-12">
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-bounce-slow">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-blue-900 mb-4">Form Successfully Submitted! 🎉</h1>
          <p className="text-gray-600 mb-8 leading-relaxed text-lg">
            Thank you for completing the intake form. Your information has been submitted securely and
            will be reviewed to assist in preparing your dissolution documents.
          </p>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl p-6 text-sm text-blue-900 text-left mb-8 shadow-sm">
            <strong className="text-lg flex items-center mb-4">
              <span className="text-2xl mr-2">📋</span>
              What Happens Next:
            </strong>
            <ul className="space-y-3">
              <li className="flex items-start hover:translate-x-1 transition-transform duration-200">
                <span className="mr-3 text-blue-600 font-bold">1.</span>
                <span>Your responses will be used to pre-fill your Ohio dissolution forms</span>
              </li>
              <li className="flex items-start hover:translate-x-1 transition-transform duration-200">
                <span className="mr-3 text-blue-600 font-bold">2.</span>
                <span>Your information has been saved and an email notification has been sent</span>
              </li>
              <li className="flex items-start hover:translate-x-1 transition-transform duration-200">
                <span className="mr-3 text-blue-600 font-bold">3.</span>
                <span>You will be contacted with next steps</span>
              </li>
              <li className="flex items-start hover:translate-x-1 transition-transform duration-200">
                <span className="mr-3 text-blue-600 font-bold">4.</span>
                <span>Do not sign any documents until instructed</span>
              </li>
              <li className="flex items-start hover:translate-x-1 transition-transform duration-200">
                <span className="mr-3 text-blue-600 font-bold">5.</span>
                <span>This process is not complete until both parties appear at the hearing</span>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-xl p-5 text-sm text-amber-900 mb-8">
            <div className="flex items-center justify-center mb-2">
              <span className="text-2xl mr-2">⚠️</span>
              <strong className="text-base">Important Reminder</strong>
            </div>
            <p className="text-center">
              All submitted information is kept strictly confidential.
              This service provides document preparation assistance only — not legal advice.
            </p>
          </div>

          <button
            onClick={() => window.location.href = '/'}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Return to Home
          </button>
        </div>

        <p className="text-sm text-gray-500 mt-6">
          Questions? Contact us for assistance with your dissolution documents.
        </p>
      </div>
    </main>
  );
}
