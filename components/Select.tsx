import { JSX } from "preact";
import { IS_BROWSER } from "fresh/runtime";

export function Select(props: JSX.IntrinsicElements["select"]) {
    return (
        <select
            { ...props }
            disabled={ !IS_BROWSER || props.disabled }
            class={ `h-[28px] px-1.5 border border-gray-500 rounded-[0.15rem] hover:border-gray-700 active:border-gray-400 ${
                props.class ?? ""
            }` }
        />
    );
}
