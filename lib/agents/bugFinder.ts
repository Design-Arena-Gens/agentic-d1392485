import { FileBlob, Finding } from "@/lib/types";

function push(findings: Finding[], partial: Omit<Finding, "agent">) {
  findings.push({ agent: "BugFinder", ...partial });
}

export function runBugFinder(files: FileBlob[]): Finding[] {
  const findings: Finding[] = [];
  for (const file of files) {
    const lines = file.content.split(/\r?\n/);

    // Assignment in condition: if (a = ...)
    lines.forEach((line, idx) => {
      if (/\b(if|while)\s*\(.*?=\s*[^=].*\)/.test(line) && !/==|===/.test(line)) {
        push(findings, {
          severity: "error",
          filePath: file.path,
          line: idx + 1,
          message: "Suspicious assignment in conditional expression.",
          suggestion: "Use '===' for comparison or separate assignment.",
          snippet: line.trim()
        });
      }
    });

    // Loose equality in JS/TS
    if (/\.(ts|tsx|js|jsx)$/.test(file.path)) {
      lines.forEach((line, idx) => {
        if (/[^=!]==[^=]/.test(line)) {
          push(findings, {
            severity: "warn",
            filePath: file.path,
            line: idx + 1,
            message: "Loose equality '==' may lead to coercion bugs.",
            suggestion: "Use strict equality '==='.",
            snippet: line.trim()
          });
        }
      });
    }

    // JSON.parse without try/catch in file (heuristic): flag parse occurrences
    const hasTry = /\btry\b[\s\S]*?\bcatch\b/.test(file.content);
    if (!hasTry) {
      lines.forEach((line, idx) => {
        if (/JSON\.parse\s*\(/.test(line)) {
          push(findings, {
            severity: "warn",
            filePath: file.path,
            line: idx + 1,
            message: "JSON.parse without error handling.",
            suggestion: "Wrap in try/catch or validate input first.",
            snippet: line.trim()
          });
        }
      });
    }

    // Deprecated Buffer constructor (Node)
    lines.forEach((line, idx) => {
      if (/new\s+Buffer\s*\(/.test(line)) {
        push(findings, {
          severity: "warn",
          filePath: file.path,
          line: idx + 1,
          message: "Deprecated Buffer constructor.",
          suggestion: "Use Buffer.from(...) instead.",
          snippet: line.trim()
        });
      }
    });

    // Node fs usage: may be server-only in web contexts
    if (/\.(ts|tsx|js|jsx)$/.test(file.path)) {
      lines.forEach((line, idx) => {
        if (/\bfs\./.test(line)) {
          push(findings, {
            severity: "info",
            filePath: file.path,
            line: idx + 1,
            message: "'fs' usage detected; ensure server-side execution only.",
            suggestion: "Guard with server checks or move to API route.",
            snippet: line.trim()
          });
        }
      });
    }
  }
  return findings;
}
