import { NextResponse } from "next/server";
import sql from "@/lib/db";

export async function GET() {
  try {
    // Run queries in parallel for performance
    // Note: Users table is in a different schema/db, so we skip counting users for now to avoid 500 error
    const [
      bookingsResult,
      revenueResult,
      productsResult,
      languagesResult
    ] = await Promise.all([
      sql`SELECT COUNT(*) as count FROM bookings`,
      sql`SELECT COALESCE(SUM(amount_net), 0) as total FROM payments WHERE status = 'captured'`,
      sql`SELECT COUNT(*) as count FROM affiliate_products`,
      sql`SELECT COUNT(*) as count FROM languages`
    ]);

    const stats = {
      users: 0, // Placeholder until we have access to users table
      bookings: parseInt(bookingsResult[0].count),
      revenue: parseFloat(revenueResult[0].total),
      products: parseInt(productsResult[0].count),
      languages: parseInt(languagesResult[0].count)
    };

    return NextResponse.json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
