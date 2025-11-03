"use client";

import { useState } from "react";
import RepoForm from "@/components/RepoForm";
import ResultView from "@/components/ResultView";

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<any | null>(null);

  async function handleAnalyze(input: { repoUrl: string; branch?: string }) {
    setLoading(true);
    setResults(null);
    setError(null);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input)
      });
      if (!response.ok) {
        const txt = await response.text();
        throw new Error(txt || "Request failed");
      }
      const data = await response.json();
      setResults(data);
    } catch (err: any) {
      setError(err?.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <div className="card">
        <h2 className="text-xl font-semibold mb-2">Analyze a GitHub repository</h2>
        <RepoForm onAnalyze={handleAnalyze} loading={loading} />
        {error && (
          <div className="mt-3"><span className="badge error">Error</span> <span className="ml-2">{error}</span></div>
        )}
      </div>

      {results && (
        <div className="card">
          <ResultView results={results} />
        </div>
      )}

      <div className="card">
        <h3 className="font-semibold mb-2">How it works</h3>
        <p>
          We fetch a sample of code files from the repository, then run three
          agents: Code Reviewer, Bug Finder, and Refactor Advisor. We show
          findings with file context and actionable suggestions.
        </p>
      </div>
    </div>
  );
}
