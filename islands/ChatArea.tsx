import { useState, useEffect, useRef } from "preact/hooks";
import Button from "../components/Button.tsx";

interface Message
{
    "channel": string;
    "address": string;
    "content": string;
}

export default function ChatArea({ address }: { "address": string }) {
    const channelInput = useRef<HTMLInputElement>(null);
    const [channel, setChannel] = useState<string>("default");

    const messageInput = useRef<HTMLInputElement>(null);
    const [messages, setMessages] = useState<Message[]>([]);

    // deno-lint-ignore no-explicit-any
    function setting(event: any)
    {
        if (event.key === "Enter" || event.target.nodeName === "BUTTON")
        {
            setChannel(channelInput.current?.value || "default");
            channelInput.current!.value = "";
        }
    }

    useEffect(() =>
    {
        fetch(`${ location.protocol }//${ location.host }/api/load/${ channel }`).then((value) => value.json().then((value) => setMessages(value)));
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
                    "content": messageInput.current?.value
                } as Message)
            });

            messageInput.current!.value = "";
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
                <input type="text" class="p-1 w-48 h-8 border border-black" placeholder="Channel" ref={ channelInput } onKeyDown={ setting }/>
                <Button class="ml-1" onClick={ setting }>Enter</Button>
            </div>

            <div class="mt-1">
                <input type="text" class="p-1 w-48 h-8 border border-black" placeholder="Message" ref={ messageInput } onKeyDown={ typing }/>
                <Button class="ml-1" onClick={ typing }>Enter</Button>
            </div>

            <div class="mt-1">
                { messages.map((message) => { return (
                    <p>{ message.address }: { message.content }</p>
                ); }) }
            </div>
        </div>
    );
}
