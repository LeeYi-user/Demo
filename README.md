# fresh project

Built with [Fresh 2](https://fresh.deno.dev) (Vite + Tailwind CSS v4) and the
official MongoDB driver.

### Setup

Copy `.env.example` to `.env` and fill in your MongoDB connection string:

```
MONGODB_CONNECTION_URI="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?appName=<app_name>"
```

Then install dependencies:

```
deno install
```

### Usage

Start the development server:

```
deno task dev
```

Build and run the production server:

```
deno task build
deno task start
```

Type check and lint:

```
deno task check
```

> The Vite dev server does not serve streaming responses or WebSocket
> upgrades, so `/api/listen/:channel` (the chat event stream) and `/api/ws`
> (WebRTC signalling) both hang under `deno task dev`. Pages and every other
> API route work fine there — to exercise `/chat` and `/call`, run
> `deno task build && deno task start` instead.

### Deploying

`deno.json` carries a `deploy` block, so Deno Deploy runs `deno install`, then
`deno task build`, and serves `_fresh/server.js`. Set
`MONGODB_CONNECTION_URI` as an environment variable in the Deno Deploy
dashboard — `.env` is local-only.
