"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Stat {
  id: number;
  number: number;
  label: string;
  suffix: string;
  prefix?: string;
  icon: string;
  description: string;
}

interface StatsResponse {
  stats: Stat[];
}

interface CountUpProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}

function CountUp({ end, duration = 2000, prefix = "", suffix = "" }: CountUpProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentCount = Math.floor(easeOutQuart * end);
      
      setCount(currentCount);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    const startAnimation = () => {
      animationFrame = requestAnimationFrame(animate);
    };

    // Add a small delay to ensure hydration is complete
    const timer = setTimeout(startAnimation, 100);

    return () => {
      clearTimeout(timer);
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [end, duration]);

  const formatNumber = (num: number) => {
    if (end >= 1000000000) {
      return (num / 1000000000).toFixed(1);
    } else if (end >= 1000000) {
      return (num / 1000000).toFixed(1);
    } else if (end >= 1000) {
      return (num / 1000).toFixed(1);
    }
    return num.toString();
  };

  return (
    <span>
      {prefix}{formatNumber(count)}{suffix}
    </span>
  );
}

export default function PropertyStats() {
  const [isVisible, setIsVisible] = useState(false);
  const [stats, setStats] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/analytics/stats', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data: StatsResponse = await response.json();
          setStats(data.stats);
        } else {
          throw new Error(`API responded with status ${response.status}`);
        }
      } catch (error) {
        if (typeof console !== 'undefined' && console.error) {
          console.error('Error fetching stats:', error);
        }
        // Fallback to static data if API fails
        setStats([
          {
            id: 1,
            number: 250,
            label: "Properties Sold",
            suffix: "+",
            icon: "🏠",
            description: "Successfully closed deals and happy new landowners."
          },
          {
            id: 2,
            number: 5.2,
            label: "Million Sq Ft Sold",
            prefix: "",
            suffix: "M+",
            icon: "📏",
            description: "Vast expanse of land successfully transferred to our clients."
          },
          {
            id: 3,
            number: 15,
            label: "Years Experience",
            suffix: "+",
            icon: "⏰",
            description: "Decades of expertise in the real estate market."
          },
          {
            id: 4,
            number: 97,
            label: "Client Satisfaction",
            suffix: "%",
            icon: "⭐",
            description: "Our commitment to excellence reflects in our client feedback."
          },
          {
            id: 5,
            number: 45,
            label: "Available Properties",
            suffix: "+",
            icon: "🏗️",
            description: "A wide range of properties ready for you to own."
          },
          {
            id: 6,
            number: 30,
            label: "Days Average Sale",
            suffix: "",
            icon: "📈",
            description: "Efficient and streamlined process to get you your property faster."
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('property-stats');
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  return (
    <div id="property-stats" className="py-8 sm:py-12 lg:py-16 bg-blue-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
            Leading Real Estate Solutions
          </h2>
          <p className="mt-2 sm:mt-4 text-base sm:text-lg lg:text-xl text-blue-100">
            Our numbers speak for themselves. We are a trusted partner for property buyers and investors, delivering exceptional results and unparalleled service.
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {loading ? (
            // Loading skeleton
            [1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="text-center p-3 sm:p-4 lg:p-6 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 animate-pulse">
                <div className="text-2xl sm:text-3xl lg:text-4xl mb-2 sm:mb-4">⏳</div>
                <div className="h-8 sm:h-10 lg:h-12 bg-white/20 rounded mb-2"></div>
                <div className="h-4 sm:h-5 lg:h-6 bg-white/20 rounded mb-2"></div>
                <div className="h-3 sm:h-4 bg-white/20 rounded"></div>
              </div>
            ))
          ) : (
            stats.map((stat, index) => (
              <div
                key={stat.id}
                className={`text-center p-3 sm:p-4 lg:p-6 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 transform transition-all duration-500 hover:scale-105 hover:bg-white/20 ${
                  isVisible 
                    ? 'translate-y-0 opacity-100' 
                    : 'translate-y-8 opacity-0'
                }`}
                style={{
                  transitionDelay: `${index * 100}ms`
                }}
              >
                <div className="text-2xl sm:text-3xl lg:text-4xl mb-2 sm:mb-4">{stat.icon}</div>
                <div className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-1 sm:mb-2">
                  {isVisible && isHydrated ? (
                    <CountUp 
                      end={stat.number} 
                      prefix={stat.prefix || ""} 
                      suffix={stat.suffix}
                      duration={2000 + index * 200}
                    />
                  ) : (
                    <span>{stat.prefix || ""}0{stat.suffix}</span>
                  )}
                </div>
                <div className="text-xs sm:text-sm lg:text-lg font-semibold text-blue-100 mb-1 sm:mb-2">
                  {stat.label}
                </div>
                <div className="text-xs sm:text-sm text-blue-200 hidden sm:block">
                  {stat.description}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-8 sm:mt-12 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 sm:p-6 border border-white/20">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-3 sm:mb-4">
              Your Success Story Starts Here
            </h3>
            <p className="text-sm sm:text-base text-blue-100 mb-4 sm:mb-6 leading-relaxed">
              Our proven track record of success is your guarantee of a seamless and rewarding experience. Whether you're buying, selling, or investing, we are committed to helping you achieve your real estate goals and build a prosperous future.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link
                href="/properties"
                className="inline-flex items-center justify-center px-4 py-2.5 sm:px-6 sm:py-3 border border-transparent text-sm sm:text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 transition-colors touch-manipulation"
              >
                Browse Properties
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-4 py-2.5 sm:px-6 sm:py-3 border-2 border-white text-sm sm:text-base font-medium rounded-md text-white hover:bg-white hover:text-blue-600 transition-colors touch-manipulation"
              >
                Contact Our Team
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}