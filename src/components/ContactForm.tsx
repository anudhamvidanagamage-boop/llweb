"use client";

import React, { useState } from "react";

export function ContactForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, email, message }),
      });
      if (!res.ok) throw new Error();
      setStatus("sent");
      setName("");
      setPhone("");
      setEmail("");
      setMessage("");
    } catch {
      setStatus("error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name *"
          className="border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-black"
        />
        <input
          type="tel"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone / WhatsApp *"
          className="border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-black"
        />
      </div>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email (optional)"
        className="w-full border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-black"
      />
      <textarea
        required
        rows={4}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="How can we help you? *"
        className="w-full border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-black"
      />
      <button
        type="submit"
        disabled={status === "sending"}
        className="bg-black px-8 py-3.5 text-xs font-medium uppercase tracking-[0.2em] text-white hover:bg-neutral-800 disabled:opacity-50"
      >
        {status === "sending" ? "Sending..." : "Send Enquiry"}
      </button>
      {status === "sent" && (
        <p className="text-xs text-neutral-700">Thank you. We will reply shortly during business hours.</p>
      )}
      {status === "error" && (
        <p className="text-xs text-black underline">Could not send enquiry. Please message us on WhatsApp.</p>
      )}
    </form>
  );
}
