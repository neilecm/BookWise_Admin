import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status") || "";
    const offset = (page - 1) * limit;

    let bookings;
    let countResult;

    // Base query parts
    // Join customers to get customer details
    // Join services to get service name (if not in booking)
    // Join businesses to get business name
    const select = sql`
      SELECT 
        b.id, 
        b.start_time, 
        b.end_time, 
        b.total_amount, 
        b.status, 
        b.payment_status,
        b.created_at,
        COALESCE(b.customer_name, c.first_name || ' ' || c.last_name) as customer_name,
        c.email as customer_email,
        COALESCE(b.service_name, s.name) as service_name,
        bz.name as business_name
      FROM bookings b
      LEFT JOIN customers c ON b.customer_id = c.id
      LEFT JOIN services s ON b.service_id = s.id
      LEFT JOIN businesses bz ON b.business_id = bz.id
    `;

    if (status) {
      bookings = await sql`
        ${select}
        WHERE b.status = ${status}
        ORDER BY b.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      countResult = await sql`
        SELECT COUNT(*) as count FROM bookings WHERE status = ${status}
      `;
    } else {
      bookings = await sql`
        ${select}
        ORDER BY b.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      countResult = await sql`
        SELECT COUNT(*) as count FROM bookings
      `;
    }

    const total = parseInt(countResult[0].count);
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: bookings,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error: any) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
