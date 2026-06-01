# Project Brief - AurumDesk Knowledge Bot

## Project Name

AurumDesk Knowledge Bot

## What This Project Is

AurumDesk Knowledge Bot is a small but realistic company knowledge assistant for a fictional finance and trading technology company called AurumDesk AI.

The goal is to let a user ask questions about the company, its trading risk rules, product behavior, support process, and client FAQ. The assistant answers only from the local documents inside the docs/ folder.

This project was built as a practical test to demonstrate AI-assisted product thinking, context management, Git workflow, basic retrieval logic, and clean UI/UX.

## MVP Scope

The MVP includes:

- A Next.js web app with a simple chat-style interface.
- A local docs/ folder containing fictional company knowledge files.
- A retrieval layer that searches the documents for relevant content.
- An API route that receives a user question and returns an answer.
- Source display so users can see which document supported the answer.
- Safe fallback behavior when the answer is not found in the knowledge base.
- Agentic project documentation inside the agentic-brain/ folder.
- Evaluation questions inside EVALS.md.

## What The Bot Should Do

The bot should:

1. Accept a user question.
2. Search the local docs/ knowledge base.
3. Find the most relevant document sections.
4. Generate a concise answer based only on those documents.
5. Show the source document used for the answer.
6. Refuse to guess when the answer is missing from the docs.

## What The Bot Should Not Do

The bot should not:

- Give financial advice.
- Generate trading signals.
- Claim information that is not present in the docs.
- Pretend to know real company information.
- Execute trades or connect to external trading platforms.

## Target User

The target user is an internal team member at a fictional finance/AI company. Example users:

- Support agent
- Product manager
- Risk team member
- Analyst
- New employee onboarding into the company docs

## Product Quality Goals

The project should feel small but professional. The most important quality goals are:

- It runs locally without complicated setup.
- The UI is simple, clean, and easy to understand.
- Answers are grounded in local documents.
- Sources are visible.
- The project structure is easy for another engineer or AI coding agent to continue.
