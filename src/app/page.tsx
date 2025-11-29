"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface DashboardStats {
  totalUsers: number;
  totalBookings: number;
  totalRevenue: number;
  affiliateClicks: number;
  activeProducts: number;
  activeLanguages: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalBookings: 0,
    totalRevenue: 0,
    affiliateClicks: 0,
    activeProducts: 0,
    activeLanguages: 5,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // In production, fetch from API
      // For now, using mock data
      setStats({
        totalUsers: 1247,
        totalBookings: 856,
        totalRevenue: 45230,
        affiliateClicks: 3421,
        activeProducts: 0,
        activeLanguages: 5,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      name: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      icon: "👥",
      change: "+12%",
      changeType: "positive",
    },
    {
      name: "Total Bookings",
      value: stats.totalBookings.toLocaleString(),
      icon: "📅",
      change: "+8%",
      changeType: "positive",
    },
    {
      name: "Revenue",
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: "💰",
      change: "+15%",
      changeType: "positive",
    },
    {
      name: "Affiliate Clicks",
      value: stats.affiliateClicks.toLocaleString(),
      icon: "🔗",
      change: "+23%",
      changeType: "positive",
    },
    {
      name: "Active Products",
      value: stats.activeProducts.toLocaleString(),
      icon: "📦",
      change: "0",
      changeType: "neutral",
    },
    {
      name: "Languages",
      value: stats.activeLanguages.toLocaleString(),
      icon: "🌐",
      change: "0",
      changeType: "neutral",
    },
  ];

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Platform overview and key metrics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {statCards.map((stat) => (
          <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
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
                      <div
                        className={`ml-2 flex items-baseline text-sm font-semibold ${
                          stat.changeType === "positive"
                            ? "text-green-600"
                            : stat.changeType === "negative"
                            ? "text-red-600"
                            : "text-gray-500"
                        }`}
                      >
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
            href="/products"
            className="flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            📦 View Products
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div className="flex items-center">
              <span className="text-2xl mr-3">📦</span>
              <div>
                <p className="text-sm font-medium text-gray-900">Product added</p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div className="flex items-center">
              <span className="text-2xl mr-3">🌐</span>
              <div>
                <p className="text-sm font-medium text-gray-900">Translation updated</p>
                <p className="text-xs text-gray-500">5 hours ago</p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center">
              <span className="text-2xl mr-3">🔗</span>
              <div>
                <p className="text-sm font-medium text-gray-900">Affiliate link generated</p>
                <p className="text-xs text-gray-500">1 day ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
