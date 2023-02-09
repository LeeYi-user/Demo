import { Head } from "$fresh/runtime.ts";
import { Link } from "../components/Link.tsx";

export default function Home() {
    return (
        <>
            <Head>
                <title>Demo</title>
            </Head>

            <div class="mt-4 ml-4">
                <Link href="/call">call</Link>
                <Link href="/chat">chat</Link>
                <Link href="/upload">upload</Link>
                <Link href="/download">download</Link>
            </div>
        </>
    );
}
