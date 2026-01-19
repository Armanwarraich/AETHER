"use client";
import { useState } from "react";

export default function Upload() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  async function uploadFile() {
    if (!file) return;
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("http://127.0.0.1:8000/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    const stored = JSON.parse(localStorage.getItem("docs") || "[]");
    localStorage.setItem("docs", JSON.stringify([...stored, data.doc_id]));

    setLoading(false);
    alert("Uploaded!");
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div
        className="
          p-8 w-[420px] rounded-2xl
          bg-glass backdrop-blur
          border border-white/10
          shadow-2xl
          animate-fadeInScale
        "
      >
        <h2 className="text-xl font-semibold mb-6 text-center">
          Upload Document
        </h2>

        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className="
            mb-6 w-full text-sm
            file:mr-4 file:py-2 file:px-4
            file:rounded-lg file:border-0
            file:bg-white/10 file:text-white
            hover:file:bg-white/20
            transition
          "
        />

        <button
          onClick={uploadFile}
          disabled={loading}
          className={`
            w-full py-2 rounded-lg font-medium
            transition-all duration-200
            ${
              loading
                ? "bg-white/20 cursor-not-allowed animate-pulse"
                : "bg-white/20 hover:bg-white/30 active:scale-95"
            }
          `}
        >
          {loading ? "Processing..." : "Upload"}
        </button>
      </div>
    </div>
  );
}
