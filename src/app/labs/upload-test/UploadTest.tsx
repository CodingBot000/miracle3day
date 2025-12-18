"use client";

import { useRef, useState } from "react";

export default function UploadTest() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [log, setLog] = useState<string>("");

  async function handleUpload() {
    const file = inputRef.current?.files?.[0];
    if (!file) return alert("파일을 선택하세요.");

    setLog("업로드 중...");
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`/api/storage/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      setLog(`업로드 실패: ${error.error ?? response.status}`);
      return;
    }

    const { ok, key, publicUrl } = await response.json();

    if (ok) {
      setLog(`✅ 업로드 성공!\n키: ${key}\n(읽기 필요 시 /api/storage/read?key=${encodeURIComponent(key)})\n직접 URL: ${publicUrl}`);
    } else {
      setLog(`업로드 실패`);
    }
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
