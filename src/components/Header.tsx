"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface OfficeSettings {
  id: string;
  companyName: string | null;
  logoUrl: string | null;
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [officeSettings, setOfficeSettings] = useState<OfficeSettings | null>(null);
  const { user, isAuthenticated, isAdmin, logout, isHydrated } = useAuth();
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Prevent hydration mismatch by not rendering auth-dependent UI until hydrated
  const showAuthUI = isHydrated;

  // Fetch office settings for logo and company name
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

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isUserMenuOpen]);

  return (
    <header className="bg-white shadow-lg relative z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex justify-start lg:w-0 lg:flex-1">
            <Link href="/" className="flex items-center space-x-3">
              {/* Logo Image - Dynamic from office settings */}
              {officeSettings?.logoUrl && (
                <div className="relative h-8 w-32">
                  <Image
                    src={officeSettings.logoUrl}
                    alt={`${officeSettings?.companyName || "Company"} Logo`}
                    fill
                    className="object-contain"
                    priority
                    key={`header-logo-${officeSettings.logoUrl}`}
                  />
                </div>
              )}
              {/* Company Name - Dynamic from office settings */}
              <span className="hidden sm:block text-xl font-bold text-blue-600">
                {officeSettings?.companyName || "Company Name"}
              </span>
            </Link>
          </div>
          
          <nav className="hidden md:flex space-x-10">
            <Link href="/" className="text-base font-medium text-gray-500 hover:text-gray-900">
              Home
            </Link>
            <Link href="/properties" className="text-base font-medium text-gray-500 hover:text-gray-900">
              Properties
            </Link>
            <Link href="/plots" className="text-base font-medium text-gray-500 hover:text-gray-900">
              Plots
            </Link>
            <Link href="/search" className="text-base font-medium text-gray-500 hover:text-gray-900">
              Search
            </Link>
            <Link href="/gallery" className="text-base font-medium text-gray-500 hover:text-gray-900">
              Gallery
            </Link>
            <Link href="/about" className="text-base font-medium text-gray-500 hover:text-gray-900">
              About
            </Link>
            <Link href="/contact" className="text-base font-medium text-gray-500 hover:text-gray-900">
              Contact
            </Link>
          </nav>

          <div className="hidden md:flex items-center justify-end md:flex-1 lg:w-0">
            {showAuthUI && isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
                >
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-medium">{user?.name}</span>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1">
                      <Link href="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Dashboard
                      </Link>
                      {isAdmin && (
                        <Link href="/admin" className="block px-4 py-2 text-sm text-blue-700 hover:bg-blue-50">
                          Admin Panel
                        </Link>
                      )}
                      <Link href="/dashboard/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Profile
                      </Link>
                      <Link href="/dashboard/favorites" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Saved Plots
                      </Link>
                      <button
                        onClick={logout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : showAuthUI ? (
              <div className="flex items-center space-x-4">
                <Link href="/login" className="text-gray-700 hover:text-gray-900 text-sm font-medium">
                  Sign in
                </Link>
                <Link href="/signup" className="whitespace-nowrap inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700">
                  Sign up
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
              </div>
            )}
          </div>

          <div className="md:hidden">
            <button
              type="button"
              className="bg-white rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="sr-only">Open menu</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link href="/" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                Home
              </Link>
              <Link href="/properties" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                Properties
              </Link>
              <Link href="/plots" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                Plots
              </Link>
              <Link href="/gallery" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                Gallery
              </Link>
              <Link href="/about" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                About
              </Link>
              <Link href="/contact" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                Contact
              </Link>
              
              {showAuthUI && isAuthenticated ? (
                <div className="border-t border-gray-200 pt-4 pb-3">
                  <div className="flex items-center px-3">
                    <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium text-gray-800">{user?.name}</div>
                      <div className="text-sm font-medium text-gray-500">{user?.email}</div>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1">
                    <Link href="/dashboard" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                      Dashboard
                    </Link>
                    {isAdmin && (
                      <Link href="/admin" className="block px-3 py-2 text-base font-medium text-blue-700 hover:text-blue-900 hover:bg-blue-50">
                        Admin Panel
                      </Link>
                    )}
                    <Link href="/dashboard/profile" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                      Profile
                    </Link>
                    <button
                      onClick={logout}
                      className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              ) : showAuthUI ? (
                <div className="border-t border-gray-200 pt-4 pb-3 space-y-1">
                  <Link href="/login" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                    Sign in
                  </Link>
                  <Link href="/signup" className="block px-3 py-2 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md mx-3">
                    Sign up
                  </Link>
                </div>
              ) : (
                <div className="border-t border-gray-200 pt-4 pb-3 space-y-1">
                  <div className="px-3 py-2">
                    <div className="w-20 h-6 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="px-3 py-2">
                    <div className="w-16 h-6 bg-gray-200 rounded animate-pulse mx-3"></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}