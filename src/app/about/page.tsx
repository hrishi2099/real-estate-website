import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | Zaminseva Prime - Your Partner in Property",
  description: "Discover the story behind Zaminseva Prime. We're not just real estate agents; we're your dedicated partners in finding the perfect property. Learn about our mission, our values, and the passionate team ready to guide you on your real estate journey.",
  openGraph: {
    title: "About Us | Zaminseva Prime - Your Partner in Property",
    description: "Discover the story behind Zaminseva Prime. We're not just real estate agents; we're your dedicated partners in finding the perfect property. Learn about our mission, our values, and the passionate team ready to guide you on your real estate journey.",
  },
};

const teamMembers = [
  {
    name: "Dattatray Ghore",
    role: "Founder & CEO",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b2972c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80",
    bio: "A true visionary in the real estate world, Dattatray’s passion for property is contagious. With over 25 years of hands-on experience, he founded Zaminseva Prime with the mission to create a more personal, client-focused real estate experience. He’s not just the CEO; he’s the heart and soul of our company, inspiring us all to be better every day."
  }
];

const stats = [
  { number: "1247+", label: "Properties Sold" },
  { number: "3.2M+", label: "Sq Ft Developed" },
  { number: "25+", label: "Years Experience" },
  { number: "97%", label: "Client Satisfaction" }
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900">About Zaminseva Prime</h1>
            <p className="mt-4 text-xl text-gray-600">
              Your trusted partner in real estate since 2000
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
            <p className="text-gray-600 mb-4">
              Our journey started with a simple, yet powerful idea: to build a real estate experience that’s not just about transactions, but about transformations. Back in 2000, our founder, Dattatray Ghore, saw a gap in the market. People weren't just looking for properties; they were looking for a place to call home, a smart investment for their future, and a trusted guide to help them navigate the often-complex world of real estate.
            </p>
            <p className="text-gray-600 mb-4">
              And so, Zaminseva Prime was born. We began as a small, passionate team with a big vision. We wanted to create a place where clients felt heard, understood, and empowered. We’ve always believed that buying or selling a property is one of life's most significant moments, and we’re honored to be a part of that journey.
            </p>
            <p className="text-gray-600">
              Over the years, we've grown, but our core values have remained the same. We’re still that same dedicated team, committed to providing you with unparalleled service, expert advice, and a personal touch that makes all the difference. We're not just here to close a deal; we're here to open doors to your future.
            </p>
          </div>
          <div className="relative h-96 rounded-lg overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2126&q=80"
              alt="Company Office"
              fill
              className="object-cover"
            />
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Zaminseva Prime Track Record</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Zaminseva Prime Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Integrity First, Always</h3>
              <p className="text-gray-600">
                For us, real estate is built on trust. We believe in open, honest communication and complete transparency. You’ll always know where you stand with us. We’re committed to upholding the highest ethical standards, ensuring that every step of your journey is clear, fair, and in your best interest.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Excellence in Everything We Do</h3>
              <p className="text-gray-600">
                We’re obsessed with quality. From our initial consultation to the final handshake, we strive for excellence in every detail. Our team is constantly learning, adapting, and using the latest market insights and technology to ensure you get the best possible outcome. We don't just meet expectations; we aim to exceed them.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">You're at the Heart of Our Business</h3>
              <p className="text-gray-600">
                Our clients are the reason we do what we do. We take the time to understand your unique needs, dreams, and goals. We listen, we learn, and we tailor our approach to fit you. Your success is our success, and we’re dedicated to helping you achieve your real estate ambitions with confidence and peace of mind.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Meet Zaminseva Prime Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-8 justify-items-center">
            {teamMembers.map((member, index) => (
              <div key={index} className="text-center">
                <div className="relative h-64 w-64 mx-auto mb-4 rounded-lg overflow-hidden">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{member.name}</h3>
                <p className="text-blue-600 font-medium mb-3">{member.role}</p>
                <p className="text-gray-600 text-sm">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 bg-blue-50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Work With Zaminseva Prime?</h2>
          <p className="text-gray-600 mb-6">
            Whether you&apos;re buying, selling, or investing in property, Zaminseva Prime&apos;s expert team is here to guide you every step of the way.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Contact Zaminseva Prime Today
            </a>
            <Link
              href="/properties"
              className="inline-flex items-center justify-center px-6 py-3 border border-blue-600 text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50"
            >
              View Zaminseva Prime Properties
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
