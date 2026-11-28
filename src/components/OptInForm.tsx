"use client";

import React, { useState } from "react";

export function OptInForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMsg("");
    try {
      const res = await fetch("/api/optin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setMsg(data.error || "Something went wrong.");
      } else {
        setStatus("done");
        setMsg("Thank you. We will share new arrivals and seasonal edits with you.");
        setName("");
        setPhone("");
        setEmail("");
      }
    } catch {
      setStatus("error");
      setMsg("Network error. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-4">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name"
        className="border border-neutral-300 bg-white px-4 py-3 text-sm outline-none focus:border-black"
      />
      <input
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="WhatsApp (e.g. 077...)"
        className="border border-neutral-300 bg-white px-4 py-3 text-sm outline-none focus:border-black"
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email (optional)"
        className="border border-neutral-300 bg-white px-4 py-3 text-sm outline-none focus:border-black"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="bg-black px-6 py-3 text-xs font-medium uppercase tracking-[0.18em] text-white hover:bg-neutral-800 disabled:opacity-50 transition-colors"
      >
        {status === "loading" ? "Saving..." : "Join List"}
      </button>
      {msg && (
        <p className={`sm:col-span-4 text-xs ${status === "error" ? "text-black underline" : "text-neutral-700"}`}>
          {msg}
        </p>
      )}
    </form>
  );
}
