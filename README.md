# Predusk Frontend Assessment

A production-ready task management dashboard built with Next.js, TypeScript, Redux Toolkit and Tailwind CSS.

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Redux Toolkit
- React Redux
- Axios
- Tailwind CSS
- LocalForage
- React Markdown
- WebSocket
- Server Sent Events (SSE)
- Jest
- React Testing Library

---

## Features

- View task list
- Search tasks
- Filter by status
- Sort tasks
- Task details panel
- AI Summary streaming
- Real-time task updates using WebSocket
- Offline cache using LocalForage
- Normalized Redux store
- Loading, Empty and Error states
- Fully typed codebase
- Unit tests

---

## Project Structure

app/
├── components/
├── features/
│ └── tasks/
├── hooks/
├── lib/
├── selectors/
├── services/
├── store/
├── types/
└── utils/

---

## Installation

```bash
npm install
```

## Run Development Server

```bash
npm run dev
```

## Run Tests

```bash
npm test
```

## Run Type Check

```bash
npx tsc --noEmit
```

## Lint

```bash
npm run lint
```

## Production Build

```bash
npm run build
```

---

## Architecture

- Redux Toolkit for state management
- Entity Adapter for normalized state
- Memoized selectors using Reselect
- Service layer for API communication
- Custom hooks for AI summary streaming
- Local cache using LocalForage
- WebSocket integration for real-time updates

---

## Testing

Covered modules

- normalize.ts
- taskSlice.ts
- taskSelectors.ts

Total

- 3 Test Suites
- 18 Tests

---

## Author

Rahul Johari
