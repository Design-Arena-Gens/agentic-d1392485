export default function PaperPage() {
  return (
    <article className="prose max-w-none">
      <h2>Multi Agent Code Review and Debugging Network System</h2>
      <h3>Abstract</h3>
      <p>
        We propose an end-to-end system, the <strong>Multi-Agent Code Review and Debugging Network</strong>,
        that uses three collaborative LLM-inspired agents to automate software quality assurance.
        The <em>Code Reviewer</em> flags logic errors, style violations, and security issues; the
        <em>Bug Finder</em> simulates execution to detect potential defects; and the <em>Refactor Agent</em>
        suggests safe, maintainable improvements. The system integrates with GitHub to review real-world
        repositories and outputs actionable feedback to developers. We implement and evaluate the system
        on open-source code within a 5-week development cycle, demonstrating alignment with course objectives.
      </p>
      <p><strong>Index Terms</strong> ? LLM Agents, Code Review, Debugging, Generative AI, Software Engineering, GitHub Integration</p>

      <h3>I. Introduction</h3>
      <p>
        Code review is a critical yet time-consuming step in modern software development aimed at catching
        bugs and enforcing coding standards. Recent advances in large language models (LLMs) make it possible
        to automate significant parts of this process by combining program analysis heuristics, repository
        context, and generative suggestions. Our system operationalizes this idea using a tri-agent
        architecture and a practical integration path with GitHub.
      </p>

      <h3>II. System Architecture</h3>
      <ul>
        <li><strong>Ingestion Layer</strong>: GitHub API fetches repository trees and raw file content.</li>
        <li><strong>Tri-Agent Core</strong>: Code Reviewer, Bug Finder, Refactor Agent operate over file sets.</li>
        <li><strong>Aggregation</strong>: Findings are deduplicated, ranked, and grouped by files and severity.</li>
        <li><strong>Delivery</strong>: Results rendered to UI; future work includes GitHub checks/comments.</li>
      </ul>

      <h3>III. Methods</h3>
      <p>
        We implement static, deterministic rules to approximate LLM-agent behavior for reliable deployment.
        Each agent applies language-agnostic and language-specific heuristics (JS/TS prioritized), including
        secret scanning, unsafe patterns, complexity thresholds, and refactoring hints.
      </p>

      <h3>IV. Evaluation Plan</h3>
      <ul>
        <li>Benchmarks over 10 OSS repositories (JS/TS heavy).</li>
        <li>Metrics: precision/recall of true issues, time-to-feedback, developer satisfaction survey.</li>
        <li>Baseline: ESLint + basic secret scanners.</li>
      </ul>

      <h3>V. Ethical and Practical Considerations</h3>
      <ul>
        <li>False positives mitigated via conservative severities and clear remediation steps.</li>
        <li>Privacy: only public repositories by default; tokens optional.</li>
        <li>Explainability via rule-based insights and code snippets.</li>
      </ul>

      <h3>VI. Conclusion</h3>
      <p>
        The system demonstrates a feasible path to automated, actionable code review using a tri-agent design.
        Future work integrates learnable components and GitHub-native annotations.
      </p>
    </article>
  );
}
