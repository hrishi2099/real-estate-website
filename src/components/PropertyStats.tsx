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
        const response = await fetch('/api/analytics/stats');
        if (response.ok) {
          const data: StatsResponse = await response.json();
          setStats(data.stats);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Fallback to static data if API fails
        setStats([
          {
            id: 1,
            number: 0,
            label: "Land Plots Sold",
            suffix: "+",
            icon: "🌿",
            description: "Successfully transferred land parcels"
          },
          {
            id: 2,
            number: 0,
            label: "Million Sq Ft Sold",
            prefix: "",
            suffix: "M+",
            icon: "📏",
            description: "Total land area transferred"
          },
          {
            id: 3,
            number: 15,
            label: "Years Experience",
            suffix: "+",
            icon: "⏰",
            description: "In land development market"
          },
          {
            id: 4,
            number: 97,
            label: "Client Satisfaction",
            suffix: "%",
            icon: "⭐",
            description: "Happy landowners rating"
          },
          {
            id: 5,
            number: 0,
            label: "Available Plots",
            suffix: "+",
            icon: "🏗️",
            description: "Ready for development"
          },
          {
            id: 6,
            number: 30,
            label: "Days Average Sale",
            suffix: "",
            icon: "📈",
            description: "Time to complete transaction"
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
    <div id="property-stats" className="py-16 bg-blue-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Leading Land Development Solutions
          </h2>
          <p className="mt-4 text-xl text-blue-100">
            Trusted by investors and developers across the region
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            // Loading skeleton
            [1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="text-center p-6 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 animate-pulse">
                <div className="text-4xl mb-4">⏳</div>
                <div className="h-12 bg-white/20 rounded mb-2"></div>
                <div className="h-6 bg-white/20 rounded mb-2"></div>
                <div className="h-4 bg-white/20 rounded"></div>
              </div>
            ))
          ) : (
            stats.map((stat, index) => (
              <div
                key={stat.id}
                className={`text-center p-6 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 transform transition-all duration-500 hover:scale-105 hover:bg-white/20 ${
                  isVisible 
                    ? 'translate-y-0 opacity-100' 
                    : 'translate-y-8 opacity-0'
                }`}
                style={{
                  transitionDelay: `${index * 100}ms`
                }}
              >
                <div className="text-4xl mb-4">{stat.icon}</div>
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">
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
                <div className="text-lg font-semibold text-blue-100 mb-2">
                  {stat.label}
                </div>
                <div className="text-sm text-blue-200">
                  {stat.description}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-12 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-4">
              Ready to Join Our Success Stories?
            </h3>
            <p className="text-blue-100 mb-6">
              Let our proven track record work for you. Whether investing in land or developing property, 
              we&apos;ll help you achieve your land acquisition goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/properties"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 transition-colors"
              >
                Browse Land Plots
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-3 border-2 border-white text-base font-medium rounded-md text-white hover:bg-white hover:text-blue-600 transition-colors"
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