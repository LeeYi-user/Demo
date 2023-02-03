import { useState, useEffect, useRef } from "preact/hooks"

export default function ChatArea({ address }: { address: string}) {
    const channelBox = useRef<HTMLInputElement>(null);
    const [channel, setChannel] = useState<string>("default");

    const messageBox = useRef<HTMLInputElement>(null);
    const [messages, setMessages] = useState<string[]>([]);

    // deno-lint-ignore no-explicit-any
    function setting(event: any)
    {
        if (event.key === "Enter" || event.target.nodeName === "BUTTON")
        {
            setChannel(channelBox.current?.value || "default");
            setMessages([]);
            channelBox.current!.value = "";
        }
    }

    // deno-lint-ignore no-explicit-any
    function typing(event: any)
    {
        if (event.key === "Enter" || event.target.nodeName === "BUTTON")
        {
            fetch("/api/send",
            {
                method: "POST",
                body: JSON.stringify(
                {
                    "channel": channel,
                    "address": address,
                    "message": messageBox.current?.value
                })
            });

            messageBox.current!.value = "";
        }
    }

    useEffect(() =>
    {
        const events = new EventSource(`/api/listen/${ channel }`);

        events.addEventListener("message", (event) =>
        {
            setMessages((messages) => [...messages, JSON.parse(event.data).address + ": " + JSON.parse(event.data).message]);
        });

        return () =>
        {
            events.close();
        }
    }, [channel]);

    return (
        <div>
            Current channel: { channel }

            <div class="mt-1">
                <input type="text" class="p-1 w-48 h-8 border border-black" placeholder="Channel" ref={ channelBox } onKeyDown={ setting }/>
                <button class="ml-1 h-8 border border-black" onClick={ setting }>Enter</button>
            </div>

            <div class="mt-1">
                <input type="text" class="p-1 w-48 h-8 border border-black" placeholder="Message" ref={ messageBox } onKeyDown={ typing }/>
                <button class="ml-1 h-8 border border-black" onClick={ typing }>Enter</button>
            </div>

            <div class="mt-1">
                { messages.map((message) => { return (
                    <p>{ message }</p>
                ) }) }
            </div>
        </div>
    );
}
