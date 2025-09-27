"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface EventPhoto {
  id: string;
  url: string;
  title: string;
  date: string;
  description: string;
  category: string;
}

interface SectionInfo {
  title: string;
  subtitle: string;
  description: string;
}

export default function PastEventsShowcase() {
  const [selectedEvent, setSelectedEvent] = useState<EventPhoto | null>(null);
  const [hoveredEvent, setHoveredEvent] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [pastEvents, setPastEvents] = useState<EventPhoto[]>([]);
  const [sectionInfo, setSectionInfo] = useState<SectionInfo>({
    title: "Memorable Moments",
    subtitle: "Our Journey",
    description: "Loading our memorable moments..."
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/api/admin/memorable-moments');
        if (response.ok) {
          const data = await response.json();
          setPastEvents(data.events || []);
          setSectionInfo(data.sectionInfo || sectionInfo);
        } else {
          // Fallback to static import if API fails
          const staticData = await import('@/data/memorableMoments.json');
          setPastEvents(staticData.events || []);
          setSectionInfo(staticData.sectionInfo || sectionInfo);
        }
      } catch (error) {
        console.error('Error loading memorable moments:', error);
        // Fallback to static import
        try {
          const staticData = await import('@/data/memorableMoments.json');
          setPastEvents(staticData.events || []);
          setSectionInfo(staticData.sectionInfo || sectionInfo);
        } catch (fallbackError) {
          console.error('Error loading fallback data:', fallbackError);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % pastEvents.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [pastEvents.length]);

  const handleEventClick = (event: EventPhoto) => {
    setSelectedEvent(event);
  };

  const closeModal = () => {
    setSelectedEvent(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') closeModal();
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mx-auto mb-8"></div>
            <div className="h-64 bg-gray-200 rounded-3xl mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-80 bg-gray-200 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show empty state if no events
  if (!pastEvents.length) {
    return (
      <div className="py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">No Memorable Moments Yet</h2>
          <p className="text-gray-600">Check back soon for updates!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-16 -left-16 w-96 h-96 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
        <div className="absolute -bottom-16 -right-16 w-96 h-96 bg-gradient-to-r from-pink-400 to-yellow-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-green-400 to-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-white font-semibold text-sm mb-6 shadow-lg transform hover:scale-105 transition-transform duration-300">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {sectionInfo.subtitle}
          </div>
          <h2 className="text-5xl md:text-6xl font-heading font-bold text-gray-900 mb-6">
            {sectionInfo.title.split(' ')[0]}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> {sectionInfo.title.split(' ').slice(1).join(' ')}</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-sans">
            {sectionInfo.description}
          </p>
        </div>

        {/* Featured Hero Image with Auto-rotation */}
        <div className="mb-16">
          <div className="relative h-96 md:h-[500px] rounded-3xl overflow-hidden shadow-2xl group">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10"></div>
            <Image
              src={pastEvents[currentImageIndex].url}
              alt={pastEvents[currentImageIndex].title}
              fill
              className="object-cover transition-all duration-1000 group-hover:scale-110"
            />

            {/* Content Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white z-20">
              <div className="max-w-2xl">
                <div className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-4">
                  {pastEvents[currentImageIndex].category}
                </div>
                <h3 className="text-3xl md:text-4xl font-bold mb-3">
                  {pastEvents[currentImageIndex].title}
                </h3>
                <p className="text-lg text-gray-200 mb-4">
                  {pastEvents[currentImageIndex].description}
                </p>
                <div className="flex items-center text-sm text-gray-300">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {pastEvents[currentImageIndex].date}
                </div>
              </div>
            </div>

            {/* Image Navigation Dots */}
            <div className="absolute bottom-6 right-6 flex space-x-2 z-30">
              {pastEvents.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentImageIndex
                      ? 'bg-white scale-125'
                      : 'bg-white/50 hover:bg-white/75'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Interactive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pastEvents.map((event, index) => (
            <div
              key={event.id}
              className="group cursor-pointer"
              onMouseEnter={() => setHoveredEvent(event.id)}
              onMouseLeave={() => setHoveredEvent(null)}
              onClick={() => handleEventClick(event)}
            >
              <div className={`relative h-80 rounded-2xl overflow-hidden shadow-lg transition-all duration-500 transform ${
                hoveredEvent === event.id ? 'scale-105 shadow-2xl' : 'hover:scale-102'
              }`}>
                {/* Unique Border Animation */}
                <div className={`absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl transition-opacity duration-300 ${
                  hoveredEvent === event.id ? 'opacity-100' : 'opacity-0'
                }`} style={{ padding: '3px' }}>
                  <div className="h-full w-full bg-white rounded-2xl"></div>
                </div>

                <div className="relative h-full rounded-2xl overflow-hidden">
                  <Image
                    src={event.url}
                    alt={event.title}
                    fill
                    className={`object-cover transition-all duration-500 ${
                      hoveredEvent === event.id ? 'scale-110 blur-sm' : ''
                    }`}
                  />

                  {/* Gradient Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300 ${
                    hoveredEvent === event.id ? 'opacity-100' : 'opacity-60'
                  }`}></div>

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <div className={`transform transition-all duration-300 ${
                      hoveredEvent === event.id ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-90'
                    }`}>
                      <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium mb-3">
                        {event.category}
                      </div>
                      <h3 className="text-xl font-bold mb-2 line-clamp-2">
                        {event.title}
                      </h3>
                      {hoveredEvent === event.id && (
                        <p className="text-sm text-gray-200 mb-3 transition-all duration-300 opacity-100 line-clamp-3">
                          {event.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-300">{event.date}</span>
                        <div className={`transform transition-all duration-300 ${
                          hoveredEvent === event.id ? 'translate-x-0 opacity-100' : 'translate-x-2 opacity-60'
                        }`}>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Decorative Corner Element */}
                  <div className={`absolute top-4 right-4 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 ${
                    hoveredEvent === event.id ? 'scale-125 rotate-45' : ''
                  }`}>
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-20 text-center">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-12 relative overflow-hidden shadow-2xl">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.2'%3E%3Cpath d='M20 20c0 4.4-3.6 8-8 8s-8-3.6-8-8 3.6-8 8-8 8 3.6 8 8zm0-20c0 4.4-3.6 8-8 8s-8-3.6-8-8 3.6-8 8-8 8 3.6 8 8z'/%3E%3C/g%3E%3C/svg%3E")`
              }}></div>
            </div>

            <div className="relative z-10">
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Be Part of Our Next Chapter
              </h3>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Join us in creating more memorable moments. Discover exclusive opportunities and become part of our growing community.
              </p>
              <button className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 shadow-lg">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Explore Opportunities
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Event Details */}
      {selectedEvent && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4"
          onClick={closeModal}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          <div
            className="bg-white rounded-3xl max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl transform transition-all duration-300 scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-96">
              <Image
                src={selectedEvent.url}
                alt={selectedEvent.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
              >
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                <div className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-4">
                  {selectedEvent.category}
                </div>
                <h3 className="text-4xl font-bold mb-4">{selectedEvent.title}</h3>
                <div className="flex items-center text-gray-200">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {selectedEvent.date}
                </div>
              </div>
            </div>
            <div className="p-8">
              <p className="text-lg text-gray-700 leading-relaxed">
                {selectedEvent.description}
              </p>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(1deg); }
          66% { transform: translateY(10px) rotate(-1deg); }
        }

        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(10px) rotate(-1deg); }
          66% { transform: translateY(-10px) rotate(1deg); }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 6s ease-in-out infinite;
          animation-delay: 2s;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}