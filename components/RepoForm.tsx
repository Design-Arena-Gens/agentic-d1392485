"use client";

import { useState } from "react";

export default function RepoForm({ onAnalyze, loading }: { onAnalyze: (v: { repoUrl: string; branch?: string }) => void; loading: boolean; }) {
  const [repoUrl, setRepoUrl] = useState("");
  const [branch, setBranch] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!repoUrl.trim()) return;
    onAnalyze({ repoUrl: repoUrl.trim(), branch: branch.trim() || undefined });
  }

  return (
    <form onSubmit={submit} className="grid gap-3">
      <label className="grid gap-1">
        <span className="text-sm">GitHub Repository URL</span>
        <input className="input" placeholder="https://github.com/owner/repo [or /tree/branch]" value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} />
      </label>
      <label className="grid gap-1">
        <span className="text-sm">Branch (optional)</span>
        <input className="input" placeholder="main" value={branch} onChange={(e) => setBranch(e.target.value)} />
      </label>
      <div>
        <button className="button" type="submit" disabled={loading}>{loading ? "Analyzing..." : "Run Analysis"}</button>
      </div>
    </form>
  );
}
