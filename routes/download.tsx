import { HandlerContext, PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";
import { MongoClient, ObjectId } from "https://deno.land/x/mongo@v0.31.1/mod.ts";
import { Link } from "../components/Link.tsx";
import "https://deno.land/x/dotenv@v3.2.0/load.ts";

const client = new MongoClient();
await client.connect(Deno.env.get("MONGODB_CONNECTION_URI")!);
const db = client.database("demo");

export async function handler(_req: Request, ctx: HandlerContext) {
    // deno-lint-ignore no-explicit-any
    const files = await db.collection<any>("fs.files").find().toArray();
    return await ctx.render(files);
}

export default function Download({ url, data }: PageProps) {
    return (
        <>
            <Head>
                <title>Demo</title>
            </Head>

            <div class="mt-4 ml-4">
                {
                    data.map((file: { "_id": ObjectId; "filename": string }) =>
                    {
                        return (
                            <Link href={ `/api/download/${ file._id.toString() }` }>{ file.filename }</Link>
                        );
                    })
                }
            </div>
        </>
    );
}
