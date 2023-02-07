import { Head } from "$fresh/runtime.ts";
import CallArea from "../islands/CallArea.tsx";

export default function Call() {
    return (
        <>
            <Head>
                <title>Demo</title>
            </Head>

            <div class="mt-4 ml-4">
                <CallArea/>
            </div>
        </>
    );
}
