"use client";

import * as React from "react";

export default function LanguageToggle({
  value,
  onChange,
}: {
  value: "ko" | "en";
  onChange: (v: "ko" | "en") => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        className={"px-3 py-2 rounded-lg border " + (value === "ko" ? "bg-neutral-900 text-white" : "bg-white")}
        onClick={() => onChange("ko")}
      >
        한글
      </button>
      <button
        className={"px-3 py-2 rounded-lg border " + (value === "en" ? "bg-neutral-900 text-white" : "bg-white")}
        onClick={() => onChange("en")}
      >
        EN
      </button>
    </div>
  );
}
