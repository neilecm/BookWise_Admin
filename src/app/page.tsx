"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Dashboard() {
  const [stats, setStats] = useState({
    users: 0,
    bookings: 0,
    revenue: 0,
    products: 0,
    languages: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/dashboard/stats");
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch stats", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const statCards = [
    {
      name: "Total Users",
      value: stats.users,
      icon: "👥",
      change: "Real-time",
      changeType: "neutral",
    },
    {
      name: "Total Bookings",
      value: stats.bookings,
      icon: "📅",
      change: "Real-time",
      changeType: "neutral",
    },
    {
      name: "Total Revenue",
      value: formatCurrency(stats.revenue),
      icon: "💰",
      change: "Real-time",
      changeType: "positive",
    },
    {
      name: "Active Products",
      value: stats.products,
      icon: "📦",
      change: "Affiliate",
      changeType: "neutral",
    },
    {
      name: "Languages",
      value: stats.languages,
      icon: "🌐",
      change: "Supported",
      changeType: "neutral",
    },
  ];

  return (
    <div className="px-4 py-6 sm:px-0">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {statCards.map((stat) => (
          <div
            key={stat.name}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-3xl">{stat.icon}</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {loading ? "..." : stat.value}
                      </div>
                      <div className="ml-2 flex items-baseline text-sm font-semibold text-gray-500">
                        {stat.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/products/new"
            className="flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            ➕ Add Product
          </Link>
          <Link
            href="/tools/link-generator"
            className="flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            🔗 Generate Link
          </Link>
          <Link
            href="/translations"
            className="flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            🌐 Manage Translations
          </Link>
          <Link
            href="/businesses"
            className="flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            🏢 View Businesses
          </Link>
        </div>
      </div>

      {/* Recent Activity (Placeholder for now, can be updated later) */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div className="flex items-center">
              <span className="text-2xl mr-3">🚀</span>
              <div>
                <p className="text-sm font-medium text-gray-900">System Online</p>
                <p className="text-xs text-gray-500">Real-time data connection active</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
