"use client";

import {
  type FormEvent,
  type KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ArrowUp,
  Bot,
  BrainCircuit,
  CheckCircle2,
  Database,
  FileSearch,
  FileText,
  Loader2,
  Moon,
  ShieldCheck,
  Sparkles,
  Sun,
} from "lucide-react";

type Confidence = "high" | "medium" | "low";

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
  confidence: Confidence;
  sources: Source[];
  error?: string;
};

type Turn = {
  id: string;
  question: string;
  loading: boolean;
  response?: AskResponse;
  error?: string;
};

type Theme = "dark" | "light";

const SAMPLE_QUESTIONS = [
  "What is the maximum daily drawdown limit?",
  "What does AI Market Brief do?",
  "Can AurumDesk AI place trades automatically?",
  "What should support do if a client reports a wrong risk calculation?",
  "Should I buy Bitcoin today?",
  "Who is the CEO of AurumDesk AI?",
];

const DOCS = [
  "Company overview",
  "Trading risk policy",
  "AI Market Brief",
  "Support playbook",
  "Client FAQ",
];

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getTheme(theme: Theme) {
  const dark = theme === "dark";

  return {
    dark,
    page: dark ? "bg-[#09090B] text-zinc-100" : "bg-[#F4F4F0] text-zinc-950",
    shell: dark
      ? "border-white/[0.08] bg-[#0D0D10] shadow-[0_32px_120px_rgba(0,0,0,0.42)]"
      : "border-zinc-200 bg-white shadow-[0_28px_90px_rgba(24,24,27,0.12)]",
    sidebar: dark ? "bg-[#111114] border-white/[0.08]" : "bg-[#18181B] border-black/10",
    workspace: dark ? "bg-[#09090B]" : "bg-[#FAFAF8]",
    panel: dark ? "bg-[#111114] border-white/[0.08]" : "bg-white border-zinc-200",
    panelSoft: dark ? "bg-white/[0.035] border-white/[0.07]" : "bg-zinc-50 border-zinc-200",
    border: dark ? "border-white/[0.08]" : "border-zinc-200",
    borderSoft: dark ? "border-white/[0.06]" : "border-zinc-200/80",
    muted: dark ? "text-zinc-400" : "text-zinc-600",
    subtle: dark ? "text-zinc-500" : "text-zinc-500",
    chip: dark
      ? "border-white/[0.08] bg-white/[0.035] text-zinc-300 hover:bg-white/[0.07] hover:text-white"
      : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950",
    input: dark
      ? "border-white/[0.10] bg-[#111114] text-zinc-100 placeholder:text-zinc-500 focus-within:border-indigo-400/50 focus-within:ring-indigo-400/10"
      : "border-zinc-200 bg-white text-zinc-950 placeholder:text-zinc-400 focus-within:border-indigo-500/40 focus-within:ring-indigo-500/10",
    user: dark ? "bg-indigo-400 text-zinc-950" : "bg-zinc-950 text-white",
    assistant: dark ? "bg-[#111114] border-white/[0.08]" : "bg-white border-zinc-200",
    send: dark ? "bg-indigo-400 text-zinc-950 hover:bg-indigo-300" : "bg-zinc-950 text-white hover:bg-zinc-800",
    sendDisabled: dark ? "bg-white/[0.08] text-zinc-600" : "bg-zinc-200 text-zinc-400",
  };
}

function confidenceLabel(confidence: Confidence) {
  if (confidence === "high") return "High confidence";
  if (confidence === "medium") return "Medium confidence";
  return "Low confidence";
}

function confidenceClass(theme: Theme, confidence: Confidence) {
  if (confidence === "high") {
    return theme === "dark"
      ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
      : "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (confidence === "medium") {
    return theme === "dark"
      ? "border-amber-400/20 bg-amber-400/10 text-amber-300"
      : "border-amber-200 bg-amber-50 text-amber-700";
  }

  return theme === "dark"
    ? "border-zinc-500/20 bg-zinc-500/10 text-zinc-300"
    : "border-zinc-200 bg-zinc-100 text-zinc-600";
}

function foundBadgeClass(theme: Theme, found: boolean) {
  if (found) {
    return theme === "dark"
      ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
      : "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  return theme === "dark"
    ? "border-amber-400/20 bg-amber-400/10 text-amber-300"
    : "border-amber-200 bg-amber-50 text-amber-700";
}

function scorePercent(score: number) {
  return Math.max(0, Math.min(100, Math.round((score / 12) * 100)));
}

function Sidebar({
  loading,
  onPick,
}: {
  loading: boolean;
  onPick: (question: string) => void;
}) {
  return (
    <aside className="hidden w-[244px] shrink-0 flex-col border-r bg-[#18181B] text-zinc-300 md:flex">
      <div className="flex h-16 items-center gap-3 border-b border-white/[0.08] px-4">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-400 text-zinc-950">
          <BrainCircuit className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">AurumDesk</p>
          <p className="truncate text-[11px] uppercase tracking-[0.18em] text-zinc-500">
            Knowledge Bot
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4">
        <section>
          <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Knowledge base
          </p>

          <div className="space-y-1">
            {DOCS.map((doc) => (
              <div
                key={doc}
                className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-[13px] text-zinc-400 transition hover:bg-white/[0.06] hover:text-white"
              >
                <FileText className="h-3.5 w-3.5 text-zinc-600" />
                <span className="truncate">{doc}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-7">
          <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Suggested questions
          </p>

          <div className="space-y-1">
            {SAMPLE_QUESTIONS.map((question) => (
              <button
                key={question}
                type="button"
                disabled={loading}
                onClick={() => onPick(question)}
                className="w-full touch-manipulation rounded-xl px-2.5 py-2 text-left text-[12.5px] leading-5 text-zinc-400 transition hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-45"
              >
                {question}
              </button>
            ))}
          </div>
        </section>
      </div>

      <div className="border-t border-white/[0.08] p-3">
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <p className="text-xs font-medium text-zinc-200">Safe fallback</p>
          </div>
          <p className="mt-1 text-[11px] leading-5 text-zinc-500">
            Unsupported questions are refused instead of invented.
          </p>
        </div>
      </div>
    </aside>
  );
}

function SourceBlock({ sources, theme }: { sources: Source[]; theme: Theme }) {
  const t = getTheme(theme);

  if (!sources.length) {
    return (
      <div className={cn("rounded-2xl border p-4 text-sm leading-6", t.panelSoft, t.muted)}>
        No source matched. The assistant used the safe fallback and did not invent an answer.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sources.map((source, index) => {
        const percent = scorePercent(source.score);

        return (
          <article
            key={`${source.document}-${source.title}-${index}`}
            className={cn("rounded-2xl border p-4", t.panelSoft)}
          >
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "grid h-9 w-9 shrink-0 place-items-center rounded-xl",
                  theme === "dark" ? "bg-white/[0.06]" : "border border-zinc-200 bg-white",
                )}
              >
                <FileText className="h-4 w-4" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{source.title}</p>
                <p className={cn("mt-1 break-words text-xs", t.muted)}>{source.document}</p>

                <div className="mt-3 flex items-center gap-2">
                  <div className={cn("h-1.5 flex-1 overflow-hidden rounded-full", theme === "dark" ? "bg-white/[0.08]" : "bg-zinc-200")}>
                    <div className="h-full rounded-full bg-indigo-500" style={{ width: `${percent}%` }} />
                  </div>
                  <span className={cn("text-[11px] tabular-nums", t.subtle)}>
                    {source.score.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {source.matchedTerms.length ? (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {source.matchedTerms.slice(0, 8).map((term) => (
                  <span
                    key={term}
                    className={cn(
                      "rounded-full border px-2 py-1 text-[11px]",
                      theme === "dark"
                        ? "border-white/[0.08] bg-white/[0.045] text-zinc-300"
                        : "border-zinc-200 bg-white text-zinc-600",
                    )}
                  >
                    {term}
                  </span>
                ))}
              </div>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}

function EmptyState({
  theme,
}: {
  theme: Theme;
  loading: boolean;
  onPick: (question: string) => void;
}) {
  const t = getTheme(theme);

  return (
    <section className={cn("rounded-3xl border p-5 sm:p-6", t.panel)}>
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "grid h-12 w-12 shrink-0 place-items-center rounded-2xl",
            theme === "dark" ? "bg-indigo-400 text-zinc-950" : "bg-zinc-950 text-white",
          )}
        >
          <Sparkles className="h-5 w-5" />
        </div>

        <div>
          <h2 className="text-xl font-semibold tracking-tight">Ready when you are.</h2>
          <p className={cn("mt-2 max-w-2xl text-sm leading-6", t.muted)}>
            Ask a question from the chips above or type your own prompt below.
            The assistant answers only from approved local company documents and shows its sources.
          </p>

          <div className={cn("mt-5 flex flex-wrap gap-2 border-t pt-4", t.borderSoft)}>
            <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs", t.panelSoft, t.muted)}>
              <Database className="h-3.5 w-3.5" />
              Local Markdown docs
            </span>
            <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs", t.panelSoft, t.muted)}>
              <FileSearch className="h-3.5 w-3.5" />
              Source-aware answers
            </span>
            <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs", t.panelSoft, t.muted)}>
              <ShieldCheck className="h-3.5 w-3.5" />
              Safe fallback
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function TurnCard({ turn, theme }: { turn: Turn; theme: Theme }) {
  const t = getTheme(theme);

  return (
    <div className="animate-[messageIn_260ms_ease-out] space-y-4">
      <div className="flex justify-end">
        <div className={cn("max-w-[92%] rounded-2xl rounded-tr-md px-4 py-3 text-sm leading-6 sm:max-w-[76%]", t.user)}>
          {turn.question}
        </div>
      </div>

      <div className="flex gap-3">
        <div className={cn("mt-1 hidden h-9 w-9 shrink-0 place-items-center rounded-xl sm:grid", theme === "dark" ? "bg-white/[0.06]" : "border border-zinc-200 bg-white")}>
          <BrainCircuit className="h-4 w-4" />
        </div>

        <div className={cn("min-w-0 flex-1 rounded-3xl border p-4 sm:p-5", t.assistant)}>
          {turn.loading ? (
            <div className="space-y-3">
              <div className={cn("flex items-center gap-2 text-sm", t.muted)}>
                <Loader2 className="h-4 w-4 animate-spin" />
                Searching local documents...
              </div>
              <div className="space-y-2">
                <div className={cn("h-3 w-[92%] animate-pulse rounded-full", theme === "dark" ? "bg-white/[0.08]" : "bg-zinc-200")} />
                <div className={cn("h-3 w-[75%] animate-pulse rounded-full", theme === "dark" ? "bg-white/[0.08]" : "bg-zinc-200")} />
                <div className={cn("h-3 w-[84%] animate-pulse rounded-full", theme === "dark" ? "bg-white/[0.08]" : "bg-zinc-200")} />
              </div>
            </div>
          ) : turn.error ? (
            <div>
              <p className="font-medium text-red-500">Something went wrong</p>
              <p className={cn("mt-1 text-sm leading-6", t.muted)}>{turn.error}</p>
            </div>
          ) : turn.response ? (
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium", foundBadgeClass(theme, turn.response.found))}>
                  {turn.response.found ? <CheckCircle2 className="h-3 w-3" /> : <ShieldCheck className="h-3 w-3" />}
                  {turn.response.found ? "Answer found" : "Safe fallback"}
                </span>

                <span className={cn("rounded-full border px-2.5 py-1 text-xs font-medium", confidenceClass(theme, turn.response.confidence))}>
                  {confidenceLabel(turn.response.confidence)}
                </span>
              </div>

              <p className={cn("whitespace-pre-wrap text-sm leading-7", theme === "dark" ? "text-zinc-200" : "text-zinc-700")}>
                {turn.response.answer}
              </p>

              <div className="mt-5 xl:hidden">
                <div className={cn("mb-2 flex items-center gap-2 text-sm font-medium", t.muted)}>
                  <FileSearch className="h-4 w-4" />
                  Sources
                </div>
                <SourceBlock sources={turn.response.sources} theme={theme} />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Composer({
  theme,
  question,
  setQuestion,
  loading,
  error,
  onSubmit,
}: {
  theme: Theme;
  question: string;
  setQuestion: (question: string) => void;
  loading: boolean;
  error: string;
  onSubmit: () => void;
}) {
  const t = getTheme(theme);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "0px";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
  }, [question]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      onSubmit();
    }
  }

  return (
    <div className={cn("sticky bottom-0 z-10 border-t px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 backdrop-blur-xl sm:px-6", theme === "dark" ? "border-white/[0.08] bg-[#09090b]/92" : "border-zinc-200 bg-[#f7f7f5]/92")}>
      <form onSubmit={handleSubmit} className="mx-auto max-w-3xl">
        {error ? (
          <p className={cn("mb-2 rounded-2xl border px-3 py-2 text-sm", theme === "dark" ? "border-amber-400/20 bg-amber-400/10 text-amber-300" : "border-amber-200 bg-amber-50 text-amber-700")}>
            {error}
          </p>
        ) : null}

        <div className={cn("rounded-3xl border p-2 shadow-sm transition focus-within:ring-4", t.input)}>
          <div className="flex items-end gap-2">
            <textarea
              ref={textareaRef}
              value={question}
              disabled={loading}
              rows={1}
              onChange={(event) => setQuestion(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about risk rules, product behavior, or support workflows..."
              className="min-h-12 max-h-[160px] flex-1 resize-none bg-transparent px-3 py-3 text-[16px] leading-6 outline-none disabled:opacity-60"
            />

            <button
              type="submit"
              disabled={loading || !question.trim()}
              aria-label="Send question"
              className={cn("grid h-11 w-11 shrink-0 touch-manipulation place-items-center rounded-2xl transition active:scale-95 disabled:cursor-not-allowed", loading || !question.trim() ? t.sendDisabled : t.send)}
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowUp className="h-5 w-5" />}
            </button>
          </div>

          <div className={cn("flex items-center justify-between px-3 pb-1 pt-1.5 text-[11px]", t.subtle)}>
            <span>Enter to send</span>
            <span>Shift+Enter for new line</span>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function ChatInterface() {
  const [theme, setTheme] = useState<Theme>("light");
  const [question, setQuestion] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [loading, setLoading] = useState(false);
  const [inlineError, setInlineError] = useState("");

  const t = getTheme(theme);
  const endRef = useRef<HTMLDivElement | null>(null);

  const latestResponse = useMemo(() => {
    for (let index = turns.length - 1; index >= 0; index -= 1) {
      const turn = turns[index];
      if (turn.response && !turn.loading) return turn.response;
    }

    return null;
  }, [turns]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [turns]);

  async function askBot(nextQuestion: string) {
    const trimmedQuestion = nextQuestion.trim();

    if (!trimmedQuestion) {
      setInlineError("Please enter a question first.");
      return;
    }

    if (loading) return;

    setInlineError("");
    setQuestion("");

    const id = makeId();

    setTurns((current) => [
      ...current,
      {
        id,
        question: trimmedQuestion,
        loading: true,
      },
    ]);

    setLoading(true);

    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: trimmedQuestion }),
      });

      if (!response.ok) {
        throw new Error("The knowledge API could not answer right now.");
      }

      const data = (await response.json()) as AskResponse;

      setTurns((current) =>
        current.map((turn) =>
          turn.id === id
            ? {
                ...turn,
                loading: false,
                response: data,
                error: data.error,
              }
            : turn,
        ),
      );
    } catch (error) {
      setTurns((current) =>
        current.map((turn) =>
          turn.id === id
            ? {
                ...turn,
                loading: false,
                error:
                  error instanceof Error
                    ? error.message
                    : "Something went wrong.",
              }
            : turn,
        ),
      );
    } finally {
      setLoading(false);
    }
  }

  function handlePick(sample: string) {
    void askBot(sample);
  }

  return (
    <main className={cn("min-h-dvh w-full overflow-x-hidden", t.page)}>
      <style>{`
        @keyframes messageIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="mx-auto flex w-full max-w-[1280px] flex-col px-0 sm:px-4 sm:py-4">
        <div className={cn("flex min-h-dvh w-full overflow-hidden border sm:min-h-[calc(100dvh-2rem)] sm:rounded-[2rem]", t.shell)}>
          <Sidebar onPick={handlePick} loading={loading} />

          <section className="flex min-w-0 flex-1 flex-col">
            <header className={cn("flex h-16 shrink-0 items-center justify-between border-b px-4 sm:px-6", t.border)}>
              <div className="flex min-w-0 items-center gap-3">
                <div className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-xl", theme === "dark" ? "bg-indigo-400 text-zinc-950" : "bg-zinc-950 text-white")}>
                  <BrainCircuit className="h-4 w-4" />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">AurumDesk</p>
                  <p className={cn("truncate text-[11px]", t.muted)}>Knowledge Bot · Local company brain</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className={cn("hidden items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium sm:flex", theme === "dark" ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300" : "border-emerald-200 bg-emerald-50 text-emerald-700")}>
                  <Database className="h-3.5 w-3.5" />
                  Local docs only
                </div>

                <button
                  type="button"
                  aria-label="Toggle theme"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className={cn("grid h-10 w-10 touch-manipulation place-items-center rounded-xl border transition", theme === "dark" ? "border-white/[0.08] bg-white/[0.04] text-zinc-300 hover:bg-white/[0.08]" : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50")}
                >
                  {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>
              </div>
            </header>

            <div className="grid min-h-0 flex-1 xl:grid-cols-[minmax(0,1fr)_330px]">
              <section className={cn("flex min-w-0 flex-col", t.workspace)}>
                <div className={cn("border-b px-4 py-4 sm:px-6", t.border)}>
                  <div className="flex items-start gap-3">
                    <div className={cn("mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl", theme === "dark" ? "bg-white/[0.06]" : "border border-zinc-200 bg-white")}>
                      <Bot className="h-4 w-4" />
                    </div>

                    <div>
                      <h1 className="text-lg font-semibold tracking-tight">Ask the company brain</h1>
                      <p className={cn("mt-1 text-sm leading-6", t.muted)}>
                        Answers are grounded in approved local Markdown docs.
                      </p>
                    </div>
                  </div>
                </div>

                <div className={cn("border-b px-4 py-3 sm:px-6", t.border)}>
                  <div className="flex gap-2 overflow-x-auto pb-1 md:flex-wrap md:overflow-visible">
                    {SAMPLE_QUESTIONS.map((sample) => (
                      <button
                        key={sample}
                        type="button"
                        disabled={loading}
                        onClick={() => handlePick(sample)}
                        className={cn("touch-manipulation rounded-full border px-3 py-2 text-xs transition disabled:cursor-not-allowed disabled:opacity-50", t.chip)}
                      >
                        {sample}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="min-h-0 flex-1 px-4 py-5 sm:px-6 md:overflow-y-auto">
                  <div className="mx-auto max-w-3xl space-y-6">
                    {turns.length === 0 ? (
                      <EmptyState theme={theme} onPick={handlePick} loading={loading} />
                    ) : (
                      turns.map((turn) => <TurnCard key={turn.id} turn={turn} theme={theme} />)
                    )}
                    <div ref={endRef} />
                  </div>
                </div>

                <Composer
                  theme={theme}
                  question={question}
                  setQuestion={(value) => {
                    setQuestion(value);
                    if (inlineError) setInlineError("");
                  }}
                  loading={loading}
                  error={inlineError}
                  onSubmit={() => void askBot(question)}
                />
              </section>

              <aside className={cn("hidden border-l p-4 xl:block", t.border, theme === "dark" ? "bg-[#0e0e12]" : "bg-zinc-50")}>
                <div className="sticky top-4">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Evidence</p>
                      <p className={cn("mt-1 text-xs", t.muted)}>Source documents and matched terms</p>
                    </div>

                    <div className={cn("grid h-10 w-10 place-items-center rounded-xl", theme === "dark" ? "bg-white/[0.06]" : "border border-zinc-200 bg-white")}>
                      <FileSearch className="h-4 w-4" />
                    </div>
                  </div>

                  {latestResponse ? (
                    <SourceBlock sources={latestResponse.sources} theme={theme} />
                  ) : (
                    <div className={cn("rounded-2xl border p-4 text-sm leading-6", t.panelSoft, t.muted)}>
                      Ask a question to see the retrieved Markdown sources here.
                    </div>
                  )}
                </div>
              </aside>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
