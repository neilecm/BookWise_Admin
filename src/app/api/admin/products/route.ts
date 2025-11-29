import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";

// GET /api/admin/products - List all products with pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const platform = searchParams.get("platform");
    const search = searchParams.get("search");
    const active = searchParams.get("active");
    
    const offset = (page - 1) * limit;
    
    // Build query
    let query = "SELECT * FROM affiliate_products WHERE 1=1";
    const params: any[] = [];
    let paramIndex = 1;
    
    if (platform) {
      query += ` AND platform = $${paramIndex}`;
      params.push(platform);
      paramIndex++;
    }
    
    if (search) {
      query += ` AND (title ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    
    if (active !== null && active !== undefined) {
      query += ` AND active = $${paramIndex}`;
      params.push(active === "true");
      paramIndex++;
    }
    
    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);
    
    const products = await sql.unsafe(query, params);
    
    // Get total count
    let countQuery = "SELECT COUNT(*) FROM affiliate_products WHERE 1=1";
    const countParams: any[] = [];
    let countParamIndex = 1;
    
    if (platform) {
      countQuery += ` AND platform = $${countParamIndex}`;
      countParams.push(platform);
      countParamIndex++;
    }
    
    if (search) {
      countQuery += ` AND (title ILIKE $${countParamIndex} OR description ILIKE $${countParamIndex})`;
      countParams.push(`%${search}%`);
      countParamIndex++;
    }
    
    if (active !== null && active !== undefined) {
      countQuery += ` AND active = $${countParamIndex}`;
      countParams.push(active === "true");
    }
    
    const [{ count }] = await sql.unsafe(countQuery, countParams);
    
    return NextResponse.json({
      success: true,
      products,
      pagination: {
        page,
        limit,
        total: parseInt(count),
        totalPages: Math.ceil(parseInt(count) / limit),
      },
    });
  } catch (error: any) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/admin/products - Create new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      subtitle,
      description,
      image_url,
      display_price,
      platform,
      affiliate_url,
      external_id,
      countries,
      service_tags,
      active,
      priority,
    } = body;
    
    // Validation
    if (!title || !platform || !affiliate_url) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: title, platform, affiliate_url" },
        { status: 400 }
      );
    }
    
    const [product] = await sql`
      INSERT INTO affiliate_products (
        title, subtitle, description, image_url, display_price,
        platform, affiliate_url, external_id,
        countries, service_tags, active, priority
      ) VALUES (
        ${title}, ${subtitle || null}, ${description || null},
        ${image_url || null}, ${display_price || null},
        ${platform}, ${affiliate_url}, ${external_id || null},
        ${countries || []}, ${service_tags || []},
        ${active !== undefined ? active : true},
        ${priority || 50}
      )
      RETURNING *
    `;
    
    return NextResponse.json({
      success: true,
      product,
    });
  } catch (error: any) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
