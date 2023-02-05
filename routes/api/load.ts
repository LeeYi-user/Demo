import { Handlers, RouteConfig } from "$fresh/server.ts";
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

export const handler: Handlers = {
    async GET(_req, ctx) {
        const messages = await db.collection<Message>("chat").find({ "channel": ctx.params.channel }, { "projection": { "_id": false } }).toArray();
        return new Response(JSON.stringify(messages));
    }
};

export const config: RouteConfig = {
    routeOverride: "/api/load/:channel"
};
