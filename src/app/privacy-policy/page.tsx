import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Our privacy policy explains how we collect, use, and protect your personal information when you use our real estate platform.",
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://zaminseva.com'}/privacy-policy`,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPolicyPage() {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gray-50 border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900">Privacy Policy</h1>
            <p className="mt-4 text-xl text-gray-600">
              How we protect and handle your personal information
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Last updated: {currentDate}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-lg max-w-none">
          
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-700 mb-4">
              This Privacy Policy describes how we collect, use, disclose, and safeguard your information when you use our real estate platform website and services. We are committed to protecting your privacy and ensuring the security of your personal information.
            </p>
            <p className="text-gray-700">
              By using our website and services, you agree to the collection and use of information in accordance with this Privacy Policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3">2.1 Personal Information</h3>
            <p className="text-gray-700 mb-4">We may collect the following types of personal information:</p>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li>Name and contact information (email address, phone number, mailing address)</li>
              <li>Account credentials (username, password)</li>
              <li>Property preferences and search criteria</li>
              <li>Financial information (income, credit information) when necessary for property transactions</li>
              <li>Communication records and correspondence</li>
              <li>Property inquiry and viewing history</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">2.2 Automatically Collected Information</h3>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li>Device information (IP address, browser type, device type)</li>
              <li>Usage data (pages visited, time spent, click patterns)</li>
              <li>Location data (with your permission)</li>
              <li>Cookies and tracking technologies</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-700 mb-4">We use your information for the following purposes:</p>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li>Provide and maintain our real estate services</li>
              <li>Process property inquiries and transactions</li>
              <li>Communicate with you about properties, services, and updates</li>
              <li>Personalize your experience and property recommendations</li>
              <li>Improve our website and services</li>
              <li>Comply with legal obligations and regulations</li>
              <li>Prevent fraud and ensure platform security</li>
              <li>Send marketing communications (with your consent)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Information Sharing and Disclosure</h2>
            <p className="text-gray-700 mb-4">We may share your information in the following circumstances:</p>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3">4.1 With Your Consent</h3>
            <p className="text-gray-700 mb-4">We may share your information with third parties when you give us explicit consent.</p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">4.2 Service Providers</h3>
            <p className="text-gray-700 mb-4">We may share information with trusted third-party service providers who assist us in:</p>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li>Property valuation and market analysis</li>
              <li>Payment processing</li>
              <li>Background checks and verification services</li>
              <li>Marketing and communication services</li>
              <li>IT and security services</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">4.3 Legal Requirements</h3>
            <p className="text-gray-700 mb-4">We may disclose your information when required by law, court order, or government regulation.</p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">4.4 Business Transfers</h3>
            <p className="text-gray-700 mb-4">In the event of a merger, acquisition, or sale of assets, your information may be transferred to the new entity.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Security</h2>
            <p className="text-gray-700 mb-4">
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li>Encryption of data in transit and at rest</li>
              <li>Secure server infrastructure</li>
              <li>Access controls and authentication measures</li>
              <li>Regular security audits and updates</li>
              <li>Employee training on data protection</li>
            </ul>
            <p className="text-gray-700">
              However, no method of transmission over the internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Cookies and Tracking Technologies</h2>
            <p className="text-gray-700 mb-4">
              We use cookies, web beacons, and similar tracking technologies to enhance your experience on our website:
            </p>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3">6.1 Types of Cookies</h3>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li><strong>Essential Cookies:</strong> Necessary for basic website functionality</li>
              <li><strong>Performance Cookies:</strong> Help us understand how visitors use our website</li>
              <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
              <li><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements</li>
            </ul>

            <p className="text-gray-700 mb-4">
              You can control cookie settings through your browser preferences. Note that disabling certain cookies may limit website functionality.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Your Rights and Choices</h2>
            <p className="text-gray-700 mb-4">You have the following rights regarding your personal information:</p>
            
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li><strong>Access:</strong> Request access to your personal data</li>
              <li><strong>Correction:</strong> Request correction of inaccurate data</li>
              <li><strong>Deletion:</strong> Request deletion of your personal data</li>
              <li><strong>Portability:</strong> Request transfer of your data</li>
              <li><strong>Restriction:</strong> Request restriction of processing</li>
              <li><strong>Objection:</strong> Object to certain types of processing</li>
              <li><strong>Withdraw Consent:</strong> Withdraw consent for data processing</li>
            </ul>

            <p className="text-gray-700 mb-4">
              To exercise these rights, please contact us using the information provided in the &quot;Contact Us&quot; section below.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Data Retention</h2>
            <p className="text-gray-700 mb-4">
              We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. Factors that determine retention periods include:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li>The nature of the information collected</li>
              <li>Legal and regulatory requirements</li>
              <li>The purpose for which the information was collected</li>
              <li>Your relationship with our services</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. International Data Transfers</h2>
            <p className="text-gray-700 mb-4">
              Your information may be transferred to and processed in countries other than your country of residence. We ensure that such transfers comply with applicable data protection laws and implement appropriate safeguards to protect your information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Children&apos;s Privacy</h2>
            <p className="text-gray-700 mb-4">
              Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children under 18. If we become aware that we have collected personal information from a child under 18, we will take steps to delete such information promptly.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Third-Party Links</h2>
            <p className="text-gray-700 mb-4">
              Our website may contain links to third-party websites or services. We are not responsible for the privacy practices or content of these third-party sites. We encourage you to review the privacy policies of any third-party sites you visit.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Changes to This Privacy Policy</h2>
            <p className="text-gray-700 mb-4">
              We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. We will notify you of any material changes by:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li>Posting the updated policy on our website</li>
              <li>Sending an email notification (if you have provided your email address)</li>
              <li>Displaying a prominent notice on our website</li>
            </ul>
            <p className="text-gray-700">
              Your continued use of our services after the effective date of the updated Privacy Policy constitutes acceptance of the changes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Contact Us</h2>
            <p className="text-gray-700 mb-4">
              If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
            </p>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Privacy Officer</h4>
              <p className="text-gray-700 mb-2">Email: privacy@company.com</p>
              <p className="text-gray-700 mb-2">Phone: +91 98765 43210</p>
              <p className="text-gray-700">
                Address: Please refer to our contact page for current office address
              </p>
            </div>

            <p className="text-gray-700 mt-4">
              We will respond to your inquiries within 30 days of receipt.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Governing Law</h2>
            <p className="text-gray-700">
              This Privacy Policy is governed by the laws of India. Any disputes arising from this Privacy Policy will be subject to the jurisdiction of the courts in the location of our registered office.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}