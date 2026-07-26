import { HttpError } from "fresh";
import { Writable } from "node:stream";
import { define } from "../../utils.ts";
import { getBucket } from "../../lib/mongo.ts";

export const handler = define.handlers({
  async POST(ctx) {
    const body = await ctx.req.formData();
    const data = body.get("data");
    const name = body.get("name");

    if (!(data instanceof File) || typeof name !== "string") {
      throw new HttpError(400, "Expected `name` and `data` fields");
    }

    const bucket = await getBucket();
    // mongodb v7 dropped the top-level `contentType` option, so stash it in
    // `metadata` — files uploaded before this (and by deno_mongo) simply have
    // none, and the download route falls back to letting the browser sniff.
    const upstream = bucket.openUploadStream(name, {
      metadata: data.type ? { "contentType": data.type } : undefined,
    });

    // Stream straight into GridFS so large files never sit in memory, and
    // await it so the response is only sent once the write has committed.
    await data.stream().pipeTo(Writable.toWeb(upstream));

    return new Response("OK");
  },
});
