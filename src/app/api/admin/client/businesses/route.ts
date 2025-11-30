import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const offset = (page - 1) * limit;

    let businesses;
    let countResult;

    // Base query parts
    // We use COALESCE to handle cases with no payments/bookings
    // We join businesses -> users (owner)
    // We join businesses -> bookings -> payments to calculate revenue
    
    if (search) {
      businesses = await sql`
        SELECT 
          b.id, 
          b.name, 
          b.created_at,
          u.name as owner_name, 
          u.email as owner_email,
          COALESCE(SUM(p.amount_net), 0) as total_revenue,
          COUNT(DISTINCT bk.id) as total_bookings
        FROM businesses b
        LEFT JOIN users u ON b.owner_id = u.id
        LEFT JOIN bookings bk ON b.id = bk.business_id
        LEFT JOIN payments p ON bk.id = p.booking_id AND p.status = 'captured'
        WHERE b.name ILIKE ${'%' + search + '%'}
        GROUP BY b.id, u.id
        ORDER BY total_revenue DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      
      countResult = await sql`
        SELECT COUNT(*) as count 
        FROM businesses 
        WHERE name ILIKE ${'%' + search + '%'}
      `;
    } else {
      businesses = await sql`
        SELECT 
          b.id, 
          b.name, 
          b.created_at,
          u.name as owner_name, 
          u.email as owner_email,
          COALESCE(SUM(p.amount_net), 0) as total_revenue,
          COUNT(DISTINCT bk.id) as total_bookings
        FROM businesses b
        LEFT JOIN users u ON b.owner_id = u.id
        LEFT JOIN bookings bk ON b.id = bk.business_id
        LEFT JOIN payments p ON bk.id = p.booking_id AND p.status = 'captured'
        GROUP BY b.id, u.id
        ORDER BY total_revenue DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      
      countResult = await sql`
        SELECT COUNT(*) as count FROM businesses
      `;
    }

    const total = parseInt(countResult[0].count);
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: businesses,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error: any) {
    console.error("Error fetching businesses:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
