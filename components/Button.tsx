import { JSX } from "preact";

export default function Button(props: JSX.HTMLAttributes<HTMLElement>) {
    return (
        <>
            <button class={ `px-1.5 py-[1px] bg-gray-200 border border-gray-500 rounded-[0.15rem] hover:bg-gray-300 hover:border-gray-600 active:bg-gray-100 active:border-gray-400 focus:outline-none ${ props.class ?? "" }` } onClick={ props.onClick }>
                { props.children }
            </button>
        </>
    );
}
