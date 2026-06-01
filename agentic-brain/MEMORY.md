# Memory - AurumDesk Knowledge Bot

## Decisions Made

### Decision 1 - Finance/Trading Context

The project was intentionally customized around a fictional finance and trading AI company instead of using a generic HR or vacation-policy bot.

Reason:
The target company works around trading, programming, and AI. A finance-focused knowledge bot is more relevant and memorable for them.

### Decision 2 - No Trading Signal Bot

A trading signal bot was avoided.

Reason:
A signal bot would require market data, strategy validation, and risk disclaimers. It could become unreliable or misleading. A knowledge bot is safer, more aligned with the task, and easier to evaluate.

### Decision 3 - Local Docs as Source of Truth

The bot uses local markdown files inside docs/ as its knowledge base.

Reason:
The assignment specifically asks for a docs/ folder and a system that answers based on those documents.

### Decision 4 - Simple Retrieval First

The first version will use simple keyword/section retrieval instead of embeddings or a vector database.

Reason:
The MVP should be easy to run and easy to explain. Simple retrieval is enough for a small knowledge base and demonstrates product thinking without unnecessary complexity.

### Decision 5 - Source Display Is Required

The UI should show the source document used for the answer.

Reason:
For a finance/AI product, trust and traceability are important. Showing sources reduces hallucination risk and makes the bot more professional.

## Mistakes / Risks To Watch

- Do not let the bot answer from general knowledge.
- Do not make the UI too complicated.
- Do not make the repo look like one final AI-generated commit.
- Do not skip evals.
- Do not forget README instructions.
- Do not require secret API keys for the basic demo.

## Things Learned During The Project

- A small project can look much stronger if the scope is realistic and the product thinking is clear.
- For knowledge bots, refusal behavior is as important as answering behavior.
- Evaluation questions make the project easier to judge.
- Agent context files help show how AI was used as a project partner, not just a code generator.

## Current Status

Completed:

- Initialized Next.js project.
- Added fictional company knowledge docs.
- Started structured agentic-brain documentation.

Next:

- Implement document loading and retrieval logic.
- Build API route.
- Build UI.
- Add final README and polish.
