import { HandlerContext, PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";
import CallArea from "../islands/CallArea.tsx";

export async function handler(_req: Request, ctx: HandlerContext) {
    const id = Math.random().toString(36).substring(2, 9);
    return await ctx.render(id);
}

export default function Call({ url, data }: PageProps) {
    return (
        <>
            <Head>
                <title>李易的視訊通話</title>
            </Head>

            <div class="mt-4 ml-4 mb-1">
                <CallArea id={ data }/>
            </div>
        </>
    );
}
