import { HandlerContext, PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";
import ChatArea from "../islands/ChatArea.tsx";

export async function handler(_req: Request, ctx: HandlerContext) {
    const { hostname } = ctx.remoteAddr as Deno.NetAddr;
    return await ctx.render(hostname);
}

export default function Chat(props: PageProps) {
    return (
        <>
            <Head>
                <title>Demo</title>
            </Head>

            <div class="mt-4 ml-4">
                <ChatArea address={ props.data }/>
            </div>
        </>
    )
}
