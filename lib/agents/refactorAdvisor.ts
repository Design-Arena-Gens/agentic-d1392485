import { FileBlob, Finding } from "@/lib/types";

function push(findings: Finding[], partial: Omit<Finding, "agent">) {
  findings.push({ agent: "RefactorAdvisor", ...partial });
}

function detectLongFunctions(content: string): { name: string; start: number; lines: number }[] {
  const lines = content.split(/\r?\n/);
  const results: { name: string; start: number; lines: number }[] = [];
  let currentStart = -1;
  let currentName = "";
  let braceDepth = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const fnMatch = line.match(/function\s+([a-zA-Z0-9_]+)/) || line.match(/([a-zA-Z0-9_]+)\s*=\s*\(/) || line.match(/([a-zA-Z0-9_]+)\s*:\s*\(/);
    if (fnMatch && currentStart === -1) {
      currentStart = i + 1;
      currentName = fnMatch[1] || "(anonymous)";
    }
    braceDepth += (line.match(/\{/g) || []).length;
    braceDepth -= (line.match(/\}/g) || []).length;
    if (currentStart !== -1 && braceDepth === 0) {
      const span = i + 1 - currentStart + 1;
      if (span > 80) {
        results.push({ name: currentName, start: currentStart, lines: span });
      }
      currentStart = -1;
      currentName = "";
    }
  }
  return results;
}

export function runRefactorAdvisor(files: FileBlob[]): Finding[] {
  const findings: Finding[] = [];
  for (const file of files) {
    const lines = file.content.split(/\r?\n/);

    // Long file
    if (lines.length > 400) {
      push(findings, {
        severity: "info",
        filePath: file.path,
        message: `File is ${lines.length} lines; consider modularization.`,
        suggestion: "Extract components/helpers and add unit tests."
      });
    }

    // Long functions
    for (const fn of detectLongFunctions(file.content)) {
      push(findings, {
        severity: "info",
        filePath: file.path,
        line: fn.start,
        message: `Function '${fn.name}' spans ${fn.lines} lines.`,
        suggestion: "Apply extract method and reduce branching complexity."
      });
    }

    // Single-letter identifiers frequency
    const idMatches = file.content.match(/\b[a-zA-Z]\b/g) || [];
    if (idMatches.length > 40) {
      push(findings, {
        severity: "warn",
        filePath: file.path,
        message: "Excessive single-letter identifiers reduce readability.",
        suggestion: "Use descriptive variable and parameter names."
      });
    }

    // Repeated string literals
    const strings = (file.content.match(/['\"][^'\"]{3,}?['\"]/g) || []).map((s) => s.slice(1, -1));
    const counts = new Map<string, number>();
    for (const s of strings) counts.set(s, (counts.get(s) || 0) + 1);
    for (const [s, c] of counts) {
      if (c >= 5 && s.length >= 6) {
        push(findings, {
          severity: "info",
          filePath: file.path,
          message: `String '${s.slice(0, 30)}${s.length > 30 ? "?" : ""}' repeated ${c} times.`,
          suggestion: "Extract constant or i18n key."
        });
        break;
      }
    }
  }
  return findings;
}
