"use client";

import Link from "next/link";
import Image from "next/image";
import type { OfficeSettings } from '@prisma/client';

interface FooterProps {
  settings: Pick<OfficeSettings, 'companyName' | 'logoUrl' | 'phone' | 'email'> | null;
}

export default function Footer({ settings }: FooterProps) {
  return (
    <footer className="bg-gray-900">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8 xl:col-span-1">
            <Link href="/" className="flex items-center space-x-3">
              {/* Logo Image - Dynamic from office settings */}
              {settings?.logoUrl && (
                <div className="relative h-10 w-36">
                  <Image
                    src="/logos/logo.png"
                    alt={`${settings?.companyName || "Company"} Logo`}
                    fill
                    className="object-contain"
                    key={`footer-logo-${settings.logoUrl}`}
                  />
                </div>
              )}
              {/* Company Name - Dynamic from office settings */}
              <span className="text-xl font-bold text-white">
                {settings?.companyName || "Company Name"}
              </span>
            </Link>
            <p className="text-gray-300 text-base">
              Your trusted partner in finding the perfect home. We specialize in luxury properties and exceptional service.
            </p>
            <div className="flex space-x-6">
              <a href="https://www.facebook.com/p/Zaminseva-Prime-Pvt-Ltd-61574607166718/" className="text-gray-300 hover:text-gray-100">
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
              <a href="https://www.instagram.com/zaminseva_prime/" className="text-gray-300 hover:text-gray-100">
                <span className="sr-only">Instagram</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C8.74 0 8.333.014 7.053.072 5.772.132 4.922.382 4.06.746 3.21.996 2.504 1.493 1.827 2.175.72 3.281 0 4.926 0 7.053c0 1.23.014 1.637.072 2.91.06 1.281.31 2.132.674 2.992.35.859.848 1.564 1.53 2.246.682.682 1.387 1.179 2.246 1.53.86.364 1.711.614 2.992.674 1.273.058 1.64.072 2.91.072s1.637-.014 2.91-.072c1.281-.06 2.132-.31 2.992-.674.859-.35 1.564-.848 2.246-1.53.682-.682 1.179-1.387 1.53-2.246.364-.86.614-1.711.674-2.992.058-1.273.072-1.64.072-2.91s-.014-1.637-.072-2.91c-.06-1.281-.31-2.132-.674-2.992-.35-.859-.848-1.564-1.53-2.246C20.504 3.28 19.799 2.783 18.94 2.426c-.86-.364-1.711-.614-2.992-.674C14.363.014 13.99.001 12 0zm0 2.163c3.204 0 3.584.012 4.85.07 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.899.42.42.68.818.899 1.382.166.422.36 1.057.415 2.227.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.055 1.17-.249 1.805-.415 2.227-.217.562-.477.96-.899 1.382-.42.42-.818.68-1.382.899-.422.166-1.057.36-2.227.415-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.17-.055-1.805-.249-2.227-.415-.562-.217-.96-.477-1.382-.899-.42-.42-.68-.818-.899-1.382-.166-.422-.36-1.057-.415-2.227C2.163 15.584 2.15 15.21 2.15 12s.012-3.584.07-4.85c.055-1.17.249-1.805.415-2.227.217-.562.477-.96.899-1.382.42-.42.818-.68 1.382-.899.422-.166 1.057-.36 2.227-.415C8.416 2.163 8.79 2.15 12 2.15zm0 3.635c-3.402 0-6.162 2.76-6.162 6.162S8.598 18.15 12 18.15s6.162-2.76 6.162-6.162S15.402 5.785 12 5.785zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0-.795-.646-1.44-1.44-1.44s-1.44.646-1.44 1.44.646 1.44 1.44 1.44 1.44-.646 1.44-1.44z" />
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
                      Contact Us
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
                    📧 {settings?.email || "contact@zaminseva.com"}
                  </li>
                  <li className="text-base text-gray-300">
                    📞 {settings?.phone || "+91 98765 43210"}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-700 pt-8">
          <p className="text-base text-gray-400 xl:text-center">
            &copy; 2024 {settings?.companyName || "Company Name"}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}