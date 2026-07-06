# Technical Decisions

## State Management

Redux Toolkit was selected because it provides predictable state management, built-in Immer support and Entity Adapter for normalized collections.

---

## Normalized State

Tasks are stored using Entity Adapter.

Benefits:

- O(1) lookup
- Easier updates
- Less duplication
- Better selector performance

---

## Memoized Selectors

Reselect is used for filtering, sorting and derived state to reduce unnecessary recalculations.

---

## Service Layer

API logic is isolated inside the services folder to keep components focused on rendering.

---

## AI Summary

Server Sent Events (SSE) were used for streaming AI summaries incrementally.

---

## Real-time Updates

A dedicated WebSocket hook handles task update events without coupling socket logic to UI components.

---

## Offline Support

LocalForage caches task data for faster startup and offline availability.

---

## Testing Strategy

Unit tests cover

- Normalization
- Reducers
- Selectors

using Jest and React Testing Library.

---

## Performance

- Memoized selectors
- Normalized Redux state
- Lazy rendering
- Minimal component re-renders
