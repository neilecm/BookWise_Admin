'use client';

import { useEffect, useState } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function AnalyticsDashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/analytics')
            .then(res => res.json())
            .then(res => {
                if (res.success) {
                    setData(res.data);
                }
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <div className="p-8 text-center">Loading analytics...</div>;
    }

    if (!data) {
        return <div className="p-8 text-center text-red-500">Failed to load analytics data.</div>;
    }

    const { overview, trends, distribution } = data;

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
                    <p className="text-2xl font-bold mt-2">
                        ${overview.totalRevenue.toLocaleString()}
                    </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="text-sm font-medium text-gray-500">Total Bookings</h3>
                    <p className="text-2xl font-bold mt-2">
                        {overview.totalBookings.toLocaleString()}
                    </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="text-sm font-medium text-gray-500">Active Products</h3>
                    <p className="text-2xl font-bold mt-2">
                        {overview.activeProducts.toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Trend */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="text-lg font-semibold mb-4">Revenue Trend (30 Days)</h3>
                    <div className="h-80">
                        {trends.revenue && trends.revenue.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trends.revenue}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="date"
                                        tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    />
                                    <YAxis />
                                    <Tooltip
                                        formatter={(value: any) => [`$${value}`, 'Revenue']}
                                        labelFormatter={(label) => new Date(label).toLocaleDateString()}
                                    />
                                    <Area type="monotone" dataKey="total" stroke="#8884d8" fill="#8884d8" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400">
                                No revenue data available
                            </div>
                        )}
                    </div>
                </div>

                {/* Bookings Trend */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="text-lg font-semibold mb-4">Bookings Trend (30 Days)</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={trends.bookings}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                />
                                <YAxis />
                                <Tooltip
                                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                                />
                                <Bar dataKey="count" fill="#82ca9d" name="Bookings" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Status Distribution */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="text-lg font-semibold mb-4">Booking Status Distribution</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={distribution.status}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="count"
                                    nameKey="status"
                                >
                                    {distribution.status.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
