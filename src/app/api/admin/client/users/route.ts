import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const offset = (page - 1) * limit;

    let users;
    let countResult;

    if (search) {
      users = await sql`
        SELECT id, name, email, avatar, created_at, active_business_id
        FROM users
        WHERE name ILIKE ${'%' + search + '%'} OR email ILIKE ${'%' + search + '%'}
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      countResult = await sql`
        SELECT COUNT(*) as count
        FROM users
        WHERE name ILIKE ${'%' + search + '%'} OR email ILIKE ${'%' + search + '%'}
      `;
    } else {
      users = await sql`
        SELECT id, name, email, avatar, created_at, active_business_id
        FROM users
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      countResult = await sql`
        SELECT COUNT(*) as count FROM users
      `;
    }

    const total = parseInt(countResult[0].count);
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error: any) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
