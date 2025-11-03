"use client";

import * as React from "react";

export default function ContactForm({
  locale = "ko",
  onSubmit,
}: {
  locale?: "ko" | "en";
  onSubmit: (payload: any) => void;
}) {
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [message, setMessage] = React.useState("");

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ name, phone, email, message });
      }}
    >
      <input className="w-full rounded-lg border px-3 py-2 text-sm border-neutral-300" placeholder={locale==="ko" ? "이름" : "Name"} value={name} onChange={e=>setName(e.target.value)} required />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <input className="w-full rounded-lg border px-3 py-2 text-sm border-neutral-300" placeholder={locale==="ko" ? "연락처(선택)" : "Phone (optional)"} value={phone} onChange={e=>setPhone(e.target.value)} />
        <input className="w-full rounded-lg border px-3 py-2 text-sm border-neutral-300" placeholder={locale==="ko" ? "이메일(선택)" : "Email (optional)"} value={email} onChange={e=>setEmail(e.target.value)} />
      </div>
      <input className="w-full rounded-lg border px-3 py-2 text-sm border-neutral-300" placeholder={locale==="ko" ? "문의 내용" : "Message"} value={message} onChange={e=>setMessage(e.target.value)} required />
      <button className="px-3 py-2 rounded-lg border" type="submit">{locale==="ko" ? "문의 보내기" : "Send Inquiry"}</button>
    </form>
  );
}
