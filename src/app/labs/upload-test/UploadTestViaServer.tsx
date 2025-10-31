"use client";
import { useRef, useState } from "react";

export default function UploadTestViaServer() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [log, setLog] = useState("");

  async function handleUpload() {
    const file = inputRef.current?.files?.[0];
    if (!file) return alert("파일을 선택하세요.");

    const fd = new FormData();
    fd.append("file", file);

    setLog("업로드 중...");
    const res = await fetch("/api/storage/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      setLog(`실패: ${data.error || res.status}`);
      return;
    }
    setLog(`✅ 성공\nkey=${data.key}\npublicUrl=${data.publicUrl} (private이라 직접 열면 AccessDenied가 정상)`);
  }

  return (
    <div className="space-y-3 p-4 border rounded-lg">
      <input ref={inputRef} type="file" accept="image/*" />
      <button onClick={handleUpload} className="px-3 py-2 rounded bg-black text-white">
        서버 프록시 업로드 테스트
      </button>
      <pre className="text-sm whitespace-pre-wrap">{log}</pre>
    </div>
  );
}
