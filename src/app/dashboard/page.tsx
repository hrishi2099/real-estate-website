"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const recentActivity = [
  {
    id: 1,
    action: "Saved land plot",
    property: "Premium Residential Plot in Green Valley",
    date: "2 hours ago",
    type: "save"
  },
  {
    id: 2,
    action: "Viewed property",
    property: "Commercial Development Land in Business District",
    date: "1 day ago",
    type: "view"
  },
  {
    id: 3,
    action: "Contacted agent",
    property: "Farmland Investment Plot in Rural County",
    date: "3 days ago",
    type: "contact"
  }
];

const savedProperties = [
  {
    id: 1,
    title: "Premium Residential Plot",
    price: "₹2,85,00,000",
    location: "Green Valley, CA",
    area: "8,500 sqft",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2232&q=80",
    savedDate: "2 days ago"
  },
  {
    id: 2,
    title: "Commercial Development Land",
    price: "₹7,50,00,000",
    location: "Business District, TX",
    area: "12,000 sqft",
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80",
    savedDate: "1 week ago"
  }
];

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading, isHydrated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isHydrated && !isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, isHydrated, router]);

  if (!isHydrated || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (isHydrated && !isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user?.name}!
              </h1>
              <p className="mt-2 text-gray-600">
                Manage your land investments and track your property interests
              </p>
            </div>
            <Link
              href="/properties"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Browse Land Plots
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-2xl font-bold text-gray-900">{savedProperties.length}</h3>
                    <p className="text-gray-600">Saved Plots</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-2xl font-bold text-gray-900">12</h3>
                    <p className="text-gray-600">Properties Viewed</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <svg className="h-6 w-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-2xl font-bold text-gray-900">3</h3>
                    <p className="text-gray-600">Agent Contacts</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className={`p-2 rounded-full ${
                        activity.type === 'save' ? 'bg-blue-100' :
                        activity.type === 'view' ? 'bg-green-100' : 'bg-orange-100'
                      }`}>
                        {activity.type === 'save' && (
                          <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        )}
                        {activity.type === 'view' && (
                          <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        )}
                        {activity.type === 'contact' && (
                          <svg className="h-4 w-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">{activity.action}</span> &ldquo;{activity.property}&rdquo;
                        </p>
                        <p className="text-xs text-gray-500">{activity.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center">
                  <span className="text-white text-lg font-medium">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{user?.name}</h3>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
              </div>
              <div className="mt-4">
                <Link
                  href="/dashboard/profile"
                  className="w-full inline-flex justify-center items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Edit Profile
                </Link>
              </div>
            </div>

            {/* Saved Properties */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Saved Plots</h3>
                <Link href="/dashboard/favorites" className="text-sm text-blue-600 hover:text-blue-500">
                  View all
                </Link>
              </div>
              <div className="p-4 space-y-4">
                {savedProperties.map((property) => (
                  <div key={property.id} className="flex space-x-3">
                    <div className="relative h-16 w-16 rounded-lg overflow-hidden">
                      <Image
                        src={property.image}
                        alt={property.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {property.title}
                      </p>
                      <p className="text-sm text-gray-500">{property.location}</p>
                      <p className="text-sm font-medium text-blue-600">{property.price}</p>
                      <p className="text-xs text-gray-400">Saved {property.savedDate}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  href="/properties"
                  className="w-full inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Browse New Plots
                </Link>
                <Link
                  href="/contact"
                  className="w-full inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Contact Support
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}