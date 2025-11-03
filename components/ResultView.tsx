import { AnalysisResult, Finding } from "@/lib/types";

function Badge({ severity }: { severity: Finding["severity"] }) {
  const cls = severity === "error" ? "badge error" : severity === "warn" ? "badge warn" : "badge info";
  return <span className={cls}>{severity.toUpperCase()}</span>;
}

function FindingItem({ f }: { f: Finding }) {
  return (
    <div className="border-b border-gray-200 py-3">
      <div className="flex items-center gap-2">
        <Badge severity={f.severity} />
        <span className="font-mono text-sm">{f.filePath}{f.line ? `:${f.line}` : ""}</span>
      </div>
      <div className="mt-1">{f.message}</div>
      {f.suggestion && (
        <div className="mt-1 text-sm text-gray-600"><strong>Suggestion:</strong> {f.suggestion}</div>
      )}
      {f.snippet && (
        <pre className="mt-2"><code>{f.snippet}</code></pre>
      )}
    </div>
  );
}

export default function ResultView({ results }: { results: AnalysisResult }) {
  const items = results.findings;
  const byAgent: Record<string, Finding[]> = items.reduce((acc, f) => {
    (acc[f.agent] ||= []).push(f);
    return acc;
  }, {} as Record<string, Finding[]>);

  const counts = {
    error: items.filter((f) => f.severity === "error").length,
    warn: items.filter((f) => f.severity === "warn").length,
    info: items.filter((f) => f.severity === "info").length
  };

  return (
    <div className="grid gap-4">
      <div>
        <div className="text-sm text-gray-600">Repository</div>
        <div className="font-mono"><a className="hover:underline" href={results.repo.url} target="_blank" rel="noreferrer">{results.repo.owner}/{results.repo.repo}</a> @ {results.repo.branch}</div>
        <div className="text-sm text-gray-600">Analyzed files: {results.analyzedFileCount}</div>
        <div className="flex gap-2 mt-2">
          <span className="badge error">{counts.error} errors</span>
          <span className="badge warn">{counts.warn} warnings</span>
          <span className="badge info">{counts.info} infos</span>
        </div>
      </div>

      {Object.entries(byAgent).map(([agent, list]) => (
        <section key={agent} className="card">
          <h4 className="font-semibold mb-2">{agent} ({list.length})</h4>
          <div>
            {list.length === 0 && (<div className="text-sm text-gray-600">No findings</div>)}
            {list.map((f, i) => (<FindingItem key={i} f={f} />))}
          </div>
        </section>
      ))}
    </div>
  );
}
