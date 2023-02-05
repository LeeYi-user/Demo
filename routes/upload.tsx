import { Head } from "$fresh/runtime.ts";
import UploadArea from "../islands/UploadArea.tsx";

export default function Upload() {
    return (
        <>
            <Head>
                <title>Demo</title>
            </Head>

            <div class="mt-4 ml-4">
                <UploadArea/>
            </div>
        </>
    );
}
