import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    
    if (!text) {
      return NextResponse.json({ error: "Text required" }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error("GOOGLE_API_KEY not configured");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      You are a product data extractor. I will give you raw text copied from a Shopee product page (Ctrl+A, Ctrl+C).
      Your job is to extract the following fields in JSON format:
      
      1. title: The full product title. It is usually at the very beginning or near the top.
      2. price: The price. Look for "Rp" followed by numbers (e.g., "Rp10.000", "Rp 50.000", "Rp1.200.000"). If there is a range, take the lowest price. Return it as a string like "Rp 50.000".
      3. description: The product description. Look for keywords like "Deskripsi Produk", "Spesifikasi", or long blocks of text after the title/price. Summarize it to 1-2 sentences if it's very long.

      Note: Image URLs are usually not present in raw text copies, so leave image as null.

      Here is the text:
      ${text.substring(0, 25000)}

      Return ONLY valid JSON.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();
    
    // Clean up markdown code blocks
    const jsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const extractedData = JSON.parse(jsonStr);

    return NextResponse.json({ success: true, data: extractedData });

  } catch (error: any) {
    console.error("Parse Text Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
