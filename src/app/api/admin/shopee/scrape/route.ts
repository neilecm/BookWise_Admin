import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

// Add stealth plugin
puppeteer.use(StealthPlugin());

export async function POST(req: NextRequest) {
  const { url } = await req.json();
  console.log("Scraping URL:", url);
  
  if (!url) return NextResponse.json({ error: "URL required" }, { status: 400 });

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox', 
        '--disable-dev-shm-usage',
        '--disable-blink-features=AutomationControlled',
      ]
    });
    
    const page = await browser.newPage();
    
    // Set Mobile User Agent
    await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1');
    await page.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true });

    // Store the found data
    let foundData: any = null;

    // Intercept Responses to catch the API data
    page.on('response', async (response) => {
      const requestUrl = response.url();
      // Shopee API v4 usually looks like this
      if (requestUrl.includes('/api/v4/item/get') || requestUrl.includes('get_item_detail')) {
        console.log("Captured API Response:", requestUrl);
        try {
          const json = await response.json();
          if (json && json.data) {
            foundData = {
              title: json.data.name || json.data.item?.name,
              price: json.data.price_min || json.data.item?.price_min || json.data.price,
              image: json.data.image ? `https://down-id.img.susercontent.com/file/${json.data.image}` : null,
              description: json.data.description || json.data.item?.description,
              currency: json.data.currency || "IDR" // Default to IDR if missing
            };
            // Normalize price (Shopee sometimes sends it with extra zeros, e.g. 10000000 for 100.000)
            // Usually it's micros (x100000)
            if (foundData.price && foundData.price > 1000000) {
                 foundData.price = foundData.price / 100000;
            }
          }
        } catch (e) {
          // Ignore json parse errors
        }
      }
    });

    console.log("Navigating...");
    try {
        // We don't need to wait for networkidle if we catch the API
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        
        // Wait a bit for the API to fire
        await new Promise(r => setTimeout(r, 5000));
    } catch (e) {
        console.log("Navigation error (might be redirect):", e);
    }

    if (foundData) {
        console.log("Successfully captured API data!");
        return NextResponse.json({ success: true, data: foundData });
    }

    // Fallback: If API interception failed, try the old AI method (unlikely to work if redirected)
    console.log("API interception failed, checking page content...");
    const title = await page.title();
    if (title.includes("Shopee")) {
         throw new Error("Shopee blocked the request (Redirected to Homepage).");
    }

    return NextResponse.json({ success: false, error: "Could not extract data via API or DOM." }, { status: 500 });

  } catch (error: any) {
    console.error("Scraping Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    if (browser) await browser.close();
  }
}
