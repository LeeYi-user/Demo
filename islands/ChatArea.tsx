import { useState, useEffect, useRef } from "preact/hooks";

interface Props
{
    "url": string;
    "address": string;
}

interface Message
{
    "channel": string;
    "address": string;
    "content": string;
}

export default function ChatArea({ url, address }: Props ) {
    const channelBox = useRef<HTMLInputElement>(null);
    const [channel, setChannel] = useState<string>("default");

    const messageBox = useRef<HTMLInputElement>(null);
    const [messages, setMessages] = useState<Message[]>([]);

    // deno-lint-ignore no-explicit-any
    function setting(event: any)
    {
        if (event.key === "Enter" || event.target.nodeName === "BUTTON")
        {
            setChannel(channelBox.current?.value || "default");
            channelBox.current!.value = "";
        }
    }

    useEffect(() =>
    {
        fetch(`${ url }/api/load/${ channel }`).then((value) => value.json().then((value) => setMessages(value)));
    }, [channel]);

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
                    "content": messageBox.current?.value
                } as Message)
            });

            messageBox.current!.value = "";
        }
    }

    useEffect(() =>
    {
        const events = new EventSource(`/api/listen/${ channel }`);

        events.addEventListener("message", (event) =>
        {
            setMessages((messages) => [...messages, JSON.parse(event.data)]);
        });

        return (() =>
        {
            events.close();
        });
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
                    <p>{ message.address }: { message.content }</p>
                ); }) }
            </div>
        </div>
    );
}
