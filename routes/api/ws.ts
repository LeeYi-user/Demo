const clients = new Map<WebSocket, string>();
const calling = new Map<string, WebSocket>();

// deno-lint-ignore no-explicit-any
function broadcast(socket: WebSocket, body: any)
{
    if (body.type === "join" || body.type === "left")
    {
        if (body.type === "join")
        {
            clients.set(socket, body.id);
        }
        else
        {
            clients.delete(socket);
        }

        const temp = [];

        for (const [_socket, id] of clients)
        {
            temp.push(id);
        }

        body.data = temp;

        for (const [socket, _id] of clients)
        {
            socket.send(JSON.stringify(body));
        }
    }
    else
    {
        if (!calling.has(body.id))
        {
            calling.set(body.id, socket);
            broadcast(socket, { "type": "left" });
        }

        if (!calling.has(body.target))
        {
            for (const [socket, id] of clients)
            {
                if (id === body.target)
                {
                    calling.set(id, socket);
                    broadcast(socket, { "type": "left" });
                    break;
                }
            }
        }

        for (const [id, socket] of calling)
        {
            if (id === body.target)
            {
                socket.send(JSON.stringify(body));
                break;
            }
        }
    }
}

export function handler(req: Request) {
    const { socket, response } = Deno.upgradeWebSocket(req);

    socket.onmessage = (event) =>
    {
        broadcast(socket, JSON.parse(event.data));
    }

    socket.onclose = () =>
    {
        broadcast(socket, { "type": "left" });

        for (const [id, socket_] of calling)
        {
            if (socket_ === socket)
            {
                calling.delete(id);
                break;
            }
        }
    }

    return response;
}
