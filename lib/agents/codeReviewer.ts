import { FileBlob, Finding } from "@/lib/types";

function push(findings: Finding[], partial: Omit<Finding, "agent">) {
  findings.push({ agent: "CodeReviewer", ...partial });
}

export function runCodeReviewer(files: FileBlob[]): Finding[] {
  const findings: Finding[] = [];
  for (const file of files) {
    const lines = file.content.split(/\r?\n/);

    // Rule: avoid eval
    lines.forEach((line, idx) => {
      if (/\beval\s*\(/.test(line)) {
        push(findings, {
          severity: "error",
          filePath: file.path,
          line: idx + 1,
          message: "Avoid using eval() due to security risks.",
          suggestion: "Refactor to safe parsing or direct API calls.",
          snippet: line.trim()
        });
      }
    });

    // Rule: secrets-like patterns
    lines.forEach((line, idx) => {
      if (/(AWS|GCP|AZURE|SECRET|TOKEN|PASSWORD|PRIVATE_KEY)[^\n]{0,50}['\"][A-Za-z0-9\/+_\-=]{16,}['\"]/i.test(line)) {
        push(findings, {
          severity: "error",
          filePath: file.path,
          line: idx + 1,
          message: "Potential hardcoded secret detected.",
          suggestion: "Move secrets to environment variables and rotate keys.",
          snippet: line.trim()
        });
      }
    });

    // Rule: console.log in source (non-test)
    if (!/\.(test|spec)\./.test(file.path)) {
      lines.forEach((line, idx) => {
        if (/\bconsole\.(log|debug)\s*\(/.test(line)) {
          push(findings, {
            severity: "warn",
            filePath: file.path,
            line: idx + 1,
            message: "Console logging in production code.",
            suggestion: "Use structured logger with levels or remove.",
            snippet: line.trim()
          });
        }
      });
    }

    // Rule: var usage in JS/TS
    if (/\.(ts|tsx|js|jsx)$/.test(file.path)) {
      lines.forEach((line, idx) => {
        if (/^\s*var\s+/.test(line)) {
          push(findings, {
            severity: "warn",
            filePath: file.path,
            line: idx + 1,
            message: "Avoid 'var'; prefer 'const' or 'let'.",
            suggestion: "Replace with block-scoped declarations.",
            snippet: line.trim()
          });
        }
      });
    }

    // Rule: long file size
    if (lines.length > 500) {
      push(findings, {
        severity: "info",
        filePath: file.path,
        message: `Large file (${lines.length} lines). Consider splitting.`
      });
    }
  }
  return findings;
}
