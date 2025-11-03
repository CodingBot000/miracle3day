"use client";

import * as React from "react";
import type { Treatment } from "../../../../constants/treatment/types";

export default function BookingForm({
  selected,
  locale = "ko",
  onSubmit,
}: {
  selected?: Treatment | null;
  locale?: "ko" | "en";
  onSubmit: (payload: any) => void;
}) {
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [preferredDate, setPreferredDate] = React.useState("");
  const [notes, setNotes] = React.useState("");

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ name, phone, email, preferredDate, treatmentId: selected?.id, notes });
      }}
    >
      <div className="text-sm">
        {locale === "ko" ? "선택 시술" : "Selected treatment"}: <strong>{selected?.name?.[locale] || "-"}</strong>
      </div>
      <input className="w-full rounded-lg border px-3 py-2 text-sm border-neutral-300" placeholder={locale==="ko" ? "이름" : "Name"} value={name} onChange={e=>setName(e.target.value)} required />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <input className="w-full rounded-lg border px-3 py-2 text-sm border-neutral-300" placeholder={locale==="ko" ? "연락처(선택)" : "Phone (optional)"} value={phone} onChange={e=>setPhone(e.target.value)} />
        <input className="w-full rounded-lg border px-3 py-2 text-sm border-neutral-300" placeholder={locale==="ko" ? "이메일(선택)" : "Email (optional)"} value={email} onChange={e=>setEmail(e.target.value)} />
      </div>
      <input type="date" className="w-full rounded-lg border px-3 py-2 text-sm border-neutral-300" value={preferredDate} onChange={e=>setPreferredDate(e.target.value)} />
      <input className="w-full rounded-lg border px-3 py-2 text-sm border-neutral-300" placeholder={locale==="ko" ? "메모(선택)" : "Notes (optional)"} value={notes} onChange={e=>setNotes(e.target.value)} />
      <button className="px-3 py-2 rounded-lg border" type="submit">{locale==="ko" ? "예약 요청" : "Request Booking"}</button>
    </form>
  );
}
