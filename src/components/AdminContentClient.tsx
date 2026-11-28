"use client";

import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { StoreSettings } from "@/lib/settings";

export function AdminContentClient({ initialSettings }: { initialSettings: StoreSettings }) {
  const [homepageBanner, setHomepageBanner] = useState(initialSettings.homepageBanner);
  const [seasonalBanner, setSeasonalBanner] = useState(initialSettings.seasonalBanner);
  const [faqs, setFaqs] = useState(initialSettings.faqs);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ homepageBanner, seasonalBanner, faqs }),
      });
      if (!res.ok) throw new Error();
      setMsg("Content saved.");
    } catch {
      setMsg("Could not save content.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="max-w-4xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl">Content &amp; Banners</h1>
          <p className="text-xs text-neutral-500">
            Update homepage hero copy, seasonal banners (Avurudu, Vesak, Wedding), and FAQs.
          </p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="bg-black px-6 py-2.5 text-xs uppercase tracking-widest text-white hover:bg-neutral-800"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {msg && <p className="border border-black bg-white p-3 text-xs">{msg}</p>}

      <section className="border border-neutral-200 bg-white p-6 space-y-4 text-sm">
        <h2 className="font-serif text-2xl">Homepage Hero</h2>
        <div>
          <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-1">Eyebrow</label>
          <input
            type="text"
            value={homepageBanner.eyebrow}
            onChange={(e) => setHomepageBanner({ ...homepageBanner, eyebrow: e.target.value })}
            className="w-full border border-neutral-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-1">Headline</label>
          <input
            type="text"
            value={homepageBanner.headline}
            onChange={(e) => setHomepageBanner({ ...homepageBanner, headline: e.target.value })}
            className="w-full border border-neutral-300 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-1">Subheadline</label>
          <textarea
            rows={2}
            value={homepageBanner.subheadline}
            onChange={(e) => setHomepageBanner({ ...homepageBanner, subheadline: e.target.value })}
            className="w-full border border-neutral-300 px-3 py-2"
          />
        </div>
      </section>

      <section className="border border-neutral-200 bg-white p-6 space-y-4 text-sm">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl">Seasonal Banner</h2>
          <label className="flex items-center gap-2 text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={seasonalBanner.enabled}
              onChange={(e) => setSeasonalBanner({ ...seasonalBanner, enabled: e.target.checked })}
              className="accent-black"
            />
            <span>Show Banner</span>
          </label>
        </div>
        <input
          type="text"
          value={seasonalBanner.title}
          onChange={(e) => setSeasonalBanner({ ...seasonalBanner, title: e.target.value })}
          placeholder="Banner title"
          className="w-full border border-neutral-300 px-3 py-2"
        />
        <input
          type="text"
          value={seasonalBanner.subtitle}
          onChange={(e) => setSeasonalBanner({ ...seasonalBanner, subtitle: e.target.value })}
          placeholder="Banner subtitle"
          className="w-full border border-neutral-300 px-3 py-2"
        />
      </section>

      <section className="border border-neutral-200 bg-white p-6 space-y-4 text-sm">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl">FAQs</h2>
          <button
            type="button"
            onClick={() => setFaqs([...faqs, { question: "", answer: "" }])}
            className="inline-flex items-center gap-1 border border-black px-3 py-1.5 text-xs uppercase tracking-widest"
          >
            <Plus className="h-3.5 w-3.5" /> Add FAQ
          </button>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="border border-neutral-200 p-4 space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={faq.question}
                  placeholder="Question"
                  onChange={(e) => {
                    const next = [...faqs];
                    next[idx] = { ...next[idx], question: e.target.value };
                    setFaqs(next);
                  }}
                  className="flex-1 border border-neutral-300 px-3 py-2 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setFaqs(faqs.filter((_, i) => i !== idx))}
                  className="text-neutral-500 hover:text-black"
                  aria-label="Remove FAQ"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <textarea
                rows={2}
                value={faq.answer}
                placeholder="Answer"
                onChange={(e) => {
                  const next = [...faqs];
                  next[idx] = { ...next[idx], answer: e.target.value };
                  setFaqs(next);
                }}
                className="w-full border border-neutral-300 px-3 py-2 text-xs"
              />
            </div>
          ))}
        </div>
      </section>
    </form>
  );
}
