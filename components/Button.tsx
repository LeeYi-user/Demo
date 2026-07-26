import { JSX } from "preact";
import { IS_BROWSER } from "fresh/runtime";

export function Button(props: JSX.IntrinsicElements["button"]) {
    return (
        <button
            { ...props }
            disabled={ !IS_BROWSER || props.disabled }
            class={ `h-[28px] px-1.5 bg-gray-200 border border-gray-500 rounded-[0.15rem] hover:bg-gray-300 hover:border-gray-700 active:bg-gray-100 active:border-gray-400 focus:outline-none ${
                props.class ?? ""
            }` }
        />
    );
}
