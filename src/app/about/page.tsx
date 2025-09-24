import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import ZaminsevaSchema from "@/components/ZaminsevaSchema";

export const metadata: Metadata = {
  title: "About Us | Zaminseva Prime - Your Partner in Property",
  description: "Discover Zaminseva Prime's story. Your trusted real estate partner for 25+ years, specializing in premium NA plots and farmhouse land with clear titles.",
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://zaminseva.com'}/about`,
  },
  openGraph: {
    title: "About Us | Zaminseva Prime - Your Partner in Property",
    description: "Discover Zaminseva Prime's story. Your trusted real estate partner for 25+ years, specializing in premium NA plots and farmhouse land with clear titles.",
  },
};

const leadership = {
  founder: {
    name: "Dattatray Ghore",
    role: "Founder & CEO",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b2972c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80",
    vision: "Transforming real estate investments through transparency and trust",
    achievements: ["25+ Years Experience", "1200+ Successful Projects", "Industry Pioneer"]
  }
};

const stats = [
  { number: "✓", label: "Clear Title Guarantee" },
  { number: "3.2M+", label: "Sq Ft Developed" },
  { number: "25+", label: "Years Experience" },
  { number: "97%", label: "Client Satisfaction" }
];

const testimonials = [
  {
    name: "Rajesh Sharma",
    location: "Pune",
    text: "Found our perfect farmhouse plot through Zaminseva Prime. Their transparent process and expert guidance made our investment journey smooth and stress-free.",
    rating: 5,
    investment: "Farmhouse Plot"
  },
  {
    name: "Priya Patel",
    location: "Mumbai",
    text: "Outstanding legal support and clear documentation process. Their professional team handled our NA land purchase with complete transparency.",
    rating: 5,
    investment: "NA Plot"
  }
];

const milestones = [
  {
    year: "1999",
    title: "Company Founded",
    description: "Dattatray Ghore established Zaminseva Prime with a vision to revolutionize real estate"
  },
  {
    year: "2005",
    title: "First Major Project",
    description: "Completed our first gated community development with 100+ plots"
  },
  {
    year: "2010",
    title: "Legal Excellence",
    description: "Established in-house legal team and architectural services"
  },
  {
    year: "2015",
    title: "1000+ Properties",
    description: "Crossed the milestone of 1000 successful property transactions"
  },
  {
    year: "2020",
    title: "Digital Transformation",
    description: "Launched digital property viewing and online documentation services"
  },
  {
    year: "2024",
    title: "Innovation Leader",
    description: "Introduced advanced property visualization and customer service technologies"
  }
];

export default function AboutPage() {
  return (
    <>
      <ZaminsevaSchema pageType="homepage" />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Unique Creative Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
          <div className="absolute top-0 right-0 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="text-center">
            {/* Floating Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white shadow-lg border border-blue-100 mb-8">
              <div className="w-3 h-3 bg-green-400 rounded-full mr-3 animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700">25 Years of Excellence</span>
            </div>

            {/* Creative Typography */}
            <div className="space-y-4">
              <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 leading-tight">
                About
              </h1>
              <div className="flex items-center justify-center space-x-4">
                <div className="w-16 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></div>
                <h2 className="text-3xl md:text-5xl font-bold text-gray-800">Zaminseva Prime</h2>
                <div className="w-16 h-1 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full"></div>
              </div>
            </div>

            {/* Creative Subtitle */}
            <p className="mt-8 text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Where dreams meet reality, and investments bloom into
              <span className="text-blue-600 font-semibold"> extraordinary opportunities</span>
            </p>

            {/* Floating Stats Cards */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                  <div className="relative bg-white rounded-2xl p-6 shadow-xl border border-white/20 backdrop-blur-sm hover:transform hover:scale-105 transition-all duration-300">
                    <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                      {stat.number}
                    </div>
                    <div className="text-sm font-medium text-gray-600 mt-2">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Decorative Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-20 text-white" viewBox="0 0 1200 120" fill="currentColor">
            <path d="M0,0V7.23C0,65.52,268.63,112.77,600,112.77S1200,65.52,1200,7.23V0Z"></path>
          </svg>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Our Story Section */}
        <div className="relative">
          {/* Background pattern */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="absolute top-1/4 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-10 animate-float"></div>
              <div className="absolute top-1/2 right-20 w-16 h-16 bg-purple-200 rounded-full opacity-10 animate-float" style={{animationDelay: '1s'}}></div>
              <div className="absolute bottom-1/4 left-1/3 w-24 h-24 bg-indigo-200 rounded-full opacity-10 animate-float" style={{animationDelay: '2s'}}></div>
            </div>
          </div>

          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-16">
            {/* Content Side */}
            <div className="relative">
              {/* Section Header */}
              <div className="mb-12">
                <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full mb-6">
                  <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-3 animate-pulse"></div>
                  <span className="text-sm font-semibold text-blue-700">Our Journey</span>
                </div>

                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Story</span>
                </h2>

                <div className="w-20 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mb-8"></div>
              </div>

              {/* Story Content */}
              <div className="space-y-6">
                <div className="group relative">
                  <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-blue-400 to-purple-400 rounded-full opacity-30 group-hover:opacity-60 transition-opacity duration-300"></div>
                  <div className="pl-8">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-3">
                        <span className="text-white text-sm font-bold">1</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Legacy of Excellence</h3>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      Zaminseva Prime is a highly respected and trusted real estate company, well known in the market for more than 23 years. Our area of expertise is in Premium Non-agricultural land (plotted development), Gated Communities, Farmhouse plots and Eco-estates.
                    </p>
                  </div>
                </div>

                <div className="group relative">
                  <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-purple-400 to-pink-400 rounded-full opacity-30 group-hover:opacity-60 transition-opacity duration-300"></div>
                  <div className="pl-8">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-3">
                        <span className="text-white text-sm font-bold">2</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Premium Locations</h3>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      Our properties are at premium locations, with unique views and features. We use this knowledge to create vibrant communities. But our services extend beyond the land itself. As a trusted real estate developer in Maharashtra, we offer comprehensive support and guidance throughout your property journey.
                    </p>
                  </div>
                </div>

                <div className="group relative">
                  <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-pink-400 to-rose-400 rounded-full opacity-30 group-hover:opacity-60 transition-opacity duration-300"></div>
                  <div className="pl-8">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center mr-3">
                        <span className="text-white text-sm font-bold">3</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Trusted Partnership</h3>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      Over the years, we've built a reputation for excellence, transparency, and customer satisfaction. We're not just here to sell properties; we're here to help you make informed investment decisions and find the perfect piece of land that matches your vision and requirements.
                    </p>
                  </div>
                </div>
              </div>

              {/* Achievement Badges */}
              <div className="mt-10 flex flex-wrap gap-4">
                <div className="bg-white rounded-2xl p-4 shadow-lg border border-orange-100 hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-900">EMI</div>
                      <div className="text-xs text-gray-500">Flexible Options</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-4 shadow-lg border border-green-100 hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-900">Legal</div>
                      <div className="text-xs text-gray-500">Clear Titles</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Image Side */}
            <div className="relative">
              {/* Decorative elements */}
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-gradient-to-br from-blue-200 to-purple-200 rounded-3xl opacity-20 rotate-12"></div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-br from-purple-200 to-pink-200 rounded-3xl opacity-20 -rotate-12"></div>

              {/* Main image container */}
              <div className="relative h-96 lg:h-[500px] rounded-3xl overflow-hidden shadow-2xl group">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-purple-600/20 z-10 group-hover:opacity-0 transition-opacity duration-500"></div>
                <Image
                  src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2126&q=80"
                  alt="Company Office"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />

                {/* Floating info card */}
                <div className="absolute bottom-6 left-6 right-6 z-20">
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900">Zaminseva Prime HQ</h4>
                        <p className="text-sm text-gray-600">Maharashtra, India</p>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Zaminseva Prime?</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-purple-400 mx-auto rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Plot Development Done Right</h3>
                  <p className="text-gray-600 text-sm">We handle complex projects, making your investment flourish.</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Hassle-Free Process</h3>
                  <p className="text-gray-600 text-sm">Easy steps keep you informed throughout.</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Expert Teamwork</h3>
                  <p className="text-gray-600 text-sm">Our specialists work together for your success.</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Legal Assurance</h3>
                  <p className="text-gray-600 text-sm">Clear title deeds, government sanctions reduce fraud risk. In-house advocate and team of architects.</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Refundable Policy</h3>
                  <p className="text-gray-600 text-sm">Token amount is 100% refundable. No hidden terms.</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Long-Term Partnerships & Buy Back Policy</h3>
                  <p className="text-gray-600 text-sm">Future-secure program that gives you the freedom to exit your investment with assured returns.</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow md:col-span-2 lg:col-span-1">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Easy & Flexible EMI Options</h3>
                  <p className="text-gray-600 text-sm">Flexible payment schemes to ease purchasing decisions by Zaminseva Prime or financial institutes.</p>
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* Enhanced Core Values Section */}
        <div className="mb-16 relative">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Core Values</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-purple-400 mx-auto rounded-full"></div>
            <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
              The principles that guide every decision we make and every relationship we build
            </p>
          </div>

          {/* Floating background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 -left-4 w-24 h-24 bg-blue-200 rounded-full opacity-20 animate-float"></div>
            <div className="absolute bottom-1/4 -right-4 w-32 h-32 bg-purple-200 rounded-full opacity-20 animate-float" style={{animationDelay: '1s'}}></div>
            <div className="absolute top-3/4 left-1/3 w-16 h-16 bg-indigo-200 rounded-full opacity-20 animate-float" style={{animationDelay: '2s'}}></div>
          </div>

          <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Trust & Integrity */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-3xl blur-lg opacity-20 group-hover:opacity-30 transition-all duration-500 group-hover:scale-105"></div>
              <div className="relative bg-white rounded-3xl p-8 shadow-xl border border-white/20 backdrop-blur-sm transform transition-all duration-500 group-hover:scale-105 group-hover:shadow-2xl">
                {/* Decorative top element */}
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl rotate-45 flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white -rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>

                {/* Content */}
                <div className="text-center pt-8">
                  <div className="inline-block px-4 py-2 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-full mb-6">
                    <span className="text-blue-700 font-semibold text-sm">Foundation</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors duration-300">
                    Trust & Integrity
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    Built on honest communication and complete transparency in every transaction. Our word is our bond.
                  </p>

                  {/* Value metrics */}
                  <div className="flex justify-center space-x-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">100%</div>
                      <div className="text-xs text-gray-500">Transparency</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">25+</div>
                      <div className="text-xs text-gray-500">Years Trust</div>
                    </div>
                  </div>
                </div>

                {/* Decorative corner */}
                <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-blue-400/10 to-transparent rounded-tl-3xl rounded-br-3xl"></div>
              </div>
            </div>

            {/* Quality Excellence */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-green-400 rounded-3xl blur-lg opacity-20 group-hover:opacity-30 transition-all duration-500 group-hover:scale-105"></div>
              <div className="relative bg-white rounded-3xl p-8 shadow-xl border border-white/20 backdrop-blur-sm transform transition-all duration-500 group-hover:scale-105 group-hover:shadow-2xl">
                {/* Decorative top element */}
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-500 rounded-2xl rotate-45 flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white -rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                </div>

                {/* Content */}
                <div className="text-center pt-8">
                  <div className="inline-block px-4 py-2 bg-gradient-to-r from-emerald-100 to-green-100 rounded-full mb-6">
                    <span className="text-emerald-700 font-semibold text-sm">Excellence</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-emerald-600 transition-colors duration-300">
                    Quality Excellence
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    Committed to delivering superior service and exceeding expectations at every step of your journey.
                  </p>

                  {/* Value metrics */}
                  <div className="flex justify-center space-x-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-emerald-600">97%</div>
                      <div className="text-xs text-gray-500">Satisfaction</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-emerald-600">1200+</div>
                      <div className="text-xs text-gray-500">Happy Clients</div>
                    </div>
                  </div>
                </div>

                {/* Decorative corner */}
                <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-emerald-400/10 to-transparent rounded-tl-3xl rounded-br-3xl"></div>
              </div>
            </div>

            {/* Client-Focused */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-400 rounded-3xl blur-lg opacity-20 group-hover:opacity-30 transition-all duration-500 group-hover:scale-105"></div>
              <div className="relative bg-white rounded-3xl p-8 shadow-xl border border-white/20 backdrop-blur-sm transform transition-all duration-500 group-hover:scale-105 group-hover:shadow-2xl">
                {/* Decorative top element */}
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl rotate-45 flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white -rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                </div>

                {/* Content */}
                <div className="text-center pt-8">
                  <div className="inline-block px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full mb-6">
                    <span className="text-purple-700 font-semibold text-sm">Priority</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-purple-600 transition-colors duration-300">
                    Client-Focused
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    Your dreams and goals are our priority. We tailor our approach to fit your unique needs and aspirations.
                  </p>

                  {/* Value metrics */}
                  <div className="flex justify-center space-x-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-purple-600">24/7</div>
                      <div className="text-xs text-gray-500">Support</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">100%</div>
                      <div className="text-xs text-gray-500">Personalized</div>
                    </div>
                  </div>
                </div>

                {/* Decorative corner */}
                <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-purple-400/10 to-transparent rounded-tl-3xl rounded-br-3xl"></div>
              </div>
            </div>
          </div>

          {/* Bottom decorative element */}
          <div className="flex justify-center mt-12">
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
              <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
            </div>
          </div>
        </div>

        {/* Horizontal Scrolling Timeline */}
        <div className="mb-16">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Journey Over 25 Years</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-purple-400 mx-auto rounded-full"></div>
            <p className="text-gray-600 mt-4">Scroll to explore our milestones</p>
          </div>

          {/* Mobile responsive: Stack on small screens, horizontal scroll on larger */}
          <div className="block md:hidden space-y-8">
            {milestones.map((milestone, index) => (
              <div key={index} className="relative">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-sm">{milestone.year.slice(-2)}</span>
                  </div>
                  <div className="flex-1 bg-white rounded-2xl p-6 shadow-lg border-l-4 border-blue-500">
                    <div className="text-blue-600 font-bold text-lg mb-2">{milestone.year}</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{milestone.title}</h3>
                    <p className="text-gray-600">{milestone.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop horizontal timeline */}
          <div className="hidden md:block relative">
            {/* Connection line */}
            <div className="absolute top-20 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 rounded-full"></div>

            {/* Scrollable container */}
            <div className="overflow-x-auto pb-4">
              <div className="flex space-x-8 min-w-max px-4">
                {milestones.map((milestone, index) => (
                  <div key={index} className="flex-shrink-0 w-80 relative">
                    {/* Timeline dot */}
                    <div className="absolute top-16 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full border-4 border-white shadow-lg z-10">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full animate-ping opacity-75"></div>
                    </div>

                    {/* Year badge */}
                    <div className="text-center mb-8">
                      <div className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full font-bold text-xl shadow-lg transform hover:scale-110 transition-transform duration-300">
                        {milestone.year}
                      </div>
                    </div>

                    {/* Content card */}
                    <div className="mt-12 group">
                      <div className="relative bg-white rounded-3xl p-8 shadow-xl border border-gray-100 transform transition-all duration-500 hover:scale-105 hover:shadow-2xl">
                        {/* Decorative corner */}
                        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-400 rounded-bl-3xl rounded-tr-3xl opacity-10"></div>

                        {/* Icon */}
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>

                        <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors duration-300">
                          {milestone.title}
                        </h3>
                        <p className="text-gray-600 leading-relaxed">
                          {milestone.description}
                        </p>

                        {/* Hover effect gradient */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/5 to-purple-400/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Scroll indicators */}
            <div className="flex justify-center mt-8 space-x-2">
              {milestones.map((_, index) => (
                <div key={index} className="w-2 h-2 bg-blue-300 rounded-full"></div>
              ))}
            </div>
          </div>
        </div>

        {/* Customer Success Stories */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Client Success Stories</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-purple-400 mx-auto rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-400 rounded-3xl blur-lg opacity-20 group-hover:opacity-30 transition-all duration-500"></div>
                <div className="relative bg-white rounded-3xl p-8 shadow-xl border border-white/20 backdrop-blur-sm hover:transform hover:scale-105 transition-all duration-500">
                  {/* Investment type badge */}
                  <div className="inline-block px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full mb-6">
                    <span className="text-blue-700 font-semibold text-sm">{testimonial.investment}</span>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <svg key={i} className="w-6 h-6 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>

                  {/* Quote */}
                  <blockquote className="text-lg text-gray-700 mb-8 italic leading-relaxed">
                    "{testimonial.text}"
                  </blockquote>

                  {/* Client info */}
                  <div className="flex items-center border-t pt-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-4">
                      <span className="text-white font-bold text-lg">{testimonial.name[0]}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-lg">{testimonial.name}</p>
                      <p className="text-blue-600 font-medium">{testimonial.location}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Leadership Spotlight */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Leadership</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-purple-400 mx-auto rounded-full"></div>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-400 rounded-3xl blur-lg opacity-20 group-hover:opacity-30 transition-all duration-500"></div>
              <div className="relative bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-white/20 backdrop-blur-sm">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  {/* Image Side */}
                  <div className="relative">
                    <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full opacity-30"></div>
                    <div className="relative h-80 w-80 mx-auto rounded-2xl overflow-hidden shadow-2xl">
                      <Image
                        src={leadership.founder.image}
                        alt={leadership.founder.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  </div>

                  {/* Content Side */}
                  <div className="text-center lg:text-left">
                    <div className="inline-block px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full mb-6">
                      <span className="text-blue-700 font-semibold text-sm">Founder & Visionary</span>
                    </div>

                    <h3 className="text-3xl font-bold text-gray-900 mb-2">{leadership.founder.name}</h3>
                    <p className="text-xl text-blue-600 font-medium mb-6">{leadership.founder.role}</p>

                    <blockquote className="text-lg text-gray-700 italic mb-8 leading-relaxed">
                      "{leadership.founder.vision}"
                    </blockquote>

                    {/* Achievements */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {leadership.founder.achievements.map((achievement, index) => (
                        <div key={index} className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 text-center">
                          <div className="text-sm font-semibold text-gray-700">{achievement}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 bg-blue-50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Work With Zaminseva Prime?</h2>
          <p className="text-gray-600 mb-6">
            Whether you&apos;re buying, selling, or investing in property, Zaminseva Prime&apos;s expert team is here to guide you every step of the way.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Contact Zaminseva Prime Today
            </Link>
            <Link
              href="/properties"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
            >
              View Properties
            </Link>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
