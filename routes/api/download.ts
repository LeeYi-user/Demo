import { Handlers, RouteConfig } from "$fresh/server.ts";
import { GridFSBucket, MongoClient, ObjectId } from "https://deno.land/x/mongo@v0.31.1/mod.ts";
import "https://deno.land/x/dotenv@v3.2.0/load.ts";

const client = new MongoClient();
await client.connect(Deno.env.get("MONGODB_CONNECTION_URI")!);
const db = client.database("demo");

export const handler: Handlers = {
    async GET(_req, ctx) {
        const bucket = new GridFSBucket(db);
        // deno-lint-ignore no-explicit-any
        const file = await db.collection<any>("fs.files").findOne({ "_id": new ObjectId(ctx.params.files_id) });
        const headers = new Headers({ "Content-Disposition": `inline; filename="${ encodeURIComponent(file.filename) }"` });

        return new Response(await bucket.openDownloadStream(file._id), { "headers": headers });
    }
};

export const config: RouteConfig = {
    routeOverride: "/api/download/:files_id"
};
