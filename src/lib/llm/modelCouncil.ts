import { SourceItem } from '../types/thread';

export interface CouncilPerspective {
  modelName: string;
  focus: string;
  summary: string;
}

export function generateCouncilSynthesis(
  query: string,
  sources: SourceItem[]
): string[] {
  const sourceRefs = sources.slice(0, 4).map((s) => `[${s.ordinal}] ${s.domain}`).join(', ');

  const responseSections = [
    `# Model Council Deliberation: "${query}"\n\n`,
    `> **Council Framework**: Evaluating inputs from 3 distinct frontier reasoning perspectives using grounded references (${sourceRefs || 'empirical sources'}).\n\n`,
    `---\n\n`,
    `## 1. Empirical & Analytical Perspective (Claude Sonnet 5.5)\n\n`,
    `From a structured empirical standpoint, **${query}** represents a complex domain requiring methodical analysis:\n`,
    `- **Core Foundation**: Grounded literature [1] emphasizes strict evidentiary rigor and baseline definitions.\n`,
    `- **Observed Mechanisms**: Practical systems operate within validated parameters rather than speculative abstractions [2].\n`,
    `- **Risk & Edge Cases**: Key vulnerabilities include unverified edge conditions and boundary transition failures.\n\n`,
    `---\n\n`,
    `## 2. Speed & Pragmatic Perspective (Gemini 3.8 Flash)\n\n`,
    `From a practical implementation and execution viewpoint:\n`,
    `- **Direct Application**: Most deployments of **${query}** yield immediate efficiency gains when configured with lean defaults [3].\n`,
    `- **Real-world Adoption**: Industry momentum is accelerating around standard interfaces and automated verification loops.\n`,
    `- **Actionable Advice**: Prioritize functional MVP over exhaustive theoretical optimization.\n\n`,
    `---\n\n`,
    `## 3. Deep Logical & Critical Perspective (DeepSeek R1)\n\n`,
    `<think>\n`,
    `Deconstructing core premises of "${query}"...\n`,
    `- Examining fundamental trade-offs between speed, accuracy, and operational overhead.\n`,
    `- Cross-referencing source citations [1] and [4] for contradictory claims.\n`,
    `- Synthesizing foundational conclusion.\n`,
    `</think>\n\n`,
    `The primary bottleneck is not conceptual viability, but error recovery and state convergence. While existing implementations [4] succeed in nominal conditions, fail-soft mechanisms remain essential for resilience.\n\n`,
    `---\n\n`,
    `## Unified Council Consensus\n\n`,
    `| Dimension | Gemini Flash | Claude Sonnet | DeepSeek R1 | Council Verdict |\n`,
    `| :--- | :--- | :--- | :--- | :--- |\n`,
    `| **Maturity** | High Production Readiness | Measured Cautious | In Transition | **Ready for Standard Workflows** |\n`,
    `| **Primary Bottleneck** | Setup Overhead | Edge-Case Robustness | State Convergence | **Focus on Fault Isolation** |\n`,
    `| **Recommended Action** | Deploy Default Config | Implement Guardrails | Add Invariant Checks | **Adopt with Layered Verification** |\n\n`,
    `**Final Council Determination**: Proceed with calibrated implementation under continuous observation. Ground all claims against verified primary sources [1], [2].\n`,
  ];

  return responseSections;
}
