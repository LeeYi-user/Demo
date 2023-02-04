import { Handlers, RouteConfig } from "$fresh/server.ts";

export const handler: Handlers = {
    GET(_req, ctx) {
        const channel = new BroadcastChannel(ctx.params.channel);
        const stream = new ReadableStream(
        {
            start: (controller) =>
            {
                channel.onmessage = (event) =>
                {
                    const body = `data: ${ JSON.stringify(event.data) }\n\n`;
                    controller.enqueue(body);
                };
            },
            cancel()
            {
                channel.close();
            }
        });

        return new Response(stream.pipeThrough(new TextEncoderStream()),
        {
            headers: { "content-type": "text/event-stream" }
        });
    }
};

export const config: RouteConfig = {
    routeOverride: "/api/listen/:channel"
};
