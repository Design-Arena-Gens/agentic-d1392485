import { NextRequest, NextResponse } from "next/server";
import { parseRepoUrl, fetchRepoTree, fetchFiles } from "@/lib/github";
import { runCodeReviewer } from "@/lib/agents/codeReviewer";
import { runBugFinder } from "@/lib/agents/bugFinder";
import { runRefactorAdvisor } from "@/lib/agents/refactorAdvisor";
import { AnalysisResult } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { repoUrl, branch } = body || {};
    if (!repoUrl || typeof repoUrl !== "string") {
      return NextResponse.json({ error: "repoUrl required" }, { status: 400 });
    }
    const parsed = parseRepoUrl(repoUrl);
    if (branch && typeof branch === "string") parsed.branch = branch;

    const paths = await fetchRepoTree(parsed);
    if (!paths.length) {
      return NextResponse.json({ error: "No files found in repo" }, { status: 404 });
    }

    const files = await fetchFiles(parsed, paths);
    const codeFiles = files.filter((f) => /\.(ts|tsx|js|jsx)$/.test(f.path));

    const reviewer = runCodeReviewer(codeFiles);
    const bugFinder = runBugFinder(codeFiles);
    const refactor = runRefactorAdvisor(codeFiles);

    const result: AnalysisResult = {
      repo: parsed,
      analyzedFileCount: codeFiles.length,
      findings: [...reviewer, ...bugFinder, ...refactor]
    };

    return NextResponse.json(result, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unknown error" }, { status: 500 });
  }
}
