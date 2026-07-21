# 🟢 Person 3 — Chat & Upload Pages

## Your Goal
Make the Chat page usable for judges who don't know what to type. Make the Upload page show what documents are already in the system.

---

## Your Time Budget (1 Day)

| Time | Task |
|---|---|
| Morning (2h) | Create `SuggestedQuestions` component |
| Mid-morning (1h) | Improve `ChatWindow` welcome message and add a clear button |
| Afternoon (2h) | Update `ChatPage` to show suggested questions |
| Late afternoon (2h) | Update `UploadPage` to list already-ingested documents with a "Load Sample" button |

---

## Files You EDIT

| File | What to change |
|---|---|
| `frontend/src/components/ChatWindow.tsx` | Improve the initial welcome message to be more descriptive. Add a "Clear chat" button in the header |
| `frontend/src/pages/ChatPage.tsx` | Import and render `SuggestedQuestions` above the chat window. When a question chip is clicked, pre-fill the chat input |
| `frontend/src/pages/UploadPage.tsx` | Add a section below the upload area that calls `listDocuments()` and shows a list of already-ingested filenames. Add a "Load Sample Doc" button that calls `seedDocuments()` |

---

## Files You CREATE

| File | What it does |
|---|---|
| `frontend/src/components/SuggestedQuestions.tsx` | A row of clickable chip buttons with 5–6 sample HR questions. Calls `onSelect(question)` when clicked |

---

## Note
`listDocuments()` and `seedDocuments()` are written by **Person 2** in `api.ts`. Coordinate with them — make sure they finish that first, or just write those two functions yourself and let Person 2 know.

---

## DO NOT TOUCH
- Any file inside `backend/`
- `frontend/src/pages/HomePage.tsx`
- `frontend/src/pages/WorkflowPage.tsx`
- `frontend/src/components/WorkflowTimeline.tsx`
- `frontend/src/components/Sidebar.tsx`
- `frontend/src/components/Layout.tsx`
