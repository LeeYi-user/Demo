import { define } from "../../../utils.ts";
import { getDb } from "../../../lib/mongo.ts";
import type { Message } from "../../../lib/types.ts";

export const handler = define.handlers({
  async GET(ctx) {
    const db = await getDb();
    const messages = await db.collection<Message>("chat").find({
      "channel": ctx.params.channel,
    }, { "projection": { "_id": 0 } }).toArray();

    return Response.json(messages);
  },
});
