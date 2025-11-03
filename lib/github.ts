import { FileBlob, RepoInput } from "./types";

const GITHUB_API = "https://api.github.com";

export function parseRepoUrl(repoUrl: string): RepoInput & { url: string } {
  // Supports: https://github.com/owner/repo[.git][/tree/branch]
  try {
    const u = new URL(repoUrl);
    const parts = u.pathname.replace(/\.git$/, "").split("/").filter(Boolean);
    const owner = parts[0];
    const repo = parts[1];
    let branch = "main";
    const treeIdx = parts.findIndex((p) => p === "tree");
    if (treeIdx !== -1 && parts[treeIdx + 1]) {
      branch = parts[treeIdx + 1];
    }
    if (!owner || !repo) throw new Error("Invalid GitHub URL");
    return { owner, repo, branch, url: `https://github.com/${owner}/${repo}` };
  } catch {
    throw new Error("Invalid GitHub URL");
  }
}

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = { "User-Agent": "multi-agent-review" };
  if (process.env.GITHUB_TOKEN) {
    headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
}

export async function fetchRepoTree(input: RepoInput): Promise<string[]> {
  // Try branch, fallback to master
  const headers = authHeaders();
  const branches = [input.branch, "main", "master"];
  let treeUrl = "";
  for (const br of branches) {
    const url = `${GITHUB_API}/repos/${input.owner}/${input.repo}/git/trees/${encodeURIComponent(br)}?recursive=1`;
    const r = await fetch(url, { headers });
    if (r.ok) {
      treeUrl = url;
      break;
    }
  }
  const res = await fetch(treeUrl, { headers });
  if (!res.ok) {
    throw new Error(`Unable to fetch repo tree (${res.status})`);
  }
  const data = await res.json();
  const allPaths: string[] = (data?.tree || [])
    .filter((t: any) => t.type === "blob")
    .map((t: any) => t.path as string);

  // Prefer JS/TS first, cap total files
  const preferred = allPaths.filter((p) => /\.(ts|tsx|js|jsx)$/.test(p));
  const others = allPaths.filter((p) => !/\.(ts|tsx|js|jsx)$/.test(p) && /\.(json|md|py|go|rb|java|cs|php|rs)$/.test(p));
  const selected = [...preferred.slice(0, 50), ...others.slice(0, 10)];
  return selected;
}

export async function fetchFiles(input: RepoInput, paths: string[]): Promise<FileBlob[]> {
  const headers = authHeaders();
  // Determine working branch by probing
  const branchProbe = [input.branch, "main", "master"];
  let branch = input.branch;
  for (const br of branchProbe) {
    const probe = await fetch(`${GITHUB_API}/repos/${input.owner}/${input.repo}/branches/${br}`, { headers });
    if (probe.ok) { branch = br; break; }
  }
  const rawBase = `https://raw.githubusercontent.com/${input.owner}/${input.repo}/${branch}`;

  const results: FileBlob[] = [];
  for (const p of paths.slice(0, 60)) {
    const url = `${rawBase}/${p}`;
    const r = await fetch(url, { headers });
    if (!r.ok) continue;
    const text = await r.text();
    if (text.length > 200_000) continue; // skip huge files
    results.push({ path: p, content: text });
  }
  return results;
}
