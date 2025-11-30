"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LinkGenerator() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"amazon" | "shopee">("amazon");
  
  // Amazon State
  const [amazonUrl, setAmazonUrl] = useState("");
  const [amazonData, setAmazonData] = useState<any>(null);
  const [loadingAmazon, setLoadingAmazon] = useState(false);
  const [amazonAffiliateUrl, setAmazonAffiliateUrl] = useState("");

  // Shopee State
  const [shopeeUrl, setShopeeUrl] = useState("");
  const [shopeeData, setShopeeData] = useState<any>(null);
  const [loadingShopee, setLoadingShopee] = useState(false);
  const [shopeeAffiliateUrl, setShopeeAffiliateUrl] = useState("");
  
  // Shopee Smart Paste State
  const [pasteMode, setPasteMode] = useState(false);
  const [rawText, setRawText] = useState("");
  const [parsingText, setParsingText] = useState(false);

  // Helper to extract ASIN
  const extractASIN = (url: string) => {
    const regex = /dp\/([A-Z0-9]{10})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const fetchAmazonDetails = async () => {
    const asin = extractASIN(amazonUrl);
    if (!asin) {
      alert("Invalid Amazon URL. Could not find ASIN.");
      return;
    }

    setLoadingAmazon(true);
    try {
      const res = await fetch("/api/admin/amazon/product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ asin }),
      });
      const data = await res.json();
      if (data.success) {
        setAmazonData(data.product);
        // Auto-generate affiliate link (basic tag appending)
        setAmazonAffiliateUrl(`https://www.amazon.com/dp/${asin}?tag=YOUR_TAG`);
      } else {
        alert("Failed to fetch Amazon data: " + data.error);
      }
    } catch (error) {
      alert("Error fetching Amazon data");
    } finally {
      setLoadingAmazon(false);
    }
  };

  const fetchShopeeDetails = async () => {
    setLoadingShopee(true);
    try {
      const res = await fetch("/api/admin/shopee/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: shopeeUrl }),
      });
      const data = await res.json();
      if (data.success) {
        setShopeeData(data.data);
      } else {
        alert("Failed to fetch Shopee data: " + data.error);
      }
    } catch (error) {
      alert("Error fetching Shopee data");
    } finally {
      setLoadingShopee(false);
    }
  };

  const parseShopeeText = async () => {
    if (!rawText.trim()) return;
    setParsingText(true);
    try {
      const res = await fetch("/api/admin/shopee/parse-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: rawText }),
      });
      const data = await res.json();
      if (data.success) {
        setShopeeData(data.data);
        alert("Text parsed successfully! Please add the Image URL manually if missing.");
      } else {
        alert("Failed to parse text: " + data.error);
      }
    } catch (error) {
      alert("Error parsing text");
    } finally {
      setParsingText(false);
    }
  };

  const addToProducts = (affiliateUrl: string, platform: string, productData: any) => {
    const params = new URLSearchParams({
      url: affiliateUrl,
      platform: platform,
      external_id: platform === "amazon" ? extractASIN(amazonUrl) || "" : "",
      title: productData.title || "",
      image: productData.image || "",
      price: productData.price || "",
      description: productData.description || ""
    });
    router.push(`/products/new?${params.toString()}`);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Link Generator</h1>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("amazon")}
            className={`${
              activeTab === "amazon"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Amazon
          </button>
          <button
            onClick={() => setActiveTab("shopee")}
            className={`${
              activeTab === "shopee"
                ? "border-orange-500 text-orange-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Shopee
          </button>
        </nav>
      </div>

      {/* Amazon Generator */}
      {activeTab === "amazon" && (
        <div className="bg-white shadow sm:rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Amazon Link Helper</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Product URL</label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="text"
                  value={amazonUrl}
                  onChange={(e) => setAmazonUrl(e.target.value)}
                  className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="https://www.amazon.com/..."
                />
                <button
                  onClick={fetchAmazonDetails}
                  disabled={loadingAmazon}
                  className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 text-sm hover:bg-gray-100"
                >
                  {loadingAmazon ? "Loading..." : "Fetch Data"}
                </button>
              </div>
            </div>

            {amazonData && (
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex gap-4 mb-4">
                  {amazonData.image && (
                    <img src={amazonData.image} alt={amazonData.title} className="w-24 h-24 object-contain" />
                  )}
                  <div>
                    <h3 className="font-medium">{amazonData.title}</h3>
                    <p className="text-gray-500">{amazonData.price}</p>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Affiliate Link</label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <input
                      type="text"
                      value={amazonAffiliateUrl}
                      readOnly
                      className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md border-gray-300 bg-gray-50 sm:text-sm"
                    />
                    <button
                      onClick={() => navigator.clipboard.writeText(amazonAffiliateUrl)}
                      className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 text-sm hover:bg-gray-100"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => addToProducts(amazonAffiliateUrl, "amazon", amazonData)}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                >
                  Add to Product Catalog
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Shopee Generator */}
      {activeTab === "shopee" && (
        <div className="bg-white shadow sm:rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Shopee Link Helper</h2>
            <button
              onClick={() => setPasteMode(!pasteMode)}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            >
              {pasteMode ? "Switch to URL Mode" : "Switch to Smart Paste Mode"}
            </button>
          </div>
          
          <div className="space-y-6">
            {/* Step 1: Fetch Data */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Step 1: Get Product Details</h3>
              
              {pasteMode ? (
                <div className="space-y-2">
                  <label className="block text-xs text-gray-500">
                    Go to the Shopee page, press <strong>Ctrl+A</strong> then <strong>Ctrl+C</strong>, and paste everything here:
                  </label>
                  <textarea
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    rows={6}
                    placeholder="Paste raw text from Shopee page here..."
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  <button
                    onClick={parseShopeeText}
                    disabled={parsingText || !rawText}
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {parsingText ? "AI is reading..." : "Parse Text with AI"}
                  </button>
                </div>
              ) : (
                <>
                  <label className="block text-xs text-gray-500 mb-1">Shopee Product URL (e.g., shopee.co.id/product/...)</label>
                  <div className="flex rounded-md shadow-sm">
                    <input
                      type="url"
                      value={shopeeUrl}
                      onChange={(e) => setShopeeUrl(e.target.value)}
                      placeholder="Paste the full product URL here"
                      className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <button
                      onClick={fetchShopeeDetails}
                      disabled={loadingShopee || !shopeeUrl}
                      className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 text-sm hover:bg-gray-100 disabled:opacity-50"
                    >
                      {loadingShopee ? "..." : "Fetch Data"}
                    </button>
                  </div>
                </>
              )}
            </div>

            {shopeeData && (
              <div className="bg-gray-50 p-4 rounded-md flex gap-4 items-start border border-gray-200">
                {shopeeData.image ? (
                  <img src={shopeeData.image} alt={shopeeData.title} className="w-20 h-20 object-contain bg-white rounded border" />
                ) : (
                  <div className="w-20 h-20 bg-gray-200 rounded border flex items-center justify-center text-xs text-gray-500 text-center p-1">
                    No Image Found
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 line-clamp-2">{shopeeData.title}</h3>
                  <p className="text-indigo-600 font-bold mt-1">{shopeeData.price}</p>
                  {!shopeeData.image && (
                    <p className="text-xs text-orange-600 mt-1">
                      * Please add Image URL manually in the next step.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Enter Affiliate Link */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Step 2: Enter Affiliate Link</h3>
              <label className="block text-xs text-gray-500 mb-1">Your Shopee Affiliate Link (e.g., https://s.shopee.co.id/...)</label>
              <input
                type="url"
                value={shopeeAffiliateUrl}
                onChange={(e) => setShopeeAffiliateUrl(e.target.value)}
                placeholder="Paste your affiliate link from Shopee App here"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              <p className="mt-1 text-xs text-gray-400">
                Get this link from the Shopee App &gt; Me &gt; Shopee Affiliate Program
              </p>
            </div>

            {/* Step 3: Save */}
            <div className="border-t border-gray-200 pt-6">
              <button
                onClick={() => addToProducts(shopeeAffiliateUrl, "shopee", shopeeData)}
                disabled={!shopeeAffiliateUrl || !shopeeData}
                className="w-full px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {!shopeeData ? "Fetch Data First" : "Add to Product Catalog"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
