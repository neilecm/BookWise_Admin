import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";

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
    const select = sql`
      SELECT 
        b.id, 
        b.start_time, 
        b.end_time, 
        b.total_amount, 
        b.status, 
        b.payment_status,
        b.created_at,
        u.name as customer_name,
        u.email as customer_email,
        s.name as service_name,
        bz.name as business_name
      FROM bookings b
      LEFT JOIN users u ON b.customer_id = u.id
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
