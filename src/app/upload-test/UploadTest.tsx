"use client";

import { useRef, useState } from "react";

export default function UploadTest() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [log, setLog] = useState<string>("");

  async function handleUpload() {
    const file = inputRef.current?.files?.[0];
    if (!file) return alert("파일을 선택하세요.");

    setLog("1) presign 요청 중...");
    const q = new URLSearchParams({
      fileName: file.name,
      contentType: file.type,
    });
    const r1 = await fetch(`/api/storage/presign-upload?${q}`);
    if (!r1.ok) {
      const e = await r1.json();
      setLog(`presign 실패: ${e.error ?? r1.status}`);
      return;
    }
    const { url, key, publicUrl } = await r1.json();
    setLog(`2) 업로드 중...\nkey=${key}`);

    const r2 = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });
    if (!r2.ok) {
      setLog(`업로드 실패: ${r2.status}`);
      return;
    }

    setLog(`✅ 업로드 성공!\n키: ${key}\n(읽기 필요 시 /api/storage/presign-read?key=${encodeURIComponent(key)})\n직접 URL(서명제거): ${publicUrl}`);
  }

  return (
    <div className="space-y-3 p-4 border rounded-lg">
      <input ref={inputRef} type="file" accept="image/*" />
      <button onClick={handleUpload} className="px-3 py-2 rounded bg-black text-white">
        업로드 테스트
      </button>
      <pre className="text-sm whitespace-pre-wrap">{log}</pre>
    </div>
  );
}
