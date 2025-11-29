"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LinkGeneratorPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"amazon" | "shopee">("amazon");
  
  // Amazon state
  const [amazonUrl, setAmazonUrl] = useState("");
  const [amazonTag, setAmazonTag] = useState("bookwise-20");
  const [amazonAffiliateUrl, setAmazonAffiliateUrl] = useState("");
  const [amazonAsin, setAmazonAsin] = useState("");
  
  // Shopee state
  const [shopeeUrl, setShopeeUrl] = useState("");
  const [shopeeAffiliateId, setShopeeAffiliateId] = useState("");
  const [shopeeRegion, setShopeeRegion] = useState("id");
  const [shopeeAffiliateUrl, setShopeeAffiliateUrl] = useState("");

  const generateAmazonLink = () => {
    try {
      // Extract ASIN from Amazon URL
      const asinMatch = amazonUrl.match(/\/dp\/([A-Z0-9]{10})|\/gp\/product\/([A-Z0-9]{10})/);
      const asin = asinMatch?.[1] || asinMatch?.[2];
      
      if (!asin) {
        alert("Could not extract ASIN from URL. Please check the URL format.");
        return;
      }
      
      setAmazonAsin(asin);
      
      // Generate affiliate link
      const affiliateUrl = `https://www.amazon.com/dp/${asin}?tag=${amazonTag}`;
      setAmazonAffiliateUrl(affiliateUrl);
    } catch (error) {
      alert("Error generating Amazon link");
    }
  };

  const generateShopeeLink = () => {
    try {
      // Extract product ID from Shopee URL
      const productIdMatch = shopeeUrl.match(/i\.(\d+)\.(\d+)/);
      
      if (!productIdMatch) {
        alert("Could not extract product ID from URL. Please check the URL format.");
        return;
      }
      
      const shopId = productIdMatch[1];
      const itemId = productIdMatch[2];
      
      // Generate affiliate link
      let affiliateUrl = `https://shopee.${shopeeRegion}/product/${shopId}/${itemId}`;
      if (shopeeAffiliateId) {
        affiliateUrl += `?affiliate_id=${shopeeAffiliateId}`;
      }
      
      setShopeeAffiliateUrl(affiliateUrl);
    } catch (error) {
      alert("Error generating Shopee link");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const addToProducts = (url: string, platform: string) => {
    // Navigate to add product page with pre-filled data
    const params = new URLSearchParams({
      platform,
      affiliate_url: url,
    });
    router.push(`/products/new?${params}`);
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Affiliate Link Generator</h1>
        <p className="mt-1 text-sm text-gray-500">
          Generate affiliate tracking links for Amazon and Shopee
        </p>
      </div>

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
                ? "border-indigo-500 text-indigo-600"
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
          <h2 className="text-lg font-medium text-gray-900 mb-4">Amazon Link Generator</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Amazon Product URL</label>
              <input
                type="url"
                value={amazonUrl}
                onChange={(e) => setAmazonUrl(e.target.value)}
                placeholder="https://www.amazon.com/dp/B001234567"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Paste any Amazon product URL (e.g., /dp/ASIN or /gp/product/ASIN)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Associate Tag</label>
              <input
                type="text"
                value={amazonTag}
                onChange={(e) => setAmazonTag(e.target.value)}
                placeholder="bookwise-20"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <button
              onClick={generateAmazonLink}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Generate Affiliate Link
            </button>

            {amazonAffiliateUrl && (
              <div className="mt-6 p-4 bg-gray-50 rounded-md">
                <div className="mb-2">
                  <span className="text-sm font-medium text-gray-700">ASIN: </span>
                  <span className="text-sm text-gray-900">{amazonAsin}</span>
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Affiliate Link:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={amazonAffiliateUrl}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
                    />
                    <button
                      onClick={() => copyToClipboard(amazonAffiliateUrl)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => addToProducts(amazonAffiliateUrl, "amazon")}
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
          <h2 className="text-lg font-medium text-gray-900 mb-4">Shopee Link Generator</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Shopee Product URL</label>
              <input
                type="url"
                value={shopeeUrl}
                onChange={(e) => setShopeeUrl(e.target.value)}
                placeholder="https://shopee.co.id/product-name-i.123456.789012"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Paste any Shopee product URL
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Region</label>
              <select
                value={shopeeRegion}
                onChange={(e) => setShopeeRegion(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="id">Indonesia (.co.id)</option>
                <option value="sg">Singapore (.sg)</option>
                <option value="com.my">Malaysia (.com.my)</option>
                <option value="ph">Philippines (.ph)</option>
                <option value="vn">Vietnam (.vn)</option>
                <option value="co.th">Thailand (.co.th)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Affiliate ID (Optional)</label>
              <input
                type="text"
                value={shopeeAffiliateId}
                onChange={(e) => setShopeeAffiliateId(e.target.value)}
                placeholder="your-affiliate-id"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <button
              onClick={generateShopeeLink}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Generate Affiliate Link
            </button>

            {shopeeAffiliateUrl && (
              <div className="mt-6 p-4 bg-gray-50 rounded-md">
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Affiliate Link:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={shopeeAffiliateUrl}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
                    />
                    <button
                      onClick={() => copyToClipboard(shopeeAffiliateUrl)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => addToProducts(shopeeAffiliateUrl, "shopee")}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                >
                  Add to Product Catalog
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
