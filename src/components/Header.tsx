"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import type { OfficeSettings } from '@prisma/client';
import { trackNavigation } from "@/lib/tracking";

interface HeaderProps {
  settings: Pick<OfficeSettings, 'companyName' | 'logoUrl'> | null;
}

export default function Header({ settings }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, isAuthenticated, isAdmin, isSalesManager, logout, isHydrated } = useAuth();
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Prevent hydration mismatch by not rendering auth-dependent UI until hydrated
  const showAuthUI = isHydrated;

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
    <header className="bg-gradient-to-r from-white/95 via-blue-50/90 to-white/95 backdrop-blur-sm shadow-xl border-b border-blue-100/50 relative z-40">
      {/* Subtle animated background pattern */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-transparent to-purple-600/5 opacity-50"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex justify-between items-center py-4 sm:py-6">
          <div className="flex items-center">
            <Link href="/" className="group flex items-center space-x-2 sm:space-x-3 hover:scale-105 transition-transform duration-300">
              {/* Logo Container with enhanced styling */}
              <div className="relative">
                {/* Decorative background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10 rounded-2xl blur-sm group-hover:blur-none transition-all duration-300"></div>

                {/* Logo Image - Dynamic from office settings */}
                {settings?.logoUrl && (
                  <div className="relative h-8 w-32 sm:h-10 sm:w-40 rounded-xl overflow-hidden">
                    <Image
                      src="/logos/logo.png"
                      alt={`${settings?.companyName || "Company"} Logo`}
                      fill
                      className="object-contain"
                      priority
                      key={`header-logo-${settings.logoUrl}`}
                    />
                  </div>
                )}

                {/* Company Name with enhanced styling */}
                <span className="text-base sm:text-lg lg:text-xl font-bold bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 bg-clip-text text-transparent truncate group-hover:from-blue-500 group-hover:to-purple-500 transition-all duration-300">
                  {settings?.companyName || "Real Estate"}
                </span>
              </div>
            </Link>
          </div>
          
          <nav className="hidden md:flex space-x-2 lg:space-x-4" data-section="main-navigation">
            <Link
              href="/"
              className="relative px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-700 transition-all duration-300 group rounded-lg hover:bg-white/60 hover:shadow-md hover:scale-105"
              onClick={() => trackNavigation('Home', '/', 'main-navigation')}
            >
              <span className="relative z-10">Home</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/10 group-hover:to-purple-500/10 rounded-lg transition-all duration-300"></div>
            </Link>
            <Link
              href="/properties"
              className="relative px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-700 transition-all duration-300 group rounded-lg hover:bg-white/60 hover:shadow-md hover:scale-105"
              onClick={() => trackNavigation('Properties', '/properties', 'main-navigation')}
            >
              <span className="relative z-10">Properties</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/10 group-hover:to-purple-500/10 rounded-lg transition-all duration-300"></div>
            </Link>
            <Link
              href="/gallery"
              className="relative px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-700 transition-all duration-300 group rounded-lg hover:bg-white/60 hover:shadow-md hover:scale-105"
              onClick={() => trackNavigation('Gallery', '/gallery', 'main-navigation')}
            >
              <span className="relative z-10">Gallery</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/10 group-hover:to-purple-500/10 rounded-lg transition-all duration-300"></div>
            </Link>
            <Link
              href="/about"
              className="relative px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-700 transition-all duration-300 group rounded-lg hover:bg-white/60 hover:shadow-md hover:scale-105"
              onClick={() => trackNavigation('About', '/about', 'main-navigation')}
            >
              <span className="relative z-10">About</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/10 group-hover:to-purple-500/10 rounded-lg transition-all duration-300"></div>
            </Link>
            <Link
              href="/contact"
              className="relative px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-700 transition-all duration-300 group rounded-lg hover:bg-white/60 hover:shadow-md hover:scale-105"
              onClick={() => trackNavigation('Contact', '/contact', 'main-navigation')}
            >
              <span className="relative z-10">Contact</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/10 group-hover:to-purple-500/10 rounded-lg transition-all duration-300"></div>
            </Link>
          </nav>

          <div className="hidden md:flex items-center justify-end" data-section="auth-navigation">
            {showAuthUI && isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 p-2 rounded-xl hover:bg-white/60 hover:shadow-md transition-all duration-300 group"
                >
                  <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                    <span className="text-white text-sm font-medium">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-medium hidden lg:block bg-gradient-to-r from-gray-700 to-gray-800 bg-clip-text text-transparent">{user?.name}</span>
                  <svg className="h-4 w-4 text-gray-500 group-hover:text-blue-600 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-3 w-56 rounded-2xl shadow-2xl bg-white/95 backdrop-blur-md border border-gray-200/50 z-50 overflow-hidden">
                    <div className="py-2">
                      <Link href="/dashboard" className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-700 transition-all duration-300 group">
                        <svg className="h-4 w-4 mr-3 text-gray-400 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                        </svg>
                        User Dashboard
                      </Link>
                      {isAdmin && (
                        <Link href="/admin" className="flex items-center px-4 py-3 text-sm text-blue-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 transition-all duration-300 group">
                          <svg className="h-4 w-4 mr-3 text-blue-500 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Admin Panel
                        </Link>
                      )}
                      {isSalesManager && (
                        <Link href="/sales" className="flex items-center px-4 py-3 text-sm text-green-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 transition-all duration-300 group">
                          <svg className="h-4 w-4 mr-3 text-green-500 group-hover:text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          Sales Dashboard
                        </Link>
                      )}
                      <div className="border-t border-gray-200/50 my-2"></div>
                      <Link href="/dashboard/profile" className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 hover:text-blue-700 transition-all duration-300 group">
                        <svg className="h-4 w-4 mr-3 text-gray-400 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        My Profile
                      </Link>
                      <Link href="/dashboard/favorites" className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-purple-50 hover:text-purple-700 transition-all duration-300 group">
                        <svg className="h-4 w-4 mr-3 text-gray-400 group-hover:text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        My Favorites
                      </Link>
                      <div className="border-t border-gray-200/50 my-2"></div>
                      <button
                        onClick={logout}
                        className="flex items-center w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 transition-all duration-300 group"
                      >
                        <svg className="h-4 w-4 mr-3 text-red-500 group-hover:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : showAuthUI ? (
              <div className="flex items-center space-x-3">
                <Link href="/login" className="text-gray-700 hover:text-blue-700 text-sm font-medium px-3 py-2 rounded-lg hover:bg-white/60 hover:shadow-md transition-all duration-300">
                  Sign in
                </Link>
                <Link href="/signup" className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl hover:scale-105 transition-all duration-300">
                  Sign up
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-2 sm:space-x-4">
                <div className="w-12 h-6 sm:w-16 sm:h-8 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-16 h-6 sm:w-20 sm:h-8 bg-gray-200 rounded animate-pulse"></div>
              </div>
            )}
          </div>

          <div className="md:hidden">
            <button
              type="button"
              className="bg-white/80 backdrop-blur-sm rounded-xl p-2.5 inline-flex items-center justify-center text-gray-600 hover:text-blue-700 hover:bg-white/90 hover:shadow-lg touch-manipulation min-w-[44px] min-h-[44px] border border-gray-200/50 transition-all duration-300"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
            >
              <span className="sr-only">{isMenuOpen ? 'Close' : 'Open'} menu</span>
              {isMenuOpen ? (
                <svg className="h-5 w-5 transition-transform duration-300 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-5 w-5 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden animate-fade-in-down" id="mobile-menu">
            <div className="px-4 pt-4 pb-6 space-y-2 bg-white/95 backdrop-blur-md border-t border-gray-200/50 rounded-b-2xl shadow-2xl">
              <Link
                href="/"
                className="block px-4 py-3 text-base font-medium text-gray-700 hover:text-blue-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl touch-manipulation transition-all duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                🏠 Home
              </Link>
              <Link
                href="/properties"
                className="block px-4 py-3 text-base font-medium text-gray-700 hover:text-blue-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl touch-manipulation transition-all duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                🏢 Properties
              </Link>
              <Link
                href="/gallery"
                className="block px-4 py-3 text-base font-medium text-gray-700 hover:text-blue-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl touch-manipulation transition-all duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                🖼️ Gallery
              </Link>
              <Link
                href="/about"
                className="block px-4 py-3 text-base font-medium text-gray-700 hover:text-blue-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl touch-manipulation transition-all duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                ℹ️ About
              </Link>
              <Link
                href="/contact"
                className="block px-4 py-3 text-base font-medium text-gray-700 hover:text-blue-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl touch-manipulation transition-all duration-300"
                onClick={() => setIsMenuOpen(false)}
              >
                📞 Contact
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
                      <div className="text-sm font-medium text-gray-600">{user?.email}</div>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1">
                    <Link 
                      href="/dashboard" 
                      className="block px-4 py-3 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md touch-manipulation"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      User Dashboard
                    </Link>
                    {isAdmin && (
                      <Link 
                        href="/admin" 
                        className="block px-4 py-3 text-base font-medium text-blue-700 hover:text-blue-900 hover:bg-blue-50 rounded-md touch-manipulation"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Admin Panel
                      </Link>
                    )}
                    {isSalesManager && (
                      <Link 
                        href="/sales" 
                        className="block px-4 py-3 text-base font-medium text-green-700 hover:text-green-900 hover:bg-green-50 rounded-md touch-manipulation"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Sales Dashboard
                      </Link>
                    )}
                    <Link 
                      href="/dashboard/profile" 
                      className="block px-4 py-3 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md touch-manipulation"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      My Profile
                    </Link>
                    <Link 
                      href="/dashboard/favorites" 
                      className="block px-4 py-3 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md touch-manipulation"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      My Favorites
                    </Link>
                    <button
                      onClick={() => { logout(); setIsMenuOpen(false); }}
                      className="block w-full text-left px-4 py-3 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md touch-manipulation"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              ) : showAuthUI ? (
                <div className="border-t border-gray-200 pt-4 pb-3 space-y-1">
                  <Link 
                    href="/login" 
                    className="block px-4 py-3 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md touch-manipulation"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign in
                  </Link>
                  <Link 
                    href="/signup" 
                    className="block px-4 py-3 mx-3 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md touch-manipulation"
                    onClick={() => setIsMenuOpen(false)}
                  >
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