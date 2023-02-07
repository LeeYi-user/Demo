export async function handler(req: Request) {
    const body = await req.json();
    const channel = new BroadcastChannel("signaling");

    channel.postMessage(body);
    channel.close();

    return new Response("OK");
}
