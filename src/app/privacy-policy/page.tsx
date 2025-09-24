import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - Zaminseva Prime | Data Protection & Privacy Rights",
  description: "Learn how Zaminseva Prime protects your privacy and handles your personal information. Your data security and privacy rights explained clearly.",
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://zaminseva.com'}/privacy-policy`,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPolicyPage() {
  const lastUpdated = "December 2024";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Enhanced Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 py-16">
        <div className="absolute inset-0 bg-black/20"></div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 right-0 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Privacy Badge */}
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8">
            <svg className="w-5 h-5 mr-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-sm font-medium text-white">Your Privacy is Our Priority</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
            Privacy Policy
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed mb-8">
            How we protect and handle your personal information with complete transparency
          </p>

          {/* Last Updated Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
            <svg className="w-4 h-4 mr-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-white text-sm">Last updated: {lastUpdated}</span>
          </div>
        </div>

        {/* Decorative Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-20 text-slate-50" viewBox="0 0 1200 120" fill="currentColor">
            <path d="M0,0V7.23C0,65.52,268.63,112.77,600,112.77S1200,65.52,1200,7.23V0Z"></path>
          </svg>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Table of Contents */}
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Quick Navigation</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { id: "introduction", title: "1. Introduction", icon: "👋" },
              { id: "information-collect", title: "2. Information We Collect", icon: "📝" },
              { id: "information-use", title: "3. How We Use Your Info", icon: "🔄" },
              { id: "information-sharing", title: "4. Information Sharing", icon: "🤝" },
              { id: "data-security", title: "5. Data Security", icon: "🔒" },
              { id: "cookies", title: "6. Cookies & Tracking", icon: "🍪" },
              { id: "your-rights", title: "7. Your Rights", icon: "⚖️" },
              { id: "data-retention", title: "8. Data Retention", icon: "📅" },
              { id: "contact", title: "13. Contact Us", icon: "📞" }
            ].map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="flex items-center p-3 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors group"
              >
                <span className="text-xl mr-3">{item.icon}</span>
                <span className="font-medium text-sm">{item.title}</span>
              </a>
            ))}
          </div>
        </div>

        <div className="space-y-8">

          {/* Introduction */}
          <section id="introduction" className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-4">1</span>
              Introduction
            </h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                This Privacy Policy describes how Zaminseva Prime Pvt. Ltd. collects, uses, discloses, and safeguards your information when you use our real estate platform website and services. We are committed to protecting your privacy and ensuring the security of your personal information.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                By using our website and services, you agree to the collection and use of information in accordance with this Privacy Policy.
              </p>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-xl">
                <p className="text-blue-800 font-medium">
                  <strong>Your Trust Matters:</strong> We only collect information necessary to provide you with excellent real estate services and never share your data without your consent.
                </p>
              </div>
            </div>
          </section>

          {/* Information We Collect */}
          <section id="information-collect" className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-4">2</span>
              Information We Collect
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="bg-blue-500 w-6 h-6 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-xs">📝</span>
                  </span>
                  Personal Information
                </h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="bg-blue-200 w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Name and contact information (email, phone, address)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-blue-200 w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Property preferences and search criteria</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-blue-200 w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Financial information for property transactions</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-blue-200 w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Communication records and correspondence</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="bg-green-500 w-6 h-6 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-xs">🔍</span>
                  </span>
                  Automatic Information
                </h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="bg-green-200 w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Device information (IP address, browser type)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-green-200 w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Usage data (pages visited, time spent)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-green-200 w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Location data (with your permission)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-green-200 w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Cookies and tracking technologies</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Your Information */}
          <section id="information-use" className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-4">3</span>
              How We Use Your Information
            </h2>
            <p className="text-gray-700 mb-6">We use your information for the following purposes:</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="bg-purple-500 w-6 h-6 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-xs">🏠</span>
                  </span>
                  Core Services
                </h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="bg-purple-200 w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Provide and maintain our real estate services</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-purple-200 w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Process property inquiries and transactions</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-purple-200 w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Personalize your experience and property recommendations</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-purple-200 w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Communicate with you about properties, services, and updates</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-2xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="bg-orange-500 w-6 h-6 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-xs">🔧</span>
                  </span>
                  Operations & Security
                </h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="bg-orange-200 w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Improve our website and services</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-orange-200 w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Comply with legal obligations and regulations</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-orange-200 w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Prevent fraud and ensure platform security</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-orange-200 w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Send marketing communications (with your consent)</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Information Sharing */}
          <section id="information-sharing" className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-4">4</span>
              Information Sharing and Disclosure
            </h2>
            <p className="text-gray-700 mb-6">We may share your information in the following circumstances:</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-6 rounded-2xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="bg-teal-500 w-6 h-6 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-xs">✋</span>
                  </span>
                  With Your Consent
                </h3>
                <p className="text-gray-700">We may share your information with third parties when you give us explicit consent.</p>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-2xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="bg-emerald-500 w-6 h-6 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-xs">🤝</span>
                  </span>
                  Service Providers
                </h3>
                <p className="text-gray-700 mb-3">We may share information with trusted third-party service providers who assist us in:</p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <span className="bg-emerald-200 w-1.5 h-1.5 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    <span>Property valuation and market analysis</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-emerald-200 w-1.5 h-1.5 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    <span>Payment processing</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-emerald-200 w-1.5 h-1.5 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    <span>Background checks and verification services</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-6 rounded-2xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="bg-amber-500 w-6 h-6 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-xs">⚖️</span>
                  </span>
                  Legal Requirements
                </h3>
                <p className="text-gray-700">We may disclose your information when required by law, court order, or government regulation.</p>
              </div>

              <div className="bg-gradient-to-br from-rose-50 to-pink-50 p-6 rounded-2xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="bg-rose-500 w-6 h-6 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-xs">🏢</span>
                  </span>
                  Business Transfers
                </h3>
                <p className="text-gray-700">In the event of a merger, acquisition, or sale of assets, your information may be transferred to the new entity.</p>
              </div>
            </div>
          </section>

          {/* Data Security */}
          <section id="data-security" className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-4">5</span>
              Data Security
            </h2>
            <p className="text-gray-700 mb-6">
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
            </p>

            <div className="bg-gradient-to-br from-red-50 to-orange-50 p-6 rounded-2xl mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="bg-red-500 w-6 h-6 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-xs">🛡️</span>
                </span>
                Security Measures
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start">
                  <span className="bg-red-200 w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-gray-700">Encryption of data in transit and at rest</span>
                </div>
                <div className="flex items-start">
                  <span className="bg-red-200 w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-gray-700">Secure server infrastructure</span>
                </div>
                <div className="flex items-start">
                  <span className="bg-red-200 w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-gray-700">Access controls and authentication measures</span>
                </div>
                <div className="flex items-start">
                  <span className="bg-red-200 w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-gray-700">Regular security audits and updates</span>
                </div>
                <div className="flex items-start">
                  <span className="bg-red-200 w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-gray-700">Employee training on data protection</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 border-l-4 border-gray-400 p-4 rounded-r-xl">
              <p className="text-gray-700 font-medium">
                <strong>Important Note:</strong> However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
              </p>
            </div>
          </section>

          {/* Cookies and Tracking */}
          <section id="cookies" className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-4">6</span>
              Cookies and Tracking Technologies
            </h2>
            <p className="text-gray-700 mb-6">
              We use cookies, web beacons, and similar tracking technologies to enhance your experience on our website:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gradient-to-br from-yellow-50 to-amber-50 p-6 rounded-2xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="bg-yellow-500 w-6 h-6 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-xs">⚙️</span>
                  </span>
                  Essential Cookies
                </h3>
                <p className="text-gray-700">Necessary for basic website functionality</p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="bg-blue-500 w-6 h-6 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-xs">📊</span>
                  </span>
                  Performance Cookies
                </h3>
                <p className="text-gray-700">Help us understand how visitors use our website</p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-teal-50 p-6 rounded-2xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="bg-green-500 w-6 h-6 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-xs">📝</span>
                  </span>
                  Functional Cookies
                </h3>
                <p className="text-gray-700">Remember your preferences and settings</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="bg-purple-500 w-6 h-6 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-xs">🎯</span>
                  </span>
                  Marketing Cookies
                </h3>
                <p className="text-gray-700">Used to deliver relevant advertisements</p>
              </div>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-xl">
              <p className="text-blue-800 font-medium">
                <strong>Cookie Control:</strong> You can control cookie settings through your browser preferences. Note that disabling certain cookies may limit website functionality.
              </p>
            </div>
          </section>

          {/* Your Rights */}
          <section id="your-rights" className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-4">7</span>
              Your Rights and Choices
            </h2>
            <p className="text-gray-700 mb-6">You have the following rights regarding your personal information:</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-2xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="bg-indigo-500 w-6 h-6 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-xs">👁️</span>
                  </span>
                  Access
                </h3>
                <p className="text-gray-700">Request access to your personal data</p>
              </div>

              <div className="bg-gradient-to-br from-teal-50 to-green-50 p-6 rounded-2xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="bg-teal-500 w-6 h-6 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-xs">✏️</span>
                  </span>
                  Correction
                </h3>
                <p className="text-gray-700">Request correction of inaccurate data</p>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-pink-50 p-6 rounded-2xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="bg-red-500 w-6 h-6 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-xs">🗑️</span>
                  </span>
                  Deletion
                </h3>
                <p className="text-gray-700">Request deletion of your personal data</p>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-yellow-50 p-6 rounded-2xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="bg-orange-500 w-6 h-6 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-xs">📦</span>
                  </span>
                  Portability
                </h3>
                <p className="text-gray-700">Request transfer of your data</p>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-slate-50 p-6 rounded-2xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="bg-gray-500 w-6 h-6 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-xs">⏸️</span>
                  </span>
                  Restriction
                </h3>
                <p className="text-gray-700">Request restriction of processing</p>
              </div>

              <div className="bg-gradient-to-br from-rose-50 to-red-50 p-6 rounded-2xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="bg-rose-500 w-6 h-6 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-xs">⛔</span>
                  </span>
                  Objection
                </h3>
                <p className="text-gray-700">Object to certain types of processing</p>
              </div>
            </div>

            <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-xl mt-6">
              <p className="text-green-800 font-medium">
                <strong>How to Exercise Your Rights:</strong> To exercise these rights, please contact us using the information provided in the "Contact Us" section below.
              </p>
            </div>
          </section>

          {/* Data Retention */}
          <section id="data-retention" className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-4">8</span>
              Data Retention
            </h2>
            <p className="text-gray-700 mb-6">
              We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law.
            </p>

            <div className="bg-gradient-to-br from-slate-50 to-gray-50 p-6 rounded-2xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="bg-slate-500 w-6 h-6 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-xs">⚖️</span>
                </span>
                Factors Determining Retention Periods
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start">
                  <span className="bg-slate-200 w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-gray-700">The nature of the information collected</span>
                </div>
                <div className="flex items-start">
                  <span className="bg-slate-200 w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-gray-700">Legal and regulatory requirements</span>
                </div>
                <div className="flex items-start">
                  <span className="bg-slate-200 w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-gray-700">The purpose for which the information was collected</span>
                </div>
                <div className="flex items-start">
                  <span className="bg-slate-200 w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span className="text-gray-700">Your relationship with our services</span>
                </div>
              </div>
            </div>
          </section>

          {/* Additional Sections Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* International Data Transfers */}
            <section className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-4">9</span>
                International Data Transfers
              </h2>
              <div className="bg-gradient-to-br from-cyan-50 to-blue-50 p-6 rounded-2xl">
                <div className="flex items-start">
                  <span className="bg-cyan-500 w-6 h-6 rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                    <span className="text-white text-xs">🌍</span>
                  </span>
                  <p className="text-gray-700">
                    Your information may be transferred to and processed in countries other than your country of residence. We ensure that such transfers comply with applicable data protection laws and implement appropriate safeguards to protect your information.
                  </p>
                </div>
              </div>
            </section>

            {/* Children's Privacy */}
            <section className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-4">10</span>
                Children's Privacy
              </h2>
              <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-6 rounded-2xl">
                <div className="flex items-start">
                  <span className="bg-pink-500 w-6 h-6 rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                    <span className="text-white text-xs">👶</span>
                  </span>
                  <p className="text-gray-700">
                    Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children under 18. If we become aware that we have collected personal information from a child under 18, we will take steps to delete such information promptly.
                  </p>
                </div>
              </div>
            </section>

            {/* Third-Party Links */}
            <section className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-4">11</span>
                Third-Party Links
              </h2>
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-2xl">
                <div className="flex items-start">
                  <span className="bg-indigo-500 w-6 h-6 rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                    <span className="text-white text-xs">🔗</span>
                  </span>
                  <p className="text-gray-700">
                    Our website may contain links to third-party websites or services. We are not responsible for the privacy practices or content of these third-party sites. We encourage you to review the privacy policies of any third-party sites you visit.
                  </p>
                </div>
              </div>
            </section>

            {/* Changes to Privacy Policy */}
            <section className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-4">12</span>
                Changes to This Privacy Policy
              </h2>
              <div className="bg-gradient-to-br from-green-50 to-teal-50 p-6 rounded-2xl">
                <div className="flex items-start mb-4">
                  <span className="bg-green-500 w-6 h-6 rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                    <span className="text-white text-xs">📄</span>
                  </span>
                  <p className="text-gray-700">
                    We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors.
                  </p>
                </div>
                <h4 className="font-semibold text-gray-900 mb-3">We will notify you by:</h4>
                <div className="space-y-2">
                  <div className="flex items-start">
                    <span className="bg-green-200 w-1.5 h-1.5 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    <span className="text-gray-700 text-sm">Posting the updated policy on our website</span>
                  </div>
                  <div className="flex items-start">
                    <span className="bg-green-200 w-1.5 h-1.5 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    <span className="text-gray-700 text-sm">Sending an email notification (if you have provided your email address)</span>
                  </div>
                  <div className="flex items-start">
                    <span className="bg-green-200 w-1.5 h-1.5 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    <span className="text-gray-700 text-sm">Displaying a prominent notice on our website</span>
                  </div>
                </div>
                <p className="text-gray-700 mt-4 text-sm">
                  Your continued use of our services after the effective date of the updated Privacy Policy constitutes acceptance of the changes.
                </p>
              </div>
            </section>
          </div>

          {/* Contact Us */}
          <section id="contact" className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-4">13</span>
              Contact Us
            </h2>
            <p className="text-gray-700 mb-6">
              If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
            </p>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="bg-blue-500 w-6 h-6 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-xs">📞</span>
                </span>
                Privacy Officer
              </h3>
              <div className="space-y-3">
                <div className="flex items-center text-gray-700">
                  <span className="bg-blue-200 w-2 h-2 rounded-full mr-3"></span>
                  <strong>Email:</strong> privacy@company.com
                </div>
                <div className="flex items-center text-gray-700">
                  <span className="bg-blue-200 w-2 h-2 rounded-full mr-3"></span>
                  <strong>Phone:</strong> +91 98765 43210
                </div>
                <div className="flex items-start text-gray-700">
                  <span className="bg-blue-200 w-2 h-2 rounded-full mt-1.5 mr-3 flex-shrink-0"></span>
                  <span><strong>Address:</strong> Please refer to our contact page for current office address</span>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-xl">
              <p className="text-green-800 font-medium">
                <strong>Response Time:</strong> We will respond to your inquiries within 30 days of receipt.
              </p>
            </div>
          </section>

          {/* Governing Law */}
          <section className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-4">14</span>
              Governing Law
            </h2>
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-2xl">
              <div className="flex items-start">
                <span className="bg-amber-500 w-6 h-6 rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                  <span className="text-white text-xs">⚖️</span>
                </span>
                <p className="text-gray-700">
                  This Privacy Policy is governed by the laws of India. Any disputes arising from this Privacy Policy will be subject to the jurisdiction of the courts in the location of our registered office.
                </p>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}