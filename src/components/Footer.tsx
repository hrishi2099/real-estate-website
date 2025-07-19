"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

interface OfficeSettings {
  id: string;
  companyName: string | null;
  logoUrl: string | null;
  phone: string | null;
  email: string | null;
}

export default function Footer() {
  const [officeSettings, setOfficeSettings] = useState<OfficeSettings | null>(null);

  useEffect(() => {
    const fetchOfficeSettings = async () => {
      try {
        const response = await fetch("/api/admin/settings");
        if (response.ok) {
          const settings = await response.json();
          setOfficeSettings(settings);
        }
      } catch (error) {
        console.error("Error fetching office settings:", error);
      }
    };

    fetchOfficeSettings();
  }, []);
  return (
    <footer className="bg-gray-900">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8 xl:col-span-1">
            <Link href="/" className="flex items-center space-x-3">
              {/* Logo Image - Dynamic from office settings */}
              {officeSettings?.logoUrl && (
                <div className="relative h-10 w-36">
                  <Image
                    src={officeSettings.logoUrl}
                    alt={`${officeSettings?.companyName || "Company"} Logo`}
                    fill
                    className="object-contain"
                    key={`footer-logo-${officeSettings.logoUrl}`}
                  />
                </div>
              )}
              {/* Company Name - Dynamic from office settings */}
              <span className="text-xl font-bold text-white">
                {officeSettings?.companyName || "Company Name"}
              </span>
            </Link>
            <p className="text-gray-300 text-base">
              Your trusted partner in finding the perfect home. We specialize in luxury properties and exceptional service.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-300 hover:text-gray-100">
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-300 hover:text-gray-100">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
            </div>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Services</h3>
                <ul className="mt-4 space-y-4">
                  <li>
                    <Link href="/properties" className="text-base text-gray-300 hover:text-white">
                      Buy Properties
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="text-base text-gray-300 hover:text-white">
                      Sell Properties
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="text-base text-gray-300 hover:text-white">
                      Property Valuation
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Company</h3>
                <ul className="mt-4 space-y-4">
                  <li>
                    <Link href="/about" className="text-base text-gray-300 hover:text-white">
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="text-base text-gray-300 hover:text-white">
                      Contact
                    </Link>
                  </li>
                  <li>
                    <a href="#" className="text-base text-gray-300 hover:text-white">
                      Careers
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Legal</h3>
                <ul className="mt-4 space-y-4">
                  <li>
                    <Link href="/privacy-policy" className="text-base text-gray-300 hover:text-white">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <a href="#" className="text-base text-gray-300 hover:text-white">
                      Terms of Service
                    </a>
                  </li>
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Contact Info</h3>
                <ul className="mt-4 space-y-4">
                  <li className="text-base text-gray-300">
                    📧 {officeSettings?.email || "contact@zaminseva.com"}
                  </li>
                  <li className="text-base text-gray-300">
                    📞 {officeSettings?.phone || "+91 98765 43210"}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-700 pt-8">
          <p className="text-base text-gray-400 xl:text-center">
            &copy; 2024 {officeSettings?.companyName || "Company Name"}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}