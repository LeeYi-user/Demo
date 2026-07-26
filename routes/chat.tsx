import { page } from "fresh";
import { define } from "../utils.ts";
import ChatArea from "../islands/ChatArea.tsx";

export const handler = define.handlers({
  GET(ctx) {
    const { hostname } = ctx.info.remoteAddr as Deno.NetAddr;
    return page(hostname);
  },
});

export default define.page<typeof handler>(function Chat({ data }) {
  return (
    <div class="mt-4 ml-4">
      <ChatArea address={data} />
    </div>
  );
});
