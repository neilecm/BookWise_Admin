"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    description: "",
    image_url: "",
    display_price: "",
    platform: "amazon",
    affiliate_url: "",
    external_id: "",
    countries: [] as string[],
    service_tags: [] as string[],
    active: true,
    priority: 50,
  });

  useEffect(() => {
    fetchProduct();
  }, []);

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/admin/products/${params.id}`);
      const data = await res.json();
      if (data.success) {
        setFormData(data.product);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`/api/admin/products/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        router.push("/products");
      } else {
        alert("Error: " + data.error);
      }
    } catch (error) {
      alert("Failed to update product");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleArrayChange = (field: "countries" | "service_tags", value: string) => {
    const values = value.split(",").map(v => v.trim()).filter(Boolean);
    setFormData(prev => ({ ...prev, [field]: values }));
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <Link href="/products" className="text-indigo-600 hover:text-indigo-900">
          ← Back to Products
        </Link>
      </div>

      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Product</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Title *</label>
                <input type="text" name="title" required value={formData.title} onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Platform *</label>
                <select name="platform" required value={formData.platform} onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                  <option value="amazon">Amazon</option>
                  <option value="shopee">Shopee</option>
                  <option value="impact">Impact.com</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Display Price</label>
                <input type="text" name="display_price" value={formData.display_price || ""} onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Affiliate URL *</label>
                <input type="url" name="affiliate_url" required value={formData.affiliate_url} onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea name="description" rows={3} value={formData.description || ""} onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Service Tags</label>
                <input type="text" defaultValue={formData.service_tags?.join(", ")}
                  onChange={(e) => handleArrayChange("service_tags", e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Countries</label>
                <input type="text" defaultValue={formData.countries?.join(", ")}
                  onChange={(e) => handleArrayChange("countries", e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Priority</label>
                <input type="number" name="priority" min="0" max="100" value={formData.priority} onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
              </div>

              <div className="flex items-center">
                <input type="checkbox" name="active" checked={formData.active} onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
                <label className="ml-2 block text-sm text-gray-900">Active</label>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Link href="/products"
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                Cancel
              </Link>
              <button type="submit" disabled={saving}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50">
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
