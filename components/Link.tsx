import { JSX } from "preact";

export default function Link(props: JSX.HTMLAttributes<HTMLElement>) {
    return (
        <>
            <span class="text-[#0000EE] text-underline" style="text-underline-offset: 3px; text-decoration-skip-ink: none;">
                <a href={`/${ props.children }`}>{ props.children }</a>
            </span>

            <br/>
        </>
    );
}
