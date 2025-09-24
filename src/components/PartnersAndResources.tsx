"use client";

interface Link {
  name: string;
  url: string;
  description: string;
  category: 'government' | 'regulatory' | 'banking' | 'legal' | 'utility' | 'local';
  icon: string;
}

const partnerLinks: Link[] = [
  // Government & Regulatory
  {
    name: "RERA Maharashtra",
    url: "https://maharera.mahaonline.gov.in/",
    description: "Real Estate Regulatory Authority - Check project registrations and complaints",
    category: "regulatory",
    icon: "🏛️"
  },
  {
    name: "Property Registration Portal",
    url: "https://igrsmaharashtra.gov.in/",
    description: "Maharashtra Property Registration and Document Verification",
    category: "government",
    icon: "📋"
  },
  {
    name: "Land Records (7/12 Extract)",
    url: "https://bhulekh.mahabhumi.gov.in/",
    description: "Verify land ownership and agricultural land records online",
    category: "government",
    icon: "📄"
  },
  {
    name: "Survey Settlement Records",
    url: "https://mahabhumi.gov.in/",
    description: "Access land survey numbers and settlement records",
    category: "government",
    icon: "🗺️"
  },

  // Banking & Financial
  {
    name: "SBI Home Loans",
    url: "https://www.sbi.co.in/web/personal-banking/loans/home-loans",
    description: "Competitive home loan rates for property purchases",
    category: "banking",
    icon: "🏦"
  },
  {
    name: "HDFC Property Loans",
    url: "https://www.hdfc.com/home-loans",
    description: "Quick property loan approvals with attractive interest rates",
    category: "banking",
    icon: "💳"
  },
  {
    name: "LIC Housing Finance",
    url: "https://www.lichousing.com/",
    description: "Specialized housing finance solutions for land and property",
    category: "banking",
    icon: "🏠"
  },

  // Legal & Professional
  {
    name: "Bar Council of Maharashtra",
    url: "https://www.barcouncilofmaharashtra.in/",
    description: "Find qualified legal professionals for property documentation",
    category: "legal",
    icon: "⚖️"
  },
  {
    name: "Property Valuation Services",
    url: "https://www.rics.org/in/",
    description: "Royal Institution of Chartered Surveyors - Professional property valuation",
    category: "legal",
    icon: "📊"
  },

  // Utilities & Infrastructure
  {
    name: "Maharashtra Electricity Board",
    url: "https://www.mahadiscom.in/",
    description: "Electricity connection and infrastructure information",
    category: "utility",
    icon: "⚡"
  },
  {
    name: "Public Works Department",
    url: "https://pwd.maharashtra.gov.in/",
    description: "Road connectivity and infrastructure development updates",
    category: "utility",
    icon: "🛣️"
  },

  // Local Authorities
  {
    name: "Pune Municipal Corporation",
    url: "https://www.pmc.gov.in/",
    description: "Local development plans and property approvals",
    category: "local",
    icon: "🏢"
  },
  {
    name: "Nashik Municipal Corporation",
    url: "https://www.nashikcorporation.in/",
    description: "Municipal services and property development guidelines",
    category: "local",
    icon: "🌆"
  }
];

const categoryInfo = {
  government: {
    title: "Government Services",
    description: "Official portals for property registration, land records, and documentation",
    color: "from-blue-600 to-blue-800"
  },
  regulatory: {
    title: "Regulatory Authorities",
    description: "Real estate regulatory bodies and compliance information",
    color: "from-purple-600 to-purple-800"
  },
  banking: {
    title: "Banking & Finance",
    description: "Trusted financial institutions for property loans and mortgages",
    color: "from-green-600 to-green-800"
  },
  legal: {
    title: "Legal & Professional",
    description: "Legal services and professional consultancy for property matters",
    color: "from-orange-600 to-orange-800"
  },
  utility: {
    title: "Utilities & Infrastructure",
    description: "Essential services and infrastructure development information",
    color: "from-indigo-600 to-indigo-800"
  },
  local: {
    title: "Local Authorities",
    description: "Municipal corporations and local development authorities",
    color: "from-teal-600 to-teal-800"
  }
};

export default function PartnersAndResources() {
  const categories = Object.keys(categoryInfo) as Array<keyof typeof categoryInfo>;

  const handleLinkClick = (linkName: string, url: string) => {
    // Track outbound link clicks for analytics
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', 'click', {
        event_category: 'outbound_link',
        event_label: linkName,
        transport_type: 'beacon'
      });
    }

    // Open in new tab
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-blue-100 text-blue-700 font-semibold mb-6">
            <span className="text-xl mr-3">🤝</span>
            Trusted Partners & Resources
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-6">
            Essential Resources for
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Smart Property Investment
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Navigate your property journey with confidence using these trusted government portals,
            financial institutions, and regulatory authorities.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="space-y-12">
          {categories.map((category) => {
            const categoryData = categoryInfo[category];
            const categoryLinks = partnerLinks.filter(link => link.category === category);

            if (categoryLinks.length === 0) return null;

            return (
              <div key={category} className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                {/* Category Header */}
                <div className={`bg-gradient-to-r ${categoryData.color} px-8 py-6`}>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {categoryData.title}
                  </h3>
                  <p className="text-white/90">
                    {categoryData.description}
                  </p>
                </div>

                {/* Links Grid */}
                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categoryLinks.map((link) => (
                      <div
                        key={link.name}
                        className="group bg-gray-50 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 rounded-2xl p-6 transition-all duration-300 cursor-pointer border border-gray-100 hover:border-blue-200 hover:shadow-lg"
                        onClick={() => handleLinkClick(link.name, link.url)}
                      >
                        <div className="flex items-start space-x-4">
                          <div className="bg-white rounded-full p-3 shadow-sm group-hover:shadow-md transition-shadow">
                            <span className="text-2xl">{link.icon}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                              {link.name}
                            </h4>
                            <p className="text-sm text-gray-600 leading-relaxed mb-3">
                              {link.description}
                            </p>
                            <div className="flex items-center text-blue-600 text-sm font-semibold">
                              <span className="group-hover:mr-2 transition-all">Visit Website</span>
                              <svg
                                className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Disclaimer */}
        <div className="mt-16 bg-amber-50 border border-amber-200 rounded-2xl p-6">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-amber-800 mb-2">Important Notice</h4>
              <p className="text-amber-700 leading-relaxed">
                These are external websites provided for your convenience. Zaminseva Prime is not responsible for their content,
                services, or policies. Please verify all information independently and consult with qualified professionals
                for your specific property needs. Always ensure you're accessing official government portals for authentic services.
              </p>
            </div>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="mt-16 text-center bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-4">Need Guidance with These Resources?</h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Our experienced team can help you navigate these portals and ensure all your property documentation is in order.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.location.href = '/contact'}
              className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors"
            >
              Get Expert Assistance
            </button>
            <button
              onClick={() => window.location.href = '/properties'}
              className="px-8 py-3 border-2 border-white text-white font-semibold rounded-xl hover:bg-white hover:text-blue-600 transition-colors"
            >
              Browse Properties
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}