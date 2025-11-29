"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Translation {
  id: string;
  key: string;
  language_code: string;
  value: string;
  context?: string;
}

interface Language {
  code: string;
  name: string;
  active: boolean;
}

export default function TranslationsPage() {
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [languages, setLanguages] = useState<Language[]>([
    { code: "en", name: "English", active: true },
    { code: "id", name: "Indonesian", active: true },
    { code: "es", name: "Spanish", active: true },
    { code: "fr", name: "French", active: true },
    { code: "de", name: "German", active: true },
  ]);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    fetchTranslations();
  }, [selectedLanguage]);

  const fetchTranslations = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ language_code: selectedLanguage });
      if (search) params.append("search", search);
      
      const res = await fetch(`/api/admin/translations?${params}`);
      const data = await res.json();
      
      if (data.success) {
        setTranslations(data.translations);
      }
    } catch (error) {
      console.error("Error fetching translations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTranslations();
  };

  const startEdit = (translation: Translation) => {
    setEditingId(translation.id);
    setEditValue(translation.value);
  };

  const saveEdit = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/translations/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: editValue }),
      });
      
      if (res.ok) {
        setEditingId(null);
        fetchTranslations();
      }
    } catch (error) {
      console.error("Error saving translation:", error);
    }
  };

  const translateWithAI = async (text: string, key: string) => {
    if (!confirm(`Translate "${text}" to ${selectedLanguage} using AI?`)) return;
    
    try {
      const res = await fetch("/api/admin/translations/ai-translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          targetLanguage: languages.find(l => l.code === selectedLanguage)?.name || selectedLanguage,
          context: key,
        }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        // Find the translation and update it
        const translation = translations.find(t => t.key === key);
        if (translation) {
          await fetch(`/api/admin/translations/${translation.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ value: data.translation }),
          });
          fetchTranslations();
        }
      }
    } catch (error) {
      console.error("AI translation error:", error);
    }
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Translations</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage multi-language translations
          </p>
        </div>
      </div>

      {/* Language Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {languages.filter(l => l.active).map((lang) => (
            <button
              key={lang.code}
              onClick={() => setSelectedLanguage(lang.code)}
              className={`${
                selectedLanguage === lang.code
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              {lang.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <form onSubmit={handleSearch} className="flex gap-4">
          <input
            type="text"
            placeholder="Search translations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Search
          </button>
        </form>
      </div>

      {/* Translations Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : translations.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No translations found</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Key
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Translation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {translations.map((translation) => (
                <tr key={translation.id}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {translation.key}
                  </td>
                  <td className="px-6 py-4">
                    {editingId === translation.id ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    ) : (
                      <span className="text-sm text-gray-900">{translation.value}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium space-x-2">
                    {editingId === translation.id ? (
                      <>
                        <button
                          onClick={() => saveEdit(translation.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(translation)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => translateWithAI(translation.value, translation.key)}
                          className="text-purple-600 hover:text-purple-900"
                        >
                          AI Translate
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
