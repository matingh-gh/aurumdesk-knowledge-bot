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

const PROMPT_GROUPS = [
  { title: "Risk", description: "Drawdown, account limits, escalation rules" },
  { title: "Product", description: "AI Market Brief and product behavior" },
  { title: "Support", description: "Client questions and internal workflow" },
  { title: "Policy", description: "Safe fallback and advice boundaries" },
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
    page: dark
      ? "bg-[#141b15] text-stone-100"
      : "bg-[#e5e4dc] text-stone-950",
    app: dark
      ? "border-white/[0.08] bg-[#202820]/80 shadow-[0_36px_120px_rgba(0,0,0,0.45)]"
      : "border-white/80 bg-[#f4f3ec]/82 shadow-[0_32px_90px_rgba(20,24,20,0.18)]",
    panel: dark
      ? "border-white/[0.08] bg-white/[0.075]"
      : "border-black/[0.06] bg-white/62",
    panelStrong: dark
      ? "border-white/[0.10] bg-[#303830]"
      : "border-black/[0.06] bg-white/78",
    cardLight: dark
      ? "bg-[#e9e8df] text-stone-950"
      : "bg-white/78 text-stone-950",
    muted: dark ? "text-stone-400" : "text-stone-600",
    subtle: dark ? "text-stone-500" : "text-stone-500",
    border: dark ? "border-white/[0.08]" : "border-black/[0.06]",
    softBorder: dark ? "border-white/[0.10]" : "border-black/[0.06]",
    chip: dark
      ? "border-white/[0.10] bg-white/[0.075] text-stone-300 hover:bg-white/[0.12] hover:text-white"
      : "border-black/[0.06] bg-white/70 text-stone-700 hover:bg-white hover:text-stone-950",
    input: dark
      ? "bg-[#6f7770]/75 text-white placeholder:text-stone-300"
      : "bg-white/80 text-stone-950 placeholder:text-stone-400",
    accent: dark
      ? "bg-[#c8d7a5] text-[#151a14] hover:bg-[#d7e5b4]"
      : "bg-[#1c241c] text-white hover:bg-[#303930]",
    accentSoft: dark
      ? "border-[#c8d7a5]/25 bg-[#c8d7a5]/10 text-[#dce9bd]"
      : "border-emerald-600/20 bg-emerald-50 text-emerald-700",
    disabled: dark
      ? "bg-white/[0.12] text-stone-500"
      : "bg-stone-200 text-stone-400",
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
      ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-200"
      : "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (confidence === "medium") {
    return theme === "dark"
      ? "border-amber-300/20 bg-amber-300/10 text-amber-200"
      : "border-amber-200 bg-amber-50 text-amber-700";
  }

  return theme === "dark"
    ? "border-stone-300/20 bg-stone-300/10 text-stone-300"
    : "border-stone-200 bg-stone-100 text-stone-600";
}

function foundClass(theme: Theme, found: boolean) {
  if (found) {
    return theme === "dark"
      ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-200"
      : "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  return theme === "dark"
    ? "border-amber-300/20 bg-amber-300/10 text-amber-200"
    : "border-amber-200 bg-amber-50 text-amber-700";
}

function scorePercent(score: number) {
  return Math.max(0, Math.min(100, Math.round((score / 12) * 100)));
}

function SourceCards({ sources, theme }: { sources: Source[]; theme: Theme }) {
  const t = getTheme(theme);

  if (!sources.length) {
    return (
      <div
        className={cn(
          "rounded-3xl border p-4 text-sm leading-6",
          t.panel,
          t.muted,
        )}
      >
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
            className={cn("rounded-3xl border p-4", t.panel)}
          >
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "grid h-10 w-10 shrink-0 place-items-center rounded-2xl",
                  theme === "dark"
                    ? "bg-white/[0.10] text-stone-200"
                    : "bg-stone-950 text-white",
                )}
              >
                <FileText className="h-4 w-4" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{source.title}</p>
                <p className={cn("mt-1 break-words text-xs", t.muted)}>
                  {source.document}
                </p>

                <div className="mt-3 flex items-center gap-2">
                  <div
                    className={cn(
                      "h-1.5 flex-1 overflow-hidden rounded-full",
                      theme === "dark" ? "bg-white/[0.12]" : "bg-stone-200",
                    )}
                  >
                    <div
                      className="h-full rounded-full bg-[#c8d7a5]"
                      style={{ width: `${percent}%` }}
                    />
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
                        ? "border-white/[0.10] bg-white/[0.07] text-stone-300"
                        : "border-black/[0.06] bg-white/70 text-stone-600",
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

function Header({
  theme,
  setTheme,
  clearChat,
  hasMessages,
}: {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  clearChat: () => void;
  hasMessages: boolean;
}) {
  const t = getTheme(theme);

  return (
    <header className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={cn(
            "grid h-10 w-10 shrink-0 place-items-center rounded-2xl",
            theme === "dark" ? "bg-[#c8d7a5] text-[#151a14]" : "bg-[#1c241c] text-white",
          )}
        >
          <BrainCircuit className="h-5 w-5" />
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">AurumDesk AI</p>
          <p className={cn("truncate text-xs", t.muted)}>Knowledge command studio</p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {hasMessages ? (
          <button
            type="button"
            onClick={clearChat}
            className={cn(
              "hidden rounded-full border px-3 py-2 text-xs font-medium transition sm:block",
              t.chip,
            )}
          >
            New chat
          </button>
        ) : null}

        <button
          type="button"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
          className={cn(
            "grid h-10 w-10 touch-manipulation place-items-center rounded-2xl border transition",
            t.chip,
          )}
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>
    </header>
  );
}

function LeftStudio({
  theme,
  loading,
  onPick,
}: {
  theme: Theme;
  loading: boolean;
  onPick: (question: string) => void;
}) {
  const t = getTheme(theme);

  return (
    <section className="space-y-5">
      <div className={cn("rounded-[2rem] border p-5 sm:p-6", t.panel)}>
        <div className="mb-8 flex items-center justify-between">
          <span
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium",
              t.accentSoft,
            )}
          >
            Local docs only
          </span>
          <Database className={cn("h-5 w-5", t.subtle)} />
        </div>

        <h1 className="max-w-xl text-5xl font-light leading-[0.95] tracking-[-0.06em] sm:text-6xl lg:text-7xl">
          Ask with
          <br />
          <span className={theme === "dark" ? "text-[#c8d7a5]" : "text-[#73805e]"}>
            context.
          </span>
          <br />
          Answer with
          <br />
          sources.
        </h1>

        <p className={cn("mt-6 max-w-md text-sm leading-7", t.muted)}>
          A compact knowledge assistant for a fictional finance and trading AI company.
          It answers from local Markdown documents and shows the source behind each answer.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {PROMPT_GROUPS.map((item) => (
          <div key={item.title} className={cn("rounded-[1.6rem] border p-4", t.panel)}>
            <div
              className={cn(
                "mb-4 grid h-10 w-10 place-items-center rounded-2xl",
                theme === "dark" ? "bg-white/[0.10]" : "bg-white/80",
              )}
            >
              <Sparkles className="h-4 w-4" />
            </div>
            <p className="font-semibold">{item.title}</p>
            <p className={cn("mt-1 text-xs leading-5", t.muted)}>{item.description}</p>
          </div>
        ))}
      </div>

      <div className={cn("rounded-[2rem] border p-4", t.panel)}>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold">Prompt library</p>
          <span className={cn("text-xs", t.subtle)}>6 tests</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {SAMPLE_QUESTIONS.map((sample) => (
            <button
              key={sample}
              type="button"
              disabled={loading}
              onClick={() => onPick(sample)}
              className={cn(
                "touch-manipulation rounded-full border px-3 py-2 text-xs leading-5 transition disabled:cursor-not-allowed disabled:opacity-50",
                t.chip,
              )}
            >
              {sample}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function EmptyChat({ theme }: { theme: Theme }) {
  const t = getTheme(theme);

  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center px-5 py-8 text-center">
      <div
        className={cn(
          "mb-4 grid h-14 w-14 place-items-center rounded-3xl",
          theme === "dark" ? "bg-[#c8d7a5] text-[#151a14]" : "bg-[#1c241c] text-white",
        )}
      >
        <Bot className="h-6 w-6" />
      </div>

      <h2 className="text-xl font-semibold">Ready to query the company brain</h2>
      <p className={cn("mt-2 max-w-sm text-sm leading-6", t.muted)}>
        Pick a prompt from the library or ask your own question below.
      </p>
    </div>
  );
}

function TurnCard({ turn, theme }: { turn: Turn; theme: Theme }) {
  const t = getTheme(theme);

  return (
    <article className="animate-[messageIn_260ms_ease-out] space-y-4">
      <div className="flex justify-end">
        <div
          className={cn(
            "max-w-[86%] rounded-[1.4rem] rounded-tr-md px-4 py-3 text-sm leading-6",
            theme === "dark" ? "bg-[#c8d7a5] text-[#151a14]" : "bg-[#1c241c] text-white",
          )}
        >
          {turn.question}
        </div>
      </div>

      <div className="flex items-start gap-3">
        <div
          className={cn(
            "mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-2xl",
            theme === "dark" ? "bg-white/[0.10]" : "bg-white/80",
          )}
        >
          <BrainCircuit className="h-4 w-4" />
        </div>

        <div className={cn("min-w-0 flex-1 rounded-[1.5rem] border p-4", t.cardLight)}>
          {turn.loading ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-stone-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Searching local documents...
              </div>
              <div className="space-y-2">
                <div className="h-3 w-[90%] animate-pulse rounded-full bg-stone-200" />
                <div className="h-3 w-[72%] animate-pulse rounded-full bg-stone-200" />
                <div className="h-3 w-[80%] animate-pulse rounded-full bg-stone-200" />
              </div>
            </div>
          ) : turn.error ? (
            <div>
              <p className="font-medium text-red-600">Something went wrong</p>
              <p className="mt-1 text-sm leading-6 text-stone-600">{turn.error}</p>
            </div>
          ) : turn.response ? (
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
                    foundClass(theme, turn.response.found),
                  )}
                >
                  {turn.response.found ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <ShieldCheck className="h-3 w-3" />
                  )}
                  {turn.response.found ? "Answer found" : "Safe fallback"}
                </span>

                <span
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-xs font-medium",
                    confidenceClass(theme, turn.response.confidence),
                  )}
                >
                  {confidenceLabel(turn.response.confidence)}
                </span>
              </div>

              <p className="whitespace-pre-wrap text-sm leading-7 text-stone-700">
                {turn.response.answer}
              </p>

              <div className="mt-5">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-stone-500">
                  <FileSearch className="h-4 w-4" />
                  Sources
                </div>
                <SourceCards sources={turn.response.sources} theme={theme} />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </article>
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
  setQuestion: (value: string) => void;
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
    textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
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
    <form onSubmit={handleSubmit}>
      {error ? (
        <p
          className={cn(
            "mb-2 rounded-2xl border px-3 py-2 text-sm",
            theme === "dark"
              ? "border-amber-300/20 bg-amber-300/10 text-amber-200"
              : "border-amber-200 bg-amber-50 text-amber-700",
          )}
        >
          {error}
        </p>
      ) : null}

      <div className={cn("rounded-[1.7rem] p-2", t.input)}>
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={question}
            disabled={loading}
            rows={1}
            onChange={(event) => setQuestion(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your question..."
            className="min-h-12 max-h-[150px] flex-1 resize-none bg-transparent px-4 py-3 text-[16px] leading-6 outline-none disabled:opacity-60"
          />

          <button
            type="submit"
            disabled={loading || !question.trim()}
            aria-label="Send question"
            className={cn(
              "grid h-12 w-12 shrink-0 touch-manipulation place-items-center rounded-full transition active:scale-95 disabled:cursor-not-allowed",
              loading || !question.trim() ? t.disabled : t.accent,
            )}
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowUp className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </form>
  );
}

export default function ChatInterface() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [question, setQuestion] = useState("");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [loading, setLoading] = useState(false);
  const [inlineError, setInlineError] = useState("");

  const t = getTheme(theme);
  const endRef = useRef<HTMLDivElement | null>(null);

  const hasMessages = turns.length > 0;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [turns]);

  async function askBot(nextQuestion: string) {
    const trimmed = nextQuestion.trim();

    if (!trimmed) {
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
        question: trimmed,
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
        body: JSON.stringify({ question: trimmed }),
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
    <main className={cn("min-h-dvh w-full overflow-x-hidden px-3 py-4 sm:px-5 sm:py-6", t.page)}>
      <style>{`
        @keyframes messageIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className={cn("mx-auto w-full max-w-7xl rounded-[2.2rem] border p-3 backdrop-blur-xl sm:p-4", t.app)}>
        <Header
          theme={theme}
          setTheme={setTheme}
          clearChat={() => setTurns([])}
          hasMessages={hasMessages}
        />

        <div className="mt-5 grid gap-5 lg:grid-cols-[0.88fr_1.12fr]">
          <LeftStudio theme={theme} loading={loading} onPick={handlePick} />

          <section className={cn("flex min-h-[640px] flex-col rounded-[2rem] border p-3 sm:p-4", t.panel)}>
            <div className="mb-3 flex items-center justify-between px-1">
              <div>
                <p className="text-sm font-semibold">Knowledge chat</p>
                <p className={cn("text-xs", t.muted)}>Grounded answers with source evidence</p>
              </div>

              <div
                className={cn(
                  "hidden rounded-full border px-3 py-1.5 text-xs font-medium sm:block",
                  t.accentSoft,
                )}
              >
                No external AI API
              </div>
            </div>

            <div className={cn("flex-1 overflow-y-auto rounded-[1.7rem] border p-3 sm:p-4", t.panel)}>
              <div className="space-y-5">
                {turns.length === 0 ? (
                  <EmptyChat theme={theme} />
                ) : (
                  turns.map((turn) => <TurnCard key={turn.id} turn={turn} theme={theme} />)
                )}
                <div ref={endRef} />
              </div>
            </div>

            <div className="mt-3">
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
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
