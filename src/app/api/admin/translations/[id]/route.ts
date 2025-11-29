import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { value, context } = body;
    
    const [translation] = await sql`
      UPDATE translations
      SET value = ${value}, context = ${context || null}, updated_at = NOW()
      WHERE id = ${params.id}
      RETURNING *
    `;
    
    if (!translation) {
      return NextResponse.json(
        { success: false, error: "Translation not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, translation });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await sql`DELETE FROM translations WHERE id = ${params.id}`;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
