import { define } from "../../../utils.ts";

export const handler = define.handlers({
  GET(ctx) {
    const channel = new BroadcastChannel(ctx.params.channel);

    const stream = new ReadableStream<string>({
      start: (controller) => {
        channel.onmessage = (event) => {
          const body = `data: ${JSON.stringify(event.data)}\n\n`;
          controller.enqueue(body);
        };
      },
      cancel() {
        channel.close();
      },
    });

    return new Response(stream.pipeThrough(new TextEncoderStream()), {
      headers: { "content-type": "text/event-stream" },
    });
  },
});
