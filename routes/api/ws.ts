const clients = new Map<WebSocket, string>();
const targets = new Map<string, string>();

function update()
{
    const body: { "type": string; "data": string[]; } =
    {
        "type": "update",
        "data": []
    };

    for (const [_socket, id] of clients)
    {
        if (!targets.get(id))
        {
            body.data.push(id);
        }
    }

    for (const [socket, _id] of clients)
    {
        socket.send(JSON.stringify(body));
    }
}

// deno-lint-ignore no-explicit-any
function broadcast(socket: WebSocket, body: any)
{
    if (body.type === "join")
    {
        clients.set(socket, body.id);
        update();
    }
    else if (body.type === "left")
    {
        for (const [socket_, id] of clients)
        {
            if (targets.get(id) === clients.get(socket))
            {
                socket_.send(JSON.stringify({ "type": "kick" }));
            }
        }

        targets.delete(clients.get(socket)!);
        clients.delete(socket);
        update();
    }
    else
    {
        if (!targets.get(body.id))
        {
            if (targets.get(body.target))
            {
                socket.send(JSON.stringify({ "type": "kick" }));
                return;
            }

            targets.set(body.id, body.target);
            targets.set(body.target, body.id);
            update();
        }

        for (const [socket, id] of clients)
        {
            if (id === targets.get(body.id))
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
    }

    return response;
}
