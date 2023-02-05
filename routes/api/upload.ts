import { Handlers } from "$fresh/server.ts";
import { GridFSBucket, MongoClient } from "https://deno.land/x/mongo@v0.31.1/mod.ts";
import "https://deno.land/x/dotenv@v3.2.0/load.ts";

const client = new MongoClient();
await client.connect(Deno.env.get("MONGODB_CONNECTION_URI")!);
const db = client.database("demo");

export const handler: Handlers = {
    async POST(req, _ctx) {
        const body = await req.json();
        const bucket = new GridFSBucket(db);
        const upstream = bucket.openUploadStream(body.name);

        const writer = (await upstream).getWriter();
        writer.write(new Uint8Array([...Object.values(body.data as JSON)]));

        await writer.close();

        return new Response("OK");
    }
};
