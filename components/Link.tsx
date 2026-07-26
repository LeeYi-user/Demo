import { JSX } from "preact";

export function Link(props: JSX.IntrinsicElements["a"]) {
    return (
        <>
            <span class="text-[#0000EE] underline" style="text-underline-offset: 3px; text-decoration-skip-ink: none;">
                <a { ...props }/>
            </span>

            <br/>
        </>
    );
}
