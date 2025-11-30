import { NextRequest, NextResponse } from "next/server";
import aws4 from "aws4";

export async function POST(req: NextRequest) {
  try {
    const { asin } = await req.json();

    if (!asin) {
      return NextResponse.json(
        { success: false, error: "ASIN is required" },
        { status: 400 }
      );
    }

    const accessKey = process.env.AMAZON_ACCESS_KEY;
    const secretKey = process.env.AMAZON_SECRET_KEY;
    const partnerTag = process.env.AMAZON_PARTNER_TAG;
    const region = process.env.AMAZON_REGION || "us-east-1";

    if (!accessKey || !secretKey || !partnerTag) {
      return NextResponse.json(
        { success: false, error: "Amazon API credentials not configured" },
        { status: 500 }
      );
    }

    const host = `webservices.amazon.com`;
    const path = `/paapi5/getitems`;
    const target = `com.amazon.paapi5.v1.ProductAdvertisingAPIv1.GetItems`;

    const payload = {
      ItemIds: [asin],
      ItemIdType: "ASIN",
      PartnerTag: partnerTag,
      PartnerType: "Associates",
      Marketplace: "www.amazon.com",
      Resources: [
        "ItemInfo.Title",
        "Images.Primary.Large",
        "Offers.Listings.Price"
      ]
    };

    const body = JSON.stringify(payload);

    const opts = {
      host,
      path,
      service: "ProductAdvertisingAPI",
      region,
      method: "POST",
      body,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "content-encoding": "amz-1.0",
        "x-amz-target": target,
      },
    };

    // Sign the request
    aws4.sign(opts, { accessKeyId: accessKey, secretAccessKey: secretKey });

    const response = await fetch(`https://${host}${path}`, {
      method: "POST",
      headers: opts.headers as HeadersInit,
      body: body,
    });

    const data = await response.json();

    if (data.ItemsResult && data.ItemsResult.Items && data.ItemsResult.Items.length > 0) {
      const item = data.ItemsResult.Items[0];
      
      return NextResponse.json({
        success: true,
        data: {
          title: item.ItemInfo?.Title?.DisplayValue || "",
          image: item.Images?.Primary?.Large?.URL || "",
          price: item.Offers?.Listings?.[0]?.Price?.DisplayAmount || "",
          url: item.DetailPageURL || `https://www.amazon.com/dp/${asin}?tag=${partnerTag}`
        }
      });
    } else if (data.Errors) {
      return NextResponse.json(
        { success: false, error: data.Errors[0].Message },
        { status: 400 }
      );
    } else {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

  } catch (error: any) {
    console.error("Server Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
