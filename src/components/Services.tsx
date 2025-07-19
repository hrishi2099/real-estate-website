import Link from "next/link";

const services = [
  {
    title: "Land Sales & Acquisition",
    description: "Expert guidance through land purchasing with due diligence, title verification, and legal documentation support.",
    icon: "🌿",
  },
  {
    title: "Site Development Planning",
    description: "Comprehensive site planning services including zoning consultation, utility connections, and development permits.",
    icon: "📋",
  },
  {
    title: "Land Investment Consulting",
    description: "Strategic land investment advice to help you build wealth through smart land acquisition and development.",
    icon: "📈",
  },
  {
    title: "Land Valuation & Survey",
    description: "Professional land surveys, soil testing, and market valuations to ensure you make informed investment decisions.",
    icon: "📏",
  },
];

export default function Services() {
  return (
    <div className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Services</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Your Land Development Partners
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            From land acquisition to development planning, we provide comprehensive land investment services.
          </p>
        </div>

        <div className="mt-10">
          <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
            {services.map((service, index) => (
              <div key={index} className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white text-2xl">
                    {service.icon}
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">{service.title}</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  {service.description}
                </dd>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center">
          <div className="bg-blue-50 rounded-lg px-6 py-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Get Started?
            </h3>
            <p className="text-lg text-gray-600 mb-6">
              Contact our expert team today for a free consultation.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Get Free Consultation
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}