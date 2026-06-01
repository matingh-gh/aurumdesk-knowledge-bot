"use client";

import { FormEvent, useState } from "react";

type Source = {
  document: string;
  title: string;
  score: number;
  matchedTerms: string[];
};

type AskResponse = {
  question: string;
  answer: string;
  found: boolean;
  confidence: "high" | "medium" | "low";
  sources: Source[];
  error?: string;
};

const sampleQuestions = [
  "What is the maximum daily drawdown limit?",
  "What does AI Market Brief do?",
  "Can AurumDesk AI place trades automatically?",
  "What should support do if a client reports a wrong risk calculation?",
  "Should I buy Bitcoin today?",
  "Who is the CEO of AurumDesk AI?",
];

function confidenceLabel(confidence: AskResponse["confidence"]) {
  if (confidence === "high") return "High confidence";
  if (confidence === "medium") return "Medium confidence";
  return "Low confidence";
}

export default function ChatInterface() {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<AskResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function askBot(nextQuestion?: string) {
    const activeQuestion = (nextQuestion ?? question).trim();

    if (!activeQuestion) {
      setError("Please enter a question first.");
      return;
    }

    setIsLoading(true);
    setError("");
    setResult(null);
    setQuestion(activeQuestion);

    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: activeQuestion }),
      });

      const data = (await response.json()) as AskResponse;

      if (!response.ok) {
        throw new Error(data.error || "The bot could not answer this question.");
      }

      setResult(data);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Something went wrong.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void askBot();
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur md:p-8">
        <div className="mb-6 flex flex-col gap-3">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
            Internal Knowledge Assistant
          </p>
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-5xl">
                AurumDesk Knowledge Bot
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                Ask questions about a fictional finance and trading AI company.
                The bot answers only from the local company documents and shows
                its sources.
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              No external AI API required
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 md:flex-row">
          <input
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Ask about risk rules, product behavior, support process..."
            className="min-h-12 flex-1 rounded-2xl border border-slate-300 bg-white px-4 text-slate-950 outline-none transition focus:border-slate-950 focus:ring-4 focus:ring-slate-200"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="min-h-12 rounded-2xl bg-slate-950 px-6 font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isLoading ? "Searching..." : "Ask bot"}
          </button>
        </form>

        {error ? (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="mt-6">
          <p className="mb-3 text-sm font-medium text-slate-700">
            Try a sample question:
          </p>
          <div className="flex flex-wrap gap-2">
            {sampleQuestions.map((sample) => (
              <button
                key={sample}
                type="button"
                disabled={isLoading}
                onClick={() => void askBot(sample)}
                className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {sample}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-[1.4fr_0.8fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-slate-950">Answer</h2>
            {result ? (
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  result.found
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-amber-50 text-amber-700"
                }`}
              >
                {confidenceLabel(result.confidence)}
              </span>
            ) : null}
          </div>

          {isLoading ? (
            <div className="space-y-3">
              <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
              <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-slate-200" />
            </div>
          ) : result ? (
            <div className="space-y-4">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-500">
                  Question
                </p>
                <p className="mt-1 text-slate-950">{result.question}</p>
              </div>

              <p className="whitespace-pre-wrap leading-7 text-slate-700">
                {result.answer}
              </p>
            </div>
          ) : (
            <div className="rounded-2xl bg-slate-50 p-5 text-slate-600">
              Ask a question or choose one of the examples above to see a
              grounded answer from the company knowledge base.
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-xl font-semibold text-slate-950">Sources</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            The bot displays the local document sections used to answer.
          </p>

          <div className="mt-5 space-y-3">
            {result?.sources.length ? (
              result.sources.map((source) => (
                <div
                  key={`${source.document}-${source.title}`}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <p className="font-medium text-slate-950">
                    {source.document}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Section: {source.title}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    Match score: {source.score}
                  </p>
                  {source.matchedTerms.length ? (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {source.matchedTerms.slice(0, 8).map((term) => (
                        <span
                          key={term}
                          className="rounded-full bg-white px-2 py-1 text-xs text-slate-600"
                        >
                          {term}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                No sources yet.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
