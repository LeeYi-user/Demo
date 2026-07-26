import { page } from "fresh";
import { define } from "../utils.ts";
import CallArea from "../islands/CallArea.tsx";

export const handler = define.handlers({
  GET() {
    const id = Math.random().toString(36).substring(2, 9);
    return page(id);
  },
});

export default define.page<typeof handler>(function Call({ data }) {
  return (
    <div class="m-1">
      <CallArea id={data} />
    </div>
  );
});
