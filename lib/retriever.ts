import type { KnowledgeSection } from "./docs";

export type RetrievedSection = KnowledgeSection & {
  score: number;
  matchedTerms: string[];
};

const STOP_WORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "that",
  "this",
  "what",
  "when",
  "where",
  "which",
  "who",
  "why",
  "how",
  "does",
  "can",
  "could",
  "would",
  "should",
  "about",
  "from",
  "into",
  "onto",
  "than",
  "then",
  "them",
  "they",
  "their",
  "there",
  "here",
  "have",
  "has",
  "had",
  "are",
  "was",
  "were",
  "will",
  "shall",
  "you",
  "your",
  "our",
  "out",
  "not",
  "but",
  "its",
  "aurumdesk",
  "company",
]);

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9/%.\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenize(text: string): string[] {
  return normalize(text)
    .split(" ")
    .map((token) => token.trim())
    .filter(Boolean)
    .map((token) =>
      token.endsWith("s") && token.length > 4 ? token.slice(0, -1) : token,
    )
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));
}

function expandQuestionTokens(question: string): string[] {
  const normalizedQuestion = normalize(question);
  const tokens = new Set(tokenize(question));

  if (
    /\b(buy|sell|invest|bitcoin|stock|forex|crypto|signal|recommendation|advice)\b/.test(
      normalizedQuestion,
    )
  ) {
    [
      "financial",
      "advice",
      "trading",
      "recommendation",
      "research",
      "assistance",
      "judgment",
    ].forEach((token) => tokens.add(token));
  }

  if (normalizedQuestion.includes("drawdown")) {
    ["risk", "daily", "total", "limit", "equity"].forEach((token) =>
      tokens.add(token),
    );
  }

  if (
    normalizedQuestion.includes("wrong risk") ||
    normalizedQuestion.includes("risk calculation")
  ) {
    ["support", "calculation", "account", "equity", "escalate"].forEach(
      (token) => tokens.add(token),
    );
  }

  if (normalizedQuestion.includes("market brief")) {
    ["market", "brief", "summary", "macro", "sentiment"].forEach((token) =>
      tokens.add(token),
    );
  }

  if (
    normalizedQuestion.includes("automatic") ||
    normalizedQuestion.includes("automatically")
  ) {
    ["execute", "trade", "human", "decision"].forEach((token) =>
      tokens.add(token),
    );
  }

  return Array.from(tokens);
}

export function scoreSection(
  question: string,
  section: KnowledgeSection,
): Pick<RetrievedSection, "score" | "matchedTerms"> {
  const questionTokens = expandQuestionTokens(question);
  const sectionText = `${section.title}\n${section.content}`;
  const sectionTokens = new Set(tokenize(sectionText));
  const titleTokens = new Set(tokenize(section.title));
  const normalizedSectionText = normalize(sectionText);
  const normalizedQuestion = normalize(question);

  let score = 0;
  const matchedTerms = new Set<string>();

  for (const token of questionTokens) {
    if (titleTokens.has(token)) {
      score += 3;
      matchedTerms.add(token);
      continue;
    }

    if (sectionTokens.has(token)) {
      score += 1;
      matchedTerms.add(token);
    }

    if (token.length > 4 && normalizedSectionText.includes(token)) {
      score += 0.25;
    }
  }

  if (
    normalizedQuestion.length > 10 &&
    normalizedSectionText.includes(normalizedQuestion)
  ) {
    score += 4;
  }

  return {
    score,
    matchedTerms: Array.from(matchedTerms),
  };
}

export function retrieveRelevantSections(
  question: string,
  sections: KnowledgeSection[],
  maxResults = 3,
): RetrievedSection[] {
  return sections
    .map((section) => {
      const result = scoreSection(question, section);

      return {
        ...section,
        score: result.score,
        matchedTerms: result.matchedTerms,
      };
    })
    .filter((section) => section.score >= 1)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);
}
