// DO NOT EDIT. This file is generated by fresh.
// This file SHOULD be checked into source version control.
// This file is automatically updated during development when running `dev.ts`.

import config from "./deno.json" assert { type: "json" };
import * as $0 from "./routes/api/download.ts";
import * as $1 from "./routes/api/listen.ts";
import * as $2 from "./routes/api/load.ts";
import * as $3 from "./routes/api/send.ts";
import * as $4 from "./routes/api/upload.ts";
import * as $5 from "./routes/api/ws.ts";
import * as $6 from "./routes/call.tsx";
import * as $7 from "./routes/chat.tsx";
import * as $8 from "./routes/download.tsx";
import * as $9 from "./routes/index.tsx";
import * as $10 from "./routes/upload.tsx";
import * as $$0 from "./islands/CallArea.tsx";
import * as $$1 from "./islands/ChatArea.tsx";
import * as $$2 from "./islands/UploadArea.tsx";

const manifest = {
  routes: {
    "./routes/api/download.ts": $0,
    "./routes/api/listen.ts": $1,
    "./routes/api/load.ts": $2,
    "./routes/api/send.ts": $3,
    "./routes/api/upload.ts": $4,
    "./routes/api/ws.ts": $5,
    "./routes/call.tsx": $6,
    "./routes/chat.tsx": $7,
    "./routes/download.tsx": $8,
    "./routes/index.tsx": $9,
    "./routes/upload.tsx": $10,
  },
  islands: {
    "./islands/CallArea.tsx": $$0,
    "./islands/ChatArea.tsx": $$1,
    "./islands/UploadArea.tsx": $$2,
  },
  baseUrl: import.meta.url,
  config,
};

export default manifest;
