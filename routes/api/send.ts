export async function handler(req: Request) {
    const body = await req.json();
    const channel = new BroadcastChannel(body.channel);

    channel.postMessage({ "address": body.address, "message": body.message });
    channel.close();

    return new Response("OK");
}
