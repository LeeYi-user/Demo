import { Handlers } from "$fresh/server.ts";
import { GridFSBucket, MongoClient } from "https://deno.land/x/mongo@v0.31.1/mod.ts";
import "https://deno.land/x/dotenv@v3.2.0/load.ts";

const client = new MongoClient();
await client.connect(Deno.env.get("MONGODB_CONNECTION_URI")!);
const db = client.database("demo");

export const handler: Handlers = {
    async POST(req, _ctx) {
        const body = await req.formData();
        const reader = new FileReader();

        reader.readAsArrayBuffer(body.get("data") as File);

        reader.onload = async function ()
        {
            const arrayBuffer = this.result;
            const fileContent = new Uint8Array(arrayBuffer as ArrayBuffer);

            const bucket = new GridFSBucket(db);
            const upstream = bucket.openUploadStream(body.get("name") as string);

            const writer = (await upstream).getWriter();
            writer.write(fileContent);

            await writer.close();
        }

        return new Response("OK");
    }
};
