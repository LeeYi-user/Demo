import { HttpError } from "fresh";
import { define } from "../../utils.ts";
import { getDb } from "../../lib/mongo.ts";
import type { Message } from "../../lib/types.ts";

export const handler = define.handlers({
  async POST(ctx) {
    const body = await ctx.req.json() as Partial<Message>;

    if (
      typeof body.channel !== "string" || typeof body.address !== "string" ||
      typeof body.content !== "string"
    ) {
      throw new HttpError(400, "Expected `channel`, `address` and `content`");
    }

    const message: Message = {
      "channel": body.channel,
      "address": body.address,
      "content": body.content,
    };

    const db = await getDb();
    await db.collection<Message>("chat").insertOne({ ...message });

    const channel = new BroadcastChannel(message.channel);
    channel.postMessage(message);
    channel.close();

    return new Response("OK");
  },
});
