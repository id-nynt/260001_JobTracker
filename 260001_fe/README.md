# Job Tracker frontend

React 18 + Vite + Tailwind CSS. Overview and setup: see the [root README](../README.md).

```bash
npm install
npm run dev      # http://localhost:3000, proxies /api to http://localhost:5000
npm test         # Vitest + Testing Library
npm run lint
npm run build
```

## How it is organised

| Path | Role |
| --- | --- |
| `src/api/client.js` | One Axios instance, auth header, 401 handling, `getErrorMessage` |
| `src/api/httpApi.js` | Real backend calls. Errors are thrown, never swallowed |
| `src/api/mockApi.js` | Demo implementation with the same methods and rules, backed by `localStorage` |
| `src/api/index.js` | `api` object that picks demo or real per call, based on the session |
| `src/components/` | UI components |
| `src/utils/stats.js` | Rates and weekly counts (pure, tested) |

## Environment

`VITE_API_URL`: base URL of the API, e.g. `https://my-api.onrender.com/api`. Leave it unset in development (the Vite proxy is used). It is baked in at **build** time; without it a production build offers only the demo.
