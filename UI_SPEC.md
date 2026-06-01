# AurumDesk Knowledge Bot UI Specification

Goal: Build a premium, minimal, production-ready AI knowledge assistant interface for a fictional finance/trading/AI company.

The UI should feel like a real internal AI workspace, inspired by Linear, Raycast, Perplexity, Vercel, and premium fintech SaaS products.

## Core Requirements

- Minimal but not empty
- Calm and focused
- Premium typography and spacing
- Dark-first or polished light mode
- Mobile-safe and touch-safe
- No horizontal scroll
- No mobile overlays that block taps
- No unsafe h-screen/w-screen overflow-hidden pattern
- Source-aware answer display
- Safe fallback state for unsupported questions
- Sticky or bottom composer that works on mobile
- Sample questions always available
- Smooth but subtle animations

## Layout

Desktop:
- Dark sidebar on the left
- Main chat workspace in the center
- Source/citation panel on the right
- Compact top bar
- Composer at the bottom of main workspace

Mobile:
- No sidebar
- No drawer overlay
- Top bar remains compact
- Sample questions are displayed as tappable chips
- Chat and sources stack in one column
- Composer remains touch-safe
- Textarea uses 16px font size to prevent iPhone zoom

## Scope for MVP

Included:
- Responsive app shell
- Chat flow
- Sample questions
- Source citations
- Dark/light theme
- Loading state
- Safe fallback
- Mobile-safe layout

Postponed:
- Framer Motion
- Markdown renderer
- Source hover previews
- Keyboard shortcut modal
- Streaming text simulation
- Copy answer button
