"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import type { OfficeSettings } from '@prisma/client';

interface FooterProps {
  settings: Pick<OfficeSettings, 'companyName' | 'logoUrl' | 'phone' | 'email'> | null;
}

export default function Footer({ settings }: FooterProps) {
  const [email, setEmail] = useState("");
  const [isNewsletterLoading, setIsNewsletterLoading] = useState(false);
  const [newsletterMessage, setNewsletterMessage] = useState("");

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsNewsletterLoading(true);

    try {
      // Simulate newsletter subscription
      await new Promise(resolve => setTimeout(resolve, 1500));
      setNewsletterMessage("Thanks for subscribing! 🎉");
      setEmail("");
    } catch (error) {
      setNewsletterMessage("Something went wrong. Please try again.");
    } finally {
      setIsNewsletterLoading(false);
      setTimeout(() => setNewsletterMessage(""), 3000);
    }
  };

  return (
    <footer className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
      </div>

      {/* Newsletter Section */}
      <div className="relative border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Stay Updated
                <span className="block text-blue-400">Get the latest property deals</span>
              </h2>
              <p className="mt-4 text-lg text-gray-300">
                Subscribe to our newsletter and never miss out on premium properties, market insights, and exclusive offers.
              </p>
            </div>

            <div className="mt-8 lg:mt-0">
              <form onSubmit={handleNewsletterSubmit} className="sm:flex sm:max-w-md lg:max-w-none">
                <div className="min-w-0 flex-1">
                  <label htmlFor="newsletter-email" className="sr-only">Email address</label>
                  <input
                    id="newsletter-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    disabled={isNewsletterLoading}
                    className="block w-full px-4 py-3 rounded-lg border-0 text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                <div className="mt-3 sm:mt-0 sm:ml-3 sm:flex-shrink-0">
                  <button
                    type="submit"
                    disabled={isNewsletterLoading || !email}
                    className="block w-full px-6 py-3 text-base font-medium text-white bg-blue-600 border border-transparent rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 sm:px-8"
                  >
                    {isNewsletterLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span className="ml-2">Subscribing...</span>
                      </div>
                    ) : (
                      "Subscribe"
                    )}
                  </button>
                </div>
              </form>
              {newsletterMessage && (
                <p className="mt-3 text-sm text-green-400 animate-fadeIn">
                  {newsletterMessage}
                </p>
              )}
              <p className="mt-3 text-sm text-gray-400">
                We respect your privacy. Unsubscribe at any time.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Company Info */}
          <div className="space-y-6 lg:col-span-1">
            <Link href="/" className="flex items-center space-x-3 group">
              {settings?.logoUrl && (
                <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-white/10 p-2">
                  <Image
                    src="/logos/logo.png"
                    alt={`${settings?.companyName || "Company"} Logo`}
                    fill
                    className="object-contain transition-transform duration-200 group-hover:scale-105"
                    key={`footer-logo-${settings.logoUrl}`}
                  />
                </div>
              )}
              <div>
                <span className="text-xl font-bold text-white">
                  {settings?.companyName || "Company Name"}
                </span>
                <p className="text-sm text-blue-400 font-medium">Premium Real Estate</p>
              </div>
            </Link>

            <p className="text-gray-300 text-sm leading-6">
              Your trusted partner in finding the perfect property. We specialize in luxury homes, commercial spaces, and agricultural land with exceptional service and transparent dealings.
            </p>

            {/* Enhanced Social Links */}
            <div>
              <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Follow Us</p>
              <div className="flex space-x-4">
                <a href="https://www.facebook.com/p/Zaminseva-Prime-Pvt-Ltd-61574607166718/"
                   className="group bg-gray-800 hover:bg-blue-600 p-2 rounded-lg transition-all duration-200">
                  <span className="sr-only">Facebook</span>
                  <svg className="h-5 w-5 text-gray-300 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="https://x.com/DreamlandGen1"
                   className="group bg-gray-800 hover:bg-black p-2 rounded-lg transition-all duration-200">
                  <span className="sr-only">X (Twitter)</span>
                  <svg className="h-5 w-5 text-gray-300 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="https://www.instagram.com/zaminseva_prime/"
                   className="group bg-gray-800 hover:bg-pink-600 p-2 rounded-lg transition-all duration-200">
                  <span className="sr-only">Instagram</span>
                  <svg className="h-5 w-5 text-gray-300 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                  </svg>
                </a>
                <a href="https://www.youtube.com/@ZaminsevaPrime"
                   className="group bg-gray-800 hover:bg-red-600 p-2 rounded-lg transition-all duration-200">
                  <span className="sr-only">YouTube</span>
                  <svg className="h-5 w-5 text-gray-300 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          {/* Enhanced Navigation Sections */}
          <div className="mt-12 lg:mt-0 lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Services Column */}
              <div>
                <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase mb-4">Our Services</h3>
                <ul className="space-y-3">
                  <li>
                    <Link href="/properties" className="text-gray-300 hover:text-white flex items-center group transition-colors duration-200">
                      <svg className="w-4 h-4 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      Buy Properties
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="text-gray-300 hover:text-white flex items-center group transition-colors duration-200">
                      <svg className="w-4 h-4 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      Sell Properties
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="text-gray-300 hover:text-white flex items-center group transition-colors duration-200">
                      <svg className="w-4 h-4 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      Property Valuation
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="text-gray-300 hover:text-white flex items-center group transition-colors duration-200">
                      <svg className="w-4 h-4 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Site Consultation
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Company Column */}
              <div>
                <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase mb-4">Company</h3>
                <ul className="space-y-3">
                  <li>
                    <Link href="/about" className="text-gray-300 hover:text-white flex items-center group transition-colors duration-200">
                      <svg className="w-4 h-4 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="text-gray-300 hover:text-white flex items-center group transition-colors duration-200">
                      <svg className="w-4 h-4 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Contact Us
                    </Link>
                  </li>
                  <li>
                    <Link href="/gallery" className="text-gray-300 hover:text-white flex items-center group transition-colors duration-200">
                      <svg className="w-4 h-4 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Gallery
                    </Link>
                  </li>
                  <li>
                    <a href="#" className="text-gray-300 hover:text-white flex items-center group transition-colors duration-200">
                      <svg className="w-4 h-4 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6z" />
                      </svg>
                      Careers
                    </a>
                  </li>
                </ul>
              </div>

              {/* Contact & Legal Column */}
              <div>
                <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase mb-4">Contact & Legal</h3>
                <ul className="space-y-3">
                  <li>
                    <div className="flex items-start">
                      <svg className="w-4 h-4 mr-2 mt-1 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <a href={`mailto:${settings?.email || "contact@zaminseva.com"}`} className="text-gray-300 hover:text-white text-sm transition-colors duration-200">
                        {settings?.email || "contact@zaminseva.com"}
                      </a>
                    </div>
                  </li>
                  <li>
                    <div className="flex items-start">
                      <svg className="w-4 h-4 mr-2 mt-1 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <a href={`tel:${settings?.phone || "+919876543210"}`} className="text-gray-300 hover:text-white text-sm transition-colors duration-200">
                        {settings?.phone || "+91 98765 43210"}
                      </a>
                    </div>
                  </li>
                  <li className="pt-2">
                    <Link href="/privacy-policy" className="text-gray-300 hover:text-white flex items-center group transition-colors duration-200">
                      <svg className="w-4 h-4 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms-of-service" className="text-gray-300 hover:text-white flex items-center group transition-colors duration-200">
                      <svg className="w-4 h-4 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Terms of Service
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        {/* Enhanced Bottom Section */}
        <div className="mt-16 border-t border-gray-700/50 pt-8">
          <div className="lg:flex lg:items-center lg:justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-8">
              <p className="text-gray-400 text-sm">
                &copy; {new Date().getFullYear()} {settings?.companyName || "Company Name"}. All rights reserved.
              </p>

              {/* Trust Indicators */}
              <div className="flex items-center space-x-6">
                <div className="flex items-center text-gray-500 text-xs">
                  <svg className="w-4 h-4 mr-1 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  RERA Approved
                </div>
                <div className="flex items-center text-gray-500 text-xs">
                  <svg className="w-4 h-4 mr-1 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  SSL Secured
                </div>
                <div className="flex items-center text-gray-500 text-xs">
                  <svg className="w-4 h-4 mr-1 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Fast Support
                </div>
              </div>
            </div>

            {/* Back to Top Button */}
            <div className="mt-6 lg:mt-0">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="group bg-gray-800 hover:bg-blue-600 text-white p-3 rounded-full transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                aria-label="Back to top"
              >
                <svg className="w-5 h-5 transform group-hover:-translate-y-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              </button>
            </div>
          </div>

          {/* Additional Footer Info */}
          <div className="mt-6 pt-6 border-t border-gray-800/50">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between text-xs text-gray-500">
              <p>
                Made with ❤️ for premium real estate experiences
              </p>
              <p className="mt-2 md:mt-0">
                Last updated: {new Date().toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}