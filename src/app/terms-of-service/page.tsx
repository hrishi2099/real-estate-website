"use client";

import { useState } from "react";

export default function TermsOfServicePage() {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const lastUpdated = "December 2024";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 py-16">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Terms of Service
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Please read these terms carefully before using Zaminseva Prime services
          </p>
          <div className="mt-6 inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
            <svg className="w-4 h-4 mr-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-white text-sm">Last updated: {lastUpdated}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Table of Contents */}
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Table of Contents</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { id: "acceptance", title: "1. Acceptance of Terms" },
              { id: "services", title: "2. Our Services" },
              { id: "user-responsibilities", title: "3. User Responsibilities" },
              { id: "property-listings", title: "4. Property Listings" },
              { id: "transactions", title: "5. Real Estate Transactions" },
              { id: "intellectual-property", title: "6. Intellectual Property" },
              { id: "privacy", title: "7. Privacy & Data Protection" },
              { id: "disclaimers", title: "8. Disclaimers" },
              { id: "liability", title: "9. Limitation of Liability" },
              { id: "termination", title: "10. Termination" },
              { id: "governing-law", title: "11. Governing Law" },
              { id: "contact", title: "12. Contact Information" }
            ].map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="flex items-center p-3 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors group"
              >
                <svg className="w-4 h-4 mr-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="font-medium">{item.title}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Terms Sections */}
        <div className="space-y-6">

          {/* 1. Acceptance of Terms */}
          <section id="acceptance" className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-4">1</span>
              Acceptance of Terms
            </h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                By accessing and using the Zaminseva Prime website (zaminseva.com) and our real estate services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service and our Privacy Policy.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you do not agree with any part of these terms, please do not use our website or services. These terms apply to all visitors, users, and others who access or use our services.
              </p>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-xl">
                <p className="text-blue-800 font-medium">
                  <strong>Important:</strong> These terms constitute a legally binding agreement between you and Zaminseva Prime Pvt. Ltd.
                </p>
              </div>
            </div>
          </section>

          {/* 2. Our Services */}
          <section id="services" className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-4">2</span>
              Our Services
            </h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                Zaminseva Prime provides comprehensive real estate services including:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
                <li>NA (Non-Agricultural) plot sales and development</li>
                <li>Farmhouse land investments</li>
                <li>Property consultation and advisory services</li>
                <li>Real estate market analysis and valuation</li>
                <li>Legal documentation assistance</li>
                <li>Property management services</li>
              </ul>
              <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-xl">
                <p className="text-green-800">
                  <strong>Service Availability:</strong> Our services are primarily focused on Maharashtra, India, with 25+ years of local market expertise.
                </p>
              </div>
            </div>
          </section>

          {/* 3. User Responsibilities */}
          <section id="user-responsibilities" className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-4">3</span>
              User Responsibilities
            </h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                When using our services, you agree to:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">✅ Do:</h4>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li>• Provide accurate and truthful information</li>
                    <li>• Respect intellectual property rights</li>
                    <li>• Use services for legitimate purposes only</li>
                    <li>• Comply with all applicable laws</li>
                    <li>• Keep your contact information updated</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">❌ Don't:</h4>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li>• Use services for illegal activities</li>
                    <li>• Impersonate others or provide false information</li>
                    <li>• Attempt to hack or disrupt our systems</li>
                    <li>• Use automated systems without permission</li>
                    <li>• Violate any intellectual property rights</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* 4. Property Listings */}
          <section id="property-listings" className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-4">4</span>
              Property Listings & Information
            </h2>
            <div className="prose prose-gray max-w-none">
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-xl mb-6">
                <p className="text-yellow-800 font-medium">
                  <strong>Important Notice:</strong> Property information is provided for general guidance only. All details should be independently verified.
                </p>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Information Accuracy</h4>
                  <p className="text-gray-700">
                    While we strive to maintain accurate property information, details may change. We recommend conducting due diligence including site visits, legal verification, and independent surveys before making investment decisions.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Price & Availability</h4>
                  <p className="text-gray-700">
                    Property prices and availability are subject to change without notice. All pricing should be confirmed directly with our sales team before proceeding with any transaction.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 5. Real Estate Transactions */}
          <section id="transactions" className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-4">5</span>
              Real Estate Transactions
            </h2>
            <div className="prose prose-gray max-w-none">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Transaction Process</h4>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li>• Initial consultation and requirement analysis</li>
                    <li>• Property selection and site visits</li>
                    <li>• Legal document verification</li>
                    <li>• Agreement drafting and execution</li>
                    <li>• Registration and handover process</li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Payment Terms</h4>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li>• Flexible EMI options available</li>
                    <li>• Clear payment schedules provided</li>
                    <li>• All payments through legal channels only</li>
                    <li>• Proper receipts and documentation</li>
                    <li>• Transparent pricing with no hidden costs</li>
                  </ul>
                </div>
              </div>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-xl mt-6">
                <p className="text-blue-800">
                  <strong>Legal Compliance:</strong> All transactions are conducted in full compliance with Indian real estate laws and regulations, including RERA guidelines.
                </p>
              </div>
            </div>
          </section>

          {/* 6. Intellectual Property */}
          <section id="intellectual-property" className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-4">6</span>
              Intellectual Property Rights
            </h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                All content on the Zaminseva Prime website, including but not limited to text, graphics, logos, images, videos, and software, is owned by Zaminseva Prime Pvt. Ltd. and protected by intellectual property laws.
              </p>
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-xl">
                <p className="text-red-800 font-medium">
                  <strong>Usage Restrictions:</strong> You may not copy, reproduce, distribute, or create derivative works without our explicit written permission.
                </p>
              </div>
            </div>
          </section>

          {/* 7. Privacy & Data Protection */}
          <section id="privacy" className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-4">7</span>
              Privacy & Data Protection
            </h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                We are committed to protecting your privacy and personal information. Our data collection and usage practices are outlined in our Privacy Policy.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Data We Collect</h4>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li>• Contact information (name, email, phone)</li>
                    <li>• Property preferences and requirements</li>
                    <li>• Communication history</li>
                    <li>• Website usage analytics</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">How We Use Data</h4>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li>• Providing personalized service</li>
                    <li>• Property recommendations</li>
                    <li>• Communication and follow-ups</li>
                    <li>• Service improvement and analytics</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* 8. Disclaimers */}
          <section id="disclaimers" className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-4">8</span>
              Disclaimers
            </h2>
            <div className="prose prose-gray max-w-none">
              <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-xl mb-6">
                <p className="text-orange-800 font-medium">
                  <strong>Investment Risk:</strong> Real estate investments carry inherent risks. Past performance does not guarantee future results.
                </p>
              </div>
              <div className="space-y-4">
                <p className="text-gray-700">
                  Our services are provided "as is" without any warranties. We make no guarantees regarding:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Property value appreciation or investment returns</li>
                  <li>Completion timelines for development projects</li>
                  <li>Third-party services or government approvals</li>
                  <li>Market conditions or external factors</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 9. Limitation of Liability */}
          <section id="liability" className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-4">9</span>
              Limitation of Liability
            </h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                To the maximum extent permitted by law, Zaminseva Prime shall not be liable for any indirect, incidental, special, or consequential damages arising from the use of our services.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Our total liability for any claims shall not exceed the amount paid by you for our services in the preceding 12 months.
              </p>
            </div>
          </section>

          {/* 10. Termination */}
          <section id="termination" className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-4">10</span>
              Termination
            </h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                We reserve the right to terminate or suspend access to our services at any time, without prior notice, for conduct that violates these terms or is harmful to other users or our business.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Upon termination, all provisions which by their nature should survive shall remain in effect, including ownership provisions, warranty disclaimers, and limitations of liability.
              </p>
            </div>
          </section>

          {/* 11. Governing Law */}
          <section id="governing-law" className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-4">11</span>
              Governing Law
            </h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed mb-4">
                These Terms of Service shall be governed by and construed in accordance with the laws of India. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts in Maharashtra, India.
              </p>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-xl">
                <p className="text-blue-800">
                  <strong>Dispute Resolution:</strong> We encourage resolving disputes through direct communication. If needed, disputes will be handled through binding arbitration in accordance with Indian arbitration laws.
                </p>
              </div>
            </div>
          </section>

          {/* 12. Contact Information */}
          <section id="contact" className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl p-8 border border-blue-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-4">12</span>
              Contact Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Questions About These Terms?</h4>
                <p className="text-gray-700 mb-4">
                  If you have any questions or concerns about these Terms of Service, please contact us:
                </p>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-gray-700">legal@zaminseva.com</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="text-gray-700">+91 98765 43210</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-gray-900">Zaminseva Prime Pvt. Ltd.</h4>
                  <p className="text-gray-600 text-sm">Maharashtra, India</p>
                </div>
              </div>
            </div>
          </section>

        </div>

        {/* Footer Notice */}
        <div className="mt-12 bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center">
          <p className="text-gray-600 text-sm">
            These Terms of Service are effective as of {lastUpdated} and may be updated from time to time.
            Continued use of our services constitutes acceptance of any changes.
          </p>
          <div className="mt-4 flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/contact" className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Contact Us
            </a>
            <a href="/" className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Back to Home
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}