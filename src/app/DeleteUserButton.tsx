"use client";

import { useState } from "react";

interface DeleteUserButtonProps {
  uid: string;
}

export default function DeleteUserButton({ uid }: DeleteUserButtonProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleDelete = async () => {
    setLoading(true);
    setResult(null);

    const res = await fetch("/api/delete_user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ uid }),
    });

    const data = await res.json();

    if (data.success) {
      setResult(" 유저 삭제 성공!");
    } else {
      setResult(" 삭제 실패: " + data.error);
    }

    setLoading(false);
  };

  return (
    <div>
      <button
        onClick={handleDelete}
        disabled={loading}
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        {loading ? "삭제 중..." : "유저 삭제"}
      </button>
      {result && <p className="mt-2">{result}</p>}
    </div>
  );
}
