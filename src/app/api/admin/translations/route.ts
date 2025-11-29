import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";

// GET /api/admin/translations - List all translations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const language_code = searchParams.get("language_code");
    const search = searchParams.get("search");
    
    let query = "SELECT * FROM translations WHERE 1=1";
    const params: any[] = [];
    let paramIndex = 1;
    
    if (language_code) {
      query += ` AND language_code = $${paramIndex}`;
      params.push(language_code);
      paramIndex++;
    }
    
    if (search) {
      query += ` AND (key ILIKE $${paramIndex} OR value ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    
    query += " ORDER BY key ASC";
    
    const translations = await sql.unsafe(query, params);
    
    return NextResponse.json({
      success: true,
      translations,
    });
  } catch (error: any) {
    console.error("Error fetching translations:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/admin/translations - Create translation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, language_code, value, context } = body;
    
    if (!key || !language_code || !value) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: key, language_code, value" },
        { status: 400 }
      );
    }
    
    const [translation] = await sql`
      INSERT INTO translations (key, language_code, value, context)
      VALUES (${key}, ${language_code}, ${value}, ${context || null})
      RETURNING *
    `;
    
    return NextResponse.json({
      success: true,
      translation,
    });
  } catch (error: any) {
    console.error("Error creating translation:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
