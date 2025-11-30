"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function NewProductForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [loading, setLoading] = useState(false);
  const [importAsin, setImportAsin] = useState("");
  const [importing, setImporting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    platform: "amazon",
    url: "",
    image_url: "",
    external_id: "",
    service_tags: "",
    countries: "",
    priority: 0,
    active: true,
  });

  useEffect(() => {
    // Pre-fill from URL params (e.g. from Link Generator)
    const url = searchParams.get("url");
    const platform = searchParams.get("platform");
    const external_id = searchParams.get("external_id");
    const title = searchParams.get("title");
    const image = searchParams.get("image");
    // const price = searchParams.get("price"); // Could add to description

    if (url || platform) {
      setFormData(prev => ({
        ...prev,
        url: url || prev.url,
        platform: platform || prev.platform,
        external_id: external_id || prev.external_id,
        title: title || prev.title,
        image_url: image || prev.image_url,
      }));
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleArrayChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImport = async () => {
    if (!importAsin) return;
    setImporting(true);
    try {
      const res = await fetch("/api/admin/amazon/product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ asin: importAsin }),
      });
      const data = await res.json();
      
      if (data.success) {
        const product = data.data;
        setFormData(prev => ({
          ...prev,
          title: product.title || prev.title,
          image_url: product.image || prev.image_url,
          url: product.url || prev.url,
          external_id: importAsin,
          platform: "amazon",
          description: product.price ? `Price: ${product.price}` : prev.description
        }));
      } else {
        alert("Import failed: " + data.error);
      }
    } catch (error) {
      console.error(error);
      alert("Error importing from Amazon");
    } finally {
      setImporting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = { affiliate_url: formData.url,
        ...formData,
        service_tags: formData.service_tags.split(",").map((t) => t.trim()).filter(Boolean),
        countries: formData.countries.split(",").map((c) => c.trim()).filter(Boolean),
      };

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push("/products");
      } else {
        const error = await res.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error("Error creating product:", error);
      alert("Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Add New Product</h1>

      {/* Import Section */}
      <div className="bg-white shadow sm:rounded-lg p-6 mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Import from Amazon</h2>
        <div className="flex gap-4">
          <input
            type="text"
            value={importAsin}
            onChange={(e) => setImportAsin(e.target.value)}
            placeholder="Enter ASIN (e.g. B08...)"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
          <button
            type="button"
            onClick={handleImport}
            disabled={importing || !importAsin}
            className="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-200 disabled:opacity-50"
          >
            {importing ? "Importing..." : "Import Data"}
          </button>
        </div>
      </div>

      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Platform
                </label>
                <select
                  name="platform"
                  value={formData.platform}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="amazon">Amazon</option>
                  <option value="shopee">Shopee</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Product URL
                </label>
                <input
                  type="url"
                  name="url"
                  required
                  value={formData.url}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Image URL
                </label>
                <input
                  type="url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  External ID
                </label>
                <input
                  type="text"
                  name="external_id"
                  value={formData.external_id}
                  onChange={handleChange}
                  placeholder="ASIN, SKU, etc."
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Service Tags (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="waxing, haircut, massage"
                  onChange={(e) => handleArrayChange("service_tags", e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Countries (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="US, ID, SG"
                  onChange={(e) => handleArrayChange("countries", e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Priority (0-100)
                </label>
                <input
                  type="number"
                  name="priority"
                  min="0"
                  max="100"
                  value={formData.priority}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="active"
                  checked={formData.active}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Active
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Link
                href="/products"
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Product"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function NewProductPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewProductForm />
    </Suspense>
  );
}
