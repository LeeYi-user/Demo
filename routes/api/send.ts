import { MongoClient } from "https://deno.land/x/mongo@v0.31.1/mod.ts";
import "https://deno.land/x/dotenv@v3.2.0/load.ts";

interface Message
{
    "channel": string;
    "address": string;
    "content": string;
}

const client = new MongoClient();
await client.connect(Deno.env.get("MONGODB_CONNECTION_URI")!);
const db = client.database("demo");

export async function handler(req: Request) {
    const body = await req.json();
    const channel = new BroadcastChannel(body.channel);

    await db.collection<Message>("chat").insertOne(body);
    channel.postMessage(body);
    channel.close();

    return new Response("OK");
}
