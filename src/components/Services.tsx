import Link from "next/link";

const services = [
  {
    title: "Land Sales & Acquisition",
    description: "Navigate the complexities of land acquisition with our expert guidance. We provide comprehensive support, from due diligence and title verification to legal documentation, ensuring a smooth and secure transaction.",
    icon: "🌿",
  },
  {
    title: "Site Development Planning",
    description: "Turn your vision into a reality with our site development planning services. We offer expert consultation on zoning, utility connections, and permit acquisition to lay the groundwork for your project's success.",
    icon: "📋",
  },
  {
    title: "Land Investment Consulting",
    description: "Build your wealth through strategic land investments. Our consulting services provide you with the insights and advice needed to make informed decisions that align with your financial goals.",
    icon: "📈",
  },
  {
    title: "Land Valuation & Survey",
    description: "Make confident investment decisions with our professional land valuation and survey services. We provide accurate market valuations, soil testing, and detailed surveys to give you a clear picture of your investment's potential.",
    icon: "📏",
  },
];

export default function Services() {
  return (
    <div className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h3 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Services</h3>
          <h2 className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Comprehensive Land Development Services
          </h2>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            We offer a full suite of services to support you at every stage of your land investment journey. From initial acquisition to development planning and beyond, our team is here to ensure your success.
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
              Begin Your Land Investment Journey
            </h3>
            <p className="text-lg text-gray-600 mb-6">
              Take the first step towards a successful land investment. Contact our expert team today for a free, no-obligation consultation and let us help you turn your vision into reality.
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