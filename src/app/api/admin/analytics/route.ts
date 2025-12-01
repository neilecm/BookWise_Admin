import { NextResponse } from "next/server";
import sql from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // 1. Overview Stats
        const [
            totalRevenueResult,
            totalBookingsResult,
            activeProductsResult
        ] = await Promise.all([
            sql`SELECT COALESCE(SUM(amount_net), 0) as total FROM payments WHERE status = 'captured'`,
            sql`SELECT COUNT(*) as count FROM bookings`,
            sql`SELECT COUNT(*) as count FROM affiliate_products WHERE active = true`
        ]);

        // 2. Revenue Trend (Last 30 Days) - Using generate_series for continuous dates
        const revenueTrend = await sql`
      WITH dates AS (
        SELECT generate_series(
          NOW() - INTERVAL '29 days',
          NOW(),
          '1 day'::interval
        )::date AS date
      )
      SELECT 
        TO_CHAR(dates.date, 'YYYY-MM-DD') as date,
        COALESCE(SUM(payments.amount_net), 0) as total
      FROM dates
      LEFT JOIN payments ON 
        TO_CHAR(payments.created_at, 'YYYY-MM-DD') = TO_CHAR(dates.date, 'YYYY-MM-DD') AND
        payments.status = 'captured'
      GROUP BY dates.date
      ORDER BY dates.date ASC
    `;

        // 3. Bookings Trend (Last 30 Days) - Using generate_series for continuous dates
        const bookingsTrend = await sql`
      WITH dates AS (
        SELECT generate_series(
          NOW() - INTERVAL '29 days',
          NOW(),
          '1 day'::interval
        )::date AS date
      )
      SELECT 
        TO_CHAR(dates.date, 'YYYY-MM-DD') as date,
        COALESCE(COUNT(bookings.id), 0) as count
      FROM dates
      LEFT JOIN bookings ON TO_CHAR(bookings.created_at, 'YYYY-MM-DD') = TO_CHAR(dates.date, 'YYYY-MM-DD')
      GROUP BY dates.date
      ORDER BY dates.date ASC
    `;

        // 4. Status Distribution
        const statusDistribution = await sql`
      SELECT 
        status,
        COUNT(*) as count
      FROM bookings 
      GROUP BY status
    `;

        // Helper to safely parse numbers
        const parseNum = (val: any) => Number(val) || 0;

        return NextResponse.json({
            success: true,
            data: {
                overview: {
                    totalRevenue: parseNum(totalRevenueResult[0].total),
                    totalBookings: parseNum(totalBookingsResult[0].count),
                    activeProducts: parseNum(activeProductsResult[0].count)
                },
                trends: {
                    revenue: revenueTrend.map(item => ({
                        date: item.date,
                        total: parseNum(item.total)
                    })),
                    bookings: bookingsTrend.map(item => ({
                        date: item.date,
                        count: parseNum(item.count)
                    }))
                },
                distribution: {
                    status: statusDistribution.map(item => ({
                        status: item.status,
                        count: parseNum(item.count)
                    }))
                }
            }
        });
    } catch (error: any) {
        console.error("Error fetching analytics:", error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
