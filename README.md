# AurumDesk Knowledge Bot

AurumDesk Knowledge Bot is a small company knowledge assistant for a fictional finance and trading AI company called AurumDesk AI.

The project was built as a practical AI/Product + Finance test. It demonstrates how a small knowledge bot can be planned, documented, implemented, tested, and improved with AI-assisted development.

## What It Does

The app lets a user ask questions about the fictional company and receives answers based only on local Markdown documents inside the `docs/` folder.

The bot can answer questions about:

- Company overview
- Trading risk rules
- Daily and total drawdown limits
- AI Market Brief product behavior
- Support team procedures
- Client FAQ
- Financial advice boundaries

If the answer is not found in the local knowledge base, the bot does not guess. It returns:

`I couldn't find this information in the company knowledge base.`

## Why This Project

The assignment asked for a Mini Company Knowledge Bot with local docs, agent context, memory, tasks, evals, and meaningful Git history.

Instead of building a generic HR bot, this project uses a finance and trading AI context because it is more relevant to a company working around trading, programming, and artificial intelligence.

The project is intentionally small, but it focuses on product quality:

- Simple and clean UI
- Local knowledge base
- Source-aware answers
- Safe no-answer behavior
- Meaningful Git commits
- Agentic project documentation
- Evaluation questions

## Tech Stack

- Next.js
- TypeScript
- Tailwind CSS
- Local Markdown documents
- Simple keyword and section retrieval
- No external AI API required for the MVP

## How It Works

1. The user asks a question in the web interface.
2. The frontend sends the question to `/api/ask`.
3. The API loads the Markdown files from `docs/`.
4. The retriever splits documents into sections and scores them by keyword relevance.
5. The answer layer returns a concise answer from the best matching section.
6. The UI displays the answer, confidence level, and source document.
7. If the match is too weak, the bot returns a safe fallback instead of hallucinating.

## Project Structure

- `app/` contains the Next.js app and API route.
- `components/` contains the chat UI.
- `lib/` contains document loading, retrieval, and answer logic.
- `docs/` contains the fictional company knowledge base.
- `agentic-brain/` contains project brief, context, memory, tasks, and evals.

## Local Setup

Install dependencies:

```bash
npm install
