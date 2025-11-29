import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const [product] = await sql`SELECT * FROM affiliate_products WHERE id = ${params.id}`;
    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { title, subtitle, description, image_url, display_price, platform, affiliate_url, external_id, countries, service_tags, active, priority } = body;
    
    const [existing] = await sql`SELECT id FROM affiliate_products WHERE id = ${params.id}`;
    if (!existing) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }
    
    const [product] = await sql`
      UPDATE affiliate_products SET
        title = ${title}, subtitle = ${subtitle || null}, description = ${description || null},
        image_url = ${image_url || null}, display_price = ${display_price || null},
        platform = ${platform}, affiliate_url = ${affiliate_url}, external_id = ${external_id || null},
        countries = ${countries || []}, service_tags = ${service_tags || []},
        active = ${active !== undefined ? active : true}, priority = ${priority || 50},
        updated_at = NOW()
      WHERE id = ${params.id} RETURNING *
    `;
    
    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const [existing] = await sql`SELECT id FROM affiliate_products WHERE id = ${params.id}`;
    if (!existing) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }
    
    await sql`UPDATE affiliate_products SET active = false, updated_at = NOW() WHERE id = ${params.id}`;
    return NextResponse.json({ success: true, message: "Product deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
