---
title: "Increase Upload Size & Markdown Support"
description: "Raise file upload limit to 50MB and add .md file support with toggle preview/raw mode, syntax highlighting, and GitHub-like prose styling."
status: completed
priority: P2
effort: 6h
branch: main
tags: [feature, frontend, api]
blockedBy: []
blocks: []
created: 2026-04-22
---

# Increase Upload Size & Markdown Support

## Overview

Two related enhancements to the Share HTML platform:
1. Increase max upload size from 10MB to 50MB
2. Add `.md` file support with client-side preview (react-markdown + shiki), toggle between rendered preview and raw source, GitHub-like prose styling

## Cross-Plan Dependencies

None — no existing plans.

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Increase Upload Size to 50MB](./phase-01-increase-upload-size.md) | Completed |
| 2 | [Add Markdown File Support — Backend](./phase-02-md-backend.md) | Completed |
| 3 | [Build Markdown Viewer — Frontend](./phase-03-md-viewer.md) | Completed |
| 4 | [Integrate Viewer Routing & Polish](./phase-04-integrate-and-polish.md) | Completed |

## Dependencies

- `react-markdown` + `remark-gfm` — markdown parsing and GFM features
- `shiki` — syntax highlighting (fine-grained bundles with JS engine)
- `@shikijs/langs-*` — curated language imports
- `@shikijs/themes/github-*` — GitHub light/dark themes
- Supabase storage bucket config update (50MB limit)
