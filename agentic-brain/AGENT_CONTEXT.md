# Agent Context - AurumDesk Knowledge Bot

## Why This File Exists

This file is written for a future AI coding agent or human developer who opens the project later and needs to understand the context quickly.

## Project Summary

This is a small Next.js + TypeScript project that implements a company knowledge bot for a fictional finance/trading AI company called AurumDesk AI.

The bot answers questions using only the local markdown files in the docs/ folder.

## Important Folders

- app/
  Contains the Next.js app routes and pages.

- docs/
  Contains the fictional company knowledge base. These files are the only approved source of truth for the bot.

- agentic-brain/
  Contains the project brief, context, memory, tasks, and evals. This folder documents the project management process.

- lib/
  Will contain document loading, retrieval, and answer-generation logic.

- components/
  Will contain reusable UI components such as the chat interface.

## Planned Architecture

The expected architecture is:

1. User asks a question in the web UI.
2. The frontend sends the question to /api/ask.
3. The API route loads markdown files from docs/.
4. The retrieval logic scores the documents or chunks based on keyword overlap.
5. The answer layer returns a grounded answer using the most relevant document content.
6. The UI displays the answer and its source.

## Retrieval Strategy

The first MVP does not need a vector database.

A simple retrieval method is acceptable:

- Read all markdown files from docs/.
- Split content into sections.
- Normalize the user question.
- Score sections by keyword overlap.
- Return the top matching sections.
- If the match score is too low, return a safe fallback answer.

This approach keeps the project small, explainable, and easy to run.

## Answering Strategy

The assistant should answer only from retrieved docs.

If relevant information is found, answer clearly and cite the source file.

If no relevant information is found, return:

"I couldn't find this information in the company knowledge base."

## UI Requirements

The UI should be simple and polished:

- Clear title and subtitle.
- Chat input.
- Sample question buttons.
- Answer card.
- Source display.
- Loading state.
- Empty state.
- Clean spacing and readable typography.

## Important Constraints

- Do not add external AI API requirements unless necessary.
- Do not require OpenAI API keys for the MVP.
- Do not overengineer the solution.
- Keep the project runnable locally with npm install and npm run dev.
- Keep Git commits meaningful.
