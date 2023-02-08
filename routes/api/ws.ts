const clients = new Map<string, WebSocket>();

export function handler(req: Request) {
    const { socket, response } = Deno.upgradeWebSocket(req);

    socket.onmessage = (event) =>
    {
        const body = JSON.parse(event.data);

        clients.set(body.id, socket);

        for (const [id, socket] of clients)
        {
            if (id === body.id)
            {
                continue;
            }

            socket.send(JSON.stringify(body));
        }
    }

    socket.onclose = () =>
    {
        for (const [id, socket_] of clients)
        {
            if (socket_ === socket)
            {
                clients.delete(id);
                break;
            }
        }
    }

    return response;
}
