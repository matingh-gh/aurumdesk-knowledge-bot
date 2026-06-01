import type { RetrievedSection } from "./retriever";

export type KnowledgeAnswer = {
  answer: string;
  found: boolean;
  confidence: "high" | "medium" | "low";
  sources: {
    document: string;
    title: string;
    score: number;
    matchedTerms: string[];
  }[];
};

const FALLBACK_ANSWER =
  "I couldn't find this information in the company knowledge base.";

function stripMarkdown(markdown: string): string {
  return markdown
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*/g, "")
    .replace(/`/g, "")
    .trim();
}

function buildSourceList(matches: RetrievedSection[]) {
  return matches.map((match) => ({
    document: match.document,
    title: match.title,
    score: Number(match.score.toFixed(2)),
    matchedTerms: match.matchedTerms,
  }));
}

function confidenceFromScore(score: number): KnowledgeAnswer["confidence"] {
  if (score >= 6) {
    return "high";
  }

  if (score >= 3) {
    return "medium";
  }

  return "low";
}

export function buildAnswer(matches: RetrievedSection[]): KnowledgeAnswer {
  const topMatch = matches[0];

  if (!topMatch || topMatch.score < 2) {
    return {
      answer: FALLBACK_ANSWER,
      found: false,
      confidence: "low",
      sources: [],
    };
  }

  const relevantMatches = matches
    .filter((match) => match.score >= Math.max(2, topMatch.score * 0.55))
    .slice(0, 2);

  const answer = relevantMatches
    .map((match) => stripMarkdown(match.content))
    .join("\n\n")
    .slice(0, 1400)
    .trim();

  return {
    answer,
    found: true,
    confidence: confidenceFromScore(topMatch.score),
    sources: buildSourceList(relevantMatches),
  };
}
